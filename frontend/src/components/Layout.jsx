/**
 * components/Layout.jsx
 * ----------------------
 * Layout principale della dashboard con sidebar e header.
 * Wrappa tutte le pagine protette.
 */

import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Package, Factory,
  ShoppingCart, PlusCircle, LogOut, KeyRound,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/",           label: "Overview",       icon: LayoutDashboard },
  { to: "/magazzino",  label: "Magazzino",       icon: Package },
  { to: "/produzione", label: "Produzione",      icon: Factory },
  { to: "/vendite",    label: "Vendite",          icon: ShoppingCart },
  { to: "/inserisci",  label: "Inserisci dati",  icon: PlusCircle },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="flex h-screen bg-background">

      {/* SIDEBAR */}
      <aside className="w-56 border-r flex flex-col bg-background">

        <div className="px-6 py-5 border-b">
          <span className="text-xs font-semibold tracking-widest uppercase text-foreground">
            Brand Dashboard
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-foreground text-background font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t space-y-1">
          <div className="text-xs text-muted-foreground px-3 mb-2 truncate">
            {user?.nome || user?.email}
          </div>
          <NavLink
            to="/cambio-password"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-foreground text-background font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`
            }
          >
            <KeyRound size={15} />
            Cambio password
          </NavLink>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3 text-muted-foreground"
            onClick={handleLogout}
          >
            <LogOut size={15} />
            Logout
          </Button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>

    </div>
  );
}
