import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Send, Sparkles } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/assistente")({
  head: () => ({
    meta: [
      { title: "Assistente Virtual de Governança — PNGI" },
      { name: "description", content: "Assistente de IA generativa para dúvidas normativas, sugestões documentais e geração de relatórios." },
    ],
  }),
  component: AssistentePage,
});

type Message = { role: "user" | "assistant"; text: string };

const seed: Message[] = [
  {
    role: "assistant",
    text: "Bom dia, Gestor. Sou o Assistente Virtual de Governança da PNGI. Posso ajudar com dúvidas normativas, sugerir documentos e gerar relatórios. Por onde começamos?",
  },
];

const suggestions = [
  "Quais são os marcos do Decreto 11.531/2023?",
  "Gerar minuta de Acordo de Cooperação Técnica para o INSS",
  "Resumir o histórico sancionador da Fundação Alfa",
  "Elaborar relatório executivo de fiscalização orientada por risco",
];

function AssistentePage() {
  const [messages, setMessages] = useState<Message[]>(seed);
  const [input, setInput] = useState("");

  function send(text: string) {
    if (!text.trim()) return;
    setMessages((m) => [
      ...m,
      { role: "user", text },
      {
        role: "assistant",
        text: "Demonstração: nesta versão piloto da PNGI, o motor de IA generativa responderia com base em normativos vigentes, dados do cadastro único e histórico sancionador. A integração com o modelo é o próximo passo deste roadmap.",
      },
    ]);
    setInput("");
  }

  return (
    <DashboardLayout>
      <header>
        <div className="text-sm font-medium text-gov-blue mb-1">IA Generativa</div>
        <h2 className="font-display text-3xl font-bold tracking-tight">Assistente Virtual de Governança</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-3xl">
          Apoia gestores com dúvidas normativas, sugestões documentais e geração de relatórios — sempre com rastreabilidade das fontes consultadas.
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <div className="bg-gov-navy rounded-2xl flex flex-col shadow-xl h-[640px] overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center gap-3">
            <div className="size-3 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-white uppercase tracking-widest">PNGI · IA Generativa</span>
            <span className="ml-auto text-[10px] font-mono text-slate-400">v2.4 — modo demonstração</span>
          </div>
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={
                  m.role === "assistant"
                    ? "max-w-2xl bg-white/5 text-slate-200 rounded-2xl rounded-tl-sm p-4 text-sm leading-relaxed"
                    : "max-w-2xl ml-auto bg-gov-blue text-white rounded-2xl rounded-tr-sm p-4 text-sm leading-relaxed"
                }
              >
                {m.text}
              </div>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="p-4 border-t border-white/10 flex items-center gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua dúvida normativa, peça uma minuta ou um relatório…"
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-gov-blue"
            />
            <button
              type="submit"
              className="size-11 grid place-items-center rounded-xl bg-gov-blue text-white hover:bg-blue-600 transition-colors"
              aria-label="Enviar"
            >
              <Send className="size-4" />
            </button>
          </form>
        </div>

        <aside className="space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
              <Sparkles className="size-4 text-gov-blue" /> Sugestões
            </div>
            <div className="space-y-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="w-full text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs text-slate-700 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 text-white">
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Rastreabilidade</div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Cada resposta cita normas, documentos e registros do cadastro único utilizados. As interações ficam registradas para fins de auditoria.
            </p>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}