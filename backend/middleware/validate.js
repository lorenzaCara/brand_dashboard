/**
 * middleware/validate.js
 * ----------------------
 * Middleware generico che valida req.body con uno schema Zod.
 * Se la validazione fallisce, risponde con 400 e i dettagli degli errori.
 * Se passa, chiama next() e la route riceve i dati già validati in req.body.
 *
 * Uso nelle route:
 *   const validate = require("../middleware/validate");
 *   const { prodottoSchema } = require("../validation/schemas");
 *
 *   router.post("/", validate(prodottoSchema), async (req, res) => { ... });
 */

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const campi = result.error.errors.map((e) => ({
        campo:  e.path.join(".") || "generale",
        errore: e.message,
      }));
      return res.status(400).json({
        error: "Dati non validi.",
        campi,
      });
    }

    req.body = result.data;
    next();
  };
}

module.exports = validate;