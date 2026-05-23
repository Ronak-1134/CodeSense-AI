# CodeSense AI — AI-Powered Code Reviewer

> Catch bugs, security vulnerabilities, and bad patterns before they reach production — powered by Claude AI.

---

## Tech Stack

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)
![Redux](https://img.shields.io/badge/Redux_Toolkit-2-764ABC?style=flat-square&logo=redux&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-10-FFCA28?style=flat-square&logo=firebase&logoColor=black)
![Claude](https://img.shields.io/badge/Claude-Sonnet_4-CC785C?style=flat-square)

---

## Features

- **AI Code Review** — Line-level bug detection, security scanning, and style feedback powered by Claude Sonnet
- **15+ Languages** — JavaScript, TypeScript, Python, Go, Rust, Java, C#, PHP, Ruby, Swift, Kotlin, SQL, Bash, and more
- **GitHub PR Integration** — Connect your GitHub account to review pull requests and post inline comments automatically
- **Review Depth Control** — Choose Quick (critical only), Standard, or Deep (thorough) analysis
- **Focus Area Selection** — Target Bug Detection, Security, Performance, and/or Code Style independently
- **Scoring System** — Every review produces a 0–100 score with letter grade (A+ through F)
- **Inline Suggestions** — Every issue includes a concrete suggested fix, not just a warning
- **Review History** — Browse, filter, and search all past reviews with pagination
- **Free Tier** — 15 reviews per month, no credit card required
- **Dark UI** — Minimal dark interface with magenta accent, built with Tailwind CSS

---

## Setup

### Prerequisites

- Node.js ≥ 20.0.0
- MongoDB (local or [Atlas](https://www.mongodb.com/cloud/atlas))
- [Firebase project](https://console.firebase.google.com) with Authentication enabled
- [Anthropic API key](https://console.anthropic.com/settings/keys)

---

### 1. Clone the repository

```bash
git clone https://github.com/your-username/ai-code-reviewer.git
cd ai-code-reviewer
```

### 2. Install dependencies

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 3. Set up environment variables

**Server:**
```bash
cd server
cp .env.example .env
# Edit .env and fill in all values (see comments in the file)
```

**Client:**
```bash
cd client
cp .env.example .env
# Edit .env and fill in your Firebase web app config
```

---

### 4. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com) → **Create a project**
2. Enable **Authentication** → **Sign-in method** → Enable **Google** and **GitHub**
3. For GitHub OAuth: create a GitHub OAuth App at [github.com/settings/developers](https://github.com/settings/developers)
   - Homepage URL: `http://localhost:5173`
   - Callback URL: `https://your-project-id.firebaseapp.com/__/auth/handler`
   - Paste the Client ID + Secret into Firebase's GitHub provider settings
4. **Web app config** (for `client/.env`):
   - Firebase Console → Project Settings → General → Your apps → Add web app
   - Copy the `firebaseConfig` object values into the `VITE_FIREBASE_*` variables
5. **Service account** (for `server/.env`):
   - Firebase Console → Project Settings → Service Accounts → **Generate new private key**
   - Download the JSON, minify it (remove all newlines), and paste as `FIREBASE_SERVICE_ACCOUNT_JSON`

---

### 5. MongoDB Setup

**Local (macOS/Linux):**
```bash
# Install MongoDB Community via Homebrew
brew tap mongodb/brew && brew install mongodb-community
brew services start mongodb-community

# MONGODB_URI in server/.env:
# mongodb://127.0.0.1:27017/ai-code-reviewer
```

**MongoDB Atlas (cloud):**
1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user and whitelist your IP
3. Copy the connection string into `MONGODB_URI`

---

### 6. Run in development

```bash
# Terminal 1 — start the backend (port 3001)
cd server && npm run dev

# Terminal 2 — start the frontend (port 5173)
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

### 7. Build for production

```bash
cd client && npm run build   # outputs to client/dist/
cd server && npm start        # runs server in production mode
```

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET`  | `/health` | — | Health check |
| `POST` | `/api/auth/sync` | ✓ | Sync Firebase user with MongoDB |
| `POST` | `/api/review/analyze` | ✓ | Submit code for AI review |
| `GET`  | `/api/review/history` | ✓ | Get paginated review history |
| `GET`  | `/api/review/:id` | ✓ | Get a single review by ID |
| `DELETE` | `/api/review/:id` | ✓ | Delete a review |
| `GET`  | `/api/github/repos` | ✓ | List user's GitHub repositories |
| `GET`  | `/api/github/repos/:owner/:repo/pulls` | ✓ | List open PRs for a repo |
| `POST` | `/api/github/repos/:owner/:repo/pulls/:number/review` | ✓ | AI review a PR diff |
| `POST` | `/api/github/token` | ✓ | Store encrypted GitHub OAuth token |

Auth column ✓ = requires `Authorization: Bearer <firebase-id-token>` header.
---

## License

MIT © 2025 CodeSense. See [LICENSE](LICENSE) for details.
