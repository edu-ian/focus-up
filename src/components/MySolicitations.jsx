import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import { ArrowBack, Assignment } from '@mui/icons-material';
import { criarSolicitacao, listarMinhasSolicitacoes } from '../services/solicitacoesService';
import { useNotify } from '../context/NotifyContext';

function formatDate(v) {
  if (!v) return '—';
  try {
    const d = v.toDate ? v.toDate() : new Date(v);
    return d.toLocaleString('pt-PT');
  } catch {
    return '—';
  }
}

export default function MySolicitations({ user, userData, onBack }) {
  const notify = useNotify();
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [enviando, setEnviando] = useState(false);

  const carregar = async () => {
    setLoading(true);
    try {
      const rows = await listarMinhasSolicitacoes(user.uid);
      setLista(rows);
    } catch (e) {
      console.error(e);
      notify.error('Erro ao carregar solicitações.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.uid]);

  const handleCriar = async (e) => {
    e.preventDefault();
    if (!titulo.trim()) {
      notify.error('Indique um título.');
      return;
    }
    setEnviando(true);
    try {
      await criarSolicitacao({
        userId: user.uid,
        nomeUsuario: userData?.nome || user.displayName || user.email,
        titulo: titulo.trim(),
        descricao: descricao.trim(),
      });
      setTitulo('');
      setDescricao('');
      notify.success('Solicitação enviada.');
      await carregar();
    } catch (err) {
      console.error(err);
      notify.error('Não foi possível criar a solicitação.');
    } finally {
      setEnviando(false);
    }
  };

  const chip = (status) => {
    const map = {
      pendente: { label: 'Pendente', color: 'warning' },
      aprovada: { label: 'Aprovada', color: 'success' },
      rejeitada: { label: 'Rejeitada', color: 'error' },
    };
    const c = map[status] || { label: status, color: 'default' };
    return <Chip size="small" label={c.label} color={c.color} />;
  };

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={onBack} sx={{ mb: 2 }}>
        Voltar
      </Button>
      <Typography variant="h4" fontWeight="800" mb={1} display="flex" alignItems="center" gap={1}>
        <Assignment color="primary" /> Minhas solicitações
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Pedidos de apoio ou revisão (equivalente ao fluxo de solicitação do cronograma).
      </Typography>

      <Card sx={{ borderRadius: 4, mb: 4 }}>
        <CardContent component="form" onSubmit={handleCriar}>
          <Typography variant="subtitle1" fontWeight="700" mb={2}>
            Nova solicitação
          </Typography>
          <Stack spacing={2}>
            <TextField label="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} fullWidth required />
            <TextField
              label="Descrição"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              fullWidth
              multiline
              minRows={3}
            />
            <Button type="submit" variant="contained" disabled={enviando}>
              {enviando ? <CircularProgress size={22} /> : 'Enviar'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {loading ? (
        <CircularProgress sx={{ display: 'block', mx: 'auto' }} />
      ) : lista.length === 0 ? (
        <Typography color="text.secondary">Ainda não tem solicitações.</Typography>
      ) : (
        <Stack spacing={2}>
          {lista.map((s) => (
            <Card key={s.id} sx={{ borderRadius: 4 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
                  <Box>
                    <Typography variant="h6" fontWeight="700">
                      {s.titulo}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {s.descricao || '—'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      {formatDate(s.createdAt)}
                    </Typography>
                  </Box>
                  {chip(s.status)}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}
