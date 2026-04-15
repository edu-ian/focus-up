import { useState, useEffect } from 'react';
import { 
  Box, Card, CardContent, Typography, Grid, Button, Avatar, LinearProgress, Stack, 
  CircularProgress, TextField, IconButton, List, ListItem, ListItemText, ListItemIcon, 
  Checkbox, MenuItem, Select, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions,
  Drawer, Divider
} from '@mui/material';
import { 
  Logout, Pets, Storefront, AttachMoney, AddTask, Delete, 
  Assignment, Edit, PriorityHigh, Info, LowPriority, LightMode, DarkMode,
  Menu as MenuIcon, Person, Timer, HelpOutline, Close
} from '@mui/icons-material';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import PomodoroTimer from './PomodoroTimer';
import Shop from './Shop';

const calcularNivel = (xpTotal) => {
  let nivel = 1;
  let limiteAtual = 0;
  let proximoLimite = 500;
  let incremento = 500;
  while (xpTotal >= proximoLimite) {
    nivel++;
    limiteAtual = proximoLimite;
    incremento += 200;
    proximoLimite += incremento;
  }
  const percentagem = ((xpTotal - limiteAtual) / (proximoLimite - limiteAtual)) * 100;
  return { nivel, percentagem, xpNoNivelAtual: xpTotal - limiteAtual, xpNecessarioProNivel: proximoLimite - limiteAtual };
};

const PRIORIDADES = {
  1: { label: 'Urgente', color: '#e11d48', icon: <PriorityHigh fontSize="small" /> },
  2: { label: 'Importante', color: '#f59e0b', icon: <Info fontSize="small" /> },
  3: { label: 'Normal', color: '#10b981', icon: <LowPriority fontSize="small" /> }
};

