/**
 * pages/Overview.jsx
 * ------------------
 * Dashboard principale con metriche chiave e grafici.
 */

import { useEffect, useState } from "react";
import { venditeAPI, magazzinoAPI, produzioneAPI } from "../api/client";
import MetricCard from "../components/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

export default function Overview() {
  const [vendite,    setVendite]    = useState([]);
  const [magazzino,  setMagazzino]  = useState([]);
  const [produzione, setProduzione] = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      venditeAPI.getAll(),
      magazzinoAPI.getAll(),
      produzioneAPI.getAll(),
    ]).then(([v, m, p]) => {
      setVendite(v.data);
      setMagazzino(m.data);
      setProduzione(p.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-muted-foreground">Caricamento...</p>;

  // Metriche 
  const totRicavo  = vendite.reduce((s, v) => s + v.ricavo,  0);
  const totMargine = vendite.reduce((s, v) => s + v.margine, 0);
  const nAlert     = magazzino.filter((m) => m.in_alert).length;

  const trenta = new Date();
  trenta.setDate(trenta.getDate() - 30);
  const ricavo30 = vendite
    .filter((v) => new Date(v.data) >= trenta)
    .reduce((s, v) => s + v.ricavo, 0);

  // Dati grafico ricavo nel tempo 
  const ricavoPerGiorno = Object.values(
    vendite.reduce((acc, v) => {
      acc[v.data] = acc[v.data] || { data: v.data, ricavo: 0 };
      acc[v.data].ricavo += v.ricavo;
      return acc;
    }, {})
  ).sort((a, b) => a.data.localeCompare(b.data));

  // Dati grafico produzione vs vendite
  const prodPerNome = produzione.reduce((acc, p) => {
    const k = p.nome || p.codice;
    acc[k] = (acc[k] || 0) + p.quantita;
    return acc;
  }, {});
  const vendPerNome = vendite.reduce((acc, v) => {
    const k = v.nome || v.codice;
    acc[k] = (acc[k] || 0) + v.quantita;
    return acc;
  }, {});
  const nomi = [...new Set([...Object.keys(prodPerNome), ...Object.keys(vendPerNome)])];
  const prodVsVend = nomi.map((n) => ({
    nome:      n,
    Prodotti:  prodPerNome[n] || 0,
    Venduti:   vendPerNome[n] || 0,
  }));

  return (
    <div className="space-y-6">

      {/* Titolo */}
      <div>
        <h1 className="text-sm font-semibold tracking-widest uppercase">Overview</h1>
        <p className="text-xs text-muted-foreground mt-1">Riepilogo generale del brand</p>
      </div>

      {/* Metriche */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Ricavo totale"      value={`€ ${totRicavo.toLocaleString("it-IT", { maximumFractionDigits: 0 })}`}  subtitle="storico completo" />
        <MetricCard label="Margine totale"     value={`€ ${totMargine.toLocaleString("it-IT", { maximumFractionDigits: 0 })}`} subtitle="ricavo − costo" />
        <MetricCard label="Ricavo ultimi 30gg" value={`€ ${ricavo30.toLocaleString("it-IT", { maximumFractionDigits: 0 })}`}   subtitle="ultimi 30 giorni" />
        <MetricCard label="Alert scorte"       value={String(nAlert)} subtitle="prodotti sotto soglia" alert={nAlert > 0} />
      </div>

      {/* Grafico ricavo nel tempo */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Ricavo nel tempo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ricavoPerGiorno.length === 0 ? (
            <p className="text-xs text-muted-foreground py-8 text-center">Nessuna vendita registrata</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={ricavoPerGiorno}>
                <XAxis dataKey="data" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `€${v}`} />
                <Tooltip formatter={(v) => [`€ ${v.toFixed(2)}`, "Ricavo"]} />
                <Line type="monotone" dataKey="ricavo" stroke="#111" strokeWidth={1.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Grafico produzione vs vendite */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Produzione vs Vendite
          </CardTitle>
        </CardHeader>
        <CardContent>
          {prodVsVend.length === 0 ? (
            <p className="text-xs text-muted-foreground py-8 text-center">Nessun dato disponibile</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={prodVsVend}>
                <XAxis dataKey="nome" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Prodotti" fill="#111" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Venduti"  fill="#888" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
