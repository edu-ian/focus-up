# Checklist manual — Focus Up

Executar antes de entrega ou após alterações grandes. Marcar cada passo.

## Autenticação

- [ ] Registo com e-mail: validação de senhas diferentes mostra erro.
- [ ] Registo com sucesso cria documento em `users` com `perfil` escolhido.
- [ ] Login e-mail/senha correto entra no dashboard de utilizador.
- [ ] Login Google funciona (se configurado no console Firebase).
- [ ] «Esqueci minha senha» envia e-mail (verificar caixa de spam).

## Utilizador

- [ ] Pomodoro: sessão de foco completa incrementa XP/moedas e `total_pomodoros_app`.
- [ ] Mercado: compra debita moedas e atualiza fome/energia.
- [ ] **Solicitações:** criar pedido; aparece como pendente na lista própria.
- [ ] **Contribuições:** submeter registo; aparece como pendente.
- [ ] **Definições:** alterar nome reflete no cabeçalho após guardar.
- [ ] **Definições:** alterar palavra-passe (conta e-mail) com senha atual correcta.

## Administrador

- [ ] Login com e-mail admin (`VITE_ADMIN_EMAIL` / padrão `admin@focusup.com`) abre painel admin.
- [ ] Gráfico «Tendência de Acessos» mostra dados após vários logins (não mock).
- [ ] Separador **Solicitações:** lista pedidos; alterar estado persiste.
- [ ] Separador **Contribuições:** filtro por tipo; alterar estado persiste.
- [ ] Tabela de utilizadores lista dados reais do Firestore.

## Segurança

- [ ] Utilizador A não acede às solicitações/doações do utilizador B (testar com dois browsers / contas).
- [ ] Build de produção com `.env` completo: `npm run build` sem erro de config Firebase.

## API (opcional)

- [ ] `cd api && uvicorn main:app --port 8787`
- [ ] `GET /health` → 200
- [ ] `POST /predict/score` com JSON válido → score numérico
- [ ] `POST /cluster/users` com matriz 2D → labels

## Documentação

- [ ] `docs/arquitetura.md` e `docs/planejamento_etapas.md` revistos.
- [ ] PDF `docs/planejamento_etapas.pdf` regenerado se o plano mudou: `scripts/.venv/bin/python scripts/generate_planning_pdf.py`
