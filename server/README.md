# 🎙️ Transcribe Backend (with Gemini)

This is the backend service for the Transcribe project, built with **Node.js, Express, and MongoDB**. It is designed to handle the asynchronous process of audio file transcription, utilizing the **Google Gemini API** for the core transcription task.

-----

## 💡 Overview

The service allows users to submit an audio file via a public **URL**. It then:

1.  **Downloads** and **validates** the audio file.
2.  **Transcribes** the content (using a mock or the Gemini API).
3.  **Stores** the results (including status and transcription text) in a **MongoDB** database.
4.  Transcription processes are handled using the **Agenda job queue system** for reliable background processing.

-----

## 📂 Code Structure

The project follows a standard modular architecture.

| Folder/File | Description |
| :--- | :--- |
| `src/app.ts` | The core **Express application**. Wires up global middlewares (security, rate-limiting, logging) and defines the API routes. |
| `src/server.ts` | The main **entry point**. Starts the server, connects to MongoDB, and handles graceful shutdown. |
| **`src/config/`** | |
| `config.ts` | Centralized **configuration** (e.g., `PORT`, `MONGO_URI`, storage folder). |
| `db.ts` | Utility for **connecting/disconnecting MongoDB** using Mongoose. |
| **`src/models/`** | |
| `transcription.model.ts` | **Mongoose schema** for transcriptions (audio URL, status, transcription text, error, timestamps, etc.). |
| **`src/routes/`** | |
| `transcription.routes.ts` | Defines **REST endpoints** for creating new transcriptions (`POST /transcribe`) and listing existing ones (`GET /transcribe`). |
| **`src/controllers/`** | |
| `transcription.controller.ts` | Handles the **request/response logic** for the transcription APIs. |
| **`src/services/`** | |
| `transcription.service.ts` | **Orchestrates** the entire transcription flow (create database record, queue processing, update status). |
| `download.service.ts` | Handles **downloading audio files**, validating MIME type, and saving them locally. |
| `transcribers/mock.transcriber.ts` | **Mock transcriber** that fakes the transcription result for testing purposes. |
| `transcribers/gemini.transcriber.ts` | The **real integration** with the **Google Gemini API** for transcription. |
| `src/middleware/` | Reusable **Express middleware** (rate limiter, request validation). |
| `src/utils/` | **Helper utilities** like structured logging using `pino`. |
| **`tests/`** | **Jest test suites** including: |
| `integration/` | **End-to-end API tests**. |

-----

## ✅ Key Assumptions

  * **Audio Source**: Input is always a **public URL** pointing directly to a valid audio file.
  * **Storage**: Downloaded audio is stored **temporarily on local disk** (in an `uploads/` folder).
  * **Queue System**: An **Agenda** job queue is planned/used for background processing, though direct processing is also possible for simplicity.
  * **Transcriber**: Both a **mock transcriber** (default for development) and the **Gemini API** are integrated.
  * **Security**: Basic middleware is included (**Helmet**, **CORS**, **rate limiting**), but full user authentication/authorization is *not* implemented as this is a demo.
  * **Validation**: **Zod** is used for clean, reliable request input validation.

-----

## 🚀 How to Run

### Prerequisites

  * Node.js (v18+)
  * MongoDB (running locally or a cloud instance)

### 1\. Clone and Install Dependencies

```bash
git clone <repo-url> audioTranscribe/server
cd audioTranscribe/server
npm install
```

### 2\. Configuration

Copy the example environment file and update your credentials:

```bash
cp .env.example .env
```

