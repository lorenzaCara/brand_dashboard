/**
 * pages/CambioPassword.jsx
 * ------------------------
 * Pagina cambio password — accessibile dalla sidebar (utente loggato).
 */

import { useState } from "react";
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

export default function CambioPassword() {
  const [form, setForm] = useState({
    password_attuale:  "",
    nuova_password:    "",
    conferma_password: "",
  });
  const [msg,     setMsg]     = useState({ text: "", ok: false });
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg({ text: "", ok: false });

    if (form.nuova_password !== form.conferma_password) {
      setMsg({ text: "Le password non coincidono.", ok: false });
      return;
    }
    if (form.nuova_password.length < 8) {
      setMsg({ text: "La nuova password deve essere di almeno 8 caratteri.", ok: false });
      return;
    }
    if (form.nuova_password === form.password_attuale) {
      setMsg({ text: "La nuova password deve essere diversa da quella attuale.", ok: false });
      return;
    }

    setLoading(true);
    try {
      await authAPI.cambioPassword({
        password_attuale:  form.password_attuale,
        nuova_password:    form.nuova_password,
        conferma_password: form.conferma_password,
      });
      setMsg({ text: "Password aggiornata con successo.", ok: true });
      setForm({ password_attuale: "", nuova_password: "", conferma_password: "" });
    } catch (err) {
      setMsg({ text: parseError(err), ok: false });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-sm font-semibold tracking-widest uppercase">Cambio password</h1>
        <p className="text-xs text-muted-foreground mt-1">Aggiorna la tua password di accesso</p>
      </div>

      <div className="max-w-md">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium">Nuova password</CardTitle>
            <CardDescription className="text-xs">
              La password deve essere di almeno 8 caratteri.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="space-y-1.5">
                <Label htmlFor="password_attuale" className="text-xs">Password attuale</Label>
                <Input
                  id="password_attuale" name="password_attuale" type="password"
                  placeholder="••••••••"
                  value={form.password_attuale} onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nuova_password" className="text-xs">Nuova password</Label>
                <Input
                  id="nuova_password" name="nuova_password" type="password"
                  placeholder="Minimo 8 caratteri"
                  value={form.nuova_password} onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="conferma_password" className="text-xs">Conferma nuova password</Label>
                <Input
                  id="conferma_password" name="conferma_password" type="password"
                  placeholder="Ripeti la nuova password"
                  value={form.conferma_password} onChange={handleChange}
                  required
                />
              </div>

              {msg.text && (
                <p className={`text-xs ${msg.ok ? "text-green-700" : "text-destructive"}`}>
                  {msg.text}
                </p>
              )}

              <Button type="submit" disabled={loading}>
                {loading ? "Aggiornamento..." : "Aggiorna password"}
              </Button>

            </form>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
