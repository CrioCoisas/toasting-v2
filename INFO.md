# Toasting — Documento de Status para Sócios

> Atualizado em 28 de maio de 2026
> Mantenedora: Amanda Marques (eusouamandamarques@gmail.com)

---

## 1. O que é o Toasting

**Toasting** é um clube de benefícios privado que dá descontos exclusivos aos amigos, funcionários, colaboradores e jornalistas do grupo de 9 restaurantes do Rio de Janeiro:

Giancarlo · Quartinho · Dainer · Pope · Chanchada · Guadalupe · Café 18 do Forte · Deja Vu · Fatchia

### Visão em uma frase

O membro abre o app, vê todas as casas, escolhe onde está, gera um QR Code com seu desconto, e mostra ao garçom.

### Por que existe

Hoje os descontos para o círculo do grupo acontecem no boca a boca — não há controle, registro nem padronização. O Toasting:

- **Organiza** quem tem acesso (cadastro único por código de acesso)
- **Padroniza** o desconto por tier (Amigos = 10%, com espaço pra Staff / VIP / Imprensa)
- **Registra** cada uso (qual casa, quando, qual membro) — vira base pra entender consumo e fidelizar
- **Cria escala** — a arquitetura é multi-tenant por dentro, então pode virar SaaS para outras redes de restaurantes depois

### Visão de produto

| Fase | Quem usa | Status |
|---|---|---|
| **V0 — MVP (atual)** | 50 amigos do grupo piloto | em construção / em testes |
| **V1 — Tiers múltiplos** | + funcionários, colaboradores, jornalistas | planejado |
| **V2 — Multi-tenant SaaS** | Outras redes de restaurantes | arquitetura pronta no banco |
| **V3 — Operacional** | Garçons / gerentes (scanner QR, validação) | parcial |
| **V4 — Engajamento** | Pontos, cashback, indicações | planejado |

---

## 2. Estado atual (em 28/05/2026)

### App no ar

🌐 **`https://toasting-tawny.vercel.app`**

Acessa a partir de qualquer browser (mobile-first). Hoje funciona:

- ✅ Splash com identidade visual (Schoolbell logo + paleta editorial creme)
- ✅ Login por código de acesso PIN (sem necessidade de email)
- ✅ Cadastro de novo membro (nome + email)
- ✅ Lista dos 9 restaurantes com saudação personalizada
- ✅ Detalhe do restaurante com badge de desconto
- ✅ Geração de QR Code (válido 2 horas, uso único, com código fallback de 6 dígitos)

**Códigos de acesso ativos no MVP:**

| Código | Tier | Desconto |
|---|---|---|
| `AMIGOS2026` | Amigos | 10% |
| `VIP2026` | Amigos | 10% |
| `CHEF2026` | Amigos | 10% |

(Em produção, cada amigo terá seu próprio código gerado pelo admin.)

### Identidade visual atual

- **Logo**: "Toasting" em fonte Schoolbell (manuscrita, vibe da casa)
- **Headlines**: DM Serif Display (editorial, elegante)
- **Texto corrido**: Inter
- **Micro labels**: DM Mono
- **Paleta**: fundo creme `#f5f0e7`, ink charcoal, acento vermelho italiano `#c43030`
- **Cards de restaurante**: cada casa tem uma cor sólida única (slabs coloridas empilhadas, vibe magazine)

### Restaurantes (dados levantados, prontos pra entrar no banco)

