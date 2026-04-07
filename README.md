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
2. **Quiz spielen** – 10 Fragen mit sofortigem Feedback
3. **Ergebnis anzeigen** – Score und Auswertung
4. **Admin-Panel** – `http://localhost:3000/admin.html` für Statistiken

## 🆘 Troubleshooting

| Problem | Lösung |
|---------|--------|
| Port bereits belegt | `PORT=3001 npm start` |
| Datenbank-Fehler | `rm leads.db && npm start` |
| Dependencies-Fehler | `rm -rf node_modules package-lock.json && npm install` |

---

**MIT License** • Optimiert für Performance und Touch-Bedienung
