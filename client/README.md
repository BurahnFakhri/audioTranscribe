# 🎧 AudioScribe — Frontend README

This is the simple, user-friendly **frontend** for the AudioScribe project. It provides a clean interface for users to submit an audio URL, initiate a transcription job on the backend, and view the results.

It's built with modern, plain **React hooks** and **Axios**, making the data flow easy to understand and maintain.

-----

## ⚡️ Quick Start

### 1\. Installation

Clone the repository (if applicable) and install the dependencies:

```bash
npm install
```

### 2\. Configuration

Create a **`.env`** file in the project root and define the backend API URL. This allows the frontend to communicate with your running backend service.

```bash
cp .env.example .env
```

Set the following variable in **`.env`**:

```env
VITE_API_URL=http://localhost:4000/api
# Change port (4000) if your backend is running on a different one.
```

### 3\. Run the Development Server

Assuming you're using **Vite** (as suggested by the configuration):

```bash
npm run dev
```

Open your browser to the address shown in the terminal (typically `http://localhost:5173`).

-----

## ✨ Main Features & Flow

The application handles the full client-side transcription lifecycle:

1.  **Submission:** You paste a public **audio URL** into the input form (`AudioUpload.tsx`).
2.  **Job Creation:** The app calls the backend endpoint `POST /api/transcription` via `createTranscription` to start a new job.
3.  **Status Tracking:** The app immediately fetches the updated list of records from `GET /api/transcription` and displays their status (**pending, processing, completed, failed**).
4.  **Result Display:** When a record shows a **"completed"** status, the user can **play the audio** using the built-in player, **copy the transcript** text, or **export** the result.

### 🌐 Core Technologies

  * **React (hooks):** Primary library for building the UI and managing component state.
  * **Axios:** Used for all HTTP requests to the backend API.
  * **Tailwind CSS with ShadCN UI:** Provides a modern, responsive, and customizable component library and styling.
  * **react-h5-audio-player:** A dedicated component for audio playback.
  * **lucide-react:** A library for simple, functional icons.

-----

## 💻 File / Component Overview

| File/Component | Description |
| :--- | :--- |
| `src/App.tsx` | Sets up the main **routing** and global UI providers. |
| **`src/lib/api.ts`** | Contains **Axios helper functions** (`fetchTranscriptions`, `createTranscription`) to abstract API calls. |
| **`src/pages/Index.tsx`** | The **main page** component. Manages the global transcription list **state** and orchestrates network calls. |
| `src/components/AudioUpload.tsx` | The **input form** where users paste the audio URL and submit the job. |
| `src/components/TranscriptionCard.tsx` | The reusable **UI card** that displays the status, audio player, transcription text, and action buttons for a single record. |

### Component Details

  * **`Index.tsx`** is the central hub: it loads the initial list on page load and triggers a reload after a successful job creation.
  * **`TranscriptionCard.tsx`** is responsible for rendering the status and results. It integrates the audio player (with a player color set to `#1593EB`) and handles the copy/export actions.

-----

## 📌 Assumptions

  * **No Authentication**: This is a demo; authentication and user session management are *not* included.
  * **URL-based Audio**: Audio files are referenced by a public **URL**; there is no file upload capability from the browser.
  * **Polling/Refetching**: Since transcription is server-side and asynchronous, the frontend relies on periodically **refetching** the list (`GET /api/transcription`) to pick up status changes.

-----

## 🚀 Future Improvements (Production-Grade)

For a production environment, the following enhancements would be essential:

  * **Real-time Updates**: Implement **WebSockets** or **Server-Sent Events (SSE)** to push status updates from the backend, eliminating the need for periodic refetching.
  * **User Authentication**: Add full authentication so users can only view and manage their *own* transcription jobs.
  * **Data Management**: Introduce **pagination and filters** to efficiently handle a long list of transcription records.
  * **Testing**: Add **component tests** (e.g., using React Testing Library) and **API helper tests** to ensure reliability.