| Casa | Endereço | Horário |
|---|---|---|
| Giancarlo | Rua Oliveira Fausto, 11 — Botafogo | Ter–Qui 12h–00h · Sex/Sáb 12h–01h · Dom 12h–23h · Seg fechado |
| Quartinho | R. Arnaldo Quintela, 124 — Botafogo | Ter/Qua 18h–01h · Qui–Sáb 18h–02h · Seg/Dom fechado |
| Dainer | R. Real Grandeza, 193 — Botafogo | Ter–Sex 8h–19h · Sáb 9h–20h · Dom/feriado 9h–17h · Seg fechado |
| Pope | R. Joana Angélica, 47 Loja 101 — Ipanema | Ter–Qui 18h–00h · Sex 18h–01h · Sáb 12h–01h · Dom 12h–23h · Seg fechado |
| Chanchada | R. General Polidoro, 164 Loja B — Botafogo | Ter–Sáb 12h–01h · Dom 12h–22h · Seg fechado |
| Guadalupe | R. Real Grandeza, 193 Loja 5 (entrada pela R. Henrique de Novais) — Botafogo | Ter–Sex 17h–23h30 · Sáb/Dom 12h–23h30 |
| Café 18 do Forte | Praça Coronel Eugênio Franco, 1 — Forte de Copacabana | Ter–Dom 10h–19h · Seg fechado |
| Deja Vu | Rua do Russel, 344 — Glória | Qua 18h–23h30 · Qui/Sex 18h–00h30 · Sáb 15h–00h30 · Dom 15h–22h30 · Seg/Ter fechado |
| Fatchia | Rua Benjamin Constant, 8 — Glória | Qua/Dom 19h–00h · Qui–Sáb 19h–01h |

---

## 3. Stack & arquitetura

| Camada | Tecnologia | Por quê |
|---|---|---|
| Frontend | Next.js 16 (App Router) + React 19 | Framework moderno, deploy fácil, mesma codebase pra app do membro, garçom e admin |
| Estilo | Tailwind CSS v4 | Iteração rápida, design tokens centralizados |
| Banco + Auth + Storage | Supabase (Postgres) | Free tier generoso, RLS multi-tenant nativo, SQL puro |
| QR Code | qrcode.react | Geração client-side, signed payload |
| Hospedagem | Vercel | Deploy automático a cada push no GitHub, free tier |
| Email transacional | Resend (configurado, não usado ativamente no MVP) | 100 emails/dia free; fallback caso voltemos pro magic link |

### Arquitetura de dados

8 tabelas no Postgres, com Row Level Security (RLS):

- `tenants` — organizações (1 hoje: "Grupo Piloto"; arquitetura pronta pra n)
- `venues` — restaurantes (9 cadastrados)
- `tiers` — níveis de membership (Amigos / Staff / VIP / Press)
- `members` — pessoas com acesso
- `admins` — gestores do tenant
- `staff` — garçons que validam (PIN no caixa)
- `invites` — códigos/links de convite
- `redemptions` — códigos gerados + log de uso (auditável)

**Multi-tenant por dentro:** todas as tabelas têm `tenant_id`. Quando o Toasting virar SaaS, basta criar novo `tenant` + venues e o sistema isola tudo automaticamente.

---

## 4. Acessos (para os sócios)

### GitHub — código-fonte

🔗 **Repositório**: `https://github.com/CrioCoisas/toasting`
**Status**: público (temporariamente, pra desbloquear deploy no Vercel Hobby)
**Branch principal**: `main`

**Como dar acesso aos sócios:**
1. Github → Settings → Collaborators → "Add people" → convida o email/usuário GitHub deles
2. Sugestão de permissão: **Write** (podem ver e propor mudanças via PR, mas não podem deletar o repo)

### Vercel — hospedagem do app

🔗 **Projeto**: `https://vercel.com/eusouamandamarques-4627s-projects/toasting`
**Plano**: Hobby (gratuito)
**Domínio atual**: `toasting-tawny.vercel.app`

**Como dar acesso (Hobby não suporta colaboração em repos privados, mas tem visibilidade):**
1. Vercel → Project → Settings → "Member access" — pode adicionar visualizadores
2. Para edição plena, precisa upgrade pro plano Pro ($20/mês)

### Supabase — banco de dados

🔗 **Dashboard**: `https://supabase.com/dashboard/project/bvzirhqixyyolsdxpsmp`
**Organização**: CRIOCOISAS
**Plano**: Free
**URL pública do banco**: `https://bvzirhqixyyolsdxpsmp.supabase.co`

