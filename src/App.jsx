import { useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import UserDashboard from "./components/UserDashboard";

// DESIGN SYSTEM: Tema customizado Material UI com design moderno
const theme = createTheme({
  palette: {
    primary: { main: '#2563eb' }, 
    background: { default: '#f8fafc', paper: '#ffffff' },
    text: { primary: '#1e293b', secondary: '#64748b' }
  },
  shape: {
    borderRadius: 24, 
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 50, 
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

// ... teus imports no topo do arquivo ...
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/Dashboard"; // O teu ficheiro Dashboard atual passa a ser o Admin

// ... (definição do teu theme) ...

export default function App() {
  // 1. ESTADOS GLOBAIS: Gerenciamento de sessão e visualização
  const [user, setUser] = useState(null); 
  const [currentView, setCurrentView] = useState('login'); 

  // 2. RETORNO ÚNICO: A árvore de componentes
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      {!user ? (
        currentView === 'login' ? (
          <Login 
            onLogin={(data) => setUser(data.user)} // Guarda o utilizador retornado pelo Firebase
            onNavigateToRegister={() => setCurrentView('register')} 
          />
        ) : (
          <Register 
            onRegister={() => setCurrentView('login')} // Após registar, manda para login
            onNavigateToLogin={() => setCurrentView('login')} 
          />
        )
      ) : (
        // Lógica de separação: Se o email for do admin, mostra o AdminDashboard, senão o UserDashboard
        user.email === 'admin@focusup.com' ? (
           <AdminDashboard onLogout={() => setUser(null)} />
        ) : (
           <UserDashboard user={user} onLogout={() => setUser(null)} />
        )
      )}
    </ThemeProvider>
  );
}