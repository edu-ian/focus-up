import { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Avatar, InputAdornment, IconButton, Alert, CircularProgress } from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';
import logo from '../assets/focus.png';

const loginUrl = () => {
  const base = import.meta.env.VITE_API_URL;
  if (base) return `${String(base).replace(/\/$/, '')}/api/login`;
  return '/api/login';
};

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(loginUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || 'E-mail ou senha incorretos.');
        return;
      }
      if (!data.token) {
        setError('Resposta inválida do servidor.');
        return;
      }
      onLogin({ token: data.token, user: data.user });
    } catch {
      setError('Não foi possível conectar ao servidor. Verifique se a API está rodando.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2
      }}
    >
      <Card sx={{ maxWidth: 420, width: '100%', borderRadius: 6, boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)' }}>
        <CardContent sx={{ p: { xs: 4, sm: 5 } }}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
            <Avatar 
              src={logo} 
              alt="Focus Up Logo" 
              sx={{ width: 88, height: 88, mb: 2, bgcolor: 'transparent' }} 
            />
            <Typography variant="h5" color="primary" fontWeight="bold">
              Admin Login
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Acesse o painel do Focus Up
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              variant="outlined"
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 3 }
              }}
            />

            <TextField
              fullWidth
              variant="outlined"
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { borderRadius: 3 }
              }}
            />

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              endIcon={loading ? <CircularProgress size={22} color="inherit" /> : <LoginIcon />}
              sx={{ py: 1.5, fontSize: '1.1rem', mt: 1 }}
            >
              {loading ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}