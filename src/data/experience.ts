export interface Role {
  company: string;
  context: { en: string; pt: string };
  title: { en: string; pt: string };
  start: { en: string; pt: string };
  end: { en: string; pt: string } | null; // null = present
  highlights: { en: string; pt: string }[];
  tags: string[];
}

export const experience: Role[] = [
  {
    company: 'Carbon Free Brasil',
    context: {
      en: 'B2B SaaS · 200+ enterprise clients (John Deere, Heineken, Coca-Cola, McDonald’s) · $1.5M+ ARR',
      pt: 'SaaS B2B · 200+ clientes enterprise (John Deere, Heineken, Coca-Cola, McDonald’s) · $1.5M+ ARR',
    },
    title: { en: 'Full Stack Engineer', pt: 'Engenheiro Full Stack' },
    start: { en: 'Nov 2024', pt: 'Nov 2024' },
    end: null,
    tags: ['FastAPI', 'Python', 'AWS Lambda', 'React'],
    highlights: [
      {
        en: 'Spearheaded the migration from a legacy PHP monolith to modular FastAPI microservices with automated testing — 80% fewer bugs, 60% faster response times, 90% shorter delivery cycles.',
        pt: 'Liderei a migração de um monólito PHP legado para microsserviços FastAPI modulares com testes automatizados — 80% menos bugs, 60% mais rápido, ciclos de entrega 90% menores.',
      },
      {
        en: 'Architected an event-driven serverless pipeline (AWS Lambda / Python) for real-time GHG calculations and PDF generation — cut document processing from 9s to under 1s and manual effort by 90%.',
        pt: 'Arquitetei um pipeline serverless orientado a eventos (AWS Lambda / Python) para cálculos de GHG em tempo real e geração de PDF — reduzi o processamento de 9s para menos de 1s e o esforço manual em 90%.',
      },
      {
        en: 'Automated complex data ingestion for enterprise integrations — cut manual input from 45 min to under 5 min per session and eliminated recurring data-entry errors.',
        pt: 'Automatizei ingestão de dados complexa para integrações enterprise — reduzi a entrada manual de 45 min para menos de 5 min por sessão, eliminando erros recorrentes.',
      },
    ],
  },
  {
    company: 'Manchester Investimentos',
    context: {
      en: 'Wealth management · $4B+ AUC · 200+ advisors · internal CRM',
      pt: 'Gestão de patrimônio · $4B+ sob custódia · 200+ assessores · CRM interno',
    },
    title: { en: 'Frontend Developer', pt: 'Desenvolvedor Frontend' },
    start: { en: 'Sep 2023', pt: 'Set 2023' },
    end: { en: 'Nov 2024', pt: 'Nov 2024' },
    tags: ['React', 'Next.js', 'Node.js', 'Playwright'],
    highlights: [
      {
        en: 'Unblocked $1M+ in monthly portfolio simulations and eliminated reconciliation errors by optimizing financial processing engines and real-time simulators (Node.js, React).',
        pt: 'Destravei $1M+ em simulações mensais de portfólio e eliminei erros de reconciliação otimizando engines de processamento financeiro e simuladores em tempo real (Node.js, React).',
      },
      {
        en: 'Architected a ~70 MAU partner portal with automated PIX payments (Node.js, Next.js, AWS) processing $100K+ monthly, saving ~20 hours/month for finance.',
        pt: 'Arquitetei um portal de parceiros (~70 MAU) com pagamentos PIX automatizados (Node.js, Next.js, AWS) processando $100K+ mensais, economizando ~20 horas/mês do financeiro.',
      },
      {
        en: 'Built a high-performance frontend architecture and shared component library, doubling delivery speed and adding Playwright E2E testing for a 14K+ client base.',
        pt: 'Construí uma arquitetura frontend de alta performance e biblioteca de componentes compartilhada, dobrando a velocidade de entrega e adicionando testes E2E Playwright para uma base de 14K+ clientes.',
      },
    ],
  },
  {
    company: 'Lize',
    context: {
      en: 'Early-stage B2B SaaS · AI social-media publishing · ~2,000 MAU (ceased ops late 2023)',
      pt: 'SaaS B2B early-stage · publicação em redes sociais com IA · ~2.000 MAU (encerrou no fim de 2023)',
    },
    title: { en: 'Frontend Developer — Founding Engineer', pt: 'Desenvolvedor Frontend — Founding Engineer' },
    start: { en: 'Jan 2023', pt: 'Jan 2023' },
    end: { en: 'Aug 2023', pt: 'Ago 2023' },
    tags: ['Vue.js', 'Django', 'Facebook API'],
    highlights: [
      {
        en: 'Launched the MVP from 0 to 1 as founding engineer, implementing an AI-driven content engine (Vue.js, Django).',
        pt: 'Lancei o MVP do 0 ao 1 como founding engineer, implementando um motor de conteúdo orientado a IA (Vue.js, Django).',
      },
      {
        en: 'Built an auto-pilot Instagram publishing feature via the Facebook API, delivering personalized scheduled content for 200+ users.',
        pt: 'Construí publicação automática no Instagram via Facebook API, entregando conteúdo agendado e personalizado para 200+ usuários.',
      },
      {
        en: 'Designed an SVG-based brand template editor (Vue.js) letting the sales team generate client-branded assets in minutes instead of hours.',
        pt: 'Desenhei um editor de templates de marca baseado em SVG (Vue.js) permitindo ao time de vendas gerar peças com a marca do cliente em minutos.',
      },
    ],
  },
];
