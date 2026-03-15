# HPVG Quiz-App - Projekt-Dokumentation

## 📋 Projektübersicht

Eine moderne, touch-optimierte Quiz-Applikation für Messestände zum Thema **Personalratsrechte nach dem Hessischen Personalvertretungsgesetz (HPVG)**.

Die App ist speziell für den Einsatz auf Tablets/Touch-Displays an Messeständen konzipiert und verzichtet bewusst auf Lead-Generierung - es werden keine persönlichen Daten erfasst.

## 🎯 Hauptziele

1. **UX Excellence**: Smooth, flüssige Benutzererfahrung ohne Page-Reloads
2. **Touch-Optimierung**: Große Buttons, haptisches Feedback, intuitive Bedienung
3. **Performance**: Vanilla JS (kein React/Vue) für maximale Geschwindigkeit
4. **Datenschutz**: Keine persönlichen Daten - nur anonyme Statistiken
5. **Messestand-Ready**: Schneller Reset zwischen Teilnehmern, robuster Betrieb

## 🏗️ Architektur

### Frontend (Single-Page-Application)
```
public/
├── index.html       # Haupt-HTML mit 3 Screens
├── app.js           # Vanilla JS Logic
├── style.css        # CSS mit Animationen & Touch-Optimierung
└── admin.html       # Admin-Panel für Statistiken
```

### Backend (Express.js)
```
server.js            # Express-Server mit API-Routen
questions.json       # Quiz-Fragen mit korrekten Antworten
leads.db             # SQLite-Datenbank (anonyme Statistiken)
```

### State Management
Vanilla JS State Object ohne externes Framework:
```javascript
const state = {
  questions: [],              // Geladene Fragen (ohne Antworten)
  currentQuestionIndex: 0,    // Aktuelle Frage
  answers: [],                // User-Antworten
  hasAnsweredCurrent: false   // Verhindert Mehrfach-Klicks
};
```

## 🔧 Technologien

### Core Dependencies
- **express** (^4.18.2) - Web-Framework
- **better-sqlite3** (^9.2.2) - SQLite-Datenbank

### Dev Dependencies
- **nodemon** (^3.0.2) - Auto-Reload während Entwicklung

### Frontend
- **Vanilla JavaScript** (ES6+)
- **CSS3** mit Custom Properties (CSS Variables)
- **HTML5** Semantic Elements

## 🎨 Design-Prinzipien

### CSS Variables (Theme)
```css
--primary-color: #2563eb     /* Haupt-Blau */
--success-color: #10b981     /* Richtige Antwort (Grün) */
--error-color: #ef4444       /* Falsche Antwort (Rot) */
--border-radius: 16px        /* Konsistente Rundungen */
--transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
```

### Animationen
- **Slide-In/Out**: Screen-Transitions (400ms)
- **Fade-In**: Fragen erscheinen (400ms)
- **Shake**: Falsche Antwort (500ms)
- **Pulse**: Richtige Antwort (500ms)
- **Celebration**: Konfetti bei 90%+ Score
- **Scale**: Button Active State (0.95)

### Touch-Optimierung
- Minimale Button-Größe: 48x48px (Apple HIG)
- Active-State: `transform: scale(0.95)`
- `-webkit-tap-highlight-color: transparent`
- `touch-action: manipulation`

## 📡 API-Endpunkte

### Public Endpoints

#### `GET /api/questions`
Fragen ohne korrekte Antworten abrufen.

**Response:**
```json
[
  {
    "id": 1,
    "question": "Frage-Text",
    "options": ["Option A", "Option B", "Option C", "Option D"]
  }
]
```

#### `POST /api/submit`
Quiz-Antworten validieren und Score berechnen.

**Request Body:**
```json
{
  "answers": [0, 2, 1, 3, 1, 2, 2, 1, 1, 1]
}
```

**Response:**
```json
{
  "success": true,
  "score": 8,
  "maxScore": 10,
  "percentage": 80,
  "results": [
    {
      "questionId": 1,
      "question": "Frage-Text",
      "userAnswer": 0,
      "correctAnswer": 0,
      "isCorrect": true,
      "correctAnswerText": "Option A"
    }
  ]
}
```

### Admin Endpoints

#### `GET /api/admin/results`
Alle Quiz-Ergebnisse (anonym).

**Response:**
```json
[
  {
    "id": 1,
    "score": 8,
    "max_score": 10,
    "percentage": 80.0,
    "timestamp": "2026-01-27 15:30:00"
  }
]
```

#### `GET /api/admin/stats`
Aggregierte Statistiken.

**Response:**
```json
{
  "total": 42,
  "average": 75,
  "today": 8
}
```

#### `GET /api/admin/export`
CSV-Export aller Ergebnisse.

**Response:** CSV-Datei Download

## 🗄️ Datenbank-Schema

