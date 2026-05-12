import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import { ArrowBack, VolunteerActivism } from '@mui/icons-material';
import { criarDoacao, listarMinhasDoacoes } from '../services/doacoesService';
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

export default function MyDonations({ user, userData, onBack }) {
  const notify = useNotify();
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tipo, setTipo] = useState('tempo');
  const [descricao, setDescricao] = useState('');
  const [detalhe, setDetalhe] = useState('');
  const [enviando, setEnviando] = useState(false);

  const carregar = async () => {
    setLoading(true);
    try {
      const rows = await listarMinhasDoacoes(user.uid);
      setLista(rows);
    } catch (e) {
      console.error(e);
      notify.error('Erro ao carregar registos.');
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
    if (!descricao.trim()) {
      notify.error('Descreva a contribuição.');
      return;
    }
    setEnviando(true);
    try {
      await criarDoacao({
        userId: user.uid,
        nomeUsuario: userData?.nome || user.displayName || user.email,
        tipo,
        descricao: descricao.trim(),
        detalhe: detalhe.trim(),
      });
      setDescricao('');
      setDetalhe('');
      notify.success('Registo enviado. Aguarde validação do administrador.');
      await carregar();
    } catch (err) {
      console.error(err);
      notify.error('Não foi possível registar.');
    } finally {
      setEnviando(false);
    }
  };

  const chip = (status) => {
    const map = {
      pendente: { label: 'Pendente', color: 'warning' },
      aceite: { label: 'Aceite', color: 'success' },
      recusada: { label: 'Recusada', color: 'error' },
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
        <VolunteerActivism color="primary" /> Contribuições
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Registo de tempo ou apoio simbólico (equivalente ao módulo de doações do cronograma).
      </Typography>

      <Card sx={{ borderRadius: 4, mb: 4 }}>
        <CardContent component="form" onSubmit={handleCriar}>
          <Typography variant="subtitle1" fontWeight="700" mb={2}>
            Novo registo
          </Typography>
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select value={tipo} label="Tipo" onChange={(e) => setTipo(e.target.value)}>
                <MenuItem value="tempo">Tempo / mentoria</MenuItem>
                <MenuItem value="financeira">Apoio financeiro (referência)</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Descrição"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              fullWidth
              required
              multiline
              minRows={2}
            />
            <TextField
              label={tipo === 'financeira' ? 'Referência / valor indicativo' : 'Horas ou notas'}
              value={detalhe}
              onChange={(e) => setDetalhe(e.target.value)}
              fullWidth
            />
            <Button type="submit" variant="contained" disabled={enviando}>
              {enviando ? <CircularProgress size={22} /> : 'Submeter'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {loading ? (
        <CircularProgress sx={{ display: 'block', mx: 'auto' }} />
      ) : lista.length === 0 ? (
        <Typography color="text.secondary">Ainda não tem registos.</Typography>
      ) : (
        <Stack spacing={2}>
          {lista.map((d) => (
            <Card key={d.id} sx={{ borderRadius: 4 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
                  <Box>
                    <Chip label={d.tipo} size="small" sx={{ mb: 1 }} variant="outlined" />
                    <Typography variant="body1" fontWeight="600">
                      {d.descricao}
                    </Typography>
                    {d.detalhe ? (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {d.detalhe}
                      </Typography>
                    ) : null}
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      {formatDate(d.createdAt)}
                    </Typography>
                  </Box>
                  {chip(d.status)}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}
