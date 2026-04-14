import { useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';

// Importações - certifique-se que os caminhos estão corretos
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Register from "./components/Register";
import AdminDashboard from "./components/Dashboard"; 
import UserDashboard from "./components/UserDashboard"; 

const theme = createTheme({
  palette: {
    primary: { main: '#2563eb' },
    background: { default: '#f8fafc' },
  },
  shape: { borderRadius: 20 },
  typography: { fontFamily: '"Inter", sans-serif' }
});

export default function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('landing');

  const renderPublicView = () => {
    switch(currentView) {
      case 'login':
        return (
          <Login 
            onLogin={(data) => setUser(data.user)} 
            onNavigateToRegister={() => setCurrentView('register')} 
            onNavigateToLanding={() => setCurrentView('landing')} 
          />
        );
      case 'register':
        return (
          <Register 
            onRegister={() => setCurrentView('login')} 
            onNavigateToLogin={() => setCurrentView('login')}
            onNavigateToLanding={() => setCurrentView('landing')} 
          />
        );
      default:
        return (
          <LandingPage 
            onNavigateToLogin={() => setCurrentView('login')} 
          />
        );
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh' }}>
        {!user ? (
          renderPublicView()
        ) : (
          user.email === 'admin@focusup.com' ? (
             <AdminDashboard onLogout={() => setUser(null)} />
          ) : (
             <UserDashboard user={user} onLogout={() => setUser(null)} />
          )
        )}
      </Box>
    </ThemeProvider>
  );
}