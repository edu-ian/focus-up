import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNotify } from '../context/NotifyContext';

export default function Settings({ user, userData, onBack, onSaved }) {
  const notify = useNotify();
  const [nome, setNome] = useState(userData?.nome || '');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const isGoogleOnly =
    user?.providerData?.length > 0 &&
    user.providerData.every((p) => p.providerId === 'google.com');

  const handleSalvarPerfil = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), { nome: nome.trim() });
      notify.success('Perfil atualizado.');
      onSaved?.();
    } catch (err) {
      console.error(err);
      notify.error('Não foi possível guardar o perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleAlterarSenha = async (e) => {
    e.preventDefault();
    if (novaSenha.length < 6) {
      notify.error('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (novaSenha !== confirmaSenha) {
      notify.error('A confirmação não coincide com a nova senha.');
      return;
    }
    setLoading(true);
    try {
      const cred = EmailAuthProvider.credential(user.email, senhaAtual);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, novaSenha);
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmaSenha('');
      notify.success('Senha alterada com sucesso.');
    } catch (err) {
      console.error(err);
      notify.error('Não foi possível alterar a senha. Verifique a senha atual.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={onBack} sx={{ mb: 2 }}>
        Voltar
      </Button>
      <Typography variant="h4" fontWeight="800" mb={3}>
        Definições da conta
      </Typography>

      <Stack spacing={4}>
        <Card sx={{ borderRadius: 4 }}>
          <CardContent component="form" onSubmit={handleSalvarPerfil}>
            <Typography variant="h6" fontWeight="700" mb={2}>
              Perfil
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              E-mail: <strong>{user.email}</strong>
            </Typography>
            {userData?.perfil && (
              <Typography variant="body2" color="text.secondary" mb={2}>
                Perfil de utilização: <strong>{userData.perfil}</strong>
              </Typography>
            )}
            <TextField
              label="Nome a apresentar"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Button type="submit" variant="contained" disabled={loading}>
              Guardar nome
            </Button>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 4 }}>
          <CardContent component={isGoogleOnly ? 'div' : 'form'} onSubmit={!isGoogleOnly ? handleAlterarSenha : undefined}>
            <Typography variant="h6" fontWeight="700" mb={2}>
              Segurança
            </Typography>
            {isGoogleOnly ? (
              <Alert severity="info">
                Conta associada ao Google: a palavra-passe é gerida na conta Google. Use a recuperação de senha do Google se
                necessário.
              </Alert>
            ) : (
              <>
                <TextField
                  label="Senha atual"
                  type="password"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  fullWidth
                  sx={{ mb: 2 }}
                  autoComplete="current-password"
                />
                <TextField
                  label="Nova senha"
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  fullWidth
                  sx={{ mb: 2 }}
                  autoComplete="new-password"
                />
                <TextField
                  label="Confirmar nova senha"
                  type="password"
                  value={confirmaSenha}
                  onChange={(e) => setConfirmaSenha(e.target.value)}
                  fullWidth
                  sx={{ mb: 2 }}
                  autoComplete="new-password"
                />
                <Button type="submit" variant="outlined" disabled={loading}>
                  Alterar palavra-passe
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
