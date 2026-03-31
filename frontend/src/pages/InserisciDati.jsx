/**
 * pages/InserisciDati.jsx
 * -----------------------
 * Form per inserire prodotti, lotti di produzione e vendite.
 * Include tabella prodotti con modifica ed eliminazione inline.
 */

import { useEffect, useState, useCallback } from "react";
import { prodottiAPI, produzioneAPI, venditeAPI } from "../api/client";
import InlineEdit from "../components/InlineEdit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";

const CATEGORIE = ["Outerwear", "T-shirt", "Knitwear", "Hoodie", "Bottom", "Headwear", "Eyewear", "Bag", "Accessories"];
const CANALI    = ["Website", "Store", "Popup", "Wholesale"];
const TODAY     = new Date().toISOString().split("T")[0];

// Helper: mostra errori Zod o messaggio generico
function parseError(err) {
  const data = err.response?.data;
  if (data?.campi?.length) {
    return data.campi.map((c) => `${c.campo}: ${c.errore}`).join(" · ");
  }
  return data?.error || "Errore sconosciuto.";
}

// Componente riga label + input
function FormField({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

export default function InserisciDati() {
  const [prodotti, setProdotti] = useState([]);

  // Aggiorna la lista prodotti dopo ogni inserimento
  const refreshProdotti = useCallback(() => {
    prodottiAPI.getAll().then((res) => setProdotti(res.data));
  }, []);
  useEffect(() => { refreshProdotti(); }, [refreshProdotti]);

  // ── Form prodotto ─────────────────────────────────────────────────────────
  const [prod, setProd]       = useState({ codice: "", nome: "", categoria: "", prezzo_costo: "", prezzo_vendita: "" });
  const [msgProd, setMsgProd] = useState({ text: "", ok: false });

  async function submitProdotto(e) {
    e.preventDefault();
    setMsgProd({ text: "", ok: false });
    try {
      await prodottiAPI.create({
        codice:         prod.codice         || null,
        nome:           prod.nome           || null,
        categoria:      prod.categoria,
        prezzo_costo:   parseFloat(prod.prezzo_costo),
        prezzo_vendita: parseFloat(prod.prezzo_vendita),
      });
      setMsgProd({ text: "Prodotto aggiunto.", ok: true });
      setProd({ codice: "", nome: "", categoria: "", prezzo_costo: "", prezzo_vendita: "" });
      refreshProdotti();
    } catch (err) {
      setMsgProd({ text: parseError(err), ok: false });
    }
  }

  // ── Form produzione ───────────────────────────────────────────────────────
  const [lotto, setLotto]       = useState({ prodotto_id: "", quantita: "", data: TODAY, note: "" });
  const [msgLotto, setMsgLotto] = useState({ text: "", ok: false });

  async function submitProduzione(e) {
    e.preventDefault();
    setMsgLotto({ text: "", ok: false });
    try {
      await produzioneAPI.create({
        prodotto_id: parseInt(lotto.prodotto_id),
        quantita:    parseInt(lotto.quantita),
        data:        lotto.data,
        note:        lotto.note || null,
      });
      setMsgLotto({ text: `Lotto di ${lotto.quantita} pz registrato.`, ok: true });
      setLotto({ prodotto_id: "", quantita: "", data: TODAY, note: "" });
    } catch (err) {
      setMsgLotto({ text: parseError(err), ok: false });
    }
  }

  // ── Form vendita ──────────────────────────────────────────────────────────
  const [vend, setVend]       = useState({ prodotto_id: "", quantita: "", data: TODAY, canale: "", note: "" });
  const [msgVend, setMsgVend] = useState({ text: "", ok: false });

  async function submitVendita(e) {
    e.preventDefault();
    setMsgVend({ text: "", ok: false });
    try {
      await venditeAPI.create({
        prodotto_id: parseInt(vend.prodotto_id),
        quantita:    parseInt(vend.quantita),
        data:        vend.data,
        canale:      vend.canale,
        note:        vend.note || null,
      });
      setMsgVend({ text: `Vendita di ${vend.quantita} pz registrata.`, ok: true });
      setVend({ prodotto_id: "", quantita: "", data: TODAY, canale: "", note: "" });
    } catch (err) {
      setMsgVend({ text: parseError(err), ok: false });
    }
  }

  // Opzioni dropdown prodotti
  const opzProdotti = prodotti.map((p) => ({
    value: String(p.id),
    label: [p.codice && `[${p.codice}]`, p.nome, `(${p.categoria})`]
      .filter(Boolean).join(" "),
  }));

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-sm font-semibold tracking-widest uppercase">Inserisci dati</h1>
        <p className="text-xs text-muted-foreground mt-1">Aggiungi prodotti, lotti e vendite</p>
      </div>

      {/* ── FORM PRODOTTO ──────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Aggiungi prodotto al catalogo
          </CardTitle>
          <p className="text-xs text-muted-foreground">Inserisci almeno il codice o il nome.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitProdotto} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Codice prodotto">
                <Input placeholder="es. FW25-TSH-001" value={prod.codice}
                  onChange={(e) => setProd({ ...prod, codice: e.target.value })} />
              </FormField>
              <FormField label="Nome prodotto (facoltativo)">
                <Input placeholder="es. Felpa Oversize" value={prod.nome}
                  onChange={(e) => setProd({ ...prod, nome: e.target.value })} />
              </FormField>
              <FormField label="Categoria">
                <Select value={prod.categoria} onValueChange={(v) => setProd({ ...prod, categoria: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleziona..." /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIE.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Prezzo di costo €">
                <Input type="number" step="0.01" min="0" placeholder="es. 18.50"
                  value={prod.prezzo_costo}
                  onChange={(e) => setProd({ ...prod, prezzo_costo: e.target.value })} />
              </FormField>
              <FormField label="Prezzo di vendita €">
                <Input type="number" step="0.01" min="0" placeholder="es. 59.00"
                  value={prod.prezzo_vendita}
                  onChange={(e) => setProd({ ...prod, prezzo_vendita: e.target.value })} />
              </FormField>
            </div>
            <div className="flex items-center gap-4">
              <Button type="submit" size="sm">Aggiungi prodotto</Button>
              {msgProd.text && (
                <span className={`text-xs ${msgProd.ok ? "text-green-700" : "text-destructive"}`}>
                  {msgProd.text}
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ── FORM PRODUZIONE ────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Registra lotto di produzione
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitProduzione} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Prodotto">
                <Select value={lotto.prodotto_id} onValueChange={(v) => setLotto({ ...lotto, prodotto_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleziona prodotto..." /></SelectTrigger>
                  <SelectContent>
                    {opzProdotti.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Quantità prodotta">
                <Input type="number" min="1" placeholder="es. 50"
                  value={lotto.quantita}
                  onChange={(e) => setLotto({ ...lotto, quantita: e.target.value })} />
              </FormField>
              <FormField label="Data">
                <Input type="date" value={lotto.data}
                  onChange={(e) => setLotto({ ...lotto, data: e.target.value })} />
              </FormField>
              <FormField label="Note (facoltativo)">
                <Input placeholder="es. Lotto primavera 2025"
                  value={lotto.note}
                  onChange={(e) => setLotto({ ...lotto, note: e.target.value })} />
              </FormField>
            </div>
            <div className="flex items-center gap-4">
              <Button type="submit" size="sm">Registra produzione</Button>
              {msgLotto.text && (
                <span className={`text-xs ${msgLotto.ok ? "text-green-700" : "text-destructive"}`}>
                  {msgLotto.text}
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ── FORM VENDITA ───────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Registra vendita
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitVendita} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Prodotto">
                <Select value={vend.prodotto_id} onValueChange={(v) => setVend({ ...vend, prodotto_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleziona prodotto..." /></SelectTrigger>
                  <SelectContent>
                    {opzProdotti.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Quantità venduta">
                <Input type="number" min="1" placeholder="es. 3"
                  value={vend.quantita}
                  onChange={(e) => setVend({ ...vend, quantita: e.target.value })} />
              </FormField>
              <FormField label="Canale">
                <Select value={vend.canale} onValueChange={(v) => setVend({ ...vend, canale: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleziona canale..." /></SelectTrigger>
                  <SelectContent>
                    {CANALI.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Data">
                <Input type="date" value={vend.data}
                  onChange={(e) => setVend({ ...vend, data: e.target.value })} />
              </FormField>
              <FormField label="Note (facoltativo)">
                <Input placeholder="es. Ordine #123"
                  value={vend.note}
                  onChange={(e) => setVend({ ...vend, note: e.target.value })} />
              </FormField>
            </div>
            <div className="flex items-center gap-4">
              <Button type="submit" size="sm">Registra vendita</Button>
              {msgVend.text && (
                <span className={`text-xs ${msgVend.ok ? "text-green-700" : "text-destructive"}`}>
                  {msgVend.text}
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ── TABELLA CATALOGO PRODOTTI ──────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Catalogo prodotti
          </CardTitle>
        </CardHeader>
        <CardContent>
          {prodotti.length === 0
            ? <p className="text-xs text-muted-foreground py-4 text-center">Nessun prodotto nel catalogo.</p>
            : <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Codice</TableHead>
                    <TableHead className="text-xs">Nome</TableHead>
                    <TableHead className="text-xs">Categoria</TableHead>
                    <TableHead className="text-xs text-right">Costo</TableHead>
                    <TableHead className="text-xs text-right">Vendita</TableHead>
                    <TableHead className="text-xs text-right">Margine %</TableHead>
                    <TableHead className="text-xs">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prodotti.map((p) => {
                    const margine = p.prezzo_costo > 0
                      ? Math.round(((p.prezzo_vendita - p.prezzo_costo) / p.prezzo_vendita) * 100)
                      : 0;
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="text-xs font-mono text-muted-foreground">{p.codice || "—"}</TableCell>
                        <TableCell className="text-sm font-medium">{p.nome || "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{p.categoria}</TableCell>
                        <TableCell className="text-sm text-right">€ {parseFloat(p.prezzo_costo).toFixed(2)}</TableCell>
                        <TableCell className="text-sm text-right">€ {parseFloat(p.prezzo_vendita).toFixed(2)}</TableCell>
                        <TableCell className="text-sm text-right text-muted-foreground">{margine}%</TableCell>
                        <TableCell>
                          <InlineEdit
                            fields={[
                              { key: "codice",          label: "Codice",    type: "text" },
                              { key: "nome",            label: "Nome",      type: "text" },
                              { key: "categoria",       label: "Categoria", type: "select", options: CATEGORIE },
                              { key: "prezzo_costo",    label: "Costo €",   type: "number" },
                              { key: "prezzo_vendita",  label: "Vendita €", type: "number" },
                            ]}
                            values={{
                              codice:         p.codice || "",
                              nome:           p.nome || "",
                              categoria:      p.categoria,
                              prezzo_costo:   parseFloat(p.prezzo_costo),
                              prezzo_vendita: parseFloat(p.prezzo_vendita),
                            }}
                            onSave={(vals) => prodottiAPI.update(p.id, {
                              ...vals,
                              prezzo_costo:   parseFloat(vals.prezzo_costo),
                              prezzo_vendita: parseFloat(vals.prezzo_vendita),
                            })}
                            onDelete={() => prodottiAPI.delete(p.id)}
                            onRefresh={refreshProdotti}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
          }
        </CardContent>
      </Card>

    </div>
  );
}
