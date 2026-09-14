# OzCraft Backend (Express.js)

Lightweight proxy server for Ollama API integration in the OzCraft Resume Builder application.
Keeps your Ollama API key secure on the server side instead of exposing it in browser cookies or client-side HTTP requests.

## Setup & Running

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   Copy `.env.example` to `.env` and provide your Ollama API credentials:
   ```bash
   cp .env.example .env
   ```
   Set your `OLLAMA_API_KEY`.

3. **Start development server:**
   ```bash
   npm run dev
   ```
   The server starts on port `5000` (default) with native auto-restart on file change.

4. **Health Check:**
   Visit `http://localhost:5000/api/health` to confirm the backend is running.
