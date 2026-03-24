# Holdings View Backend

Backend Node.js per il monitoraggio di post Reddit, con persistenza su MySQL e analisi automatica tramite LLM locale eseguito con Ollama.

Il progetto recupera i nuovi post da subreddit configurati, li salva nel database, ne estrae i commenti principali e genera un riassunto strutturato in italiano tramite una pipeline AI locale. Il risultato viene poi classificato e reso disponibile tramite API REST.

## Features principali

- Ingest automatico dei nuovi post da uno o piu subreddit
- Salvataggio dei contenuti su MySQL tramite Prisma ORM
- Workflow di elaborazione con stati di lavorazione
- Recupero dei commenti principali per arricchire il contesto
- Generazione di riassunti con Ollama in locale
- API REST per ingest, processing e consultazione dei post
- Scheduler automatico con esecuzione ogni 8 ore

## Stack tecnologico

- Node.js
- Express
- Prisma ORM
- MySQL
- Reddit API / JSON endpoints
- Ollama
- Scheduler automatico
- REST API

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
```

## Installazione

Prerequisiti:

- Node.js 18+
- MySQL attivo e raggiungibile
- Ollama installato in locale

Passaggi:

```bash
git clone <repo-url>
cd holdings-view/backend
npm install
npx prisma generate
npx prisma migrate dev
```

Se il modello non e ancora disponibile in Ollama:

```bash
ollama pull qwen3:14b
```

## Configurazione (`.env`)

Esempio di configurazione:

```env
DATABASE_URL="mysql://root:"mettilatupassword"@localhost:3306/holdings_mvp"
PORT=3001
OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen3:14b
TZ=Europe/Rome
AUTO_SUBREDDITS=stocks,SecurityAnalysis,ValueInvesting,StockMarket
```

Variabili principali:

- `DATABASE_URL`: connessione MySQL usata da Prisma
- `PORT`: porta del server Express
- `OLLAMA_URL`: endpoint locale di Ollama
- `OLLAMA_MODEL`: modello LLM usato per classificazione e summary
- `AUTO_SUBREDDITS`: lista di subreddit monitorati dallo scheduler
- `TZ`: timezone del processo

## Avvio del server

Modalita sviluppo:

```bash
npm run dev
```

Modalita standard:

```bash
npm start
```

Health check disponibile su `GET /health`.

## API principali

| Metodo | Endpoint | Descrizione |
| --- | --- | --- |
| `POST` | `/api/ingest/:subreddit` | Recupera e salva i nuovi post di un subreddit |
| `POST` | `/api/process-new` | Processa i post con stato `NEW` |
| `GET` | `/api/raw-posts?status=NEW` | Elenca i post per stato |
| `GET` | `/api/raw-posts/:id` | Restituisce il dettaglio di un post |
| `POST` | `/api/raw-posts/:id/summarize` | Genera un riassunto AI per un singolo post |
| `POST` | `/api/raw-posts/:id/save` | Salva il post come rilevante |
| `PATCH` | `/api/raw-posts/:id/dismiss` | Marca il post come scartato |
| `PATCH` | `/api/raw-posts/:id/restore` | Riporta un post allo stato `NEW` |
| `GET` | `/api/saved-posts` | Elenca i post salvati |

## Come funziona il workflow

1. Il backend recupera i nuovi post dai subreddit configurati.
2. Ogni post viene salvato in MySQL tramite Prisma con stato iniziale `NEW`.
3. Il workflow legge i post `NEW` in batch.
4. Per ogni post recupera i commenti principali da Reddit.
5. Ollama esegue una classificazione e genera un riassunto Markdown in italiano.
6. Il sistema aggiorna i campi AI e assegna uno stato tra `SAVED`, `DISMISSED` o `UNCERTAIN`.
7. I post salvati vengono resi disponibili anche nella sezione dei contenuti salvati.

Stati gestiti dal dominio:

- `NEW`
- `UNCERTAIN`
- `SAVED`
- `DISMISSED`
- `PROCESSED`

Lo scheduler avvia automaticamente il fetch dei nuovi contenuti ogni 8 ore.

