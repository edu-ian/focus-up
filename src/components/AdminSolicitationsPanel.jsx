import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import { listarTodasSolicitacoesAdmin, atualizarStatusSolicitacao } from '../services/solicitacoesService';
import { auth } from '../firebase';
import { useNotify } from '../context/NotifyContext';

export default function AdminSolicitationsPanel() {
  const notify = useNotify();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notas, setNotas] = useState({});

  const carregar = async () => {
    setLoading(true);
    try {
      const data = await listarTodasSolicitacoesAdmin();
      setRows(data);
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
  }, []);

  const handleStatus = async (id, status) => {
    try {
      await atualizarStatusSolicitacao(id, status, notas[id] || '', auth.currentUser?.email);
      notify.success('Estado atualizado.');
      await carregar();
    } catch (e) {
      console.error(e);
      notify.error('Falha ao atualizar.');
    }
  };

  if (loading) {
    return (
      <Box py={6} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight="800" mb={2}>
        Solicitações (admin)
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Filtre mentalmente por estado; altere o estado e opcionalmente deixe uma nota interna.
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Utilizador</TableCell>
            <TableCell>Título</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4}>Sem solicitações.</TableCell>
            </TableRow>
          ) : (
            rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.nomeUsuario || r.userId}</TableCell>
                <TableCell>
                  <Typography fontWeight="600">{r.titulo}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {r.descricao}
                  </Typography>
                </TableCell>
                <TableCell>{r.status}</TableCell>
                <TableCell>
                  <Stack spacing={1} alignItems="flex-start">
                    <TextField
                      size="small"
                      placeholder="Nota (opcional)"
                      value={notas[r.id] || ''}
                      onChange={(e) => setNotas((m) => ({ ...m, [r.id]: e.target.value }))}
                    />
                    <Stack direction="row" spacing={1}>
                      <Button size="small" variant="contained" color="success" onClick={() => handleStatus(r.id, 'aprovada')}>
                        Aprovar
                      </Button>
                      <Button size="small" variant="outlined" color="warning" onClick={() => handleStatus(r.id, 'pendente')}>
                        Pendente
                      </Button>
                      <Button size="small" variant="outlined" color="error" onClick={() => handleStatus(r.id, 'rejeitada')}>
                        Rejeitar
                      </Button>
                    </Stack>
                  </Stack>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Box>
  );
}
