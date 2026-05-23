import { useMemo } from 'react';

// ── Line type classifiers ─────────────────────────────────────────────────────
function classifyLine(line) {
  if (line.startsWith('+') && !line.startsWith('+++')) return 'added';
  if (line.startsWith('-') && !line.startsWith('---')) return 'removed';
  if (line.startsWith('@@')) return 'hunk';
  if (line.startsWith('diff ') || line.startsWith('index ') || line.startsWith('---') || line.startsWith('+++')) return 'meta';
  return 'context';
}

const LINE_STYLES = {
  added: {
    row:    'bg-status-success/6',
    gutter: 'bg-status-success/10 text-status-success/70 border-r border-status-success/15',
    text:   'text-[#abb2bf]',
    prefix: { color: '#22C55E', char: '+' },
  },
  removed: {
    row:    'bg-status-error/6',
    gutter: 'bg-status-error/10 text-status-error/70 border-r border-status-error/15',
    text:   'text-[#abb2bf] line-through opacity-60',
    prefix: { color: '#EF4444', char: '−' },
  },
  hunk: {
    row:    'bg-status-info/5',
    gutter: 'bg-status-info/8 border-r border-status-info/15',
    text:   'text-status-info text-[11px]',
    prefix: null,
  },
  meta: {
    row:    'bg-dark-elevated/30',
    gutter: 'border-r border-dark-border',
    text:   'text-[#444] text-[11px] font-medium',
    prefix: null,
  },
  context: {
    row:    '',
    gutter: 'border-r border-dark-border text-[#3B4048]',
    text:   'text-[#6B7280]',
    prefix: null,
  },
};

// ── File header ───────────────────────────────────────────────────────────────
function FileHeader({ filename, additions, deletions }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-dark-elevated border-b border-dark-border">
      <span className="text-[12px] font-medium text-white font-code">{filename}</span>
      <div className="flex items-center gap-3 text-[11px] font-medium">
        {additions > 0 && <span className="text-status-success">+{additions}</span>}
        {deletions > 0 && <span className="text-status-error">−{deletions}</span>}
      </div>
    </div>
  );
}

// ── Single diff file view ─────────────────────────────────────────────────────
function FileDiff({ file }) {
  const lines = useMemo(() => file.chunks?.flatMap((c) => c.lines) ?? [], [file]);

  // Track line numbers separately for old and new
  let oldLine = 0;
  let newLine = 0;

  // Parse hunk header for starting line numbers
  const parseHunkHeader = (header) => {
    const match = header.match(/@@ -(\d+)(?:,\d+)? \+(\d+)/);
    return match ? { old: parseInt(match[1], 10), new: parseInt(match[2], 10) } : { old: 1, new: 1 };
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg overflow-hidden">
      <FileHeader filename={file.filename} additions={file.additions} deletions={file.deletions} />
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[12px] font-code">
          <tbody>
            {lines.map((rawLine, i) => {
              const type = classifyLine(rawLine);
              const style = LINE_STYLES[type];

              if (type === 'hunk') {
                const { old: o, new: n } = parseHunkHeader(rawLine);
                oldLine = o - 1;
                newLine = n - 1;
              }

              let oldNum = null;
              let newNum = null;

              if (type === 'context') {
                oldLine++;
                newLine++;
                oldNum = oldLine;
                newNum = newLine;
              } else if (type === 'added') {
                newLine++;
                newNum = newLine;
              } else if (type === 'removed') {
                oldLine++;
                oldNum = oldLine;
              }

              const displayText = type === 'added' || type === 'removed' ? rawLine.slice(1) : rawLine;

              return (
                <tr key={i} className={`group ${style.row}`}>
                  {/* Old line number */}
                  <td className={`w-10 text-right pr-2 pl-2 py-0.5 select-none align-top ${style.gutter}`}>
                    {oldNum ?? ''}
                  </td>
                  {/* New line number */}
                  <td className={`w-10 text-right pr-3 pl-1 py-0.5 select-none align-top ${style.gutter}`}>
                    {newNum ?? ''}
                  </td>
                  {/* Prefix char (+/−) */}
                  <td className="w-4 py-0.5 pl-2 select-none align-top">
                    {style.prefix && (
                      <span style={{ color: style.prefix.color }} className="font-semibold">
                        {style.prefix.char}
                      </span>
                    )}
                  </td>
                  {/* Line content */}
                  <td className={`py-0.5 pr-6 whitespace-pre ${style.text}`}>
                    {displayText || ' '}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Stats summary ─────────────────────────────────────────────────────────────
function DiffStats({ files }) {
  const totalAdd = files.reduce((s, f) => s + (f.additions ?? 0), 0);
  const totalDel = files.reduce((s, f) => s + (f.deletions ?? 0), 0);

  return (
    <div className="flex items-center gap-4 text-[12px] text-[#555]">
      <span>{files.length} {files.length === 1 ? 'file' : 'files'} changed</span>
      {totalAdd > 0 && <span className="text-status-success font-medium">+{totalAdd} additions</span>}
      {totalDel > 0 && <span className="text-status-error font-medium">−{totalDel} deletions</span>}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
/**
 * Renders a parsed diff (array of file objects from githubService.parseDiff).
 *
 * @param {{
 *   files: Array<{
 *     filename: string,
 *     language: string,
 *     additions: number,
 *     deletions: number,
 *     chunks: Array<{ header: string, lines: string[] }>,
 *   }>,
 *   showStats?: boolean,
 *   className?: string,
 * }} props
 */
export default function DiffViewer({ files = [], showStats = true, className = '' }) {
  if (!files || files.length === 0) {
    return (
      <div className="text-[13px] text-[#444] py-8 text-center">
        No diff to display.
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {showStats && <DiffStats files={files} />}
      {files.map((file, i) => (
        <FileDiff key={`${file.filename}-${i}`} file={file} />
      ))}
    </div>
  );
}