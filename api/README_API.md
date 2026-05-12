# API de análise — Focus Up

Serviço FastAPI com regressão linear (score previsto) e clusterização K-Means, alinhado à ETAPA 8 do cronograma (predição + clusters + JSON padronizado).

## Setup

```bash
cd api
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## Executar

```bash
uvicorn main:app --reload --port 8787
```

Documentação interativa: `http://127.0.0.1:8787/docs`

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/health` | Estado do serviço |
| POST | `/predict/score` | Corpo: `{ "horas_estudo": 5, "pausas": 3 }` → score previsto |
| POST | `/cluster/users` | Corpo: `{ "amostras": [[1,2],[3,4],[5,1]], "k": 2 }` → labels |

## Exemplo cURL

```bash
curl -s http://127.0.0.1:8787/health
curl -s -X POST http://127.0.0.1:8787/predict/score \
  -H "Content-Type: application/json" \
  -d '{"horas_estudo":6,"pausas":2}'
```

## Testes manuais de rota

Ver `tests_api.http` (VS Code / REST Client).
