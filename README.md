# Holdings View

Applicazione full-stack per raccogliere post Reddit da subreddit finanziari, analizzarli con un modello AI locale e revisionarli tramite interfaccia web.

L'obiettivo del progetto e creare un flusso pratico di raccolta e filtro: il backend acquisisce i contenuti, li salva nel database, genera riassunti con Ollama e li espone via API; il frontend permette di navigare i post, valutarli rapidamente e organizzarli per stato.

## Architettura

Il progetto e diviso in due parti:

- `backend/`: servizio Node.js che gestisce ingest, persistenza, pipeline AI, scheduler e API REST
- `frontend/`: client React che consuma le API del backend e offre una dashboard per la revisione dei post

Flusso generale:

1. Lo scheduler del backend recupera periodicamente i nuovi post dai subreddit configurati.
2. I post vengono salvati in MySQL tramite Prisma.
3. Il workflow recupera i commenti principali e invia il contenuto a Ollama per analisi e riassunto.
4. Il backend aggiorna stato e metadati AI del post.
5. Il frontend mostra i contenuti per stato e consente revisione e categorizzazione manuale.

## Features principali

- Raccolta automatica dei post da subreddit finanziari
- Salvataggio strutturato dei dati su MySQL
- Pipeline AI locale con Ollama per summary e classificazione
- Gestione degli stati del ciclo di vita dei post
- API REST per integrazione frontend/backend
- Dashboard React per navigazione e revisione dei contenuti
- Scheduler automatico con esecuzione ogni 8 ore

## Stack tecnologico

### Backend

- Node.js
- Express
- Prisma ORM
- MySQL
- Reddit API / JSON endpoints
- Ollama

### Frontend

- React
- React Router
- UI a componenti
- Vite per sviluppo e build

## Struttura del progetto

```text
.
|-- backend/
|   |-- prisma/
|   |   `-- schema.prisma
|   |-- src/
|   |   |-- index.js
|   |   |-- routes.js
|   |   |-- reddit.js
|   |   |-- post-workflow.js
|   |   |-- scheduler.js
|   |   |-- db.js
|   |   `-- ai/
|   |       |-- index.js
|   |       |-- ollama.js
|   |       `-- prompts.js
|   `-- package.json
`-- frontend/
    |-- src/
    |   |-- App.jsx
    |   |-- api.js
    |   |-- components/
    |   |   |-- NavBar.jsx
    |   |   |-- PostList.jsx
    |   |   |-- PostCard.jsx
    |   |   `-- SavedList.jsx
    |   |-- pages/
    |   |   |-- NewPage.jsx
    |   |   |-- UncertainPage.jsx
    |   |   |-- SavedPage.jsx
    |   |   `-- DismissedPage.jsx
    |   `-- routes/
    |       `-- routesConfig.jsx
    `-- package.json
```

## Backend

Responsabilita principali:

- recuperare nuovi post dai subreddit configurati
- salvare i post nel database MySQL
- recuperare i commenti principali
- usare Ollama per generare riassunti e metadati AI
- gestire gli stati dei post
- esporre API REST consumate dal frontend
- eseguire fetch automatici ogni 8 ore

Stati gestiti dal sistema:

- `NEW`
- `UNCERTAIN`
- `SAVED`
- `DISMISSED`
- `PROCESSED`

Moduli principali:

- `index.js`: entry point del server Express
- `routes.js`: definizione degli endpoint API
- `reddit.js`: integrazione con Reddit
- `ai.js` / `src/ai/*`: prompt, parsing e summarization
- `post-workflow.js`: ingest e pipeline di processamento
- `scheduler.js`: scheduler automatico dei subreddit
- `db.js`: configurazione del client Prisma

## Frontend

Il frontend e una dashboard React che permette di consultare i post elaborati dal backend e di gestirli per stato.

Pagine principali:

- `New posts`
- `Uncertain posts`
- `Saved posts`
- `Dismissed posts`

Componenti principali:

- `NavBar`: navigazione tra le sezioni
- `PostList`: rendering delle liste di post
- `PostCard`: scheda singolo post con azioni
- `SavedList`: vista dedicata ai post salvati

La comunicazione con il backend avviene tramite REST API, centralizzate nel modulo `frontend/src/api.js`.

## Installazione

Prerequisiti:

- Node.js 18+
- MySQL in esecuzione
- Ollama installato in locale

1. Clonare il repository

```bash
git clone <repo-url>
cd holdings-view
```

2. Installare le dipendenze del backend

```bash
cd backend
npm install
```

3. Installare le dipendenze del frontend

```bash
cd ../frontend
npm install
```

4. Configurare le variabili ambiente del backend

Creare o aggiornare `backend/.env` con i valori necessari.

5. Preparare il database con Prisma

```bash
cd ../backend
npx prisma generate
npx prisma migrate dev
```

6. Avviare il backend

```bash
npm run dev
```

7. Avviare il frontend

In un secondo terminale:

```bash
cd ../frontend
npm run dev
```

## Configurazione (`.env`)

Esempio di configurazione backend:

```env
DATABASE_URL="mysql://root:"mettilatuapassword"@localhost:3306/holdings_mvp"
PORT=3001
OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen3:14b
AUTO_SUBREDDITS=stocks,SecurityAnalysis,ValueInvesting,StockMarket
```

Variabili principali:

- `DATABASE_URL`: stringa di connessione MySQL usata da Prisma
- `PORT`: porta del server backend
- `OLLAMA_URL`: endpoint del servizio Ollama locale
- `OLLAMA_MODEL`: modello LLM usato per analisi e summary
- `AUTO_SUBREDDITS`: lista dei subreddit monitorati automaticamente

## Avvio del progetto

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

In ambiente locale il frontend gira tipicamente su Vite e comunica con il backend disponibile su `http://localhost:3001`.

## API principali

| Metodo | Endpoint | Descrizione |
| --- | --- | --- |
| `POST` | `/api/ingest/:subreddit` | recupera e salva i nuovi post di un subreddit |
| `POST` | `/api/process-new` | processa i post con stato `NEW` |
| `GET` | `/api/raw-posts?status=NEW` | restituisce i post filtrati per stato |
| `GET` | `/api/raw-posts/:id` | dettaglio di un singolo post |
| `POST` | `/api/raw-posts/:id/save` | salva un post come rilevante |
| `PATCH` | `/api/raw-posts/:id/dismiss` | sposta un post tra gli scartati |
| `PATCH` | `/api/raw-posts/:id/restore` | riporta un post allo stato `NEW` |

## Workflow

1. Lo scheduler esegue il fetch dei nuovi post ogni 8 ore.
2. I post vengono normalizzati e salvati nel database.
3. Il backend recupera i commenti principali per ogni post nuovo.
4. Ollama genera un riassunto in italiano e dati utili alla classificazione.
5. Il sistema assegna uno stato al post in base al risultato della pipeline.
6. Il frontend mostra i post nelle viste `New`, `Uncertain`, `Saved` e `Dismissed`.
7. L'utente puo rivedere i contenuti e completare la categorizzazione manuale.

