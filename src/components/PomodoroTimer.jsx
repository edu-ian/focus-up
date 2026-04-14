import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, TextField, Stack, IconButton, Chip } from '@mui/material';
import { PlayArrow, Pause, Stop, CheckCircle } from '@mui/icons-material';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

export default function PomodoroTimer({ userId, onSessionComplete }) {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutos padrão
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [task, setTask] = useState('');
  const [currentTask, setCurrentTask] = useState(null);

  // Lógica do Cronómetro
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((time) => time - 1), 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleTimerComplete = async () => {
    setIsActive(false);
    
    if (!isBreak) {
      // Terminou uma sessão de foco!
      alert("Sessão concluída! Ganhaste XP.");
      
      // Atualizar Firebase do Utilizador
      if (userId) {
        const userRef = doc(db, "users", userId);
        try {
          await updateDoc(userRef, {
            xp_pet: increment(150), // Ganha 150 XP por pomodoro
            energy: increment(-10), // Gasta energia
            hunger: increment(-15), // Fica com fome
            lastCategory: currentTask || 'Foco Geral'
          });
          
          // Atualizar métrica global
          const metricsRef = doc(db, "dashboard", "metrics");
          await updateDoc(metricsRef, {
            total_pomodoros_app: increment(1)
          });

          if(onSessionComplete) onSessionComplete();
        } catch (error) {
          console.error("Erro ao salvar progresso:", error);
        }
      }
      
      // Iniciar Pausa de 5 min
      setIsBreak(true);
      setTimeLeft(5 * 60);
    } else {
      // Terminou a pausa
      alert("Pausa terminada. De volta ao trabalho!");
      setIsBreak(false);
      setTimeLeft(25 * 60);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(isBreak ? 5 * 60 : 25 * 60);
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

        {/* Gestão Simples de Tarefa */}
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