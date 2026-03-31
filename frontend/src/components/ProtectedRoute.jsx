/**
 * components/ProtectedRoute.jsx
 * ------------------------------
 * Wrappa le pagine protette.
 * Se l'utente non è loggato, lo reindirizza a /login.
 * Se il token è in fase di verifica, mostra un loader.
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-sm text-muted-foreground">Caricamento...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
