"""
API de análise (equivalente funcional à ETAPA 8 do cronograma).
Regressão simples e clusterização K-Means sobre payload JSON.
"""
from typing import List

import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from sklearn.cluster import KMeans
from sklearn.linear_model import LinearRegression

app = FastAPI(title="Focus Up Analytics API", version="1.0.0")


class HealthResponse(BaseModel):
    status: str = "ok"


class PredictRequest(BaseModel):
    horas_estudo: float = Field(..., ge=0, le=24)
    pausas: float = Field(..., ge=0, le=50)


class PredictResponse(BaseModel):
    score_previsto: float
    modelo: str


class ClusterRequest(BaseModel):
    amostras: List[List[float]] = Field(..., min_length=2)
    k: int = Field(2, ge=2, le=8)


class ClusterResponse(BaseModel):
    labels: List[int]
    k_utilizado: int


@app.get("/health", response_model=HealthResponse)
def health():
    return HealthResponse()


@app.post("/predict/score", response_model=PredictResponse)
def predict_score(body: PredictRequest):
    rng = np.random.default_rng(42)
    X = rng.uniform(0, 10, size=(80, 2))
    noise = rng.normal(0, 1.5, size=80)
    y = 4.5 * X[:, 0] - 0.8 * X[:, 1] + 30 + noise
    model = LinearRegression().fit(X, y)
    x = np.array([[body.horas_estudo, body.pausas]], dtype=float)
    pred = float(model.predict(x)[0])
    return PredictResponse(score_previsto=round(pred, 2), modelo="LinearRegression(sintético)")


@app.post("/cluster/users", response_model=ClusterResponse)
def cluster_users(body: ClusterRequest):
    arr = np.array(body.amostras, dtype=float)
    if arr.ndim != 2 or arr.shape[1] < 1:
        raise HTTPException(status_code=400, detail="Cada amostra deve ser um vetor numérico.")
    k = min(body.k, arr.shape[0])
    if k < 2:
        raise HTTPException(status_code=400, detail="k deve ser pelo menos 2.")
    labels = KMeans(n_clusters=k, random_state=42, n_init="auto").fit_predict(arr)
    return ClusterResponse(labels=[int(x) for x in labels], k_utilizado=k)
