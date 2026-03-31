/**
 * components/MetricCard.jsx
 * -------------------------
 * Card riutilizzabile per mostrare una metrica chiave.
 */

import { Card, CardContent } from "@/components/ui/card";

export default function MetricCard({ label, value, subtitle, alert = false }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
          {label}
        </p>
        <p className="text-2xl font-medium text-foreground leading-none">
          {value}
        </p>
        {subtitle && (
          <p className={`text-xs mt-2 ${alert ? "text-destructive" : "text-muted-foreground"}`}>
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
