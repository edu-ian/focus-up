import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, TextField, Stack, IconButton } from '@mui/material';
import { PlayArrow, Pause, Stop, CheckCircle } from '@mui/icons-material';
// IMPORTANTE: Importamos o setDoc para evitar erros se a conta for muito nova
import { doc, setDoc, getDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { useNotify } from '../context/NotifyContext';

const WORK_SEC = 25 * 60;
const BREAK_SEC = 5 * 60;

export default function PomodoroTimer({ userId, onSessionComplete }) {
  const notify = useNotify();
  const [timeLeft, setTimeLeft] = useState(WORK_SEC);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [task, setTask] = useState('');
  const [currentTask, setCurrentTask] = useState(null);

  async function handleTimerComplete() {
    setIsActive(false);
    
    if (!isBreak) {
      notify.success('Sessão concluída! Ganhaste XP.');
      
      // Atualizar Firebase do Utilizador com Limite de Zero
      if (userId) {
        const userRef = doc(db, "users", userId);
        const agora = new Date();
        
        try {
          // 1. Lemos o status atual do Pet
          const userSnap = await getDoc(userRef);
          let novaEnergia = 90; // Valores padrão caso seja o primeiro pomodoro
          let novaFome = 85;
          
          if (userSnap.exists()) {
            const data = userSnap.data();
            // 2. Calculamos o novo valor garantindo que nunca é menor que 0
            novaEnergia = Math.max(0, (data.energy !== undefined ? data.energy : 100) - 10);
            novaFome = Math.max(0, (data.hunger !== undefined ? data.hunger : 100) - 15);
          }

          // 3. Guardamos os novos valores calculados
          await setDoc(userRef, {
            xp_pet: increment(150),
            energy: novaEnergia, 
            hunger: novaFome,
            lastCategory: currentTask || 'pomodoro',
            moedas: increment(50),
            lastUpdate: agora
          }, { merge: true });
          
          // Atualizar métrica global
          const metricsRef = doc(db, "dashboard", "metrics");
          await setDoc(metricsRef, {
            total_pomodoros_app: increment(1)
          }, { merge: true });

          if(onSessionComplete) onSessionComplete();
        } catch (error) {
          console.error("Erro ao salvar progresso:", error);
        }
      }
      
      setIsBreak(true);
      setTimeLeft(BREAK_SEC);
    } else {
      notify.success('Pausa terminada. De volta ao trabalho!');
      setIsBreak(false);
      setTimeLeft(WORK_SEC);
    }
  }

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((time) => time - 1), 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }
    return () => clearInterval(interval);
    // handleTimerComplete depende do estado na conclusão; incluir nas deps re-dispara ao zerar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(isBreak ? BREAK_SEC : WORK_SEC);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSetTask = () => {
    if (task.trim()) {
      setCurrentTask(task);
      setTask('');
    }
  };

  return (
    <Card sx={{ borderRadius: 6, textAlign: 'center', p: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }}>
      <CardContent>
        <Typography variant="h5" fontWeight="bold" color={isBreak ? 'success.main' : 'primary'} gutterBottom>
          {isBreak ? 'Pausa Curta' : 'Sessão de Foco'}
        </Typography>

        <Typography variant="h1" fontWeight="900" sx={{ my: 4, fontFamily: 'monospace', color: 'text.primary' }}>
          {formatTime(timeLeft)}
        </Typography>

        <Stack direction="row" justifyContent="center" spacing={2} mb={4}>
          <Button 
            variant="contained" 
            color={isActive ? "warning" : "primary"} 
            size="large" 
            onClick={toggleTimer}
            startIcon={isActive ? <Pause /> : <PlayArrow />}
            sx={{ px: 4, py: 1.5, borderRadius: 8 }}
          >
            {isActive ? 'Pausar' : 'Iniciar'}
          </Button>
          <Button variant="outlined" color="error" size="large" onClick={resetTimer} startIcon={<Stop />}>
            Reset
          </Button>
        </Stack>

        <Box sx={{ mt: 4, p: 3, bgcolor: 'background.default', borderRadius: 4 }}>
          {currentTask ? (
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="body1" fontWeight="600">Focado em: <Typography component="span" color="primary">{currentTask}</Typography></Typography>
              <IconButton color="success" onClick={() => setCurrentTask(null)}><CheckCircle /></IconButton>
            </Stack>
          ) : (
            <Stack direction="row" spacing={2}>
              <TextField 
                size="small" 
                fullWidth 
                placeholder="O que vais fazer agora?" 
                value={task} 
                onChange={(e) => setTask(e.target.value)} 
                sx={{ bgcolor: 'white' }}
              />
              <Button variant="contained" onClick={handleSetTask}>Definir</Button>
            </Stack>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}