/**
 * pages/Produzione.jsx
 * --------------------
 * Storico lotti con modifica (data, note) ed eliminazione inline.
 */

import { useEffect, useState, useCallback } from "react";
import { produzioneAPI } from "../api/client";
import InlineEdit from "../components/InlineEdit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Produzione() {
  const [produzione, setProduzione] = useState([]);
  const [loading,    setLoading]    = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    produzioneAPI.getAll()
      .then((res) => setProduzione(res.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <p className="text-sm text-muted-foreground">Caricamento...</p>;

  const perGiorno = Object.values(
    produzione.reduce((acc, p) => {
      acc[p.data] = acc[p.data] || { data: p.data, quantita: 0 };
      acc[p.data].quantita += p.quantita;
      return acc;
    }, {})
  ).sort((a, b) => a.data.localeCompare(b.data));

  const totPezzi = produzione.reduce((s, p) => s + p.quantita, 0);
  const totCosto = produzione.reduce((s, p) => s + p.costo_lotto, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-sm font-semibold tracking-widest uppercase">Produzione</h1>
        <p className="text-xs text-muted-foreground mt-1">Storico lotti prodotti</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card><CardContent className="pt-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Pezzi totali</p>
          <p className="text-2xl font-medium">{totPezzi.toLocaleString("it-IT")}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Costo totale</p>
          <p className="text-2xl font-medium">€ {totCosto.toLocaleString("it-IT", { maximumFractionDigits: 0 })}</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Pezzi prodotti nel tempo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {perGiorno.length === 0
            ? <p className="text-xs text-muted-foreground py-8 text-center">Nessun lotto registrato</p>
            : <ResponsiveContainer width="100%" height={220}>
                <LineChart data={perGiorno}>
                  <XAxis dataKey="data" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="quantita" stroke="#111" strokeWidth={1.5} dot={{ r: 3 }} name="Pezzi" />
                </LineChart>
              </ResponsiveContainer>
          }
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Storico lotti
          </CardTitle>
        </CardHeader>
        <CardContent>
          {produzione.length === 0
            ? <p className="text-xs text-muted-foreground py-4 text-center">Nessun lotto registrato.</p>
            : <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Data</TableHead>
                    <TableHead className="text-xs">Codice</TableHead>
                    <TableHead className="text-xs">Prodotto</TableHead>
                    <TableHead className="text-xs">Categoria</TableHead>
                    <TableHead className="text-xs text-right">Qtà</TableHead>
                    <TableHead className="text-xs text-right">Costo</TableHead>
                    <TableHead className="text-xs">Note</TableHead>
                    <TableHead className="text-xs">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {produzione.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-xs text-muted-foreground">{p.data}</TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">{p.codice || "—"}</TableCell>
                      <TableCell className="text-sm font-medium">{p.nome || "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{p.categoria}</TableCell>
                      <TableCell className="text-sm text-right">{p.quantita}</TableCell>
                      <TableCell className="text-sm text-right">€ {p.costo_lotto?.toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{p.note || "—"}</TableCell>
                      <TableCell>
                        <InlineEdit
                          fields={[
                            { key: "data", label: "Data", type: "date" },
                            { key: "note", label: "Note", type: "text" },
                          ]}
                          values={{ data: p.data, note: p.note || "" }}
                          onSave={(vals) => produzioneAPI.update(p.id, vals)}
                          onDelete={() => produzioneAPI.delete(p.id)}
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
