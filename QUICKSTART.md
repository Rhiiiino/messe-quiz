# ⚡ Schnellstart: Quiz öffentlich hosten

## 🎯 Empfohlene Option für Ihre Messe

Für schnelles Setup (< 30 Minuten) empfehle ich **Railway.app**.

---

## Option 1: Railway.app (Empfohlen - Am schnellsten)

### Schritt 1: Railway Account erstellen
Gehen Sie zu https://railway.app und registrieren Sie sich (GitHub-Login möglich).

### Schritt 2: Projekt vorbereiten

```bash
cd /Users/reneanderlohr/messe-quiz

# .env Datei erstellen
cp .env.example .env
nano .env
```

Ändern Sie in `.env`:
```env
NODE_ENV=production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=IhrSicheresPasswort123!
SESSION_SECRET=$(openssl rand -base64 32)
```

### Schritt 3: Git Repository erstellen (falls noch nicht vorhanden)

```bash
git init
git add .
git commit -m "Initial commit"
```

### Schritt 4: Railway CLI installieren und deployen

```bash
# Railway CLI installieren
npm install -g @railway/cli

# Einloggen
railway login

# Projekt initialisieren
railway init

# Environment Variables setzen (aus .env Datei)
railway variables set NODE_ENV=production
railway variables set ADMIN_USERNAME=admin
railway variables set ADMIN_PASSWORD=IhrSicheresPasswort123!
railway variables set SESSION_SECRET=$(openssl rand -base64 32)

# Deployen
railway up
```

### Schritt 5: URL abrufen

```bash
railway domain
```

Oder in der Web-UI: https://railway.app/dashboard
→ Ihr Projekt → Settings → Domains

**Ihre Quiz-URL:** `https://ihre-app.up.railway.app`

### Kosten:
- **Free Trial:** $5 Guthaben (reicht für ca. 1 Monat bei niedriger Last)
- **Danach:** ~$5-10/Monat

✅ **Fertig!** Ihre Quiz-App ist jetzt öffentlich erreichbar.

---

## Option 2: Hetzner Cloud (Professionell, DSGVO-konform)

### Schritt 1: Server mieten

1. Gehen Sie zu https://www.hetzner.com/cloud
2. Erstellen Sie einen Account
3. Wählen Sie: **CX11** (2GB RAM, 20GB SSD) - 4,51€/Monat
4. Betriebssystem: **Ubuntu 22.04**
5. SSH-Key hinzufügen (oder Password-Login)

### Schritt 2: Mit Server verbinden

```bash
ssh root@ihre-server-ip
```

### Schritt 3: Server einrichten (Copy & Paste)

```bash
# System aktualisieren
apt update && apt upgrade -y

# Node.js installieren
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs nginx

# PM2 installieren
npm install -g pm2

# Firewall konfigurieren
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable

# App-User erstellen
adduser quizapp
usermod -aG sudo quizapp
```

### Schritt 4: App hochladen

**Vom lokalen Rechner:**
```bash
# Code zum Server kopieren
scp -r /Users/reneanderlohr/messe-quiz quizapp@ihre-server-ip:/home/quizapp/

# Oder mit Git:
# ssh quizapp@ihre-server-ip
# git clone https://github.com/ihr-repo/messe-quiz.git
```

**Auf dem Server:**
```bash
su - quizapp
cd messe-quiz

# Dependencies installieren
npm install

# .env Datei erstellen
cp .env.example .env
nano .env
```

Ändern Sie:
```env
NODE_ENV=production
PORT=3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=IhrSicheresPasswort123!
SESSION_SECRET=$(openssl rand -base64 32)
```

```bash
# App mit PM2 starten
pm2 start server-production.js --name hpvg-quiz
pm2 startup
pm2 save
```

### Schritt 5: Nginx konfigurieren

```bash
sudo nano /etc/nginx/sites-available/quiz
```

