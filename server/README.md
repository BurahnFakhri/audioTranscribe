🎙️ Transcribe Backend (with Gemini)

This is the backend service for the Transcribe project.
It lets users submit an audio file (by URL), downloads and validates it, transcribes the content (mock or Gemini API), and stores results in MongoDB. Transcribe process are done using agenda queue system.

📂 Code Structure 

src/app.ts → The Express app itself. It wires up middlewares (security, rate-limiting, logging) and routes.

src/server.ts → Entry point that starts the server, connects to MongoDB, and handles graceful shutdown.

src/config/

config.ts → Central config like port, Mongo URI, storage folder.

db.ts → Connect/disconnect MongoDB with Mongoose.

src/models/

transcription.model.ts → Mongoose schema for transcriptions (audio URL, status, transcription text, error, timestamps, etc.).

src/routes/

transcription.routes.ts → Defines REST endpoints for creating and listing transcriptions.

src/controllers/

transcription.controller.ts → Handles request/response logic for transcription APIs.

src/services/

transcription.service.ts → Orchestrates the whole transcription flow (create record, queue processing, update status).

download.service.ts → Downloads audio files, validates MIME type, saves them locally.

transcribers/mock.transcriber.ts → Mock transcriber that fakes transcription for testing.

transcribers/gemini.transcriber.ts → Real integration with Google Gemini API for transcription.

src/middleware/ → Reusable Express middleware (rate limiter, request validation).

src/utils/ → Helpers like structured logging (pino).

tests/ → Jest test suites:
integration/ → End-to-end API tests

✅ Assumptions Made
Audio source: Input is always a public URL pointing to a valid audio file.

Storage: Downloaded audio is stored temporarily on local disk (in an uploads/ folder). No cloud storage integration yet.

Queue: I planned to use a background job queue (agenda), but for simplicity jobs can also be processed directly.

Transcriber: Default is a mock transcriber for development/testing & Gemini is also integarted.

Security: Added basic middleware (Helmet, CORS, rate limiting), but not full auth since this is a demo.

Validation: Using Zod for clean request validation.

🚀 How to Run

Clone repo and install dependencies:

cd audioTranscribe/server
npm install


Copy .env.example → .env and set:

PORT=4000
MONGO_URI=mongodb://localhost:27017/transcribe_dev
GEMINI_API_KEY=your-key-here


Start dev server:

npm run dev
npm run worker (Queue system)

Future Improvements (Production-Grade)

If this were to go live in production, here’s what I’d improve:

Authentication & roles → Secure APIs with JWT or OAuth2, role-based access (e.g., only owners can access their transcriptions).

File storage → Store audio files in cloud storage (e.g., S3 Storage) instead of local disk for scalability.

Robust job queue → Use Redis-backed queues

Better error handling → Standardize error responses, add retry logic for failed jobs, and track attempts more thoroughly.

Testing → Add more edge cases (e.g., large file rejection, retry flow, Gemini API errors, download error).
Rate limiting per user → Current limiter is global; ideally it should apply per authenticated user.

Streaming transcription → Instead of waiting for full job, use WebSockets or SSE to stream progress to clients.

