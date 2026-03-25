'use strict';

const express = require('express');
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;
const EXPORTS_DIR = path.join(__dirname, 'exports');

// Ensure exports directory exists
if (!fs.existsSync(EXPORTS_DIR)) {
  fs.mkdirSync(EXPORTS_DIR, { recursive: true });
}

// Rate limiters
const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.' },
});

const downloadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.' },
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Sanitize a string for use in a filename
function sanitizeForFilename(str) {
  return String(str)
    .replace(/[^a-zA-Z0-9_\-]/g, '_')
    .slice(0, 50);
}

// POST /api/submit – validate input, create Excel, save to exports/
app.post('/api/submit', submitLimiter, async (req, res) => {
  const { name, email, phone, comment } = req.body;

  // Basic validation – name and email are required
  if (!name || !email) {
    return res.status(400).json({ error: 'Name und E-Mail sind Pflichtfelder.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Ungültige E-Mail-Adresse.' });
  }

  try {
    const timestamp = new Date();
    const isoTimestamp = timestamp.toISOString().replace(/[:.]/g, '-');
    const safeName = sanitizeForFilename(name);
    const filename = `${isoTimestamp}_${safeName}.xlsx`;
    const filepath = path.join(EXPORTS_DIR, filename);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'formular-excel-server';
    workbook.created = timestamp;

    const sheet = workbook.addWorksheet('Alarmempfänger');

    sheet.columns = [
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Telefon', key: 'phone', width: 20 },
      { header: 'Kommentar', key: 'comment', width: 40 },
      { header: 'Zeitstempel', key: 'timestamp', width: 25 },
    ];

    // Style header row
    sheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2563EB' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    sheet.addRow({
      name: name.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : '',
      comment: comment ? comment.trim() : '',
      timestamp: timestamp.toLocaleString('de-DE'),
    });

    await workbook.xlsx.writeFile(filepath);

    return res.status(200).json({
      message: 'Excel-Datei erfolgreich erstellt.',
      filename,
      path: `exports/${filename}`,
      downloadUrl: `/exports/${encodeURIComponent(filename)}`,
    });
  } catch (err) {
    console.error('Fehler beim Erstellen der Excel-Datei:', err);
    return res.status(500).json({ error: 'Interner Serverfehler beim Erstellen der Excel-Datei.' });
  }
});

// GET /exports/:filename – download a previously generated file
app.get('/exports/:filename', downloadLimiter, (req, res) => {
  const filename = path.basename(req.params.filename);
  const filepath = path.join(EXPORTS_DIR, filename);

  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: 'Datei nicht gefunden.' });
  }

  res.download(filepath, filename);
});

// Serve index.html for all other routes (SPA fallback)
app.get('*', generalLimiter, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
