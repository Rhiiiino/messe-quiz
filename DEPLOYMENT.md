# 🌐 Deployment-Anleitung: Öffentliches Hosting für Messe

## 📋 Übersicht

Diese Anleitung zeigt, wie Sie die Quiz-App sicher auf einem öffentlichen Server hosten.

## 🎯 Hosting-Optionen

### Option 1: VPS (Empfohlen für Messen)
**Anbieter:**
- **Hetzner Cloud** (günstig, EU, DSGVO-konform) - ab 4,51€/Monat
- **DigitalOcean** (einfach, gute Docs) - ab $6/Monat
- **AWS EC2** (professionell, teurer) - ab $8/Monat
- **Contabo** (sehr günstig, Deutschland) - ab 4,99€/Monat

**Vorteile:**
- Volle Kontrolle
- Root-Zugriff
- Eigene Domain möglich
- DSGVO-konform (EU-Server)

### Option 2: Platform-as-a-Service (Schnellste Lösung)
**Anbieter:**
- **Railway.app** (einfach, kostenlos bis $5/Monat)
- **Render.com** (kostenloser Plan verfügbar)
- **Fly.io** (kostenloser Plan)

**Vorteile:**
- Sehr schnelles Setup
- Automatische SSL-Zertifikate
- Git-basiertes Deployment

---

## 🔐 Sicherheits-Checkliste

### ✅ Kritische Maßnahmen (MUSS)

1. **HTTPS/SSL** - Verschlüsselte Verbindung
2. **Admin-Panel Authentifizierung** - Passwortschutz
3. **Rate-Limiting** - Schutz vor Spam/DDoS
4. **Security Headers** - XSS/Clickjacking-Schutz
5. **Environment Variables** - Keine Secrets im Code
6. **Firewall** - Nur notwendige Ports offen

### ⚠️ Empfohlene Maßnahmen

7. **Monitoring** - Uptime-Check
8. **Backup** - Tägliche DB-Sicherung
9. **Logging** - Fehler-Tracking
10. **Updates** - Regelmäßige Sicherheits-Updates

---

## 🛠️ Schritt 1: Sicherheits-Features implementieren

### 1.1 Dependencies installieren

```bash
npm install helmet express-rate-limit dotenv bcrypt
```

### 1.2 Erweiterte server.js mit Sicherheits-Features

Siehe `server-production.js` (wird gleich erstellt)

---

## 🚀 Deployment-Varianten

## Variante A: VPS mit Nginx (Professionell)

### 1. Server vorbereiten (Ubuntu 22.04)

```bash
# Als root einloggen
ssh root@ihre-server-ip

# System aktualisieren
apt update && apt upgrade -y

# Node.js installieren (v18 LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Nginx installieren
apt install -y nginx

# PM2 global installieren
npm install -g pm2

# Firewall konfigurieren
ufw allow 22     # SSH
ufw allow 80     # HTTP
ufw allow 443    # HTTPS
ufw enable
```

### 2. App deployen

```bash
# Benutzer erstellen
adduser quizapp
usermod -aG sudo quizapp

# Als quizapp-User einloggen
su - quizapp

# Code hochladen (Option A: Git)
git clone https://github.com/ihr-username/messe-quiz.git
cd messe-quiz

# ODER (Option B: SCP vom lokalen Rechner)
# scp -r /Users/reneanderlohr/messe-quiz quizapp@server-ip:/home/quizapp/

# Dependencies installieren
npm install --production

# Environment Variables setzen
nano .env
```

**.env Datei:**
```env
NODE_ENV=production
PORT=3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=IhrSicheresPasswort123!
SESSION_SECRET=generieren-sie-einen-langen-zufälligen-string-hier
```

```bash
# App mit PM2 starten
pm2 start server-production.js --name hpvg-quiz
pm2 startup
pm2 save

# PM2 Logs anschauen
pm2 logs
```

### 3. Nginx als Reverse Proxy konfigurieren

```bash
sudo nano /etc/nginx/sites-available/quiz
```

