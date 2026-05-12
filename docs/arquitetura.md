# Arquitetura — Focus Up

## Visão geral

Aplicação **SPA** em **React 19** + **Vite 7**, autenticação e persistência com **Firebase** (Auth + Firestore), interface **Material UI 7**, gráficos **Recharts**. Uma **API Python** opcional em `api/` expõe endpoints de análise (regressão e clusterização) desacoplados do frontend.

## Pastas principais

| Caminho | Função |
|---------|--------|
| `src/App.jsx` | Tema MUI, `NotifyProvider`, fluxo login/registo vs dashboards. |
| `src/config/env.js` | Leitura de `VITE_FIREBASE_*`, `VITE_ADMIN_EMAIL`; validação em produção. |
| `src/firebase.js` | Inicialização do SDK Firebase. |
| `src/context/NotifyContext.jsx` | Snackbar global (`useNotify`). |
| `src/services/` | Integração Firestore de analytics, solicitações e doações. |
| `src/components/` | Ecrãs: Login, Register, Dashboard (admin), UserDashboard, Pomodoro, Shop, fluxos novos (Settings, solicitações, doações). |
| `firestore.rules` / `firestore.indexes.json` | Segurança e índices para consultas compostas. |
| `api/` | FastAPI: `/health`, `/predict/score`, `/cluster/users`. |

## Fluxos principais

### Autenticação

1. Utilizador autentica-se (e-mail/senha ou Google).
2. Após sucesso, `logDailyAccess()` incrementa `analytics_daily/{YYYY-MM-DD}.accessos`.
3. `App.jsx` compara `user.email` com `getAdminEmail()` e encaminha para **Admin** ou **UserDashboard**.

### Utilizador

- Documento `users/{uid}`: gamificação (pet), `perfil`, `moedas`, etc.
- **Solicitações:** `solicitacoes/{id}` com `userId`, `status`, `historico[]`.
- **Contribuições:** `doacoes/{id}` com `tipo`, `status`, `historico[]`.

### Administrador

- Lê `users`, `dashboard/metrics`, `analytics_daily` (últimos 7 dias), listas completas de `solicitacoes` e `doacoes`.
- Atualiza estados (apenas admin nas regras Firestore).

## Contratos de dados (Firestore)

### `users/{uid}`

Campos usados pela app: `nome`, `perfil`, `nivel_pet`, `xp_pet`, `hunger`, `energy`, `moedas`, `evolution`, `lastUpdate`, `lastCategory`, …

### `solicitacoes/{id}`

- `userId` (string), `nomeUsuario`, `titulo`, `descricao`, `status` (`pendente` \| `aprovada` \| `rejeitada`), `createdAt`, `historico` (array de mapas).

### `doacoes/{id}`

- `userId`, `nomeUsuario`, `tipo` (`tempo` \| `financeira`), `descricao`, `detalhe`, `status` (`pendente` \| `aceite` \| `recusada`), `createdAt`, `historico`.

### `analytics_daily/{date}`

- `accessos` (número), `updatedAt`.

### `dashboard/metrics`

- `total_pomodoros_app` (incrementado pelo Pomodoro).

## API de análise (opcional)

Ver `api/README_API.md`. Payloads JSON validados por Pydantic; respostas JSON estáveis.

## Admin e regras

O e-mail administrativo está em `VITE_ADMIN_EMAIL` (frontend) e deve coincidir com a função `adminEmail()` em `firestore.rules` antes do deploy, pois as regras não leem ficheiros `.env`.

## Deploy sugerido

```bash
npm run build
firebase deploy --only firestore
firebase deploy --only hosting
```
