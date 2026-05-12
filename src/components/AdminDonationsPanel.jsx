import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
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
import { listarDoacoesAdmin, atualizarStatusDoacao } from '../services/doacoesService';
import { auth } from '../firebase';
import { useNotify } from '../context/NotifyContext';

export default function AdminDonationsPanel() {
  const notify = useNotify();
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notas, setNotas] = useState({});

  const carregar = async () => {
    setLoading(true);
    try {
      const data = await listarDoacoesAdmin(filtroTipo);
      setRows(data);
    } catch (e) {
      console.error(e);
      notify.error('Erro ao carregar contribuições.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroTipo]);

  const handleStatus = async (id, status) => {
    try {
      await atualizarStatusDoacao(id, status, notas[id] || '', auth.currentUser?.email);
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
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={2} mb={3}>
        <Typography variant="h5" fontWeight="800">
          Contribuições (admin)
        </Typography>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filtro por tipo</InputLabel>
          <Select value={filtroTipo} label="Filtro por tipo" onChange={(e) => setFiltroTipo(e.target.value)}>
            <MenuItem value="todos">Todos</MenuItem>
            <MenuItem value="tempo">Tempo / mentoria</MenuItem>
            <MenuItem value="financeira">Financeira</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Utilizador</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Descrição</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5}>Sem registos para este filtro.</TableCell>
            </TableRow>
          ) : (
            rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.nomeUsuario || r.userId}</TableCell>
                <TableCell>{r.tipo}</TableCell>
                <TableCell>
                  <Typography fontWeight="600">{r.descricao}</Typography>
                  {r.detalhe ? (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {r.detalhe}
                    </Typography>
                  ) : null}
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
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Button size="small" variant="contained" color="success" onClick={() => handleStatus(r.id, 'aceite')}>
                        Aceitar
                      </Button>
                      <Button size="small" variant="outlined" color="warning" onClick={() => handleStatus(r.id, 'pendente')}>
                        Pendente
                      </Button>
                      <Button size="small" variant="outlined" color="error" onClick={() => handleStatus(r.id, 'recusada')}>
                        Recusar
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