### Tabelle: `quiz_results`
```sql
CREATE TABLE quiz_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  score INTEGER NOT NULL,           -- Anzahl richtiger Antworten
  max_score INTEGER NOT NULL,       -- Gesamtzahl Fragen (13)
  percentage REAL NOT NULL,         -- Prozentsatz
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Wichtig:** Keine persönlichen Daten (Name, E-Mail) werden gespeichert!

## 🔒 Sicherheits-Features

### Backend-Validierung
- Antworten werden nur serverseitig validiert
- Frontend sendet nur User-Auswahl (Index)
- Korrekte Antworten sind im Frontend niemals sichtbar

### SQL-Injection-Schutz
- Verwendung von Prepared Statements
- Keine String-Concatenation in SQL-Queries

### Input-Validierung
- Array-Typ-Check für Antworten
- Bounds-Check für Antwort-Indizes

## 📱 Screen-Flow

### Screen 1: Start (index.html #startScreen)
```
┌─────────────────────────────┐
│  🎯 Quiz: Personalratsrechte│
│                             │
│  Einleitung & Themen        │
│  [Info-Box]                 │
│  [Quiz starten Button]      │
└─────────────────────────────┘
```

### Screen 2: Quiz (index.html #quizScreen)
```
┌─────────────────────────────┐
│  [Progress Bar: 3/10]       │
├─────────────────────────────┤
│  Frage 3                    │
│  Fragetext...               │
│                             │
│  [○ Option A]               │
│  [○ Option B]               │
│  [○ Option C]               │
│  [○ Option D]               │
│                             │
│  [Nächste Frage Button]     │
└─────────────────────────────┘
```

### Screen 3: Ergebnis (index.html #resultScreen)
```
┌─────────────────────────────┐
│  ⭐⭐⭐ / ⭐⭐ / ⭐ / 📚       │
│  Exzellent! / Gut! / etc.   │
│                             │
│  8/10                       │
│  80%                        │
│                             │
│  [Detaillierte Auswertung]  │
│                             │
│  [Neues Quiz starten]       │
└─────────────────────────────┘
```

## 🎮 User-Interaktionen

### 1. Quiz starten
```javascript
handleStart()
→ Fragen vom Backend laden
→ Screen-Transition (start → quiz)
→ Progress Bar einblenden
→ Erste Frage anzeigen
```

### 2. Antwort auswählen
```javascript
handleAnswer(index, button)
→ Button disablen (alle)
→ Selected-Class setzen
→ Antwort im State speichern
→ "Nächste Frage" Button zeigen
```

### 3. Nächste Frage / Submit
```javascript
handleNextQuestion()
→ wenn currentIndex < 9: nächste Frage laden
→ wenn currentIndex === 9: submitQuiz()
```

### 4. Quiz absenden
```javascript
submitQuiz()
→ POST /api/submit mit answers[]
→ Backend validiert
→ Ergebnisse empfangen
→ Screen-Transition (quiz → result)
→ Score anzeigen + Konfetti (bei 90%+)
```

### 5. Reset
```javascript
handleReset()
→ State zurücksetzen
→ Screen-Transition (result → start)
→ Progress Bar verstecken
```

## 📝 Fragen-Format (questions.json)

```json
{
  "questions": [
    {
      "id": 1,
      "question": "Frage-Text",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correctAnswer": 0  // Index der richtigen Antwort (0-3)
    }
  ]
}
```

**Wichtig:**
- `correctAnswer` ist der Array-Index (0-basiert)
- Wird niemals ans Frontend gesendet
- Nur im Backend für Validierung verwendet

## 🚀 Deployment

### Entwicklung
```bash
npm install
npm run dev    # nodemon mit Auto-Reload
```

### Produktion
```bash
npm install
npm start      # Node.js Server

# ODER mit PM2 (empfohlen):
pm2 start server.js --name hpvg-quiz
pm2 startup
pm2 save
```

### Umgebungsvariablen
```bash
PORT=3000  # Optional, Default: 3000
```

### Server-Anforderungen
- Node.js 16+ (empfohlen: 18 LTS)
- 512MB RAM (ausreichend)
- 100MB Disk Space
- Port 3000 (oder custom)

### Render.com Deployment
- **Status**: 🟢 Live auf render.com
- **Health-Check**: Cronjob pingt `/health` alle 5 Minuten an
- **Grund**: Verhinderung von Inaktivität (Spin-down auf kostenlosen Servern)
- **Alternative**: External monitoring service (z.B. Healthchecks.io) kann konfiguriert werden

## 🔍 Debugging

### PM2 Logs
```bash
pm2 logs hpvg-quiz           # Live-Logs
pm2 logs hpvg-quiz --lines 100   # Letzte 100 Zeilen
```

### Browser Console
```javascript
// State inspizieren (dev tools)
console.log(state);

// Fragen anzeigen
console.log(state.questions);

