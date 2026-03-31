/**
 * database.js
 * -----------
 * Crea e condivide un'unica istanza di PrismaClient.
 * Viene importato da tutte le route.
 *
 * Perché una sola istanza?
 * PrismaClient gestisce internamente un pool di connessioni.
 * Crearne più di una causerebbe sprechi di memoria e connessioni inutili.
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: ["error", "warn"], // mostra nel terminale solo errori e warning
});

module.exports = prisma;
