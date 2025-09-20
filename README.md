# Audio Transcribe
Please check full detail by opening client or server folder.

# 🎙️ AudioScribe: Fullstack Setup Guide

This guide provides instructions for setting up and running both the **Backend (Transcribe Backend)** and **Frontend (AudioScribe)** services.

You will need two separate terminals for running the API server and the job queue worker.

-----

## 🛠️ Prerequisites

Ensure you have the following installed:

  * **Node.js** (v18+ recommended)
  * **MongoDB** (running locally or accessible via a cloud connection string)
  * **Git**

-----

## 1\. ⚙️ Backend Setup (Transcribe Backend)

The backend service handles the transcription logic and uses **MongoDB** and the **Gemini API**.

### A. Clone and Install

Navigate to the directory where you want to place the project and clone the backend repository:

```bash
git clone <backend-repo-url> audioTranscribe/server
cd audioTranscribe/server
npm install
```

### B. Configuration

Create a configuration file based on the example and fill in your credentials:

```bash
cp .env.example .env
```

Edit the newly created **`.env`** file:

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/transcribe_dev  # Update if using a remote Mongo instance
GEMINI_API_KEY=your-key-here                        # REQUIRED for transcription
```

### C. Run Backend Services

The backend needs **two separate processes** to function: the API server and the Job Queue Worker.

**Terminal 1: Start the API Server**

This runs the Express application, handling API requests.

```bash
npm run dev
```

**Terminal 2: Start the Queue Worker**

This runs the Agenda job system, picking up transcription jobs and executing them.

```bash
npm run worker
```

**Result:** The backend API should now be running on `http://localhost:4000` (or your configured port).

-----

## 2\. 🖥️ Frontend Setup (AudioScribe)

The frontend is a simple React application that consumes the backend API.

### A. Clone and Install

Open a **new terminal window/tab**, navigate to your desired directory, and clone the frontend repository:

```bash
git clone <frontend-repo-url> audioTranscribe/client
cd audioTranscribe/client
npm install
```

### B. Configuration

Create the environment file to tell the frontend where to find the backend API:

```bash
cp .env.example .env
```

Edit the **`.env`** file to point to your running backend (using the same port configured in the backend's `.env`):

```env
VITE_API_URL=http://localhost:4000/api
```

### C. Run Frontend Service

Start the development server (using Vite):

```bash
npm run dev
```

**Result:** The terminal will display the local URL (typically `http://localhost:5173`). Open this URL in your browser to access the application.

-----

## 🚀 Usage

1.  Ensure all three processes are running (Backend API, Backend Worker, Frontend Dev Server).
1.  Ensure frontend & backend .env is updated .
2.  Open the frontend application in your browser.
3.  Paste a **public audio URL** (e.g., an `.mp3`, `.wav`) into the submission form and click **Submit**.
4.  The application will display a new card with the status (e.g., "pending," "processing").
5.  Wait for the Worker process (Terminal 2) to finish the job then click on refresh icon above the list to updated the status to **"completed"** or **"Failed"** .
6.  You can then play the audio and view/copy the transcript.