Set the following variables in your new **`.env`** file:

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/transcribe_dev
GEMINI_API_KEY=your-key-here
```

### 3\. Start the Services

The backend requires two main processes: the **API server** and the **Worker** (queue system).

**Start Development Server (API):**

```bash
npm run dev
```

**Start Worker (Queue System):**

This process runs the Agenda queue to pick up and process transcription jobs.

```bash
npm run worker
```

-----

## 📈 Future Improvements (Production-Grade)

If this were to be deployed as a live, production-grade service, the following enhancements would be necessary:

1.  **Authentication & Roles**: Implement secure APIs using **JWT** or **OAuth2**, and add role-based access control (e.g., only the owner can access their transcriptions).
2.  **Cloud File Storage**: Replace local disk storage with scalable cloud storage (**AWS S3** or similar) for audio files.
3.  **Robust Job Queue**: Integrate a more robust, battle-tested queue solution, such as an **Agenda setup backed by Redis**.
4.  **Better Error Handling**: Standardize error response formats, add **retry logic** for transient job failures, and thoroughly track job attempts.
5.  **Streaming Transcription**: Use **WebSockets** or **Server-Sent Events (SSE)** to stream progress updates back to the client instead of waiting for the full job completion.
6.  **Granular Rate Limiting**: Change the current global rate limiter to apply **per authenticated user** for better resource management.# 🎙️ Transcribe Backend (with Gemini)

This is the backend service for the Transcribe project, built with **Node.js, Express, and MongoDB**. It is designed to handle the asynchronous process of audio file transcription, utilizing the **Google Gemini API** for the core transcription task.

-----

## 💡 Overview

The service allows users to submit an audio file via a public **URL**. It then:

1.  **Downloads** and **validates** the audio file.
2.  **Transcribes** the content (using a mock or the Gemini API).
3.  **Stores** the results (including status and transcription text) in a **MongoDB** database.
4.  Transcription processes are handled using the **Agenda job queue system** for reliable background processing.

-----

## 📂 Code Structure

The project follows a standard modular architecture.

| Folder/File | Description |
| :--- | :--- |
| `src/app.ts` | The core **Express application**. Wires up global middlewares (security, rate-limiting, logging) and defines the API routes. |
| `src/server.ts` | The main **entry point**. Starts the server, connects to MongoDB, and handles graceful shutdown. |
| **`src/config/`** | |
| `config.ts` | Centralized **configuration** (e.g., `PORT`, `MONGO_URI`, storage folder). |
| `db.ts` | Utility for **connecting/disconnecting MongoDB** using Mongoose. |
| **`src/models/`** | |
| `transcription.model.ts` | **Mongoose schema** for transcriptions (audio URL, status, transcription text, error, timestamps, etc.). |
| **`src/routes/`** | |
| `transcription.routes.ts` | Defines **REST endpoints** for creating new transcriptions (`POST /transcribe`) and listing existing ones (`GET /transcribe`). |
| **`src/controllers/`** | |
| `transcription.controller.ts` | Handles the **request/response logic** for the transcription APIs. |
| **`src/services/`** | |
| `transcription.service.ts` | **Orchestrates** the entire transcription flow (create database record, queue processing, update status). |
| `download.service.ts` | Handles **downloading audio files**, validating MIME type, and saving them locally. |
| `transcribers/mock.transcriber.ts` | **Mock transcriber** that fakes the transcription result for testing purposes. |
| `transcribers/gemini.transcriber.ts` | The **real integration** with the **Google Gemini API** for transcription. |
| `src/middleware/` | Reusable **Express middleware** (rate limiter, request validation). |
| `src/utils/` | **Helper utilities** like structured logging using `pino`. |
| **`tests/`** | **Jest test suites** including: |
| `integration/` | **End-to-end API tests**. |

-----

## ✅ Key Assumptions

  * **Audio Source**: Input is always a **public URL** pointing directly to a valid audio file.
  * **Storage**: Downloaded audio is stored **temporarily on local disk** (in an `uploads/` folder).
  * **Queue System**: An **Agenda** job queue is planned/used for background processing, though direct processing is also possible for simplicity.
  * **Transcriber**: Both a **mock transcriber** (default for development) and the **Gemini API** are integrated.
  * **Security**: Basic middleware is included (**Helmet**, **CORS**, **rate limiting**), but full user authentication/authorization is *not* implemented as this is a demo.
  * **Validation**: **Zod** is used for clean, reliable request input validation.

-----

## 🚀 How to Run

### Prerequisites

  * Node.js (v18+)
  * MongoDB (running locally or a cloud instance)

### 1\. Clone and Install Dependencies

```bash
git clone <repo-url> audioTranscribe/server
cd audioTranscribe/server
npm install
```

### 2\. Configuration

Copy the example environment file and update your credentials:

```bash
cp .env.example .env
```

Set the following variables in your new **`.env`** file:

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/transcribe_dev
GEMINI_API_KEY=your-key-here
```

### 3\. Start the Services

The backend requires two main processes: the **API server** and the **Worker** (queue system).

**Start Development Server (API):**

```bash
npm run dev
```

**Start Worker (Queue System):**

This process runs the Agenda queue to pick up and process transcription jobs.

```bash
npm run worker
```

-----

## 📈 Future Improvements (Production-Grade)

If this were to be deployed as a live, production-grade service, the following enhancements would be necessary:

1.  **Authentication & Roles**: Implement secure APIs using **JWT** or **OAuth2**, and add role-based access control (e.g., only the owner can access their transcriptions).
2.  **Cloud File Storage**: Replace local disk storage with scalable cloud storage (**AWS S3** or similar) for audio files.
3.  **Robust Job Queue**: Integrate a more robust, battle-tested queue solution, such as an **Agenda setup backed by Redis**.
4.  **Better Error Handling**: Standardize error response formats, add **retry logic** for transient job failures, and thoroughly track job attempts.
5.  **Streaming Transcription**: Use **WebSockets** or **Server-Sent Events (SSE)** to stream progress updates back to the client instead of waiting for the full job completion.
6.  **Granular Rate Limiting**: Change the current global rate limiter to apply **per authenticated user** for better resource management.