import { useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

const SESSION_KEY = 'focus_up_session';

const theme = createTheme({
  palette: {
    primary: { main: '#2563eb' }, // Azul moderno
    background: { default: '#f8fafc', paper: '#ffffff' },
    text: { primary: '#1e293b', secondary: '#64748b' }
  },
  shape: {
    borderRadius: 24, // Bordas bem arredondadas nos cards
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 50, // Botões em formato de pílula
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
          }
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)',
          border: '1px solid #f1f5f9',
        },
      },
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
});

function readSessionLoggedIn() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.token) return true;
    }
  } catch {
    localStorage.removeItem(SESSION_KEY);
  }
  return false;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(readSessionLoggedIn);

  const handleLogin = ({ token, user }) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ token, user }));
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setIsLoggedIn(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Dashboard onLogout={handleLogout} />
      )}
    </ThemeProvider>
  );
}

export default App;