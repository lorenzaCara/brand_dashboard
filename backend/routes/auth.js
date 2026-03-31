/**
 * routes/auth.js
 * --------------
 * POST /api/auth/register         → crea nuovo utente
 * POST /api/auth/login            → login, restituisce JWT
 * GET  /api/auth/me               → verifica token, dati utente
 * POST /api/auth/logout           → logout
 * PUT  /api/auth/cambio-password  → cambia password (richiede token)
 */

const express  = require("express");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const router   = express.Router();
const prisma   = require("../database");
const auth     = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  loginSchema,
  registerSchema,
  cambioPasswordSchema,
} = require("../validation/schemas");

// ── POST /api/auth/register ──────────────────────────────────────────────────
router.post("/register", validate(registerSchema), async (req, res) => {
  const { email, password, nome } = req.body;

  try {
    // Controlla se l'email esiste già
    const esistente = await prisma.utente.findUnique({ where: { email } });
    if (esistente) {
      return res.status(400).json({ error: "Email già registrata." });
    }

    // Hash della password — bcrypt aggiunge automaticamente il salt
    const password_hash = await bcrypt.hash(password, 12);

    const utente = await prisma.utente.create({
      data: { email, password_hash, nome: nome || null },
    });

    res.status(201).json({
      message: "Registrazione completata. Ora puoi accedere.",
      user: { id: utente.id, email: utente.email, nome: utente.nome },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/auth/login ─────────────────────────────────────────────────────
router.post("/login", validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  try {
    const utente = await prisma.utente.findUnique({ where: { email } });

    // Messaggio generico — non rivela se l'email esiste
    if (!utente || !utente.attivo) {
      return res.status(401).json({ error: "Credenziali non valide." });
    }

    const passwordOk = await bcrypt.compare(password, utente.password_hash);
    if (!passwordOk) {
      return res.status(401).json({ error: "Credenziali non valide." });
    }

    // Aggiorna ultimo accesso
    await prisma.utente.update({
      where: { id: utente.id },
      data:  { ultimo_accesso: new Date() },
    });

    const token = jwt.sign(
      { id: utente.id, email: utente.email, ruolo: utente.ruolo },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
    );

    res.json({
      token,
      user: {
        id:    utente.id,
        email: utente.email,
        nome:  utente.nome,
        ruolo: utente.ruolo,
      },
      message: "Login effettuato con successo.",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get("/me", auth, async (req, res) => {
  try {
    const utente = await prisma.utente.findUnique({
      where:  { id: req.user.id },
      select: { id: true, email: true, nome: true, ruolo: true, ultimo_accesso: true },
    });
    if (!utente) return res.status(404).json({ error: "Utente non trovato." });
    res.json({ user: utente });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/auth/logout ────────────────────────────────────────────────────
router.post("/logout", auth, (req, res) => {
  res.json({ message: "Logout effettuato." });
});

// ── PUT /api/auth/cambio-password ────────────────────────────────────────────
router.put("/cambio-password", auth, validate(cambioPasswordSchema), async (req, res) => {
  const { password_attuale, nuova_password } = req.body;

  try {
    const utente = await prisma.utente.findUnique({ where: { id: req.user.id } });
    if (!utente) return res.status(404).json({ error: "Utente non trovato." });

    // Verifica password attuale
    const ok = await bcrypt.compare(password_attuale, utente.password_hash);
    if (!ok) {
      return res.status(400).json({ error: "Password attuale non corretta." });
    }

    const nuovoHash = await bcrypt.hash(nuova_password, 12);
    await prisma.utente.update({
      where: { id: utente.id },
      data:  { password_hash: nuovoHash },
    });

    res.json({ message: "Password aggiornata con successo." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
