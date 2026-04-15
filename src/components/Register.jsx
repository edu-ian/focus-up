import { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Stack, Link, Alert, CircularProgress } from '@mui/material';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; 
import { auth, db } from '../firebase'; 

export default function Register({ onRegister, onNavigateToLogin }) {
  // Estado único para controlar os inputs
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Adicionado o estado que faltava

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Verificação de segurança corrigida para usar formData.name
    if (formData.name.length > 20) {
      setError('O nome deve ter no máximo 20 caracteres.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem!');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        nome: formData.name || formData.email.split('@')[0],
        nivel_pet: 1,
        xp_pet: 0,
        hunger: 100,
        energy: 100,
        evolution: 'Ovo',
        lastUpdate: new Date(),
        lastCategory: 'Foco Geral'
      });

      onRegister(); 
    } catch (err) {
      setError('Erro ao criar conta: O e-mail já existe ou a senha é muito fraca.');
      console.error(err);
      setLoading(false); // Reseta o botão em caso de erro
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Card sx={{ maxWidth: 450, width: '100%', p: 2 }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom color="primary">Criar Nova Conta</Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Preenche os dados abaixo para garantir o teu acesso.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {/* Campo de nome corrigido para alinhar com o formData */}
              <TextField
                  fullWidth
                  label="Nome Completo"
                  name="name"
                  variant="outlined"
                  value={formData.name}
                  onChange={handleChange}
                  inputProps={{ maxLength: 20 }} 
                  required
                />
              <TextField label="E-mail" name="email" type="email" value={formData.email} onChange={handleChange} fullWidth required />
              <TextField label="Senha" name="password" type="password" value={formData.password} onChange={handleChange} fullWidth required />
              <TextField label="Confirmar Senha" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} fullWidth required />
              
              <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 2 }} disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Cadastrar'}
              </Button>
            </Stack>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Já tens uma conta?{' '}
              <Link component="button" variant="body2" onClick={onNavigateToLogin} underline="hover" sx={{ fontWeight: 600 }}>
                Faz login aqui
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}