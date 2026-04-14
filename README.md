# 🎯 HPVG Quiz-App für Messestand

Eine moderne, touch-optimierte Quiz-Applikation für Messestände zum Thema Personalratsrechte nach dem Hessischen Personalvertretungsgesetz (HPVG).

## ✨ Features

- **Smooth UX**: Single-Page-Architecture ohne Page-Reloads
- **Touch-optimiert**: Große Buttons mit haptischem Feedback
- **Animationen**: Slide-In/Out-Effekte und Celebration-Animationen
- **Datenschutz**: Anonyme Statistiken, keine persönlichen Daten
- **Admin-Panel**: Übersicht der Quiz-Ergebnisse mit Export-Funktion
- **Backend-Validierung**: Sichere Antwortprüfung auf dem Server

## 🚀 Schnelleinstieg

```bash
npm install
npm start              # Production: http://localhost:3000
# oder
npm run dev           # Development mit Auto-Reload
```

## 📚 Dokumentation

- **[claude.md](./claude.md)** - Technische Referenz (Architektur, API, Debugging)
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Produktives Hosting (lokal, VPS, Cloud)

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
      "options": ["Antwort A", "Antwort B", "Antwort C", "Antwort D"],
      "correctAnswer": 0
    }
  ]
}
```

## 🎮 Verwendung

1. **Quiz starten** – Besucher öffnet die App
2. **Quiz spielen** – 13 Fragen mit sofortigem Feedback
3. **Ergebnis anzeigen** – Score und personalisierte Auswertung
4. **Admin-Panel** – `http://localhost:3000/admin.html` für Statistiken

## 🏆 Ergebnismeldungen nach Score

| Score | Icon | Nachricht |
|-------|------|-----------|
| **90% oder mehr** | 🏆 | *Du bist ein echter Champion!* Willst du nicht in zwei Jahren bei den Wahlen zum Personalrat kandidieren? |
| **70–89%** | 💪 | *Starke Leistung! 💪* Du hast ein solides Fundament und bist für den Büroalltag bestens gewappnet. |
| **50–69%** | 📈 | *Nicht schlecht, aber da geht noch was! 📈* Schau dir die Erklärungen an, dann bist du beim nächsten Mal unschlagbar. |
| **Unter 50%** | 📚 | *Informationsbedarf mit Hunger-Faktor 📚* Lass uns mal gemeinsam zum Essen gehen. |

Jede Nachricht wird mit dem Quiz-Score (z.B. "8/10") und der Prozentangabe angezeigt. Bei 90%+ gibt es zusätzlich eine Konfetti-Animation! 🎉

## 🆘 Troubleshooting

| Problem | Lösung |
|---------|--------|
| Port bereits belegt | `PORT=3001 npm start` |
| Datenbank-Fehler | `rm leads.db && npm start` |
| Dependencies-Fehler | `rm -rf node_modules package-lock.json && npm install` |

---

**MIT License** • Optimiert für Performance und Touch-Bedienung
