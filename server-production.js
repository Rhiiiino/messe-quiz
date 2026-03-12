const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ===== SICHERHEITS-MIDDLEWARE =====

// 1. Helmet - Security Headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// 2. Rate Limiting - DDoS-Schutz
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: 100, // Max 100 Requests pro IP
  message: {
    error: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const submitLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 Minute
  max: 5, // Max 5 Quiz-Submissions pro Minute
  message: {
    error: 'Bitte warten Sie eine Minute, bevor Sie das nächste Quiz starten.'
  }
});

// 3. Body Parser mit Limits
app.use(express.json({ limit: '10kb' }));

// 4. Static Files
app.use(express.static('public', {
  maxAge: NODE_ENV === 'production' ? '1d' : 0
}));

// 5. Logging (Production)
if (NODE_ENV === 'production') {
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
    next();
  });
}

// ===== DATENBANK =====

const db = new Database('leads.db');

// Tabelle für anonyme Quiz-Ergebnisse erstellen
db.exec(`
  CREATE TABLE IF NOT EXISTS quiz_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    percentage REAL NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_hash TEXT
  )
`);

// Fragen laden
const questions = JSON.parse(fs.readFileSync('./questions.json', 'utf8'));

// ===== HELPER FUNCTIONS =====

// IP-Adresse anonymisieren (DSGVO)
function hashIP(ip) {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(ip + process.env.SESSION_SECRET).digest('hex').substring(0, 16);
}

// Admin-Authentifizierung (HTTP Basic Auth)
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Panel"');
    return res.status(401).json({ error: 'Authentifizierung erforderlich' });
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [username, password] = credentials.split(':');

  const validUsername = process.env.ADMIN_USERNAME || 'admin';
  const validPassword = process.env.ADMIN_PASSWORD || 'change-me-please';

  if (username === validUsername && password === validPassword) {
    next();
  } else {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Panel"');
    return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
  }
}

// ===== PUBLIC API ROUTES =====

// Fragen abrufen (ohne korrekte Antworten)
app.get('/api/questions', apiLimiter, (req, res) => {
  const questionsWithoutAnswers = questions.questions.map(q => ({
    id: q.id,
    question: q.question,
    options: q.options
  }));
  res.json(questionsWithoutAnswers);
});

// Quiz-Submission und Validierung
app.post('/api/submit', submitLimiter, (req, res) => {
  const { answers } = req.body;

  // Validierung
  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({
      error: 'Antworten fehlen'
    });
  }

  if (answers.length !== questions.questions.length) {
    return res.status(400).json({
      error: 'Ungültige Anzahl von Antworten'
    });
  }

  // Antworten validieren und Score berechnen
  let score = 0;
  const results = [];

  questions.questions.forEach((q, index) => {
    const userAnswer = answers[index];

    // Validierung: Antwort muss eine Zahl zwischen 0 und 3 sein
    if (typeof userAnswer !== 'number' || userAnswer < 0 || userAnswer >= q.options.length) {
      return res.status(400).json({
        error: 'Ungültige Antwort-Indizes'
      });
    }

    const isCorrect = userAnswer === q.correctAnswer;

    if (isCorrect) {
      score++;
    }

    results.push({
      questionId: q.id,
      question: q.question,
      userAnswer: userAnswer,
      correctAnswer: q.correctAnswer,
      isCorrect: isCorrect,
      correctAnswerText: q.options[q.correctAnswer]
    });
  });

  const maxScore = questions.questions.length;
  const percentage = (score / maxScore) * 100;

  // IP anonymisiert speichern (für Spam-Erkennung)
  const ipHash = hashIP(req.ip);

  // Anonyme Statistik in Datenbank speichern
  const stmt = db.prepare(`
    INSERT INTO quiz_results (score, max_score, percentage, ip_hash)
    VALUES (?, ?, ?, ?)
  `);

  try {
    stmt.run(score, maxScore, percentage, ipHash);

    res.json({
      success: true,
      score: score,
      maxScore: maxScore,
      percentage: Math.round(percentage),
      results: results
    });
  } catch (error) {
    console.error('Fehler beim Speichern:', error);
    res.status(500).json({
      error: 'Fehler beim Speichern der Daten'
    });
  }
});

