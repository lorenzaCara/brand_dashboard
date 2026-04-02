/**
 * routes/vendite.js
 * -----------------
 * GET    /api/vendite      → storico vendite
 * POST   /api/vendite      → registra nuova vendita
 * PUT    /api/vendite/:id  → modifica vendita (canale, data, note)
 * DELETE /api/vendite/:id  → elimina vendita e ripristina magazzino
 */

const express  = require("express");
const router   = express.Router();
const prisma   = require("../database");
const validate = require("../middleware/validate");
const { venditaSchema } = require("../validation/schemas");

// GET /api/vendite
router.get("/", async (req, res) => {
  try {
    const vendite = await prisma.vendita.findMany({
      take: 200,
      orderBy: { data: "desc" },
      include: {
        prodotto: {
          select: { codice: true, nome: true, categoria: true,
                    prezzo_vendita: true, prezzo_costo: true },
        },
      },
    });
    const result = vendite.map((v) => ({
      id:             v.id,
      data:           v.data.toISOString().split("T")[0],
      prodotto_id:    v.prodotto_id,
      codice:         v.prodotto.codice,
      nome:           v.prodotto.nome,
      categoria:      v.prodotto.categoria,
      quantita:       v.quantita,
      canale:         v.canale,
      note:           v.note,
      prezzo_vendita: parseFloat(v.prodotto.prezzo_vendita),
      ricavo:         parseFloat((v.quantita * v.prodotto.prezzo_vendita).toFixed(2)),
      margine:        parseFloat((v.quantita * (v.prodotto.prezzo_vendita - v.prodotto.prezzo_costo)).toFixed(2)),
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vendite
router.post("/", validate(venditaSchema), async (req, res) => {
  const { prodotto_id, quantita, data, canale, note } = req.body;
  try {
    await prisma.$transaction(async (tx) => {
      const stock = await tx.magazzino.findUnique({ where: { prodotto_id } });
      if (!stock || stock.quantita < quantita) {
        throw new Error(`Scorte insufficienti. Disponibili: ${stock?.quantita ?? 0} pz.`);
      }
      await tx.vendita.create({
        data: { prodotto_id, quantita, data: new Date(data), canale, note: note || null },
      });
      await tx.magazzino.update({
        where: { prodotto_id },
        data:  { quantita: { decrement: quantita } },
      });
    });
    res.status(201).json({ message: `Vendita di ${quantita} pz registrata.` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/vendite/:id 
// Modifica canale, data e note. NON modifica la quantità.
router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID non valido." });

  const { data, canale, note } = req.body;
  if (!data)   return res.status(400).json({ error: "Data obbligatoria." });
  if (!canale) return res.status(400).json({ error: "Canale obbligatorio." });

  try {
    await prisma.vendita.update({
      where: { id },
      data:  { data: new Date(data), canale, note: note || null },
    });
    res.json({ message: "Vendita aggiornata." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/vendite/:id
router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID non valido." });
  try {
    await prisma.$transaction(async (tx) => {
      const vendita = await tx.vendita.findUnique({ where: { id } });
      if (!vendita) throw new Error("Vendita non trovata.");

      // Ripristina la quantità in magazzino
      await tx.magazzino.update({
        where: { prodotto_id: vendita.prodotto_id },
        data:  { quantita: { increment: vendita.quantita } },
      });
      await tx.vendita.delete({ where: { id } });
    });
    res.json({ message: "Vendita eliminata e magazzino ripristinato." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
