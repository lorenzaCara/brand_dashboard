/**
 * routes/produzione.js
 * --------------------
 * GET    /api/produzione      → storico lotti
 * POST   /api/produzione      → registra nuovo lotto
 * PUT    /api/produzione/:id  → modifica lotto
 * DELETE /api/produzione/:id  → elimina lotto
 */

const express  = require("express");
const router   = express.Router();
const prisma   = require("../database");
const validate = require("../middleware/validate");
const { produzioneSchema } = require("../validation/schemas");

// GET /api/produzione
router.get("/", async (req, res) => {
  try {
    const lotti = await prisma.produzione.findMany({
      take: 200,
      orderBy: { data: "desc" },
      include: {
        prodotto: {
          select: { codice: true, nome: true, categoria: true, prezzo_costo: true },
        },
      },
    });
    const result = lotti.map((l) => ({
      id:          l.id,
      data:        l.data.toISOString().split("T")[0],
      prodotto_id: l.prodotto_id,
      codice:      l.prodotto.codice,
      nome:        l.prodotto.nome,
      categoria:   l.prodotto.categoria,
      quantita:    l.quantita,
      note:        l.note,
      costo_lotto: parseFloat((l.quantita * l.prodotto.prezzo_costo).toFixed(2)),
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/produzione
router.post("/", validate(produzioneSchema), async (req, res) => {
  const { prodotto_id, quantita, data, note } = req.body;
  try {
    await prisma.$transaction(async (tx) => {
      await tx.produzione.create({
        data: { prodotto_id, quantita, data: new Date(data), note: note || null },
      });
      await tx.magazzino.update({
        where: { prodotto_id },
        data:  { quantita: { increment: quantita } },
      });
    });
    res.status(201).json({ message: `Lotto di ${quantita} pz registrato.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/produzione/:id
// Modifica nota e data — NON modifica la quantità per non sballare il magazzino.
// Per correggere la quantità va eliminato e reinserito.
router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID non valido." });

  const { data, note } = req.body;
  if (!data) return res.status(400).json({ error: "Data obbligatoria." });

  try {
    await prisma.produzione.update({
      where: { id },
      data:  { data: new Date(data), note: note || null },
    });
    res.json({ message: "Lotto aggiornato." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/produzione/:id 
router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID non valido." });
  try {
    await prisma.$transaction(async (tx) => {
      const lotto = await tx.produzione.findUnique({ where: { id } });
      if (!lotto) throw new Error("Lotto non trovato.");

      // Scala la quantità dal magazzino
      await tx.magazzino.update({
        where: { prodotto_id: lotto.prodotto_id },
        data:  { quantita: { decrement: lotto.quantita } },
      });
      await tx.produzione.delete({ where: { id } });
    });
    res.json({ message: "Lotto eliminato." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
