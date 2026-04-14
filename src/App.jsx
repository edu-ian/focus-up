import { useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Login from "./components/Login";
import Register from "./components/Register";
import AdminDashboard from "./components/Dashboard"; 
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

export default function App() {
  // ESTADO GLOBAL REACT: Gerenciamento de sessão de usuário
  const [user, setUser] = useState(null);
  
  // ROTEAMENTO CONDICIONAL: Controle de visualização (login vs registro)
  const [currentView, setCurrentView] = useState('login');

  return (
    // THEME PROVIDER: Injeção de dependência de estilos na árvore de componentes
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      {!user ? (
        currentView === 'login' ? (
          <Login 
            onLogin={(data) => setUser(data.user)} // Guarda o objeto do utilizador do Firebase
            onNavigateToRegister={() => setCurrentView('register')} 
          />
        ) : (
          <Register 
            onRegister={() => setCurrentView('login')} // Após registar, manda para login
            onNavigateToLogin={() => setCurrentView('login')} 
          />
        )
      ) : (
        // Lógica de separação: Se o email for do admin, mostra o painel geral, senão o painel do pet
        user.email === 'admin@focusup.com' ? (
           <AdminDashboard onLogout={() => setUser(null)} />
        ) : (
           <UserDashboard user={user} onLogout={() => setUser(null)} />
        )
      )}
    </ThemeProvider>
  );
}