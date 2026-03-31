/**
 * routes/magazzino.js
 * -------------------
 * GET  /api/magazzino              → stock attuale con alert
 * PUT  /api/magazzino/:id/soglia   → aggiorna soglia alert
 */

const express  = require("express");
const router   = express.Router();
const prisma   = require("../database");
const validate = require("../middleware/validate");
const { sogliaSchema } = require("../validation/schemas");

// ── GET /api/magazzino ───────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const magazzino = await prisma.magazzino.findMany({
      include: {
        prodotto: {
          select: { codice: true, nome: true, categoria: true },
        },
      },
      orderBy: { quantita: "asc" },
    });

    const result = magazzino.map((m) => ({
      id:           m.prodotto_id,
      codice:       m.prodotto.codice,
      nome:         m.prodotto.nome,
      categoria:    m.prodotto.categoria,
      quantita:     m.quantita,
      soglia_alert: m.soglia_alert,
      in_alert:     m.quantita <= m.soglia_alert ? 1 : 0,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/magazzino/:id/soglia ────────────────────────────────────────────
router.put("/:id/soglia", validate(sogliaSchema), async (req, res) => {
  const prodotto_id = parseInt(req.params.id);
  if (isNaN(prodotto_id)) return res.status(400).json({ error: "ID non valido." });

  const { soglia } = req.body;
  try {
    await prisma.magazzino.update({
      where: { prodotto_id },
      data:  { soglia_alert: soglia },
    });
    res.json({ message: "Soglia aggiornata." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
