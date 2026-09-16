import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const OLLAMA_BASE_URL = (process.env.OLLAMA_BASE_URL || 'https://ollama.com/api').replace(/\/+$/, '');
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY || '';

// Enable CORS for frontend clients
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));

// Global rate limiter: max 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use('/api/', apiLimiter);

// Health Check
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'ok',
    service: 'ozcraft-backend',
    ollamaConfigured: Boolean(OLLAMA_API_KEY),
    ollamaBaseUrl: OLLAMA_BASE_URL,
  });
});

// Proxy Ollama Models/Tags
app.get(['/api/ollama/tags', '/tags'], async (req, res) => {
  try {
    const headers = { 'Content-Type': 'application/json' };
    const authHeader = req.headers.authorization;
    const clientKey = authHeader ? authHeader.replace(/^Bearer\s+/i, '').trim() : '';
    const activeKey = clientKey || OLLAMA_API_KEY;

    if (activeKey) {
      headers.Authorization = `Bearer ${activeKey}`;
    }

    const response = await fetch(`${OLLAMA_BASE_URL}/tags`, {
      method: 'GET',
      headers,
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    console.error('[ozcraft-backend] Error proxying /tags:', err);
    return res.status(502).json({
      error: 'Failed to connect to Ollama endpoint',
      message: err.message,
    });
  }
});

// Proxy Ollama Generate Text
app.post(['/api/ollama/generate', '/generate'], async (req, res) => {
  try {
    const headers = { 'Content-Type': 'application/json' };
    const authHeader = req.headers.authorization;
    const clientKey = authHeader ? authHeader.replace(/^Bearer\s+/i, '').trim() : '';
    const activeKey = clientKey || OLLAMA_API_KEY;

    if (activeKey) {
      headers.Authorization = `Bearer ${activeKey}`;
    }

    const response = await fetch(`${OLLAMA_BASE_URL}/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    console.error('[ozcraft-backend] Error proxying /generate:', err);
    return res.status(502).json({
      error: 'Failed to proxy request to Ollama endpoint',
      message: err.message,
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`[ozcraft-backend] Server listening on port ${PORT}`);
  console.log(`[ozcraft-backend] Proxying Ollama requests to: ${OLLAMA_BASE_URL}`);
  console.log(
    `[ozcraft-backend] Ollama API Key: ${OLLAMA_API_KEY ? 'Configured (Server-side)' : 'Not configured'}`
  );
});