Einfügen:
```nginx
server {
    listen 80;
    server_name ihre-server-ip;  # Oder Ihre Domain

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/quiz /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Schritt 6: SSL-Zertifikat (optional, aber empfohlen)

Benötigt eine Domain (z.B. quiz.ihre-domain.de):

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d quiz.ihre-domain.de
```

✅ **Fertig!** Quiz erreichbar unter: `http://ihre-server-ip` oder `https://quiz.ihre-domain.de`

### Kosten:
- **Server:** 4,51€/Monat
- **Domain (optional):** ~12€/Jahr
- **SSL:** Kostenlos (Let's Encrypt)

---

## Option 3: Docker (für fortgeschrittene User)

### Mit Docker Compose (lokal testen):

```bash
cd /Users/reneanderlohr/messe-quiz

# .env Datei erstellen
cp .env.example .env
nano .env  # Passwörter ändern

# Docker Container starten
docker-compose up -d

# Logs anschauen
docker-compose logs -f
```

**Quiz erreichbar:** http://localhost:3000

### Docker Image bauen und deployen:

```bash
# Image bauen
docker build -t hpvg-quiz .

# Zu Docker Hub pushen (optional)
docker tag hpvg-quiz ihr-username/hpvg-quiz:latest
docker push ihr-username/hpvg-quiz:latest

# Auf Server ausführen
docker run -d \
  -p 3000:3000 \
  -e ADMIN_PASSWORD=IhrPasswort \
  -e SESSION_SECRET=$(openssl rand -base64 32) \
  -v $(pwd)/leads.db:/app/leads.db \
  --name hpvg-quiz \
  hpvg-quiz
```

---

## 🧪 Nach dem Deployment: Testen

### 1. Quiz öffnen
Öffnen Sie im Browser: `https://ihre-url.com`

### 2. Admin-Panel testen
Öffnen Sie: `https://ihre-url.com/admin.html`
- Username: `admin` (oder Ihr Wert aus .env)
- Password: Ihr Passwort aus .env

### 3. Security-Check
Testen Sie auf: https://securityheaders.com/

### 4. SSL-Check (falls SSL aktiviert)
Testen Sie auf: https://www.ssllabs.com/ssltest/

---

## 📱 QR-Code für Messestand erstellen

1. Gehen Sie zu: https://www.qr-code-generator.com/
2. URL eingeben: `https://ihre-quiz-url.com`
3. QR-Code generieren und herunterladen
4. Ausdrucken und am Messestand aufhängen

**Tipp:** Erstellen Sie einen kurzen Link mit https://bitly.com für einen einfacheren QR-Code.

---

## 🆘 Probleme?

### App läuft nicht
```bash
# Railway:
railway logs

# Hetzner/VPS:
pm2 logs hpvg-quiz
```

### Admin-Panel: 401 Unauthorized
- Prüfen Sie ADMIN_USERNAME und ADMIN_PASSWORD in .env
- Browser-Cache leeren

### Quiz nicht erreichbar
- Firewall-Regeln prüfen: `sudo ufw status`
- Nginx-Status prüfen: `sudo systemctl status nginx`
- PM2-Status prüfen: `pm2 status`

---

## 📞 Support

Bei Fragen zum Deployment:
1. Lesen Sie `DEPLOYMENT.md` für Details
2. Prüfen Sie die Logs (siehe oben)
3. Öffnen Sie ein GitHub Issue (wenn Repository vorhanden)

---

## ✅ Checkliste vor der Messe

- [ ] App ist öffentlich erreichbar
- [ ] HTTPS/SSL aktiviert (empfohlen)
- [ ] Admin-Panel funktioniert
- [ ] QR-Code erstellt und gedruckt
- [ ] Quiz vollständig getestet
- [ ] Backup-Plan (falls Internet ausfällt)
- [ ] Monitoring aktiviert (z.B. UptimeRobot)

**Empfehlung:** Testen Sie die App 1-2 Tage vor der Messe gründlich!
