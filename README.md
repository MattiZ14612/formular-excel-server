# formular-excel-server

Web-Anwendung zum Erfassen neuer Alarmempfänger über ein Browser-Formular.  
Die ausgefüllten Daten werden vom Backend als `.xlsx`-Datei erzeugt und im Ordner `exports/` auf dem Server gespeichert.

---

## Voraussetzungen

- [Node.js](https://nodejs.org/) **v18 oder neuer**
- npm (wird mit Node.js mitinstalliert)

---

## Installation

```bash
# Repository klonen
git clone https://github.com/MattiZ14612/formular-excel-server.git
cd formular-excel-server

# Abhängigkeiten installieren
npm install
```

---

## Starten

### Produktion
```bash
npm start
```

### Entwicklung (mit automatischem Neustart via nodemon)
```bash
npm run dev
```

Der Server läuft dann unter **http://localhost:3000**.

---

## Benutzung

1. Öffne **http://localhost:3000** im Browser.
2. Fülle das Formular aus (Name und E-Mail sind Pflichtfelder).
3. Klicke auf **„Excel-Datei erstellen"**.
4. Die Anwendung bestätigt den Erfolg und bietet einen Download-Link an.

---

## API-Endpunkte

| Methode | Route | Beschreibung |
|---------|-------|--------------|
| `GET`   | `/`   | Liefert das HTML-Formular |
| `POST`  | `/api/submit` | Nimmt die Formulardaten entgegen, erzeugt eine `.xlsx`-Datei und gibt Dateiname + Download-URL zurück |
| `GET`   | `/exports/:filename` | Lädt eine zuvor erzeugte Excel-Datei herunter |

### Beispiel-Request (POST /api/submit)
```json
{
  "name": "Max Mustermann",
  "email": "max@beispiel.de",
  "phone": "+49 123 4567890",
  "comment": "Nachtbereitschaft"
}
```

### Beispiel-Response
```json
{
  "message": "Excel-Datei erfolgreich erstellt.",
  "filename": "2024-01-15T10-30-00-000Z_Max_Mustermann.xlsx",
  "path": "exports/2024-01-15T10-30-00-000Z_Max_Mustermann.xlsx",
  "downloadUrl": "/exports/2024-01-15T10-30-00-000Z_Max_Mustermann.xlsx"
}
```

---

## Gespeicherte Dateien

Alle erzeugten Excel-Dateien werden im Ordner **`exports/`** gespeichert.  
Der Dateiname setzt sich aus einem ISO-Zeitstempel und dem bereinigten Namen zusammen, z. B.:

```
exports/2024-01-15T10-30-00-000Z_Max_Mustermann.xlsx
```

Die `.xlsx`-Dateien sind in `.gitignore` eingetragen und werden **nicht** ins Repository übertragen.

---

## Projektstruktur

```
formular-excel-server/
├── exports/          # Gespeicherte Excel-Dateien (nicht in Git)
│   └── .gitkeep
├── public/           # Statische Frontend-Dateien
│   ├── index.html
│   ├── app.js
│   └── styles.css
├── server.js         # Express-Backend
├── package.json
└── .gitignore
```
