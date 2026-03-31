/**
 * pages/Register.jsx
 * ------------------
 * Pagina di registrazione nuovo utente.
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../api/client";
import { Button } from "@/components/ui/button";
import { Input }  from "@/components/ui/input";
import { Label }  from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

function parseError(err) {
  const data = err.response?.data;
  if (data?.campi?.length) return data.campi.map((c) => c.errore).join(" · ");
  return data?.error || "Errore di connessione.";
}

export default function Register() {
  const navigate = useNavigate();

  const [form,    setForm]    = useState({ email: "", password: "", conferma: "", nome: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password !== form.conferma) {
      setError("Le password non coincidono.");
      return;
    }
    if (form.password.length < 8) {
      setError("La password deve essere di almeno 8 caratteri.");
      return;
    }

    setLoading(true);
    try {
      await authAPI.register({
        email:    form.email,
        password: form.password,
        nome:     form.nome || undefined,
      });
      navigate("/login", { state: { message: "Registrazione completata. Accedi ora." } });
    } catch (err) {
      setError(parseError(err));
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
            <CardTitle className="text-base font-medium">Crea account</CardTitle>
            <CardDescription className="text-xs">
              Inserisci i tuoi dati per registrarti.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="space-y-1.5">
                <Label htmlFor="nome" className="text-xs">Nome (facoltativo)</Label>
                <Input
                  id="nome" name="nome" type="text"
                  placeholder="es. Mario Rossi"
                  value={form.nome} onChange={handleChange}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">Email</Label>
                <Input
                  id="email" name="email" type="email"
                  placeholder="tua@email.com"
                  value={form.email} onChange={handleChange}
                  required autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs">Password</Label>
                <Input
                  id="password" name="password" type="password"
                  placeholder="Minimo 8 caratteri"
                  value={form.password} onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="conferma" className="text-xs">Conferma password</Label>
                <Input
                  id="conferma" name="conferma" type="password"
                  placeholder="Ripeti la password"
                  value={form.conferma} onChange={handleChange}
                  required
                />
              </div>

              {error && <p className="text-xs text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Registrazione..." : "Crea account"}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Hai già un account?{" "}
                <Link to="/login" className="underline text-foreground">Accedi</Link>
              </p>

            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
