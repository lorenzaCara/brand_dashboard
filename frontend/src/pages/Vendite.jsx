/**
 * pages/Vendite.jsx
 * -----------------
 * Storico vendite con modifica (canale, data, note) ed eliminazione inline.
 */

import { useEffect, useState, useCallback } from "react";
import { venditeAPI } from "../api/client";
import InlineEdit from "../components/InlineEdit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

const GRAY_RAMP = ["#111", "#333", "#555", "#777", "#999", "#bbb"];
const CANALI    = ["Diretto", "Instagram", "Sito Web", "Marketplace", "Wholesale", "Altro"];

export default function Vendite() {
  const [vendite, setVendite] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    venditeAPI.getAll()
      .then((res) => setVendite(res.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <p className="text-sm text-muted-foreground">Caricamento...</p>;

  const totRicavo  = vendite.reduce((s, v) => s + v.ricavo,  0);
  const totMargine = vendite.reduce((s, v) => s + v.margine, 0);
  const totPezzi   = vendite.reduce((s, v) => s + v.quantita, 0);

  const perCanale = Object.entries(
    vendite.reduce((acc, v) => {
      acc[v.canale] = (acc[v.canale] || 0) + v.ricavo;
      return acc;
    }, {})
  ).map(([canale, ricavo]) => ({ canale, ricavo }));

  const perCategoria = Object.entries(
    vendite.reduce((acc, v) => {
      acc[v.categoria] = acc[v.categoria] || { ricavo: 0, margine: 0 };
      acc[v.categoria].ricavo  += v.ricavo;
      acc[v.categoria].margine += v.margine;
      return acc;
    }, {})
  ).map(([categoria, vals]) => ({ categoria, ...vals }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-sm font-semibold tracking-widest uppercase">Vendite</h1>
        <p className="text-xs text-muted-foreground mt-1">Storico ordini e ricavi</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Ricavo totale</p>
          <p className="text-2xl font-medium">€ {totRicavo.toLocaleString("it-IT", { maximumFractionDigits: 0 })}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Margine totale</p>
          <p className="text-2xl font-medium">€ {totMargine.toLocaleString("it-IT", { maximumFractionDigits: 0 })}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Pezzi venduti</p>
          <p className="text-2xl font-medium">{totPezzi.toLocaleString("it-IT")}</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Ricavo per canale</CardTitle>
          </CardHeader>
          <CardContent>
            {perCanale.length === 0
              ? <p className="text-xs text-muted-foreground py-8 text-center">Nessun dato</p>
              : <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={perCanale} dataKey="ricavo" nameKey="canale" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                      {perCanale.map((_, i) => <Cell key={i} fill={GRAY_RAMP[i % GRAY_RAMP.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => `€ ${v.toFixed(2)}`} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
            }
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Margine per categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {perCategoria.length === 0
              ? <p className="text-xs text-muted-foreground py-8 text-center">Nessun dato</p>
              : <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={perCategoria}>
                    <XAxis dataKey="categoria" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `€${v}`} />
                    <Tooltip formatter={(v) => `€ ${v.toFixed(2)}`} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="ricavo"  fill="#111" radius={[3,3,0,0]} name="Ricavo" />
                    <Bar dataKey="margine" fill="#888" radius={[3,3,0,0]} name="Margine" />
                  </BarChart>
                </ResponsiveContainer>
            }
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Storico vendite</CardTitle>
        </CardHeader>
        <CardContent>
          {vendite.length === 0
            ? <p className="text-xs text-muted-foreground py-4 text-center">Nessuna vendita registrata.</p>
            : <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Data</TableHead>
                    <TableHead className="text-xs">Codice</TableHead>
                    <TableHead className="text-xs">Prodotto</TableHead>
                    <TableHead className="text-xs">Categoria</TableHead>
                    <TableHead className="text-xs text-right">Qtà</TableHead>
                    <TableHead className="text-xs">Canale</TableHead>
                    <TableHead className="text-xs text-right">Ricavo</TableHead>
                    <TableHead className="text-xs text-right">Margine</TableHead>
                    <TableHead className="text-xs">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendite.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="text-xs text-muted-foreground">{v.data}</TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">{v.codice || "—"}</TableCell>
                      <TableCell className="text-sm font-medium">{v.nome || "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{v.categoria}</TableCell>
                      <TableCell className="text-sm text-right">{v.quantita}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{v.canale}</Badge></TableCell>
                      <TableCell className="text-sm text-right font-medium">€ {v.ricavo?.toFixed(2)}</TableCell>
                      <TableCell className={`text-sm text-right font-medium ${v.margine > 0 ? "text-green-700" : ""}`}>
                        € {v.margine?.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <InlineEdit
                          fields={[
                            { key: "data",   label: "Data",   type: "date" },
                            { key: "canale", label: "Canale", type: "select", options: CANALI },
                            { key: "note",   label: "Note",   type: "text" },
                          ]}
                          values={{ data: v.data, canale: v.canale, note: v.note || "" }}
                          onSave={(vals) => venditeAPI.update(v.id, vals)}
                          onDelete={() => venditeAPI.delete(v.id)}
                          onRefresh={load}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          }
        </CardContent>
      </Card>
    </div>
  );
}
