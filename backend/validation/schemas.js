/**
 * validation/schemas.js
 * ----------------------
 * Definisce tutti gli schemi di validazione con Zod.
 * Viene importato dalle route per validare i dati in arrivo.
 *
 * Zod funziona così:
 *   1. Definisci uno schema che descrive la forma dei dati attesi
 *   2. Chiami schema.parse(dati) o schema.safeParse(dati)
 *   3. Se i dati non corrispondono, Zod lancia un errore con dettagli precisi
 */

const { z } = require("zod");

// ── AUTH ─────────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z
    .string({ required_error: "Email obbligatoria." })
    .email("Formato email non valido."),
  password: z
    .string({ required_error: "Password obbligatoria." })
    .min(1, "Password obbligatoria."),
});

const registerSchema = z.object({
  email: z
    .string({ required_error: "Email obbligatoria." })
    .email("Formato email non valido."),
  password: z
    .string({ required_error: "Password obbligatoria." })
    .min(8, "La password deve essere di almeno 8 caratteri."),
  nome: z
    .string()
    .max(100, "Il nome non può superare 100 caratteri.")
    .optional(),
});

const cambioPasswordSchema = z
  .object({
    password_attuale: z
      .string({ required_error: "Password attuale obbligatoria." })
      .min(1, "Password attuale obbligatoria."),
    nuova_password: z
      .string({ required_error: "Nuova password obbligatoria." })
      .min(8, "La nuova password deve essere di almeno 8 caratteri."),
    conferma_password: z
      .string({ required_error: "Conferma password obbligatoria." })
      .min(1, "Conferma password obbligatoria."),
  })
  .refine((d) => d.nuova_password === d.conferma_password, {
    message: "Le password non coincidono.",
    path: ["conferma_password"],
  })
  .refine((d) => d.nuova_password !== d.password_attuale, {
    message: "La nuova password deve essere diversa da quella attuale.",
    path: ["nuova_password"],
  });

// ── PRODOTTI ─────────────────────────────────────────────────────────────────
const prodottoSchema = z
  .object({
    codice: z
      .string()
      .max(50, "Il codice non può superare 50 caratteri.")
      .optional()
      .nullable(),
    nome: z
      .string()
      .max(150, "Il nome non può superare 150 caratteri.")
      .optional()
      .nullable(),
    categoria: z
      .string({ required_error: "Categoria obbligatoria." })
      .min(1, "Categoria obbligatoria.")
      .max(100, "La categoria non può superare 100 caratteri."),
    prezzo_costo: z
      .number({ required_error: "Prezzo di costo obbligatorio.",
                invalid_type_error: "Il prezzo di costo deve essere un numero." })
      .min(0, "Il prezzo di costo non può essere negativo."),
    prezzo_vendita: z
      .number({ required_error: "Prezzo di vendita obbligatorio.",
                invalid_type_error: "Il prezzo di vendita deve essere un numero." })
      .min(0, "Il prezzo di vendita non può essere negativo."),
  })
  // Validazione cross-campo: almeno uno tra codice e nome
  .refine((data) => data.codice || data.nome, {
    message: "Inserisci almeno il codice o il nome del prodotto.",
    path: ["codice"],
  })
  // Validazione cross-campo: prezzo vendita > prezzo costo
  .refine((data) => data.prezzo_vendita > data.prezzo_costo, {
    message: "Il prezzo di vendita deve essere maggiore del costo.",
    path: ["prezzo_vendita"],
  });

// ── PRODUZIONE ───────────────────────────────────────────────────────────────
const produzioneSchema = z.object({
  prodotto_id: z
    .number({ required_error: "Seleziona un prodotto.",
              invalid_type_error: "ID prodotto non valido." })
    .int("ID prodotto deve essere un numero intero.")
    .positive("ID prodotto non valido."),
  quantita: z
    .number({ required_error: "Quantità obbligatoria.",
              invalid_type_error: "La quantità deve essere un numero." })
    .int("La quantità deve essere un numero intero.")
    .min(1, "La quantità deve essere almeno 1."),
  data: z
    .string({ required_error: "Data obbligatoria." })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato data non valido. Usa YYYY-MM-DD."),
  note: z
    .string()
    .max(255, "Le note non possono superare 255 caratteri.")
    .optional()
    .nullable(),
});

// ── VENDITE ──────────────────────────────────────────────────────────────────
const CANALI_VALIDI = [
  "Diretto",
  "Instagram",
  "Sito Web",
  "Marketplace",
  "Wholesale",
  "Altro",
];

const venditaSchema = z.object({
  prodotto_id: z
    .number({ required_error: "Seleziona un prodotto.",
              invalid_type_error: "ID prodotto non valido." })
    .int("ID prodotto deve essere un numero intero.")
    .positive("ID prodotto non valido."),
  quantita: z
    .number({ required_error: "Quantità obbligatoria.",
              invalid_type_error: "La quantità deve essere un numero." })
    .int("La quantità deve essere un numero intero.")
    .min(1, "La quantità deve essere almeno 1."),
  data: z
    .string({ required_error: "Data obbligatoria." })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato data non valido. Usa YYYY-MM-DD."),
  canale: z.enum(CANALI_VALIDI, {
    errorMap: () => ({
      message: `Canale non valido. Scegli tra: ${CANALI_VALIDI.join(", ")}.`,
    }),
  }),
  note: z
    .string()
    .max(255, "Le note non possono superare 255 caratteri.")
    .optional()
    .nullable(),
});

// ── SOGLIA ALERT ─────────────────────────────────────────────────────────────
const sogliaSchema = z.object({
  soglia: z
    .number({ required_error: "Soglia obbligatoria.",
              invalid_type_error: "La soglia deve essere un numero." })
    .int("La soglia deve essere un numero intero.")
    .min(0, "La soglia non può essere negativa."),
});

// ── HELPER: estrae messaggi di errore leggibili da ZodError ──────────────────
function formatZodErrors(error) {
  return error.errors.map((e) => ({
    campo:    e.path.join(".") || "generale",
    errore:   e.message,
  }));
}

module.exports = {
  loginSchema,
  registerSchema,
  cambioPasswordSchema,
  prodottoSchema,
  produzioneSchema,
  venditaSchema,
  sogliaSchema,
  formatZodErrors,
};
