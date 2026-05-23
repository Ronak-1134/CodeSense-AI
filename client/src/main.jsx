import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { store } from '@app/store';
import { initializeAuth } from '@features/auth/authSlice';
import App from './App.jsx';
import './index.css';

// Kick off Firebase auth listener before first render
store.dispatch(initializeAuth());

const root = createRoot(document.getElementById('root'));

root.render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);