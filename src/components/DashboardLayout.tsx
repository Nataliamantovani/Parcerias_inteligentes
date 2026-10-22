import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { TopNav, navGroups } from "./InstitutionalShell";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    navGroups.forEach((g) => {
      init[g.label] = pathname === g.to || pathname.startsWith(g.to + "/") || g.items.some((it) => it.to.split("#")[0] === pathname);
    });
    return init;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gov-navy">
      <TopNav variant="app" />
      <div className="mx-auto max-w-[1400px] flex">
        <aside className="w-72 shrink-0 border-r border-slate-200 bg-white min-h-[calc(100vh-64px)] p-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-3 flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-emerald-500" /> Caso Piloto · SIGACT IA — INSS
          </div>
          <nav className="space-y-1">
            {navGroups.map((g) => {
              const isOpen = openGroups[g.label];
              const groupActive = pathname === g.to || pathname.startsWith(g.to + "/");
              return (
                <div key={g.label}>
                  <button
                    onClick={() => setOpenGroups((s) => ({ ...s, [g.label]: !s[g.label] }))}
                    className={
                      "w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-tight transition-colors " +
                      (groupActive ? "text-gov-blue" : "text-slate-700 hover:bg-slate-50")
                    }
                  >
                    <span className="flex items-center gap-2">
                      {isOpen ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                      {g.label}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="ml-5 mt-1 mb-2 border-l border-slate-100 space-y-0.5">
                      {g.items.map((it) => {
                        const active = pathname === it.to;
                        return (
                          <Link
                            key={it.label}
                            to={it.to}
                            hash={it.hash}
                            className={
                              "block pl-4 pr-3 py-1.5 text-xs font-medium border-l-2 transition-colors " +
                              (active
                                ? "border-gov-blue text-gov-blue bg-gov-blue/5"
                                : "border-transparent text-slate-500 hover:text-gov-navy hover:bg-slate-50")
                            }
                          >
                            {it.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="pt-6 px-1">
            <div className="rounded-xl bg-gov-navy p-4 text-white">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Governança em operação</p>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-semibold">1.248 instrumentos ativos</span>
              </div>
              <p className="mt-3 text-[11px] text-white/60 leading-relaxed">
                Dados estruturados, evidências auditáveis e aprendizado institucional contínuo.
              </p>
              <Link to="/valor-publico" className="mt-3 inline-block text-[11px] font-semibold text-gov-blue hover:underline">
                Ver valor público gerado →
              </Link>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-8 space-y-8 min-w-0">{children}</main>
      </div>
    </div>
  );
}