**Nginx-Config:**
```nginx
server {
    listen 80;
    server_name quiz.ihre-domain.de;  # Ihre Domain hier eintragen

    # Redirect HTTP zu HTTPS (wird später aktiviert)
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Rate Limiting (zusätzlich zu Express)
    limit_req_zone $binary_remote_addr zone=quiz_limit:10m rate=10r/s;
    limit_req zone=quiz_limit burst=20 nodelay;
}
```

```bash
# Site aktivieren
sudo ln -s /etc/nginx/sites-available/quiz /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. SSL-Zertifikat installieren (Let's Encrypt)

```bash
# Certbot installieren
sudo apt install -y certbot python3-certbot-nginx

# SSL-Zertifikat erstellen
sudo certbot --nginx -d quiz.ihre-domain.de

# Auto-Renewal testen
sudo certbot renew --dry-run
```

---

## Variante B: Railway.app (Schnellste Lösung)

### 1. Railway.app Setup

```bash
# Railway CLI installieren
npm install -g @railway/cli

# Einloggen
railway login

# Projekt initialisieren
railway init

# Environment Variables setzen
railway variables set NODE_ENV=production
railway variables set ADMIN_USERNAME=admin
railway variables set ADMIN_PASSWORD=IhrSicheresPasswort123!
railway variables set SESSION_SECRET=$(openssl rand -base64 32)

# Deployen
railway up
```

### 2. Domain verbinden (optional)

In der Railway-Web-UI:
1. Settings → Domains
2. Custom Domain hinzufügen
3. DNS-Einträge bei Ihrem Domain-Provider setzen

---

## Variante C: Docker (für Kubernetes/Cloud)

### Dockerfile

Siehe `Dockerfile` (wird gleich erstellt)

```bash
# Lokal bauen und testen
docker build -t hpvg-quiz .
docker run -p 3000:3000 -e ADMIN_PASSWORD=test123 hpvg-quiz

# Zu Docker Hub pushen
docker tag hpvg-quiz ihr-username/hpvg-quiz:latest
docker push ihr-username/hpvg-quiz:latest
```

---

## 🔐 Admin-Panel absichern

Das Admin-Panel wird mit HTTP Basic Auth geschützt:

**Zugriff:** https://quiz.ihre-domain.de/admin.html
- **Username:** Aus .env (ADMIN_USERNAME)
- **Password:** Aus .env (ADMIN_PASSWORD)

---

## 📊 Monitoring & Wartung

### Uptime-Monitoring

**Kostenlose Tools:**
- **UptimeRobot** (uptimerobot.com) - 50 Monitore kostenlos
- **BetterUptime** (betteruptime.com) - Kostenloser Plan
- **Ping-Intervall:** 5 Minuten

### Server-Monitoring (VPS)

```bash
# PM2 Monitoring (kostenlos)
pm2 register

# System-Ressourcen überwachen
pm2 monit

# Logs rotieren (verhindert volle Festplatte)
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Datenbank-Backup

```bash
# Backup-Script erstellen
nano ~/backup-quiz.sh
```

**backup-quiz.sh:**
```bash
#!/bin/bash
BACKUP_DIR="/home/quizapp/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Datenbank sichern
cp /home/quizapp/messe-quiz/leads.db $BACKUP_DIR/leads_$DATE.db

# Alte Backups löschen (älter als 7 Tage)
find $BACKUP_DIR -name "leads_*.db" -mtime +7 -delete

echo "Backup erstellt: leads_$DATE.db"
```

```bash
# Ausführbar machen
chmod +x ~/backup-quiz.sh

# Cronjob einrichten (täglich um 3 Uhr)
crontab -e
```

**Cronjob hinzufügen:**
```
0 3 * * * /home/quizapp/backup-quiz.sh >> /home/quizapp/backup.log 2>&1
```

---

## 🧪 Testing vor Go-Live

### Checkliste:

```bash
# 1. SSL-Zertifikat prüfen
curl -I https://quiz.ihre-domain.de

# 2. Security Headers prüfen
curl -I https://quiz.ihre-domain.de | grep -i "x-frame-options\|x-content-type\|strict-transport"

# 3. Rate Limiting testen
for i in {1..30}; do curl -I https://quiz.ihre-domain.de/api/questions; done

# 4. Admin-Panel Authentifizierung testen
curl -I https://quiz.ihre-domain.de/admin.html

# 5. Quiz durchspielen
# Manuell im Browser testen
```

