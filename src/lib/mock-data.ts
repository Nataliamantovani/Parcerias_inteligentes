export type RiskLevel = "alto" | "medio" | "baixo";

export type Instrument = {
  id: string;
  type: string;
  partner: string;
  object: string;
  validity: string;
  value: string;
  status: "Vigente" | "Em análise" | "Suspenso" | "Encerrado";
  riskScore: number;
  riskLabel: string;
  riskLevel: RiskLevel;
  compliance: number;
};

export const instruments: Instrument[] = [
  {
    id: "ACT 042/2023",
    type: "Acordo de Cooperação Técnica",
    partner: "Fundação Alfa",
    object: "Capacitação de servidores em análise previdenciária",
    validity: "31/12/2024",
    value: "R$ 1.250.000",
    status: "Vigente",
    riskScore: 8.8,
    riskLabel: "Inconsistência de Repasse",
    riskLevel: "alto",
    compliance: 62,
  },
  {
    id: "Convênio 012/2024",
    type: "Convênio",
    partner: "Município Delta",
    object: "Implantação de posto de atendimento INSS digital",
    validity: "30/06/2026",
    value: "R$ 3.420.000",
    status: "Vigente",
    riskScore: 4.5,
    riskLabel: "Histórico Sancionador",
    riskLevel: "medio",
    compliance: 78,
  },
  {
    id: "ACT 118/2024",
    type: "Acordo de Cooperação",
    partner: "Universidade Federal de Brasília",
    object: "Pesquisa aplicada em automação previdenciária",
    validity: "20/10/2027",
    value: "R$ 0",
    status: "Vigente",
    riskScore: 1.6,
    riskLabel: "Conforme",
    riskLevel: "baixo",
    compliance: 96,
  },
  {
    id: "TF 088/2023",
    type: "Termo de Fomento",
    partner: "Instituto BioDev",
    object: "Inclusão digital para beneficiários do BPC",
    validity: "12/03/2025",
    value: "R$ 980.000",
    status: "Em análise",
    riskScore: 6.3,
    riskLabel: "Pendência Documental",
    riskLevel: "medio",
    compliance: 71,
  },
  {
    id: "Convênio 027/2022",
    type: "Convênio",
    partner: "Secretaria Estadual de Saúde RS",
    object: "Integração de perícias médicas regionais",
    validity: "15/10/2024",
    value: "R$ 2.100.000",
    status: "Suspenso",
    riskScore: 9.1,
    riskLabel: "Desvio Financeiro Detectado",
    riskLevel: "alto",
    compliance: 44,
  },
  {
    id: "ACT 201/2024",
    type: "Acordo de Cooperação",
    partner: "Consórcio Intermunicipal Norte",
    object: "Compartilhamento de base cadastral previdenciária",
    validity: "01/08/2027",
    value: "R$ 0",
    status: "Vigente",
    riskScore: 3.2,
    riskLabel: "Conforme",
    riskLevel: "baixo",
    compliance: 89,
  },
];

export type Partner = {
  cnpj: string;
  name: string;
  sanctions: number;
  ceis: "Nada consta" | "Sanção ativa" | "Em apuração";
  cnep: "Nada consta" | "Sanção ativa";
  certidoes: "Regular" | "Pendente" | "Vencida";
  instruments: number;
  integrity: number;
};

export const partners: Partner[] = [
  {
    cnpj: "12.345.678/0001-90",
    name: "Fundação Alfa",
    sanctions: 1,
    ceis: "Em apuração",
    cnep: "Nada consta",
    certidoes: "Pendente",
    instruments: 3,
    integrity: 62,
  },
  {
    cnpj: "98.765.432/0001-10",
    name: "Consórcio Intermunicipal Norte",
    sanctions: 0,
    ceis: "Nada consta",
    cnep: "Nada consta",
    certidoes: "Regular",
    instruments: 2,
    integrity: 91,
  },
  {
    cnpj: "45.678.910/0001-22",
    name: "Instituto BioDev",
    sanctions: 0,
    ceis: "Nada consta",
    cnep: "Nada consta",
    certidoes: "Pendente",
    instruments: 1,
    integrity: 78,
  },
  {
    cnpj: "33.444.555/0001-77",
    name: "Secretaria Estadual de Saúde RS",
    sanctions: 2,
    ceis: "Sanção ativa",
    cnep: "Nada consta",
    certidoes: "Vencida",
    instruments: 4,
    integrity: 41,
  },
  {
    cnpj: "22.111.000/0001-44",
    name: "Universidade Federal de Brasília",
    sanctions: 0,
    ceis: "Nada consta",
    cnep: "Nada consta",
    certidoes: "Regular",
    instruments: 5,
    integrity: 97,
  },
];

export type AuditFinding = {
  id: string;
  instrument: string;
  category: "Integridade" | "Conformidade" | "Financeiro" | "Documental";
  description: string;
  confidence: number;
  severity: RiskLevel;
  detectedAt: string;
};

export const auditFindings: AuditFinding[] = [
  {
    id: "AUD-2024-0421",
    instrument: "Convênio 027/2022",
    category: "Financeiro",
    description:
      "Padrão de desembolso incompatível com o cronograma físico-financeiro do item 4.1.",
    confidence: 98.4,
    severity: "alto",
    detectedAt: "Há 2 horas",
  },
  {
    id: "AUD-2024-0420",
    instrument: "ACT 042/2023",
    category: "Integridade",
    description:
      "Parceiro apresenta sanção administrativa não declarada no cadastro único (CEIS).",
    confidence: 92.1,
    severity: "alto",
    detectedAt: "Há 6 horas",
  },
  {
    id: "AUD-2024-0418",
    instrument: "TF 088/2023",
    category: "Documental",
    description:
      "Certidão de regularidade fiscal vencida há 14 dias; bloqueio preventivo recomendado.",
    confidence: 88.7,
    severity: "medio",
    detectedAt: "Ontem",
  },
  {
    id: "AUD-2024-0411",
    instrument: "Convênio 012/2024",
    category: "Conformidade",
    description:
      "Plano de trabalho não contempla indicadores de resultado exigidos pelo Decreto 11.531.",
    confidence: 81.2,
    severity: "medio",
    detectedAt: "Há 3 dias",
  },
  {
    id: "AUD-2024-0402",
    instrument: "ACT 118/2024",
    category: "Conformidade",
    description:
      "Marcos contratuais cumpridos. Sugere-se replicar boas práticas para novos ACTs.",
    confidence: 95.6,
    severity: "baixo",
    detectedAt: "Há 5 dias",
  },
];

export const lifecyclePhases = [
  { phase: "Proposição", count: 142, color: "bg-slate-300" },
  { phase: "Celebração", count: 318, color: "bg-gov-blue" },
  { phase: "Execução", count: 612, color: "bg-emerald-500" },
  { phase: "Monitoramento", count: 124, color: "bg-amber-500" },
  { phase: "Prestação de Contas", count: 52, color: "bg-rose-500" },
];

export const riskBadge = (level: RiskLevel) => {
  switch (level) {
    case "alto":
      return "bg-rose-50 text-rose-600 border border-rose-100";
    case "medio":
      return "bg-amber-50 text-amber-600 border border-amber-100";
    case "baixo":
      return "bg-emerald-50 text-emerald-600 border border-emerald-100";
  }
};

export const riskBar = (level: RiskLevel) => {
  switch (level) {
    case "alto":
      return "bg-risk-high";
    case "medio":
      return "bg-risk-mid";
    case "baixo":
      return "bg-risk-low";
  }
};