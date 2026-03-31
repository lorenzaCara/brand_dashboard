/**
 * server.js
 * ---------
 * Punto di avvio del backend.
 * Esegui con:   npm run dev
 * Il server sarà disponibile su: http://localhost:3001
 */

const express = require("express");
const cors    = require("cors");
require("dotenv").config();

// ── Importa middleware e route ───────────────────────────────────────────────
const auth            = require("./middleware/auth");
const authRoute       = require("./routes/auth");
const prodottiRoute   = require("./routes/prodotti");
const magazzinoRoute  = require("./routes/magazzino");
const produzioneRoute = require("./routes/produzione");
const venditeRoute    = require("./routes/vendite");

// ── Crea l'app Express ───────────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware globali ───────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Route PUBBLICA — login (non richiede token) ──────────────────────────────
app.use("/api/auth", authRoute);

// ── Route di test pubblica ───────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend attivo ✅" });
});

// ── Route PROTETTE — richiedono token JWT valido ─────────────────────────────
// Il middleware "auth" viene applicato a tutte le route qui sotto.
// Se il token manca o non è valido, restituisce 401 prima ancora
// di arrivare alla route specifica.
app.use("/api/prodotti",   auth, prodottiRoute);
app.use("/api/magazzino",  auth, magazzinoRoute);
app.use("/api/produzione", auth, produzioneRoute);
app.use("/api/vendite",    auth, venditeRoute);

// ── Avvio ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log("=".repeat(45));
  console.log(`  BRAND DASHBOARD — backend attivo`);
  console.log(`  http://localhost:${PORT}/api/health`);
  console.log("=".repeat(45));
});

