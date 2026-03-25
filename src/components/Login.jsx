import { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Avatar, InputAdornment, IconButton, Alert, CircularProgress, Divider, Link } from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff, Login as LoginIcon, Google } from '@mui/icons-material';
import { auth, googleProvider } from '../firebase'; 
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth'; 
import logo from '../assets/focus.png';

export default function Login({ onLogin, onNavigateToRegister }) {
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState(''); // Estado para mensagem de sucesso (recuperação de senha)
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ASYNC FUNCTION: Lógica de Login tradicional com E-mail e Senha
  const handleSubmit = async (e) => {
    e.preventDefault(); // EVENT PREVENT: Evita o reload padrão da página
    setError('');
    setMessage('');
    setLoading(true);
    try {
      // PROMISE RESOLUTION: Requisição assíncrona de autenticação no backend
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      onLogin({ user: userCredential.user }); // STATE LIFTING: Passa o objeto do usuário logado para o componente pai
    } catch (err) {
      // ERROR HANDLING: Tratamento simplificado de erro para apresentação amigável
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('E-mail ou senha incorretos.');
      } else {
        setError('Erro ao processar o login. Tente novamente.');
      }
    } finally {
      setLoading(false); // PERFORMANCE: Encerra o estado de carregamento independente do resultado (sucesso ou falha)
    }
  };

  // OAUTH INTEGRATION: Login social via provedor de identidade do Google
  const handleGoogleLogin = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      // POPUP AUTH: Abertura de janela modal para autenticação de terceiros (SSO - Single Sign-On)
      const result = await signInWithPopup(auth, googleProvider);
      onLogin({ user: result.user }); // Passa o objeto do usuário logado
    } catch (err) {
      setError('Erro ao logar com Google. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // PASSWORD RECOVERY: Fluxo de redefinição de credenciais de usuário
  const handleForgotPassword = async () => {
    if (!email) {
      setError('Digite seu e-mail para recuperar a senha.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // EMAIL NOTIFICATION: Disparo de e-mail transacional automatizado via Firebase
      await sendPasswordResetEmail(auth, email);
      setMessage('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
    } catch (err) {
      setError('Erro ao enviar e-mail de recuperação. Verifique o endereço digitado.');
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

      <Card sx={{ maxWidth: 480, width: '100%', borderRadius: 6, boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)' }}>
        <CardContent sx={{ p: { xs: 5, sm: 6 } }}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={5}>
            {/* BRANDING: Renderização de asset de marca (Avatar) */}
            <Avatar 
              src={logo} 
              alt="Focus Up Logo" 
           
              sx={{ width: 120, height: 120, mb: 3, bgcolor: 'transparent' }} 
            />
            {/* TYPOGRAPHY: Hierarquia visual de títulos mantendo a consistência do Design System */}
            <Typography variant="h4" color="primary" fontWeight="bold">
              Bem-vindo
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Acesse sua conta para continuar
            </Typography>
          </Box>

          {/* FORM HANDLING: Captura de dados de entrada com validação integrada */}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              variant="outlined"
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // TWO-WAY DATA BINDING: Atualização do estado em tempo real
              required
     
              sx={{ mb: 4 }}
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
              type={showPassword ? 'text' : 'password'} // CONDITIONAL RENDERING: Alternância dinâmica do tipo de input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
             
              sx={{ mb: 2 }}
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

            {/* CALL TO ACTION SECUNDÁRIO: Roteamento virtual para recuperação de acesso */}
            {/* Link de Esqueci a Senha */}
            <Box display="flex" justifyContent="flex-end" mb={3}>
              <Link
                component="button"
                variant="body2"
                onClick={handleForgotPassword}
                sx={{ textTransform: 'none', color: 'text.secondary' }}
              >
                Esqueci minha senha
              </Link>
            </Box>

            {/* USER FEEDBACK: Exibição condicional de alertas de erro baseados no estado */}
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
                {error}
              </Alert>
            )}

            {/* USER FEEDBACK: Exibição condicional de alertas de sucesso operacionais */}
            {message && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 3 }}>
                {message}
              </Alert>
            )}

            {/* CALL TO ACTION PRIMÁRIO: Botão de submissão com indicador de progresso (UX Load State) */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              endIcon={loading ? <CircularProgress size={22} color="inherit" /> : <LoginIcon />}
              sx={{ py: 1.8, fontSize: '1.1rem', borderRadius: 3, mt: 1 }}
            >
              {loading ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>

      
          {/* VISUAL DIVIDER: Separação semântica entre métodos de autenticação */}
          <Divider sx={{ my: 4, color: 'text.secondary' }}>
            <Typography variant="body2">OU</Typography>
          </Divider>

      
          {/* Botão do Google */}
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<Google />}
            onClick={handleGoogleLogin}
            sx={{ py: 1.8, borderRadius: 3, textTransform: 'none', borderColor: 'grey.300', color: 'text.primary', '&:hover': { borderColor: 'grey.400' } }}
          >
            Entrar com Google

            
          </Button>
          {/* NAVIGATION: Redirecionamento para a tela de registro de novos usuários */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Ainda não tem uma conta?{' '}
              <Link 
                component="button" 
                variant="body2" 
                onClick={onNavigateToRegister} 
                underline="hover" 
                sx={{ fontWeight: 600, color: 'primary.main' }}
              >
                Crie uma agora
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}