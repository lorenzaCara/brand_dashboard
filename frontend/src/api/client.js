/**
 * api/client.js
 * -------------
 * Istanza axios configurata con:
 * - Base URL del backend
 * - Interceptor che aggiunge automaticamente il token JWT ad ogni richiesta
 * - Interceptor che gestisce il 401 (token scaduto → redirect al login)
 */

import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:3001/api",
  headers: { "Content-Type": "application/json" },
});

// Interceptor REQUEST
// Prima di ogni richiesta, aggiunge il token JWT nell'header Authorization
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor RESPONSE
// Se il backend risponde con 401 (token scaduto o mancante),
// cancella il token e reindirizza al login
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Funzioni API

export const authAPI = {
  login:           (data) => client.post("/auth/login", data),
  register:        (data) => client.post("/auth/register", data),
  me:              ()     => client.get("/auth/me"),
  logout:          ()     => client.post("/auth/logout"),
  cambioPassword:  (data) => client.put("/auth/cambio-password", data),
};

export const prodottiAPI = {
  getAll:  ()         => client.get("/prodotti"),
  create:  (data)     => client.post("/prodotti", data),
  update:  (id, data) => client.put(`/prodotti/${id}`, data),
  delete:  (id)       => client.delete(`/prodotti/${id}`),
};

export const magazzinoAPI = {
  getAll:       ()           => client.get("/magazzino"),
  updateSoglia: (id, soglia) => client.put(`/magazzino/${id}/soglia`, { soglia }),
};

export const produzioneAPI = {
  getAll:  ()         => client.get("/produzione"),
  create:  (data)     => client.post("/produzione", data),
  update:  (id, data) => client.put(`/produzione/${id}`, data),
  delete:  (id)       => client.delete(`/produzione/${id}`),
};

export const venditeAPI = {
  getAll:  ()         => client.get("/vendite"),
  create:  (data)     => client.post("/vendite", data),
  update:  (id, data) => client.put(`/vendite/${id}`, data),
  delete:  (id)       => client.delete(`/vendite/${id}`),
};

export default client;
