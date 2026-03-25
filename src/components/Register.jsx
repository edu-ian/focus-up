import { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Stack, Link, Alert } from '@mui/material';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default function Register({ onRegister, onNavigateToLogin }) {
  // STATE MANAGEMENT: Controle de inputs do formulário
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');

  // EVENT HANDLER: Atualização dinâmica do estado (Two-way data binding)
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ASYNC FUNCTION: Integração com Firebase Auth para criar usuário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // VALIDAÇÃO FRONT-END: Checagem de integridade de senha
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem!');
      return;
    }

    try {
      // FIREBASE API: Requisição de criação de conta
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      onRegister(); // STATE LIFTING: Atualiza o estado no App.jsx
    } catch (err) {
      // ERROR HANDLING: Tratamento de exceções e feedback ao usuário
      setError('Erro ao criar conta: O e-mail já existe ou a senha é muito fraca.');
    }
  };

  return (
    // LAYOUT FLEXBOX: Centralização de conteúdo responsiva
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Card sx={{ maxWidth: 450, width: '100%', p: 2 }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom color="primary">Criar Nova Conta</Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Preencha os dados abaixo para garantir seu acesso.
          </Typography>

          {/* USER FEEDBACK: Exibição condicional de mensagens de erro */}
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          {/* FORM SUBMIT: Disparo da função principal de autenticação */}
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField label="Nome Completo" name="name" onChange={handleChange} fullWidth required />
              <TextField label="E-mail" name="email" type="email" onChange={handleChange} fullWidth required />
              <TextField label="Senha" name="password" type="password" onChange={handleChange} fullWidth required />
              <TextField label="Confirmar Senha" name="confirmPassword" type="password" onChange={handleChange} fullWidth required />
              
              {/* CALL TO ACTION (CTA): Botão de conversão principal */}
              <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 2 }}>
                Cadastrar
              </Button>
            </Stack>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Já tem uma conta?{' '}
              {/* NAVIGATION: Redirecionamento interno sem reload (SPA) */}
              <Link component="button" variant="body2" onClick={onNavigateToLogin} underline="hover" sx={{ fontWeight: 600 }}>
                Faça login aqui
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}