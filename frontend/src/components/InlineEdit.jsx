/**
 * components/InlineEdit.jsx
 * -------------------------
 * Componente riutilizzabile per la modifica e cancellazione inline.
 *
 * Uso:
 *   <InlineEdit
 *     fields={[{ key: "note", label: "Note", type: "text" }]}
 *     values={{ note: "Lotto primavera" }}
 *     onSave={(vals) => produzioneAPI.update(id, vals)}
 *     onDelete={() => produzioneAPI.delete(id)}
 *     onRefresh={loadData}
 *   />
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input }  from "@/components/ui/input";
import { Pencil, Trash2, Check, X } from "lucide-react";

function parseError(err) {
  const data = err.response?.data;
  if (data?.campi?.length) return data.campi.map((c) => c.errore).join(" · ");
  return data?.error || "Errore.";
}

export default function InlineEdit({ fields, values, onSave, onDelete, onRefresh }) {
  const [editing,  setEditing]  = useState(false);
  const [form,     setForm]     = useState(values);
  const [loading,  setLoading]  = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error,    setError]    = useState("");

  function startEdit() {
    setForm(values);
    setError("");
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setError("");
  }

  async function handleSave() {
    setLoading(true);
    setError("");
    try {
      await onSave(form);
      setEditing(false);
      onRefresh();
    } catch (err) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Sei sicuro di voler eliminare questo record?")) return;
    setDeleting(true);
    try {
      await onDelete();
      onRefresh();
    } catch (err) {
      setError(parseError(err));
      setDeleting(false);
    }
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost" size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={startEdit}
          title="Modifica"
        >
          <Pencil size={13} />
        </Button>
        <Button
          variant="ghost" size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={handleDelete}
          disabled={deleting}
          title="Elimina"
        >
          <Trash2 size={13} />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 py-1 min-w-[200px]">
      {fields.map((f) => (
        <div key={f.key}>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{f.label}</p>
          {f.type === "select" ? (
            <select
              className="w-full text-xs border rounded-md px-2 py-1 bg-background"
              value={form[f.key] || ""}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
            >
              {f.options.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          ) : (
            <Input
              type={f.type || "text"}
              value={form[f.key] || ""}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              className="h-7 text-xs"
            />
          )}
        </div>
      ))}

      {error && <p className="text-[10px] text-destructive">{error}</p>}

      <div className="flex gap-1">
        <Button
          size="sm" className="h-7 text-xs flex-1"
          onClick={handleSave} disabled={loading}
        >
          <Check size={12} className="mr-1" />
          {loading ? "..." : "Salva"}
        </Button>
        <Button
          variant="ghost" size="sm" className="h-7 text-xs"
          onClick={cancelEdit}
        >
          <X size={12} />
        </Button>
      </div>
    </div>
  );
}
