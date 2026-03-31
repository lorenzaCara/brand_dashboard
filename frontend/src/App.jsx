/**
 * App.jsx
 * -------
 * Definisce il routing dell'applicazione.
 * - /login, /register  → pagine pubbliche
 * - /*                 → pagine protette (richiedono login)
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider }    from "./context/AuthContext";
import ProtectedRoute      from "./components/ProtectedRoute";
import Layout              from "./components/Layout";
import Login               from "./pages/Login";
import Register            from "./pages/Register";
import Overview            from "./pages/Overview";
import Magazzino           from "./pages/Magazzino";
import Produzione          from "./pages/Produzione";
import Vendite             from "./pages/Vendite";
import InserisciDati       from "./pages/InserisciDati";
import CambioPassword      from "./pages/CambioPassword";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* ── Pagine pubbliche ────────────────────────────────────── */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── Pagine protette ─────────────────────────────────────── */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index                  element={<Overview />} />
            <Route path="magazzino"       element={<Magazzino />} />
            <Route path="produzione"      element={<Produzione />} />
            <Route path="vendite"         element={<Vendite />} />
            <Route path="inserisci"       element={<InserisciDati />} />
            <Route path="cambio-password" element={<CambioPassword />} />
          </Route>

          {/* ── Fallback ─────────────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
