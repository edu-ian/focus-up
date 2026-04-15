import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button, Stack } from '@mui/material';
import { PlayArrow, Pause, Stop } from '@mui/icons-material';
import { doc, setDoc, getDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

export default function PomodoroTimer({ userId, onSessionComplete, isDarkMode }) {
  // 5 segundos para testes. Mudar para 25 * 60 na versão real
  const [timeLeft, setTimeLeft] = useState(5); 
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

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
      alert("Sessão concluída! Ganhaste XP e Moedas.");
      
      if (userId) {
        const userRef = doc(db, "users", userId);
        const agora = new Date();
        
        try {
          const userSnap = await getDoc(userRef);
          let novaEnergia = 90; 
          let novaFome = 85;
          
          if (userSnap.exists()) {
            const data = userSnap.data();
            novaEnergia = Math.max(0, (data.energy !== undefined ? data.energy : 100) - 10);
            novaFome = Math.max(0, (data.hunger !== undefined ? data.hunger : 100) - 15);
          }
      await setDoc(userRef, {
            xp_pet: increment(150),
            energy: novaEnergia, 
            hunger: novaFome,
            lastCategory: 'pomodoro',
            moedas: increment(50),
            pomodoros_feitos: increment(1), // <--- ADICIONA ESTA LINHA AQUI
            lastUpdate: agora
          }, { merge: true });
          
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
      setTimeLeft(5 * 60);
    } else {
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

  // Cores dinâmicas
  const cardBg = isDarkMode ? '#1e293b' : '#ffffff';
  const textPrimary = isDarkMode ? '#fff' : '#0f172a';
  const borderColor = isDarkMode ? '#334155' : '#cbd5e1';

  return (
    <Card sx={{ 
      borderRadius: 2, textAlign: 'center', p: 4, 
      bgcolor: cardBg, color: textPrimary, border: `1px solid ${borderColor}`,
      boxShadow: isDarkMode ? '0 10px 30px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.05)',
      transition: 'all 0.3s ease'
    }}>
      <CardContent>
        <Typography variant="overline" sx={{ color: isBreak ? '#10b981' : '#6366f1', fontWeight: '900', letterSpacing: 2 }}>
          {isBreak ? 'MODO DESCANSO' : 'MODO FoCO'}
        </Typography>

        <Typography variant="h1" fontWeight="900" sx={{ my: 4, fontSize: {xs: '4rem', md: '5rem'}, color: textPrimary, transition: 'color 0.3s ease' }}>
          {formatTime(timeLeft)}
        </Typography>

        <Stack direction="row" justifyContent="center" spacing={2}>
          <Button 
            variant="contained" 
            onClick={toggleTimer}
            startIcon={isActive ? <Pause /> : <PlayArrow />}
            sx={{ 
              bgcolor: isActive ? '#f59e0b' : '#6366f1', 
              color: '#fff',
              px: 4, py: 1.5, borderRadius: 2, fontWeight: 'bold',
              '&:hover': { bgcolor: isActive ? '#d97706' : '#4f46e5' }
            }}
          >
            {isActive ? 'Pausar' : 'Focar'}
          </Button>
          <Button 
            variant="outlined" 
            onClick={resetTimer}
            startIcon={<Stop />}
            sx={{ color: '#ef4444', borderColor: '#ef4444', borderRadius: 2, '&:hover': { borderColor: '#b91c1c', color: '#b91c1c', bgcolor: 'transparent' } }}
          >
            Reset
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}