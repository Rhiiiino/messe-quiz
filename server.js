const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// SQLite Datenbank initialisieren
let db;
let dbReady = false;

try {
  db = new Database('leads.db');
  db.exec(`
    CREATE TABLE IF NOT EXISTS quiz_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      score INTEGER NOT NULL,
      max_score INTEGER NOT NULL,
      percentage REAL NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  dbReady = true;
  console.log('✅ SQLite Datenbank erfolgreich initialisiert');
} catch (error) {
  console.error('❌ Fehler bei DB-Initialisierung:', error.message);
  console.error('Server startet ohne Datenbank-Funktionalität.');
}

// Fragen laden
const questions = JSON.parse(fs.readFileSync('./questions.json', 'utf8'));

// API Routes

// Health Check (für Railway)
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Fragen abrufen (ohne korrekte Antworten)
app.get('/api/questions', (req, res) => {
  const questionsWithoutAnswers = questions.questions.map(q => ({
    id: q.id,
    question: q.question,
    options: q.options
  }));
  res.json(questionsWithoutAnswers);
});

// Quiz-Submission und Validierung
app.post('/api/submit', (req, res) => {
  if (!dbReady) {
    return res.status(503).json({ error: 'Datenbank nicht verfügbar' });
  }

  const { answers } = req.body;

  // Validierung
  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({
      error: 'Antworten fehlen'
    });
  }

  // Antworten validieren und Score berechnen
  let score = 0;
  const results = [];

  questions.questions.forEach((q, index) => {
    const userAnswer = answers[index];
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
      correctAnswerText: q.options[q.correctAnswer],
      impact: q.impact
    });
  });

  const maxScore = questions.questions.length;
  const percentage = (score / maxScore) * 100;

  // Anonyme Statistik in Datenbank speichern
  const stmt = db.prepare(`
    INSERT INTO quiz_results (score, max_score, percentage)
    VALUES (?, ?, ?)
  `);

  try {
    stmt.run(score, maxScore, percentage);

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

// Admin-Route: Alle Ergebnisse abrufen
app.get('/api/admin/results', (req, res) => {
  if (!dbReady) return res.status(503).json({ error: 'Datenbank nicht verfügbar' });
  try {
    const results = db.prepare('SELECT * FROM quiz_results ORDER BY timestamp DESC').all();
    res.json(results);
  } catch (error) {
    console.error('Fehler beim Abrufen der Ergebnisse:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Daten' });
  }
});

// Admin-Route: Statistiken abrufen
app.get('/api/admin/stats', (req, res) => {
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

// Admin-Route: Ergebnisse als CSV exportieren
app.get('/api/admin/export', (req, res) => {
  try {
    const results = db.prepare('SELECT * FROM quiz_results ORDER BY timestamp DESC').all();

    // CSV erstellen
    const headers = 'ID,Score,Max Score,Prozent,Zeitstempel\n';
    const rows = results.map(result =>
      `${result.id},${result.score},${result.max_score},${result.percentage},"${result.timestamp}"`
    ).join('\n');

    const csv = headers + rows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="quiz-results.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Fehler beim Export:', error);
    res.status(500).json({ error: 'Fehler beim Export' });
  }
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM empfangen. Server wird heruntergefahren...');
  if (db) db.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT empfangen. Server wird heruntergefahren...');
  if (db) db.close();
  process.exit(0);
});

// Server starten – 0.0.0.0 explizit binden (wichtig für Railway/Docker)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔═══════════════════════════════════════════╗
║   🎯 HPVG Quiz-App gestartet             ║
║                                           ║
║   Server läuft auf: http://0.0.0.0:${PORT}    ║
║   Admin-Panel: /admin.html                ║
║                                           ║
║   Bereit für Messestand! 🎪               ║
╚═══════════════════════════════════════════╝
  `);
});
