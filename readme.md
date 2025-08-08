
# 🧠 Writeora WebApp – KI-gestützte Chatplattform

**Writeora WebApp** ist eine passwortgeschützte, personalisierte KI-Chatoberfläche – ähnlich wie ChatGPT, aber lokal steuerbar und vollständig erweiterbar durch sogenannte **Addons**. Ziel ist maximale Kontrolle über Funktionen, Darstellung und KI-Verhalten.

---

## ✅ Aktueller Stand

- 🔒 **Login-System** (ein Admin-Passwort, lokal oder aus `.env`)
- 💬 **Chatoberfläche mit Streaming-Funktion**
- 🧠 **Fester Chat-Agent (anpassbar)** – ohne moralische Filter
- ⚙️ **Agent-Wechsel-System** mit Lade-Animation (ROM-in-PC-Popup)
- 🧩 **Addonsystem mit JSON-basierten Modulen**
  - z. B. Text2Image, Image2Image, ZIP-Handling, Codeanalyse
- 🧾 **Gesichtserkennung & Speicherung** (optional bei Bildverarbeitung)
- 📥 **Datei-Download & -Anzeige direkt im Chatverlauf**
- 📺 **Eigener Media-Viewer für Bilder, Videos & Codeblöcke**

---

## 🔜 Geplante Erweiterungen

- 🧰 **Addon-Magazin** (separate App oder Integration)
  - Vorinstallierte Addons durchsuchen & aktivieren
  - Addon-Definitionen erstellen & direkt in WebApp laden
- 🧠 **KI erkennt fehlendes Addon automatisch**
  - schlägt passenden Download vor & erstellt das Modul selbstständig
- ⚙️ **Detaillierte Einstellungsseite** (Verhalten, Sprache, Ausdruck)
- 🔍 **Intelligente Vorschau & Prompt-Masken**
  - automatisch angepasst je nach Addon
- 💾 **Lokale Speicherung aller Aktionen & Dateien**
  - inkl. JSON-Verläufen, Medien, generierten Codes

---

## 📁 Struktur (Ausschnitt)

```
app/
├── components/
│   ├── ChatInterface.tsx
│   ├── MediaViewer.tsx
│   ├── AgentSettings.tsx
│   └── AgentLoaderPopup.tsx
├── lib/
│   └── agentSelector.ts
├── settings/
│   ├── available_agents.json
│   └── selected_agent.json
├── api/...
├── page.tsx
```

---

## 🛠️ Setup

1. `.env.local` Datei mit folgendem Inhalt erstellen:

```bash
ADMIN_PASSWORD=dein_passwort
```

2. Projekt starten:

```bash
npm install
npm run dev
```

---

## 🔐 Zugriff

Die App ist **nur für den privaten, passwortgeschützten Einsatz** gedacht. Freunde können optional per Gastpasswort zugreifen.

---

## 👤 Autor

**Andi (cylezzzz)**  
🌐 [writeora.de](https://writeora.de)  
🔒 Local-first. Modular. KI auf deine Art.