export default function UserDashboard({ user, onLogout }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('dashboard');
  const [tarefas, setTarefas] = useState([]);
  const [novaTarefa, setNovaTarefa] = useState('');
  const [prioridadeNova, setPrioridadeNova] = useState(3);
  
  // Estados de UI
  const [editOpen, setEditOpen] = useState(false);
  const [tarefaSendoEditada, setTarefaSendoEditada] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  // Estados de Edição de Perfil
  const [editNome, setEditNome] = useState('');
  const [editFoto, setEditFoto] = useState('');

  // Modo Noturno/Claro
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('appTheme');
    return savedTheme ? savedTheme === 'dark' : false;
  });

  useEffect(() => {
    localStorage.setItem('appTheme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Tema Dinâmico
  const theme = isDarkMode ? {
    bg: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', cardBg: '#1e293b', border: '#334155', text: '#f8fafc',
    textSec: '#94a3b8', itemBg: '#334155', coinBg: '#065f46', coinText: '#34d399', inputBg: '#334155',
    petBoxBg: '#0f172a', petCircle: '#334155', hover: '#334155'
  } : {
    bg: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', cardBg: '#ffffff', border: '#cbd5e1', text: '#0f172a',
    textSec: '#64748b', itemBg: '#f8fafc', coinBg: '#ecfdf5', coinText: '#059669', inputBg: '#ffffff',
    petBoxBg: '#f8fafc', petCircle: '#f1f5f9', hover: '#f1f5f9'
  };

  const fetchUserData = async () => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserData(data);
        setEditNome(data.nome || '');
        setEditFoto(data.fotoUrl || '');
        const listaOrdenada = (data.tarefas || []).sort((a, b) => (a.prioridade || 3) - (b.prioridade || 3));
        setTarefas(listaOrdenada);
      }
    } catch (error) { 
      console.error(error); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchUserData(); }, [user]);

  const salvarNoFirebase = async (novasTarefas) => {
    const listaOrdenada = [...novasTarefas].sort((a, b) => (a.prioridade || 3) - (b.prioridade || 3));
    setTarefas(listaOrdenada);
    await updateDoc(doc(db, "users", user.uid), { tarefas: listaOrdenada });
  };

  const handleAddTarefa = () => {
    if (!novaTarefa.trim()) return;
    const novaLista = [...tarefas, { id: Date.now(), texto: novaTarefa, concluida: false, prioridade: prioridadeNova }];
    setNovaTarefa(''); 
    setPrioridadeNova(3); 
    salvarNoFirebase(novaLista);
  };

  const handleToggleTarefa = async (id) => {
    const tarefa = tarefas.find(t => t.id === id);
    const isCompleting = !tarefa.concluida;
    
    const novaLista = tarefas.map(t => t.id === id ? { ...t, concluida: isCompleting } : t);
    salvarNoFirebase(novaLista);

    if (isCompleting) {
      await updateDoc(doc(db, "users", user.uid), { tarefas_concluidas: increment(1) });
      setUserData(prev => ({...prev, tarefas_concluidas: (prev.tarefas_concluidas || 0) + 1}));
    }
  };

  const handleDeleteTarefa = (id) => salvarNoFirebase(tarefas.filter(t => t.id !== id));
  
  const handleOpenEdit = (tarefa) => { 
    setTarefaSendoEditada({ ...tarefa }); 
    setEditOpen(true); 
  };
  
  const handleSaveEdit = () => {
    const novaLista = tarefas.map(t => t.id === tarefaSendoEditada.id ? tarefaSendoEditada : t);
    salvarNoFirebase(novaLista); 
    setEditOpen(false);
  };

  const handleSalvarPerfil = async () => {
    await updateDoc(doc(db, "users", user.uid), { nome: editNome, fotoUrl: editFoto });
    setUserData(prev => ({ ...prev, nome: editNome, fotoUrl: editFoto }));
    setActiveModal(null);
  };

  const openMenuModal = (modalName) => {
    setActiveModal(modalName);
    setDrawerOpen(false);
  };

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 10 }} />;
  const statusNivel = calcularNivel(userData?.xp_pet || 0);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', transition: 'all 0.3s ease', background: theme.bg, color: theme.text }}>
      
      {/* MENU LATERAL (DRAWER) */}
      <Drawer 
        anchor="left" 
        open={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        PaperProps={{ sx: { width: 280, bgcolor: theme.cardBg, color: theme.text, borderRight: `1px solid ${theme.border}` } }}
      >
        <Box p={3} display="flex" flexDirection="column" height="100%">
          <Typography variant="h6" fontWeight="bold" mb={3} display="flex" alignItems="center" gap={1}>
            <MenuIcon color="primary" /> Menu
          </Typography>
          <List sx={{ flexGrow: 1 }}>
            <ListItem button onClick={() => openMenuModal('profile')} sx={{ borderRadius: 2, mb: 1, '&:hover': { bgcolor: theme.hover } }}>
              <ListItemIcon><Person sx={{ color: theme.textSec }} /></ListItemIcon>
              <ListItemText primary="Meu Perfil" />
            </ListItem>
            <ListItem button onClick={() => openMenuModal('pomodoro')} sx={{ borderRadius: 2, mb: 1, '&:hover': { bgcolor: theme.hover } }}>
              <ListItemIcon><Timer sx={{ color: theme.textSec }} /></ListItemIcon>
              <ListItemText primary="O que é o Pomodoro?" />
            </ListItem>
            <Divider sx={{ my: 2, borderColor: theme.border }} />
            <ListItem button onClick={() => openMenuModal('support')} sx={{ borderRadius: 2, mb: 1, '&:hover': { bgcolor: theme.hover } }}>
              <ListItemIcon><HelpOutline sx={{ color: theme.textSec }} /></ListItemIcon>
              <ListItemText primary="Suporte" />
            </ListItem>
            <ListItem button onClick={() => openMenuModal('about')} sx={{ borderRadius: 2, mb: 1, '&:hover': { bgcolor: theme.hover } }}>
              <ListItemIcon><Info sx={{ color: theme.textSec }} /></ListItemIcon>
              <ListItemText primary="Sobre o Projeto" />
            </ListItem>
          </List>
          <Button variant="outlined" color="error" fullWidth startIcon={<Logout />} onClick={onLogout}>
            Sair da Conta
          </Button>
        </Box>
      </Drawer>

      {view === 'shop' ? (
        <Shop userData={{ ...userData, uid: user.uid }} onBack={() => setView('dashboard')} onPurchase={fetchUserData} />
      ) : (
        <Box sx={{ maxWidth: 1200, margin: '0 auto' }}>
          
          {/* Cabeçalho */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} sx={{ p: 2 }}>
            <Stack direction="row" alignItems="center" gap={2}>
              <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: theme.text, bgcolor: theme.itemBg, '&:hover': { bgcolor: theme.border } }}>
                <MenuIcon />
              </IconButton>
              <Avatar src={userData?.fotoUrl} sx={{ width: 50, height: 50, bgcolor: '#6366f1', color: '#fff', boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)' }}>
                {!userData?.fotoUrl && userData?.nome?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h5" fontWeight="700" sx={{ display: { xs: 'none', sm: 'block' } }}>
                Olá, {userData?.nome}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton onClick={() => setIsDarkMode(!isDarkMode)} sx={{ color: theme.text }}>
                {isDarkMode ? <LightMode /> : <DarkMode />}
              </IconButton>
              <Button variant="contained" sx={{ bgcolor: '#fbbf24', '&:hover': {bgcolor: '#d97706'}, color: '#000', borderRadius: 2 }} startIcon={<Storefront />} onClick={() => setView('shop')}>
                Mercado
              </Button>
            </Stack>
          </Box>

          <Grid container spacing={3}>
            {/* Esquerda: Tarefas em Cima, Pomodoro em Baixo */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack spacing={3}>
                {/* Lista de Tarefas (Movida para Cima) */}
                <Card sx={{ bgcolor: theme.cardBg, color: theme.text, borderRadius: 2, border: `1px solid ${theme.border}`, transition: 'all 0.3s ease' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="700" mb={3} display="flex" alignItems="center" gap={1}>
                      <Assignment sx={{ color: '#6366f1' }} /> Lista de Foco
                    </Typography>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} mb={3}>
                      <TextField 
                        fullWidth 
                        size="small" 
                        placeholder="O que precisa de fazer?" 
                        value={novaTarefa} 
                        onChange={(e) => setNovaTarefa(e.target.value)} 
                        sx={{ input: { color: theme.text }, '& .MuiOutlinedInput-root': { bgcolor: theme.inputBg } }} 
                      />
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select value={prioridadeNova} onChange={(e) => setPrioridadeNova(e.target.value)} sx={{ color: theme.text, bgcolor: theme.inputBg }}>
                          <MenuItem value={1}>Urgente</MenuItem>
                          <MenuItem value={2}>Importante</MenuItem>
                          <MenuItem value={3}>Normal</MenuItem>
                        </Select>
                      </FormControl>
                      <Button variant="contained" sx={{ bgcolor: '#6366f1', color: '#fff' }} onClick={handleAddTarefa}>
                        <AddTask />
                      </Button>
                    </Stack>

                    <List>
                      {tarefas.map((t) => {
                        const prioridadeAtual = t.prioridade || 3;
                        return (
                          <ListItem 
                            key={t.id} 
                            sx={{ mb: 1, bgcolor: theme.itemBg, borderRadius: 1, transition: 'all 0.3s ease' }} 
                            secondaryAction={
                              <Stack direction="row">
                                <IconButton onClick={() => handleOpenEdit(t)} size="small" sx={{ color: theme.textSec }}><Edit fontSize="small" /></IconButton>
                                <IconButton onClick={() => handleDeleteTarefa(t.id)} size="small" sx={{ color: '#ef4444' }}><Delete fontSize="small" /></IconButton>
                              </Stack>
                            }
                          >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              <Checkbox checked={t.concluida} onChange={() => handleToggleTarefa(t.id)} sx={{ color: '#6366f1', '&.Mui-checked': { color: '#10b981' } }} />
                            </ListItemIcon>
                            <ListItemText 
                              primary={t.texto} 
                              secondary={
                                <Box display="flex" alignItems="center" gap={0.5} sx={{ color: PRIORIDADES[prioridadeAtual].color, fontWeight: 'bold', fontSize: '0.75rem', mt: 0.5 }}>
                                  {PRIORIDADES[prioridadeAtual].icon} {PRIORIDADES[prioridadeAtual].label}
                                </Box>
                              }
                              sx={{ textDecoration: t.concluida ? 'line-through' : 'none', opacity: t.concluida ? 0.5 : 1, color: theme.text }}
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  </CardContent>
                </Card>

                {/* Pomodoro Timer (Movido para Baixo) */}
                <PomodoroTimer userId={user.uid} onSessionComplete={fetchUserData} isDarkMode={isDarkMode} />
              </Stack>
            </Grid>

            {/* Direita: Pet */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Card sx={{ bgcolor: theme.cardBg, color: theme.text, borderRadius: 2, height: '100%', border: `1px solid ${theme.border}`, transition: 'all 0.3s ease' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Typography variant="h6" fontWeight="700">Seu Companheiro</Typography>
                    <Box sx={{ bgcolor: theme.coinBg, color: theme.coinText, px: 1.5, py: 0.5, borderRadius: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AttachMoney fontSize="small" /> <strong>{userData?.moedas || 0}</strong>
                    </Box>
                  </Box>

                  <Box textAlign="center" mb={4}>
                    {/* Substituição do Ícone Pets pela imagem da foca (focus.png) */}
                    <Box sx={{ width: 120, height: 120, mx: 'auto', mb: 2, bgcolor: theme.petCircle, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid #6366f1', overflow: 'hidden' }}>
                      <img src="/focus.png" alt="Foca" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                    </Box>
                    <Typography variant="h6" fontWeight="bold">{userData?.evolution || 'Foca Iniciante'}</Typography>
                    
                    <Box sx={{ mt: 3, p: 2, bgcolor: theme.petBoxBg, borderRadius: 2 }}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="caption" sx={{ color: '#fbbf24', fontWeight: 'bold' }}>NÍVEL {statusNivel.nivel}</Typography>
                        <Typography variant="caption" sx={{ color: theme.textSec }}>{statusNivel.xpNoNivelAtual}/{statusNivel.xpNecessarioProNivel} XP</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={statusNivel.percentagem} sx={{ height: 6, borderRadius: 3, bgcolor: theme.itemBg, '& .MuiLinearProgress-bar': { bgcolor: '#fbbf24' } }} />
                    </Box>
                  </Box>

                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" sx={{ color: theme.textSec, fontWeight: 'bold' }}>ENERGIA</Typography>
                      <LinearProgress variant="determinate" value={userData?.energy || 0} color="primary" sx={{ height: 8, borderRadius: 1, bgcolor: theme.itemBg, mt: 0.5 }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: theme.textSec, fontWeight: 'bold' }}>FOME</Typography>
                      <LinearProgress variant="determinate" value={userData?.hunger || 0} sx={{ height: 8, borderRadius: 1, bgcolor: theme.itemBg, mt: 0.5, '& .MuiLinearProgress-bar': { bgcolor: '#f43f5e' } }} />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* --- MODAIS DO MENU --- */}

      {/* Modal de Perfil */}
      <Dialog open={activeModal === 'profile'} onClose={() => setActiveModal(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: theme.cardBg, color: theme.text, borderRadius: 2 } }}>
        <DialogTitle display="flex" justifyContent="space-between" alignItems="center">
          Meu Perfil 
          <IconButton onClick={() => setActiveModal(null)} sx={{ color: theme.textSec }}><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: theme.border }}>
          <Stack direction={{xs: 'column', sm: 'row'}} spacing={4} alignItems="center" mb={4}>
            <Avatar src={editFoto} sx={{ width: 100, height: 100, fontSize: '3rem', bgcolor: '#6366f1' }}>
              {!editFoto && editNome.charAt(0).toUpperCase()}
            </Avatar>
            <Box width="100%">
              <TextField 
                fullWidth margin="dense" label="Nome de Exibição" 
                value={editNome} onChange={(e) => setEditNome(e.target.value)} 
                sx={{ input: { color: theme.text }, label: { color: theme.textSec }, mb: 2 }} 
              />
              <TextField 
                fullWidth margin="dense" label="URL da Foto de Perfil" placeholder="https://..." 
                value={editFoto} onChange={(e) => setEditFoto(e.target.value)} 
                sx={{ input: { color: theme.text }, label: { color: theme.textSec } }} 
              />
            </Box>
          </Stack>
          
          <Typography variant="h6" fontWeight="bold" mb={2}>Estatísticas</Typography>
          
          {/* Aqui está o Grid das estatísticas agora quebrado em várias linhas */}
          <Grid container spacing={2}>
            <Grid size={6}>
              <Box p={2} bgcolor={theme.petBoxBg} borderRadius={2} textAlign="center">
                <Typography variant="h4" color="#6366f1" fontWeight="bold">{userData?.pomodoros_feitos || 0}</Typography>
                <Typography variant="caption" color={theme.textSec}>Sessões Foco</Typography>
              </Box>
            </Grid>
            <Grid size={6}>
              <Box p={2} bgcolor={theme.petBoxBg} borderRadius={2} textAlign="center">
                <Typography variant="h4" color="#10b981" fontWeight="bold">{userData?.tarefas_concluidas || 0}</Typography>
                <Typography variant="caption" color={theme.textSec}>Tarefas Feitas</Typography>
              </Box>
            </Grid>
            <Grid size={4}>
              <Box p={2} bgcolor={theme.petBoxBg} borderRadius={2} textAlign="center">
                <Typography variant="h5" color="#fbbf24" fontWeight="bold">Lvl {statusNivel.nivel}</Typography>
                <Typography variant="caption" color={theme.textSec}>Nível do Pet</Typography>
              </Box>
            </Grid>
            <Grid size={4}>
              <Box p={2} bgcolor={theme.petBoxBg} borderRadius={2} textAlign="center">
                <Typography variant="h5" color="#3b82f6" fontWeight="bold">{userData?.energy}%</Typography>
                <Typography variant="caption" color={theme.textSec}>Energia</Typography>
              </Box>
            </Grid>
            <Grid size={4}>
              <Box p={2} bgcolor={theme.petBoxBg} borderRadius={2} textAlign="center">
                <Typography variant="h5" color="#f43f5e" fontWeight="bold">{userData?.hunger}%</Typography>
                <Typography variant="caption" color={theme.textSec}>Fome</Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleSalvarPerfil} variant="contained" sx={{ bgcolor: '#6366f1', color: '#fff' }}>
            Guardar Alterações
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Pomodoro */}
      <Dialog open={activeModal === 'pomodoro'} onClose={() => setActiveModal(null)} PaperProps={{ sx: { bgcolor: theme.cardBg, color: theme.text, borderRadius: 2 } }}>
        <DialogTitle display="flex" justifyContent="space-between">
          <Box>O Método Pomodoro</Box> 
          <IconButton onClick={() => setActiveModal(null)} sx={{ color: theme.textSec }}><Close/></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: theme.border }}>
          <Typography mb={2}>O Método Pomodoro é uma técnica de gestão de tempo desenvolvida no final dos anos 80. Consiste em dividir o trabalho em períodos de foco intenso, seguidos de pausas curtas.</Typography>
          <Typography mb={1}><strong>1. Modo Foco (25 min):</strong> Trabalha numa única tarefa sem qualquer distração.</Typography>
          <Typography mb={1}><strong>2. Pausa Curta (5 min):</strong> Descansa a mente, bebe água ou levanta-te.</Typography>
          <Typography>No Focus Up, cada sessão de foco concluída recompensa-te com <strong>XP</strong> e <strong>Moedas</strong> para comprar no Mercado do foco e evoluíres o teu Pet!</Typography>
        </DialogContent>
      </Dialog>

      {/* Modal Suporte */}
      <Dialog open={activeModal === 'support'} onClose={() => setActiveModal(null)} PaperProps={{ sx: { bgcolor: theme.cardBg, color: theme.text, borderRadius: 2 } }}>
        <DialogTitle display="flex" justifyContent="space-between">
          <Box>Suporte</Box> 
          <IconButton onClick={() => setActiveModal(null)} sx={{ color: theme.textSec }}><Close/></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: theme.border }}>
          <Typography mb={2}>Encontraste um bug ou precisas de ajuda com a tua conta?</Typography>
          <Typography color="primary" fontWeight="bold">Email: eduianbf@gmail.com ou WhatsApp (41)992516116.</Typography>
          <Typography>O Foca Aqui ainda esta em produção e por isso ele é instavel.</Typography>
        </DialogContent>
      </Dialog>

      {/* Modal Sobre */}
      <Dialog open={activeModal === 'about'} onClose={() => setActiveModal(null)} PaperProps={{ sx: { bgcolor: theme.cardBg, color: theme.text, borderRadius: 2 } }}>
        <DialogTitle display="flex" justifyContent="space-between">
          <Box>Sobre o Projeto</Box> 
          <IconButton onClick={() => setActiveModal(null)} sx={{ color: theme.textSec }}><Close/></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: theme.border }}>
          <Typography mb={2}><strong>Foca aqui</strong> foi criado para tornar a produtividade divertida e gratificante através da gamificação.</Typography>
          <Typography>A ideia começou para suprir o meu TDAH e minha preguiça, mas assim veio a ideia de ajudar outras pessoas </Typography>
          <Typography>Desenvolvido com carinho em React, Material UI e Firebase.</Typography>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição de Tarefa */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} PaperProps={{ sx: { bgcolor: theme.cardBg, color: theme.text, borderRadius: 2 } }}>
        <DialogTitle>Editar Tarefa</DialogTitle>
        <DialogContent>
          <TextField 
            fullWidth margin="dense" label="Texto da Tarefa" 
            value={tarefaSendoEditada?.texto || ''} 
            onChange={(e) => setTarefaSendoEditada({...tarefaSendoEditada, texto: e.target.value})} 
            sx={{ input: { color: theme.text }, label: { color: theme.textSec } }} 
          />
          <FormControl fullWidth margin="dense">
            <InputLabel sx={{ color: theme.textSec }}>Prioridade</InputLabel>
            <Select 
              value={tarefaSendoEditada?.prioridade || 3} 
              onChange={(e) => setTarefaSendoEditada({...tarefaSendoEditada, prioridade: e.target.value})} 
              sx={{ color: theme.text, bgcolor: theme.inputBg }}
            >
              <MenuItem value={1}>Urgente</MenuItem>
              <MenuItem value={2}>Importante</MenuItem>
              <MenuItem value={3}>Normal</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditOpen(false)} sx={{ color: theme.textSec }}>Cancelar</Button>
          <Button onClick={handleSaveEdit} variant="contained" sx={{ bgcolor: '#6366f1', color: '#fff' }}>Guardar Alterações</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}