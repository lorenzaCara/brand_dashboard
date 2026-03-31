/**
 * pages/Login.jsx
 * ---------------
 * Pagina di login con form email + password.
 * Dopo il login reindirizza alla dashboard.
 */

import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Login() {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const location     = useLocation();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  // Messaggio proveniente dalla pagina di registrazione
  const successMsg = location.state?.message || "";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.campi?.[0]?.errore ||
        "Errore di connessione."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-sm px-4">

        <div className="text-center mb-8">
          <p className="text-xs font-semibold tracking-widest uppercase text-foreground">
            Brand Dashboard
          </p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium">Accedi</CardTitle>
            <CardDescription className="text-xs">
              Inserisci le tue credenziali per continuare.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">

              {successMsg && (
                <p className="text-xs text-green-700 bg-green-50 px-3 py-2 rounded-md">
                  {successMsg}
                </p>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">Email</Label>
                <Input
                  id="email" type="email" placeholder="tua@email.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  required autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs">Password</Label>
                <Input
                  id="password" type="password" placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && <p className="text-xs text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Accesso in corso..." : "Accedi"}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Non hai un account?{" "}
                <Link to="/register" className="underline text-foreground">Registrati</Link>
              </p>

            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
