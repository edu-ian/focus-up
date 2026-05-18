import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, TextField, Stack, IconButton } from '@mui/material';
import { PlayArrow, Pause, Stop, CheckCircle } from '@mui/icons-material';
import { doc, setDoc, getDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { useNotify } from '../context/NotifyContext';
import {
  applyFocusSession,
  applyBreakRecovery,
  REWARD_COINS_FOCUS,
  REWARD_XP_FOCUS,
  REWARD_COINS_BREAK,
  REWARD_XP_BREAK,
  getLevelFromXp,
  didLevelUp,
} from '../game/petBalance';

const WORK_SEC = 25 * 60;
const BREAK_SEC = 5 * 60;

export default function PomodoroTimer({ userId, onSessionComplete }) {
  const notify = useNotify();
  const [timeLeft, setTimeLeft] = useState(WORK_SEC);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [task, setTask] = useState('');
  const [currentTask, setCurrentTask] = useState(null);

  async function savePetUpdate(patch, successMessage, xpBefore = null, xpAfter = null, countPomodoro = false) {
    if (!userId) return;
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { ...patch, lastUpdate: new Date() }, { merge: true });

    if (countPomodoro) {
      const metricsRef = doc(db, 'dashboard', 'metrics');
      await setDoc(metricsRef, { total_pomodoros_app: increment(1) }, { merge: true }).catch(() => {});
    }

    if (xpBefore != null && xpAfter != null && didLevelUp(xpBefore, xpAfter)) {
      const { nivel, evolution } = getLevelFromXp(xpAfter);
      notify.success(`${successMessage} Subiste para o nível ${nivel} (${evolution})!`);
    } else {
      notify.success(successMessage);
    }
    onSessionComplete?.();
  }

  async function handleTimerComplete() {
    setIsActive(false);

    if (!isBreak) {
      if (!userId) {
        setIsBreak(true);
        setTimeLeft(BREAK_SEC);
        return;
      }

      try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        const data = userSnap.exists() ? userSnap.data() : {};
        const xpBefore = data.xp_pet || 0;
        const moedasBefore = data.moedas || 0;
        const xpAfter = xpBefore + REWARD_XP_FOCUS;
        const { nivel, evolution } = getLevelFromXp(xpAfter);
        const { energy, hunger } = applyFocusSession(data.energy, data.hunger);

        await savePetUpdate(
          {
            xp_pet: xpAfter,
            moedas: moedasBefore + REWARD_COINS_FOCUS,
            energy,
            hunger,
            nivel_pet: nivel,
            evolution,
            lastCategory: currentTask || 'pomodoro',
          },
          `Sessão concluída! +${REWARD_XP_FOCUS} XP e +${REWARD_COINS_FOCUS} moedas.`,
          xpBefore,
          xpAfter,
          true
        );
      } catch (error) {
        console.error('Erro ao salvar progresso:', error);
        notify.error('Não foi possível guardar o progresso da sessão.');
      }

      setIsBreak(true);
      setTimeLeft(BREAK_SEC);
    } else {
      if (userId) {
        try {
          const userRef = doc(db, 'users', userId);
          const userSnap = await getDoc(userRef);
          const data = userSnap.exists() ? userSnap.data() : {};
          const xpBefore = data.xp_pet || 0;
          const moedasBefore = data.moedas || 0;
          const xpAfter = xpBefore + REWARD_XP_BREAK;
          const { nivel, evolution } = getLevelFromXp(xpAfter);
          const { energy, hunger } = applyBreakRecovery(data.energy, data.hunger);

          await setDoc(
            userRef,
            {
              xp_pet: xpAfter,
              moedas: moedasBefore + REWARD_COINS_BREAK,
              energy,
              hunger,
              nivel_pet: nivel,
              evolution,
              lastUpdate: new Date(),
            },
            { merge: true }
          );

          if (didLevelUp(xpBefore, xpAfter)) {
            notify.success(
              `Pausa concluída! O pet recuperou um pouco. Nível ${nivel} (${evolution})!`
            );
          } else {
            notify.success('Pausa concluída! O pet recuperou energia e fome.');
          }
          onSessionComplete?.();
        } catch (error) {
          console.error('Erro ao guardar pausa:', error);
        }
      } else {
        notify.success('Pausa terminada. De volta ao trabalho!');
      }

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
            color={isActive ? 'warning' : 'primary'}
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
              <Typography variant="body1" fontWeight="600">
                Focado em: <Typography component="span" color="primary">{currentTask}</Typography>
              </Typography>
              <IconButton color="success" onClick={() => setCurrentTask(null)}>
                <CheckCircle />
              </IconButton>
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
              <Button variant="contained" onClick={handleSetTask}>
                Definir
              </Button>
            </Stack>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