// Antworten anzeigen
console.log(state.answers);
```

### Häufige Probleme

#### Port bereits belegt
```bash
lsof -ti:3000 | xargs kill -9
pm2 restart hpvg-quiz
```

#### Datenbank zurücksetzen
```bash
rm leads.db
pm2 restart hpvg-quiz
```

#### Cache-Probleme (Browser)
```
Strg/Cmd + Shift + R (Hard Reload)
```

## 📊 Performance-Metriken

### Ziel-Werte
- **First Contentful Paint**: < 1s
- **Time to Interactive**: < 2s
- **Lighthouse Score**: > 90

### Optimierungen
- Keine externen Frameworks (React, Vue, etc.)
- Minimales CSS/JS
- Keine Bilder (nur Emojis)
- Gzip-Kompression (Express)
- SQLite (keine externe DB)

## 🎯 Erweiterungs-Möglichkeiten

### Mögliche Features (nicht implementiert)
1. **Mehrsprachigkeit**: i18n für DE/EN
2. **Fragen-Pool**: Randomisierte Fragenauswahl
3. **Zeitlimit**: Timer pro Frage
4. **Schwierigkeitsgrade**: Easy/Medium/Hard
5. **QR-Code**: Zum Teilen der Ergebnisse
6. **PDF-Export**: Zertifikat generieren
7. **Highscore**: Top 10 Ergebnisse anzeigen
8. **Analytics**: Google Analytics Integration

### Backend-Erweiterungen
1. **Authentifizierung**: Admin-Panel Login
2. **Rate-Limiting**: Spam-Schutz
3. **Caching**: Redis für Fragen
4. **Monitoring**: Prometheus/Grafana

## 📚 Code-Konventionen

### JavaScript
- ES6+ Features (const/let, arrow functions, async/await)
- Keine globalen Variablen außer `state`
- Funktions-Namen: camelCase (`handleStart`, `loadQuestion`)
- Event-Handler-Präfix: `handle` (`handleAnswer`)

### CSS
- CSS Variables für Theme
- BEM-ähnliche Naming: `.option-btn`, `.result-item`
- Mobile-First Approach
- Animations via CSS (nicht JS)

### HTML
- Semantic Elements (`<main>`, `<section>`, `<button>`)
- Accessibility: ARIA-Labels wo nötig
- Data-Attributes: `data-index`, `data-id`

## 🧪 Testing (Empfehlung)

### Manuelle Tests
- [ ] Quiz durchspielen (alle Antworten richtig)
- [ ] Quiz durchspielen (alle Antworten falsch)
- [ ] Quiz durchspielen (gemischt)
- [ ] Reset nach Quiz
- [ ] Admin-Panel Statistiken
- [ ] CSV-Export
- [ ] Responsive Design (Tablet/Mobile)
- [ ] Touch-Interaktionen

### Automatisierte Tests (nicht implementiert)
```bash
# Beispiel mit Jest/Mocha
npm test
```

## 📞 Support & Wartung

### Logs überwachen
```bash
pm2 monit          # Real-time Monitoring
pm2 logs hpvg-quiz --lines 50
```

### Backup
```bash
# Datenbank sichern
cp leads.db leads_backup_$(date +%Y%m%d).db
```

### Updates
```bash
npm update         # Dependencies aktualisieren
npm audit fix      # Sicherheits-Updates
```

## 🎪 Messestand-Setup

### Hardware-Empfehlung
- **Tablet**: iPad Pro 12.9" oder Android Tablet (min. 10")
- **Ständer**: Fester Tablet-Ständer mit Kiosk-Modus
- **Netzwerk**: Lokales WLAN oder Hotspot

### Kiosk-Modus
```javascript
// Optional: Auto-Reset nach 2 Minuten Inaktivität
let inactivityTimer;
document.addEventListener('click', () => {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    if (screens.result.classList.contains('active')) {
      handleReset();
    }
  }, 120000); // 2 Minuten
});
```

### Browser-Empfehlung
- **Chrome** (empfohlen)
- **Safari** (iOS)
- Vollbild-Modus: F11 (Windows) / Ctrl+Cmd+F (Mac)

## 📄 Lizenz & Credits

- **Lizenz**: MIT
- **Erstellt**: 2026-01-27
- **Zweck**: Messestand-Quiz für HPVG-Schulungen
- **Zielgruppe**: Mitarbeiter in AöR, Personalräte, Führungskräfte

## 📝 Aktuelle Features (März 2026)

- ✅ **13 optimierte Fragen** (HPVG-Personalratsrechte, KI, SBV, BEM)
- ✅ **Impact-Statements** auf Ergebnisseite für besseres Lernen
- ✅ **Randomisierte Antwortoptionen** (verhindert Pattern-Erkennung)
- ✅ **Mobile-optimiert** (reduzierte Spacing auf Smartphones)
- ✅ **Race-Condition Fix** (isProcessing Flag für Button-Sicherheit)
- ✅ **Cronjob-Schutz** gegen Inaktivität auf Render.com
- ✅ **Debug-Logging** für Impact-Feld-Überprüfung

---

**Letzte Aktualisierung:** 2026-03-15
**Version:** 1.1.0
**Status:** ✅ Production Ready (Render.com)