**Como dar acesso aos sócios:**
1. Supabase → Project Settings → Team → "Invite member" pelo email
2. Roles: Owner / Administrator / Developer / Read-only

### Resend — email transacional

🔗 **Dashboard**: `https://resend.com`
**Configurado** (SMTP plugado ao Supabase pra usar caso voltemos pro magic link)
**Plano**: Free (100 emails/dia)

### Domínio público

Não comprado ainda. Sugestão de nomes:
- `toasting.app` (verificar disponibilidade)
- `toasting.club`
- `toastingclub.com.br`

Quando comprar, basta apontar pra Vercel em Settings → Domains.

### Drive (a criar)

Sugestão de estrutura pra subir:
```
Toasting/
├── 01. Visão & Estratégia/
│   └── HANDOFF.md (este documento)
├── 02. Identidade Visual/
│   ├── Logos das 9 casas/
│   ├── Paleta & Tokens/
│   └── Wireframes v4/ (handoff de design pendente)
├── 03. Documentos Técnicos/
│   ├── PLAN.md (roadmap de desenvolvimento)
│   └── README.md (setup local)
└── 04. Operacional/
    ├── Lista de membros pilotos
    ├── Códigos de acesso ativos
    └── Restaurantes (este HANDOFF tem a tabela)
```

---

## 5. O que está pronto vs pendente

### ✅ Pronto

**Backend:**
- Esquema multi-tenant completo com RLS no Postgres
- 6 migrations versionadas em SQL
- APIs: `/api/entrar` (cadastro com PIN), `/api/restaurantes` (listagem), `/api/redemption` (gerar QR)
- Tenant piloto + 9 venues + tier "Amigos 10%" semeados

**Frontend:**
- Splash com identidade visual
- Login por PIN (sem email)
- Cadastro (nome + email)
- Lista de restaurantes com saudação editorial
- Detalhe do restaurante com QR Code
- Identidade visual aplicada (creme + DM Serif Display + Schoolbell + Inter)

**Infra:**
- Repo no GitHub (CrioCoisas/toasting)
- CI/CD automático via Vercel (push no main = deploy em prod)
- Banco Supabase em São Paulo (sa-east-1)
- Email transacional via Resend (standby)

### ⏳ Pendências críticas (antes do beta com amigos)

1. **Endereços + horários dos restaurantes** entrar no banco (tabela do item 2 acima → 1 query SQL)
2. **`SUPABASE_SERVICE_ROLE_KEY` cadastrada no Vercel** — pra APIs `/api/entrar` e `/api/redemption` rodarem em prod
3. **Logos reais das 9 casas** entram no app (hoje cards usam só nome)
4. **Wireframes v4** do Claude Design serem replicados pixel-perfect (handoff já entregue, falta acessar a pasta)

### 📋 Backlog (próximas semanas)

5. **PWA do garçom** — scanner de QR Code com PIN de acesso por venue
6. **Painel admin** — gerar convites/PINs individuais por amigo, ver lista de membros, ver histórico de uso
7. **Histórico do membro** — "você usou 12× em outubro: 4× Giancarlo, 3× Pope..."
8. **Foto de perfil** — upload (hoje é placeholder com degradê)
9. **Domínio próprio** + manifest PWA real
10. **Beta com 5-10 amigos** antes de abrir pros 50

### 🔮 Roadmap futuro (V2+)

11. Multi-tenant exposto (outras redes contratam o Toasting white-label)
12. Integração com PDVs (iFood, Saipos, ColibriPOS)
13. Programa de pontos / cashback
14. Indicação rastreada com recompensa pro indicador

---

## 6. Métricas atuais (28/05)

| Métrica | Valor |
|---|---|
| Tenants ativos | 1 (Grupo Piloto) |
| Restaurantes cadastrados | 9 (mais 1 a confirmar — você mencionou 10) |
| Tiers configurados | 1 (Amigos 10%) |
| Membros ativos | 1 (Amanda, criada manualmente p/ teste) |
| Redemptions geradas em prod | 0 (não testadas end-to-end ainda) |
| Status do deploy | Hobby ativo, último deploy aceito |

