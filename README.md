# 🎯 HPVG Quiz-App für Messestand

Eine moderne, touch-optimierte Quiz-Applikation für Messestände zum Thema Personalratsrechte nach dem Hessischen Personalvertretungsgesetz (HPVG).

## ✨ Features

- **Smooth UX**: Single-Page-Architecture ohne Page-Reloads
- **Touch-optimiert**: Große Buttons mit haptischem Feedback
- **Animationen**: Slide-In/Out-Effekte und Celebration-Animationen
- **DSGVO-konform**: Einverständnis-Checkbox für Datenspeicherung
- **Lead-Generierung**: Automatische Speicherung von Name, E-Mail und Score
- **Admin-Panel**: Übersicht aller Teilnehmer mit Export-Funktion
- **Backend-Validierung**: Sichere Antwortprüfung auf dem Server

## 🚀 Installation

### 1. Dependencies installieren

```bash
npm install
```

### 2. App starten

```bash
npm start
```

Die App läuft dann auf: `http://localhost:3000`

### 3. Für Entwicklung (mit Auto-Reload)

```bash
npm run dev
```

## 📂 Projektstruktur

```
messe-quiz/
├── server.js              # Express Backend
├── questions.json         # Quiz-Fragen mit korrekten Antworten
├── package.json          # Dependencies
├── leads.db              # SQLite Datenbank (wird automatisch erstellt)
└── public/
    ├── index.html        # Haupt-HTML
    ├── style.css         # Styling
    ├── app.js            # Frontend-Logik
    └── admin.html        # Admin-Panel
```

## 🎮 Verwendung

### Quiz-Flow

1. **Lead-Generierung**: Besucher gibt Name und E-Mail ein
2. **Quiz**: 10 Fragen mit sofortigem Feedback
3. **Ergebnis**: Auswertung mit detaillierter Übersicht

### Admin-Panel

Aufrufbar unter: `http://localhost:3000/admin.html`

Features:
- Übersicht aller Teilnehmer
- Statistiken (Gesamt, Durchschnitt, Heute)
- CSV-Export für weitere Verarbeitung
- Auto-Refresh alle 30 Sekunden

## 🔧 Konfiguration

### Port ändern

```bash
PORT=8080 npm start
```

### Fragen anpassen

Bearbeiten Sie `questions.json`:

```json
{
  "questions": [
    {
      "id": 1,
      "question": "Ihre Frage hier?",
      "options": [
        "Antwort A",
        "Antwort B",
        "Antwort C",
        "Antwort D"
      ],
      "correctAnswer": 0
    }
  ]
}
```

**Hinweis**: `correctAnswer` ist der Index (0-basiert) der richtigen Antwort.

## 🌐 Produktiv-Deployment

### Mit PM2 (empfohlen)

```bash
# PM2 global installieren
npm install -g pm2

# App starten
pm2 start server.js --name hpvg-quiz

# Auto-Start beim Server-Neustart
pm2 startup
pm2 save
```

### Nützliche PM2-Befehle

```bash
pm2 status              # Status anzeigen
pm2 logs hpvg-quiz     # Logs anzeigen
pm2 restart hpvg-quiz  # App neustarten
pm2 stop hpvg-quiz     # App stoppen
```

## 🔒 Sicherheit

- **Backend-Validierung**: Alle Antworten werden serverseitig geprüft
- **Input-Validierung**: E-Mail-Format und Pflichtfelder werden validiert
- **SQL-Injection-Schutz**: Verwendung von Prepared Statements
- **DSGVO-konform**: Explizite Einwilligung erforderlich

## 📊 Datenbank

Die SQLite-Datenbank (`leads.db`) enthält folgende Struktur:

```sql
CREATE TABLE leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  percentage REAL NOT NULL,
  consent BOOLEAN NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## 🎨 Design-Anpassungen

CSS-Variablen in `public/style.css` anpassen:

```css
:root {
  --primary-color: #2563eb;    /* Haupt-Farbe */
  --success-color: #10b981;    /* Richtige Antwort */
  --error-color: #ef4444;      /* Falsche Antwort */
}
```

## 📱 Browser-Kompatibilität

- Chrome/Edge (empfohlen für Messestände)
- Firefox
- Safari
- Mobile Browser (iOS Safari, Chrome Mobile)

## 🆘 Troubleshooting

**Port bereits belegt:**
```bash
PORT=3001 npm start
```

**Datenbank-Fehler:**
```bash
rm leads.db
npm start
```

**Dependencies-Probleme:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📝 Lizenz

MIT License - Frei verwendbar für kommerzielle und private Zwecke.

---

**Erstellt für Messestände** • Optimiert für Performance und UX
