# Brand Dashboard

Dashboard gestionale per brand di abbigliamento. Permette di monitorare produzione, magazzino e vendite in tempo reale, con autenticazione multi-utente e CRUD completa.

---

## Stack tecnologico

| Layer | Tecnologia |
|-------|-----------|
| Frontend | React 18 + Vite |
| Stile | Tailwind CSS + shadcn/ui |
| Grafici | Recharts |
| Backend | Node.js + Express |
| ORM | Prisma 5 |
| Database | MySQL |
| Auth | JWT + bcryptjs |
| Validazione | Zod |

---

## Struttura del progetto

```
brand_dashboard_react/
│
├── README.md
│
├── backend/
│   ├── .env                     ← credenziali DB e JWT (non committare)
│   ├── package.json
│   ├── server.js                ← avvio Express
│   ├── database.js              ← istanza Prisma
│   ├── prisma/
│   │   └── schema.prisma        ← modelli DB
│   ├── middleware/
│   │   ├── auth.js              ← verifica JWT
│   │   └── validate.js          ← validazione Zod
│   ├── routes/
│   │   ├── auth.js              ← register, login, cambio password
│   │   ├── prodotti.js          ← CRUD prodotti
│   │   ├── magazzino.js         ← stock e soglie alert
│   │   ├── produzione.js        ← CRUD lotti produzione
│   │   └── vendite.js           ← CRUD vendite
│   └── validation/
│       └── schemas.js           ← schemi Zod
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── jsconfig.json
    ├── tsconfig.json
    └── src/
        ├── main.jsx
        ├── App.jsx              ← routing
        ├── index.css            ← Tailwind
        ├── api/
        │   └── client.js        ← axios + interceptor JWT
        ├── context/
        │   └── AuthContext.jsx  ← stato autenticazione globale
        ├── components/
        │   ├── Layout.jsx       ← sidebar + navigazione
        │   ├── MetricCard.jsx   ← card metrica riutilizzabile
        │   ├── InlineEdit.jsx   ← modifica/elimina inline nelle tabelle
        │   └── ProtectedRoute.jsx
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            ├── Overview.jsx
            ├── Magazzino.jsx
            ├── Produzione.jsx
            ├── Vendite.jsx
            ├── InserisciDati.jsx
            └── CambioPassword.jsx
```

---

## Prerequisiti

- Node.js v18 o superiore
- MySQL in esecuzione (es. tramite XAMPP, MySQL Workbench, o servizio locale)
- npm

---

## Installazione

### 1. Clona o scarica il progetto

```bash
cd brand_dashboard_react
```

### 2. Configura il backend

```bash
cd backend
npm install
```

Crea il file `.env` nella cartella `backend/`:

```env
PORT=3001
DATABASE_URL="mysql://root:TuaPassword@localhost:3306/brand_dashboard"
JWT_SECRET=unaSuperChiaveSegretaMoltoLunga2025
JWT_EXPIRES_IN=8h
```

> Sostituisci `TuaPassword` con la password del tuo utente MySQL.

### 3. Crea il database in MySQL

Apri MySQL Workbench (o il tuo client SQL) ed esegui:

```sql
CREATE DATABASE IF NOT EXISTS brand_dashboard
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

### 4. Sincronizza lo schema con Prisma

```bash
npx prisma generate
npx prisma db push
```

### 5. Configura il frontend

```bash
cd ../frontend
npm install
```

---

## Avvio

Apri **due terminali separati**.

**Terminale 1 — Backend:**
```bash
cd backend
npm run dev
```
Il backend sarà disponibile su `http://localhost:3001`

**Terminale 2 — Frontend:**
```bash
cd frontend
npm run dev
```
Il frontend sarà disponibile su `http://localhost:5173`

---

## Primo utilizzo

1. Apri `http://localhost:5173/register`
2. Crea il tuo account inserendo email, password (minimo 8 caratteri) e nome
3. Accedi con le credenziali appena create
4. Vai su **Inserisci dati** per aggiungere i primi prodotti al catalogo

---

## Funzionalità

### Autenticazione
- Registrazione nuovo utente
- Login con JWT (token valido 8 ore)
- Cambio password dalla sidebar
- Logout

### Overview
- Ricavo totale e ultimi 30 giorni
- Margine totale
- Alert scorte basse
- Grafico ricavo nel tempo
- Confronto produzione vs vendite

### Magazzino
- Stock attuale per prodotto
- Alert automatico quando le scorte scendono sotto la soglia
- Modifica soglia alert direttamente nella tabella

### Produzione
- Registrazione lotti (aggiorna automaticamente il magazzino)
- Grafico pezzi prodotti nel tempo
- Modifica data e note inline
- Eliminazione lotto (scala automaticamente il magazzino)

### Vendite
- Registrazione vendite con canale (Instagram, Sito Web, ecc.)
- Calcolo automatico ricavo e margine
- Grafici: ricavo per canale, margine per categoria
- Modifica canale, data e note inline
- Eliminazione vendita (ripristina automaticamente il magazzino)

### Inserisci dati
- Form aggiunta prodotto (codice, nome, categoria, prezzi)
- Form registrazione lotto produzione
- Form registrazione vendita
- Catalogo prodotti con modifica ed eliminazione inline

---

## API Reference

Tutti gli endpoint protetti richiedono l'header:
```
Authorization: Bearer <token>
```

### Auth (pubblici)
| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| POST | `/api/auth/register` | Crea nuovo utente |
| POST | `/api/auth/login` | Login, restituisce JWT |

### Auth (protetti)
| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/api/auth/me` | Dati utente corrente |
| POST | `/api/auth/logout` | Logout |
| PUT | `/api/auth/cambio-password` | Cambia password |

### Prodotti
| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/api/prodotti` | Lista catalogo |
| POST | `/api/prodotti` | Aggiunge prodotto |
| PUT | `/api/prodotti/:id` | Modifica prodotto |
| DELETE | `/api/prodotti/:id` | Elimina prodotto |

### Magazzino
| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/api/magazzino` | Stock attuale con alert |
| PUT | `/api/magazzino/:id/soglia` | Aggiorna soglia alert |

### Produzione
| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/api/produzione` | Storico lotti |
| POST | `/api/produzione` | Registra lotto |
| PUT | `/api/produzione/:id` | Modifica data e note |
| DELETE | `/api/produzione/:id` | Elimina lotto |

### Vendite
| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/api/vendite` | Storico vendite |
| POST | `/api/vendite` | Registra vendita |
| PUT | `/api/vendite/:id` | Modifica canale, data, note |
| DELETE | `/api/vendite/:id` | Elimina vendita |

---

## Note importanti

- **Non committare mai il file `.env`** — contiene credenziali sensibili. Aggiungilo al `.gitignore`.
- Quando elimini un lotto di produzione, il magazzino viene scalato automaticamente.
- Quando elimini una vendita, il magazzino viene ripristinato automaticamente.
- La quantità di un lotto non è modificabile dopo l'inserimento — per correggere elimina e reinserisci.

---

## Sviluppi futuri consigliati

- Export dati in CSV/Excel
- Filtri per periodo nelle tabelle
- Gestione taglie e varianti prodotto
- Dashboard multi-brand
- Notifiche email per scorte basse
- Deploy su server remoto (Railway, Render, ecc.)