---

## 7. Pontos de atenção e dívida técnica

### Segurança

- ✅ Senhas dos auth users hashadas com bcrypt (padrão Supabase)
- ✅ RLS ativa em todas as tabelas
- ⚠️ Repo está **público** temporariamente (não tem segredo no código, mas vale voltar a privado quando subir pro Vercel Pro)
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY` precisa ser tratada como senha de banco — qualquer um com ela bypassa RLS. Hoje só Amanda tem.

### Manutenibilidade

- ✅ Migrations versionadas em SQL — qualquer dev pode re-criar o banco do zero
- ✅ TypeScript em todo o código
- ✅ Sem `node_modules` no repo (gitignored corretamente)
- ⚠️ Documentação de componentes ainda escassa — vamos amadurecer conforme o time crescer

### Custos atuais

| Serviço | Plano | Custo/mês |
|---|---|---|
| Vercel | Hobby | R$ 0 |
| Supabase | Free | R$ 0 |
| Resend | Free | R$ 0 |
| Domínio | (ainda não comprado) | ~R$ 5-10/mês (ex: `.app` ou `.com.br`) |
| **Total** | | **~R$ 10/mês** |

Quando crescer (acima de 50 amigos / múltiplos tenants):
- Vercel Pro: US$ 20/mês (~R$ 100)
- Supabase Pro: US$ 25/mês (~R$ 125) — necessário só quando passar de 500MB de banco ou 50GB de bandwidth/mês
- Resend Pro: a partir de US$ 20/mês

---

## 8. Como rodar localmente (para devs)

```bash
# Clonar
git clone https://github.com/CrioCoisas/toasting.git
cd toasting/web

# Instalar deps
npm install

# Configurar env
cp .env.local.example .env.local
# Editar .env.local com as chaves do Supabase
# (pedir pra Amanda — não estão no repo)

# Rodar
npm run dev
# Abre http://localhost:3000
```

Documentação de setup completa em [README.md](./README.md). Plano de desenvolvimento e sprints em [PLAN.md](./PLAN.md).

---

## 9. Decisões importantes já tomadas (com sócios validarem)

1. **Auth por PIN + localStorage** (sem email) — escolhido pra desbloquear teste com amigos. Quando virar SaaS, retomamos email/magic link.
2. **9 cores únicas, uma por restaurante** — assinatura visual; cada casa "tem identidade" no app.
3. **QR Code com validade de 2 horas** — janela suficiente pra uma refeição sem permitir reuso amplo.
4. **Multi-tenant por dentro desde o dia 1** — overhead pequeno hoje pra economizar 3x de retrabalho amanhã.
5. **Identidade visual editorial** (creme + serif + slabs coloridas) inspirada em apps de gastronomia premium — não minimalista azul corporativo.

---

## 10. Como acompanhar / contribuir

- **Diálogo de produto**: WhatsApp/Slack do grupo de sócios
- **Issues e bugs**: GitHub Issues em `CrioCoisas/toasting`
- **PR de design ou copy**: abre branch + PR, Amanda revisa e dá merge
- **Acesso ao Supabase pra editar dados de venues/tiers**: pedir pra Amanda promover seu usuário
- **Deploy a cada commit**: monitorar em `vercel.com/eusouamandamarques-4627s-projects/toasting/deployments`

---

**Próxima decisão necessária dos sócios:**

1. Confirmar a tabela de endereços + horários dos 9 restaurantes (acima)
2. Decidir o 10º restaurante (Amanda mencionou que eram 10)
3. Aprovar a identidade visual atual ou pedir ajustes baseados no handoff v4 de design
4. Definir o nome de domínio
5. Decidir tier de acesso pra sócios (Owner/Developer no Supabase, Write no GitHub)
