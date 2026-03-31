/**
 * pages/Magazzino.jsx
 * -------------------
 * Stock attuale con alert scorte e modifica soglia inline.
 */

import { useEffect, useState, useCallback } from "react";
import { magazzinoAPI } from "../api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input }  from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, Pencil, X } from "lucide-react";

function SogliaEdit({ id, soglia, onRefresh }) {
  const [editing, setEditing] = useState(false);
  const [val,     setVal]     = useState(soglia);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    try {
      await magazzinoAPI.updateSoglia(id, parseInt(val));
      setEditing(false);
      onRefresh();
    } finally {
      setLoading(false);
    }
  }

  if (!editing) return (
    <div className="flex items-center gap-1">
      <span className="text-sm">{soglia}</span>
      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground"
        onClick={() => { setVal(soglia); setEditing(true); }}>
        <Pencil size={11} />
      </Button>
    </div>
  );

  return (
    <div className="flex items-center gap-1">
      <Input type="number" min="0" value={val}
        onChange={(e) => setVal(e.target.value)}
        className="h-7 w-20 text-xs" />
      <Button size="icon" className="h-7 w-7" onClick={save} disabled={loading}>
        <Check size={12} />
      </Button>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(false)}>
        <X size={12} />
      </Button>
    </div>
  );
}

export default function Magazzino() {
  const [magazzino, setMagazzino] = useState([]);
  const [loading,   setLoading]   = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    magazzinoAPI.getAll()
      .then((res) => setMagazzino(res.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <p className="text-sm text-muted-foreground">Caricamento...</p>;

  const alert = magazzino.filter((m) => m.in_alert);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-sm font-semibold tracking-widest uppercase">Magazzino</h1>
        <p className="text-xs text-muted-foreground mt-1">Stock attuale per prodotto</p>
      </div>

      {alert.length > 0 && (
        <Card className="border-destructive/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium uppercase tracking-widest text-destructive flex items-center gap-2">
              Alert scorte basse
              <Badge variant="destructive" className="text-xs">{alert.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alert.map((m) => (
              <div key={m.id} className="flex justify-between items-center py-2 border-l-2 border-destructive pl-3">
                <span className="text-sm font-medium">
                  {m.codice && <span className="text-muted-foreground mr-2">[{m.codice}]</span>}
                  {m.nome || "—"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {m.quantita} pz disponibili (soglia: {m.soglia_alert})
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Stock completo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {magazzino.length === 0
            ? <p className="text-xs text-muted-foreground py-4 text-center">
                Nessun prodotto in magazzino. Aggiungi prodotti dalla sezione "Inserisci dati".
              </p>
            : <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Codice</TableHead>
                    <TableHead className="text-xs">Prodotto</TableHead>
                    <TableHead className="text-xs">Categoria</TableHead>
                    <TableHead className="text-xs text-right">In stock</TableHead>
                    <TableHead className="text-xs">Soglia alert</TableHead>
                    <TableHead className="text-xs">Stato</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {magazzino.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="text-xs text-muted-foreground font-mono">{m.codice || "—"}</TableCell>
                      <TableCell className="text-sm font-medium">{m.nome || "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{m.categoria}</TableCell>
                      <TableCell className="text-sm text-right font-medium">{m.quantita}</TableCell>
                      <TableCell>
                        <SogliaEdit id={m.id} soglia={m.soglia_alert} onRefresh={load} />
                      </TableCell>
                      <TableCell>
                        {m.in_alert
                          ? <Badge variant="destructive" className="text-xs">Scorta bassa</Badge>
                          : <Badge variant="outline" className="text-xs">OK</Badge>
                        }
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
