/**
 * routes/prodotti.js
 * ------------------
 * GET    /api/prodotti        → lista tutti i prodotti
 * POST   /api/prodotti        → aggiunge un nuovo prodotto
 * PUT    /api/prodotti/:id    → modifica un prodotto
 * DELETE /api/prodotti/:id    → elimina un prodotto
 */

const express  = require("express");
const router   = express.Router();
const prisma   = require("../database");
const validate = require("../middleware/validate");
const { prodottoSchema } = require("../validation/schemas");

// ── GET /api/prodotti ────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const prodotti = await prisma.prodotto.findMany({
      orderBy: [{ categoria: "asc" }, { nome: "asc" }],
    });
    res.json(prodotti);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/prodotti ───────────────────────────────────────────────────────
router.post("/", validate(prodottoSchema), async (req, res) => {
  const { codice, nome, categoria, prezzo_costo, prezzo_vendita } = req.body;
  try {
    const prodotto = await prisma.$transaction(async (tx) => {
      const created = await tx.prodotto.create({
        data: {
          codice:         codice || null,
          nome:           nome   || null,
          categoria,
          prezzo_costo,
          prezzo_vendita,
        },
      });
      await tx.magazzino.create({
        data: { prodotto_id: created.id, quantita: 0, soglia_alert: 10 },
      });
      return created;
    });
    res.status(201).json({ id: prodotto.id, message: "Prodotto aggiunto." });
  } catch (err) {
    if (err.code === "P2002") {
      res.status(400).json({ error: "Codice prodotto già esistente." });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// ── PUT /api/prodotti/:id ────────────────────────────────────────────────────
router.put("/:id", validate(prodottoSchema), async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID non valido." });

  const { codice, nome, categoria, prezzo_costo, prezzo_vendita } = req.body;
  try {
    await prisma.prodotto.update({
      where: { id },
      data: {
        codice:         codice || null,
        nome:           nome   || null,
        categoria,
        prezzo_costo,
        prezzo_vendita,
      },
    });
    res.json({ message: "Prodotto aggiornato." });
  } catch (err) {
    if (err.code === "P2002") {
      res.status(400).json({ error: "Codice prodotto già esistente." });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// ── DELETE /api/prodotti/:id ─────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID non valido." });
  try {
    await prisma.prodotto.delete({ where: { id } });
    res.json({ message: "Prodotto eliminato." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
