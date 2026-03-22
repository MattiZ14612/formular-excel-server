'use strict';

const express = require('express');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'empfaenger.xlsx');

fs.mkdirSync(DATA_DIR, { recursive: true });

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

async function getOrCreateWorkbook() {
  const workbook = new ExcelJS.Workbook();

  if (fs.existsSync(DATA_FILE)) {
    await workbook.xlsx.readFile(DATA_FILE);
  }

  let sheet = workbook.getWorksheet('Empfänger');
  if (!sheet) {
    sheet = workbook.addWorksheet('Empfänger');
    sheet.columns = [
      { header: 'Vorname', key: 'vorname', width: 20 },
      { header: 'Nachname', key: 'nachname', width: 20 },
      { header: 'E-Mail', key: 'email', width: 30 },
      { header: 'Telefonnummer', key: 'telefon', width: 20 },
    ];
    sheet.getRow(1).font = { bold: true };
  }

  return { workbook, sheet };
}

app.post('/submit', async (req, res) => {
  const { vorname, nachname, email, telefon } = req.body;

  if (!vorname || !nachname || !email || !telefon) {
    return res.status(400).json({ success: false, message: 'Alle Felder sind Pflichtfelder.' });
  }

  try {
    const { workbook, sheet } = await getOrCreateWorkbook();
    sheet.addRow({ vorname, nachname, email, telefon });
    await workbook.xlsx.writeFile(DATA_FILE);
    res.json({ success: true, message: 'Eintrag erfolgreich gespeichert.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Fehler beim Speichern der Daten.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