### Online Security-Checks:

- **SSL Test:** https://www.ssllabs.com/ssltest/
- **Security Headers:** https://securityheaders.com/
- **Performance:** https://pagespeed.web.dev/

---

## 📱 Messe-spezifische Anpassungen

### QR-Code generieren

Für einfachen Zugang auf Tablets/Smartphones:

```bash
# QR-Code-Generator online nutzen:
# https://www.qr-code-generator.com/

# URL: https://quiz.ihre-domain.de
# Ausdrucken und am Messestand aufhängen
```

### Fallback: Lokales Tablet-Setup

Falls Internet-Probleme auf der Messe:

```bash
# Lokaler Hotspot auf dem Tablet/Laptop
# Quiz-App läuft auf lokalem Laptop
# Tablets verbinden sich per WLAN mit Laptop
# URL: http://192.168.x.x:3000
```

---

## 🆘 Troubleshooting

### Server erreichbar?

```bash
# Ping-Test
ping quiz.ihre-domain.de

# Port-Test
telnet quiz.ihre-domain.de 443
```

### App läuft nicht?

```bash
# PM2-Status prüfen
pm2 status

# Logs anschauen
pm2 logs hpvg-quiz --lines 100

# App neu starten
pm2 restart hpvg-quiz

# Nginx-Status prüfen
sudo systemctl status nginx

# Nginx-Fehler-Log
sudo tail -f /var/log/nginx/error.log
```

### Datenbank-Probleme?

```bash
# Datenbank-Größe prüfen
ls -lh ~/messe-quiz/leads.db

# Datenbank-Integrität prüfen
sqlite3 ~/messe-quiz/leads.db "PRAGMA integrity_check;"

# Bei Korruption: Backup wiederherstellen
cp ~/backups/leads_20260127_030000.db ~/messe-quiz/leads.db
pm2 restart hpvg-quiz
```

---

## 💰 Kosten-Übersicht

### Minimale Kosten (Railway.app):
- **Hosting:** $5/Monat
- **Domain:** ~12€/Jahr (optional)
- **Total:** ~6€/Monat

### Professionelles Setup (VPS):
- **Hetzner CX11:** 4,51€/Monat
- **Domain:** ~12€/Jahr
- **SSL:** Kostenlos (Let's Encrypt)
- **Total:** ~6€/Monat

### Nur für Messe (temporär):
- **Railway.app Free Tier:** $0
- **Oder: Lokales Setup mit Hotspot:** $0

---

## 📞 Support-Kontakte

### Hosting-Support:
- **Hetzner:** https://www.hetzner.com/support
- **Railway:** https://railway.app/help
- **DigitalOcean:** https://www.digitalocean.com/support

### Domain-Anbieter (Deutschland):
- **Namecheap:** https://www.namecheap.com
- **IONOS:** https://www.ionos.de
- **Strato:** https://www.strato.de

---

## ✅ Pre-Launch Checkliste

- [ ] Server/Hosting gewählt
- [ ] Domain registriert (optional)
- [ ] SSL-Zertifikat installiert
- [ ] Admin-Panel Passwort gesetzt
- [ ] Rate-Limiting aktiv
- [ ] Security Headers konfiguriert
- [ ] Backup-Strategie eingerichtet
- [ ] Monitoring aktiviert
- [ ] Vollständiger Quiz-Test durchgeführt
- [ ] QR-Code erstellt (für Messe)
- [ ] Fallback-Plan (lokales Setup)
- [ ] Notfall-Kontakte dokumentiert

---

**Empfehlung für Ihre Messe:**

Nutzen Sie **Railway.app** für schnellstes Setup (< 30 Minuten) oder **Hetzner VPS** für professionelles, DSGVO-konformes Hosting (< 2 Stunden Setup).

**Nächster Schritt:** Ich erstelle jetzt die production-ready Server-Datei mit allen Sicherheits-Features.
