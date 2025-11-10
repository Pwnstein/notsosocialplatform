const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const ogs = require('open-graph-scraper');
const fs = require('fs');
const path = require('path');

const app = express();
const notesPath = path.join(__dirname, 'notes.json');
app.use(cors());
app.use(bodyParser.json());

if (!fs.existsSync(notesPath)) fs.writeFileSync(notesPath, '[]');

// Serve statische files
app.use('/', express.static(__dirname));

// API endpoint
app.post('/api/addnote', async (req, res) => {
  let { url, owner } = req.body;
  if (!url || !owner) return res.status(400).json({ error: 'url + owner!' });

  let isImage = /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/.test(url);
  let meta = {};
  if (!isImage) {
    try {
      let og = await ogs({ url });
      meta = {
        ogTitle: og.result.ogTitle,
        ogDescription: og.result.ogDescription,
        ogImage: og.result.ogImage?.url
      };
    } catch(e) {}
  }

  let notes = JSON.parse(fs.readFileSync(notesPath));
  notes.push({ url, owner, isImage, meta });
  fs.writeFileSync(notesPath, JSON.stringify(notes, null, 2));
  res.json({ ok: true });
});

// Serve notes.json direct
app.get('/notes.json', (req, res) => {
  res.sendFile(notesPath);
});

const PORT = 8080;
app.listen(PORT, () => console.log('Server draait op poort ' + PORT));