// ===== ADMIN API ROUTES (Geschützt) =====

// Admin-Panel HTML mit Auth
app.get('/admin.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Alle Ergebnisse abrufen
app.get('/api/admin/results', requireAuth, apiLimiter, (req, res) => {
  try {
    // IP-Hash nicht zurückgeben (Privacy)
    const results = db.prepare('SELECT id, score, max_score, percentage, timestamp FROM quiz_results ORDER BY timestamp DESC LIMIT 1000').all();
    res.json(results);
  } catch (error) {
    console.error('Fehler beim Abrufen der Ergebnisse:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Daten' });
  }
});

// Statistiken abrufen
app.get('/api/admin/stats', requireAuth, (req, res) => {
  try {
    const total = db.prepare('SELECT COUNT(*) as count FROM quiz_results').get();
    const avgScore = db.prepare('SELECT AVG(percentage) as avg FROM quiz_results').get();
    const today = new Date().toISOString().split('T')[0];
    const todayCount = db.prepare(
      'SELECT COUNT(*) as count FROM quiz_results WHERE DATE(timestamp) = ?'
    ).get(today);

    res.json({
      total: total.count,
      average: Math.round(avgScore.avg || 0),
      today: todayCount.count
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Statistiken:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Statistiken' });
  }
});

// Ergebnisse als CSV exportieren
app.get('/api/admin/export', requireAuth, (req, res) => {
  try {
    const results = db.prepare('SELECT id, score, max_score, percentage, timestamp FROM quiz_results ORDER BY timestamp DESC').all();

    // CSV erstellen
    const headers = 'ID,Score,Max Score,Prozent,Zeitstempel\n';
    const rows = results.map(result =>
      `${result.id},${result.score},${result.max_score},${result.percentage},"${result.timestamp}"`
    ).join('\n');

    const csv = headers + rows;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="quiz-results.csv"');
    res.send('\uFEFF' + csv); // UTF-8 BOM für Excel
  } catch (error) {
    console.error('Fehler beim Export:', error);
    res.status(500).json({ error: 'Fehler beim Export' });
  }
});

// Health-Check Endpoint (für Monitoring)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ===== ERROR HANDLING =====

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route nicht gefunden' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unbehandelter Fehler:', err);
  res.status(500).json({
    error: NODE_ENV === 'production' ? 'Interner Server-Fehler' : err.message
  });
});

// ===== SERVER START =====

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM empfangen. Server wird heruntergefahren...');
  db.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT empfangen. Server wird heruntergefahren...');
  db.close();
  process.exit(0);
});

// Server starten
const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║   🎯 HPVG Quiz-App (${NODE_ENV.toUpperCase()})                    ║
║                                                       ║
║   Server läuft auf: http://localhost:${PORT}             ║
║   Admin-Panel: /admin.html                            ║
║                                                       ║
║   🔐 Sicherheits-Features:                            ║
║   ✓ Helmet Security Headers                          ║
║   ✓ Rate Limiting                                     ║
║   ✓ Admin Auth (Basic)                                ║
║   ✓ Input Validierung                                 ║
║   ✓ IP Anonymisierung                                 ║
║                                                       ║
║   Bereit für Messestand! 🎪                           ║
╚═══════════════════════════════════════════════════════╝
  `);

  if (NODE_ENV === 'production') {
    if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === 'change-me-please') {
      console.warn('\n⚠️  WARNUNG: Bitte setzen Sie ADMIN_PASSWORD in .env!\n');
    }
    if (!process.env.SESSION_SECRET) {
      console.warn('\n⚠️  WARNUNG: Bitte setzen Sie SESSION_SECRET in .env!\n');
    }
  }
});

module.exports = server;
