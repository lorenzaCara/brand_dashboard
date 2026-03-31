/**
 * middleware/auth.js
 * ------------------
 * Middleware che verifica il token JWT su ogni richiesta protetta.
 *
 * Come funziona:
 * 1. Il frontend fa login → riceve un token JWT
 * 2. Il frontend salva il token e lo invia in ogni richiesta nell'header:
 *    Authorization: Bearer <token>
 * 3. Questo middleware legge l'header, verifica il token e lascia passare
 *    la richiesta solo se il token è valido
 */

const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  // Legge l'header Authorization
  const authHeader = req.headers["authorization"];

  // Il formato atteso è: "Bearer <token>"
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Accesso negato. Token mancante." });
  }

  try {
    // Verifica il token con la chiave segreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Aggiunge i dati dell'utente alla richiesta
    // così le route possono sapere chi ha fatto la richiesta
    req.user = decoded;

    next(); // tutto ok, passa alla route
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token scaduto. Effettua di nuovo il login." });
    }
    return res.status(403).json({ error: "Token non valido." });
  }
}

module.exports = authMiddleware;