import Link from "next/link"
import type { ReactNode } from "react"
import {
    ArrowRight,
    BarChart3,
    Bot,
    CheckCircle2,
    CreditCard,
    Globe,
    KanbanSquare,
    Megaphone,
    MessageSquare,
    PlayCircle,
    Sparkles,
    Zap,
} from "lucide-react"

const modules = [
    { title: "CRM e Pipeline", desc: "Leads, negocios, propostas e follow-up em um fluxo unico.", icon: KanbanSquare, color: "text-blue-300 bg-blue-500/15" },
    { title: "Sites e Funis", desc: "Construtor de paginas, modelos e publicacao sem depender de plugins.", icon: Globe, color: "text-emerald-300 bg-emerald-500/15" },
    { title: "Automacoes", desc: "Gatilhos, acoes, WhatsApp, e-mail e rotas para escalar atendimento.", icon: Zap, color: "text-amber-300 bg-amber-500/15" },
    { title: "IA Operacional", desc: "Assistentes para criar fluxos, textos e processos comerciais.", icon: Bot, color: "text-fuchsia-300 bg-fuchsia-500/15" },
    { title: "Afiliados", desc: "Links de indicacao, materiais e comissoes acompanhadas no painel.", icon: Megaphone, color: "text-rose-300 bg-rose-500/15" },
    { title: "Financeiro", desc: "Faturas, propostas e visao de situacao financeira da plataforma.", icon: CreditCard, color: "text-cyan-300 bg-cyan-500/15" },
]

const replacements = [
    ["CRM e pipeline", "R$ 500/mês", "Incluido"],
    ["Construtor de sites", "R$ 100/mês", "Incluido"],
    ["E-mail e automacoes", "R$ 500/mês", "Incluido"],
    ["Central de atendimento", "R$ 300/mês", "Incluido"],
    ["Afiliados e materiais", "R$ 250/mês", "Incluido"],
    ["Analytics comercial", "R$ 250/mês", "Incluido"],
]

const plans = [
    {
        name: "Starter",
        price: "R$ 297",
        period: "mensal",
        highlight: false,
        features: ["CRM completo", "Sites e funis", "Modelos essenciais", "3 usuarios", "Suporte padrao"],
    },
    {
        name: "Growth",
        price: "R$ 497",
        period: "mensal",
        highlight: true,
        features: ["Tudo do Starter", "Automacoes avancadas", "Afiliados", "Marketplace de integracoes", "Onboarding guiado"],
    },
    {
        name: "Scale",
        price: "R$ 697",
        period: "mensal",
        highlight: false,
        features: ["Tudo do Growth", "Multi-equipe", "Relatorios executivos", "Seeds e ambientes de teste", "Suporte prioritario"],
    },
]

const faqs = [
    ["O SWHub substitui quais ferramentas?", "CRM, funis, propostas, automacoes, afiliados, materiais, suporte e parte da operacao financeira comercial."],
    ["Preciso migrar tudo de uma vez?", "Nao. O ideal e comecar por leads e pipeline, depois conectar sites, propostas e automacoes."],
    ["Tem builder beta?", "Sim. O admin pode escolher entre o construtor padrao e o beta para testar a nova experiencia."],
    ["O Resend e Meta entram onde?", "Resend entra nos disparos de e-mail transacional. Meta entra em Pixel, CAPI, Lead Ads e WhatsApp Cloud API."],
]

export default function ApresentacaoPage() {
    return (
        <main className="min-h-screen bg-[#070914] text-white">
            <section className="relative min-h-[92vh] overflow-hidden border-b border-white/10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(124,58,237,0.35),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(14,165,233,0.22),transparent_24%),linear-gradient(180deg,#090b18_0%,#070914_80%)]" />
                <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#070914] to-transparent" />

                <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
                    <Link href="/apresentacao" className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 font-bold">S</div>
                        <div>
                            <p className="text-sm font-bold">SWHub</p>
                            <p className="text-[11px] text-slate-400">CRM, sites e automacoes</p>
                        </div>
                    </Link>
                    <nav className="hidden items-center gap-6 text-xs font-semibold text-slate-300 md:flex">
                        <a href="#modulos" className="hover:text-white">Modulos</a>
                        <a href="#economia" className="hover:text-white">Economia</a>
                        <a href="#planos" className="hover:text-white">Planos</a>
                        <a href="#faq" className="hover:text-white">FAQ</a>
                    </nav>
                    <Link href="/login" className="rounded-lg border border-white/15 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10">
                        Entrar
                    </Link>
                </header>

                <div className="relative z-10 mx-auto flex min-h-[calc(92vh-80px)] max-w-7xl flex-col justify-center px-5 pb-20 pt-10">
                    <div className="max-w-3xl">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                            <Sparkles className="h-3.5 w-3.5" /> Plataforma all-in-one para vender, entregar e fidelizar
                        </div>
                        <h1 className="max-w-4xl text-5xl font-black leading-tight md:text-7xl">
                            SWHub
                        </h1>
                        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                            Uma central para organizar leads, criar sites e funis, enviar propostas, automatizar follow-up e acompanhar a operacao comercial sem espalhar tudo em varias ferramentas.
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link href="/registro" className="inline-flex h-12 items-center justify-center rounded-lg bg-violet-600 px-6 text-sm font-bold text-white shadow-lg shadow-violet-950/40 hover:bg-violet-700">
                                Comecar agora <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                            <a href="#modulos" className="inline-flex h-12 items-center justify-center rounded-lg border border-white/15 px-6 text-sm font-bold text-white hover:bg-white/10">
                                <PlayCircle className="mr-2 h-4 w-4" /> Ver a plataforma
                            </a>
                        </div>
                    </div>

                    <div className="mt-12 grid max-w-5xl gap-4 md:grid-cols-[1.4fr_0.8fr]">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 shadow-2xl shadow-black/30 backdrop-blur">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-300">Pipeline Comercial</p>
                                    <p className="text-[11px] text-slate-500">R$ 84.700 em oportunidades abertas</p>
                                </div>
                                <div className="flex gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                                </div>
                            </div>
                            <div className="grid gap-3 md:grid-cols-4">
                                {["Lead Frio", "Oportunidade", "Em Negociacao", "Fechado"].map((stage, index) => (
                                    <div key={stage} className="min-h-44 rounded-xl border border-white/10 bg-[#0b1020]/90 p-3">
                                        <div className="mb-3 flex items-center justify-between">
                                            <p className="text-[11px] font-bold text-white">{stage}</p>
                                            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-slate-300">{index + 2}</span>
                                        </div>
                                        <div className="space-y-2">
                                            {[0, 1].map((item) => (
                                                <div key={item} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                                                    <div className="mb-2 h-2 w-20 rounded-full bg-slate-500/60" />
                                                    <div className="h-2 w-14 rounded-full bg-violet-400/70" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid gap-4">
                            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur">
                                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
                                    <MessageSquare className="h-5 w-5" />
                                </div>
                                <p className="text-sm font-bold">WhatsApp e e-mail no fluxo</p>
                                <p className="mt-2 text-xs leading-5 text-slate-400">Automacoes acionam mensagens, tags e tarefas no momento certo.</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur">
                                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300">
                                    <BarChart3 className="h-5 w-5" />
                                </div>
                                <p className="text-sm font-bold">Clareza para decidir</p>
                                <p className="mt-2 text-xs leading-5 text-slate-400">Relatorios mostram vendas, propostas e performance comercial.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="modulos" className="mx-auto max-w-7xl px-5 py-20">
                <div className="max-w-2xl">
                    <p className="text-xs font-bold uppercase text-violet-300">Tudo conectado</p>
                    <h2 className="mt-2 text-3xl font-black md:text-4xl">Um hub para toda a jornada do cliente.</h2>
                    <p className="mt-4 text-sm leading-7 text-slate-400">Do primeiro contato ao acompanhamento financeiro, cada modulo conversa com o restante da operacao.</p>
                </div>
                <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {modules.map((module) => (
                        <div key={module.title} className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
                            <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-lg ${module.color}`}>
                                <module.icon className="h-5 w-5" />
                            </div>
                            <h3 className="text-base font-bold">{module.title}</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-400">{module.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section id="economia" className="border-y border-white/10 bg-white/[0.03]">
                <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[0.8fr_1.2fr]">
                    <div>
                        <p className="text-xs font-bold uppercase text-emerald-300">Substitua ferramentas soltas</p>
                        <h2 className="mt-2 text-3xl font-black md:text-4xl">Menos assinaturas, mais processo.</h2>
                        <p className="mt-4 text-sm leading-7 text-slate-400">A ideia e reduzir o empilhamento de ferramentas caras e trazer a rotina para um painel unico.</p>
                    </div>
                    <div className="overflow-hidden rounded-xl border border-white/10">
                        <div className="grid grid-cols-3 bg-white/[0.06] px-4 py-3 text-xs font-bold text-slate-300">
                            <span>Funcionalidade</span>
                            <span>Avulso</span>
                            <span>SWHub</span>
                        </div>
                        {replacements.map(([feature, market, hub]) => (
                            <div key={feature} className="grid grid-cols-3 border-t border-white/10 px-4 py-4 text-sm">
                                <span className="text-white">{feature}</span>
                                <span className="text-slate-400">{market}</span>
                                <span className="inline-flex items-center gap-2 font-bold text-emerald-300">
                                    <CheckCircle2 className="h-4 w-4" /> {hub}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="planos" className="mx-auto max-w-7xl px-5 py-20">
                <div className="text-center">
                    <p className="text-xs font-bold uppercase text-cyan-300">Planos</p>
                    <h2 className="mt-2 text-3xl font-black md:text-4xl">Escolha o ritmo da sua operacao.</h2>
                </div>
                <div className="mt-10 grid gap-4 lg:grid-cols-3">
                    {plans.map((plan) => (
                        <div key={plan.name} className={`rounded-xl border p-6 ${plan.highlight ? "border-violet-400 bg-violet-500/10 shadow-xl shadow-violet-950/30" : "border-white/10 bg-white/[0.04]"}`}>
                            {plan.highlight && <BadgeLabel>Mais escolhido</BadgeLabel>}
                            <h3 className="mt-3 text-xl font-black">{plan.name}</h3>
                            <div className="mt-4 flex items-end gap-2">
                                <p className="text-4xl font-black">{plan.price}</p>
                                <p className="pb-1 text-sm text-slate-400">/{plan.period}</p>
                            </div>
                            <div className="mt-6 space-y-3">
                                {plan.features.map((feature) => (
                                    <p key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-300" /> {feature}
                                    </p>
                                ))}
                            </div>
                            <Link href="/registro" className={`mt-7 inline-flex h-11 w-full items-center justify-center rounded-lg text-sm font-bold ${plan.highlight ? "bg-violet-600 hover:bg-violet-700" : "border border-white/15 hover:bg-white/10"}`}>
                                Quero esse plano
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            <section id="faq" className="mx-auto max-w-4xl px-5 pb-20">
                <div className="text-center">
                    <p className="text-xs font-bold uppercase text-amber-300">Perguntas frequentes</p>
                    <h2 className="mt-2 text-3xl font-black">O essencial antes de comecar.</h2>
                </div>
                <div className="mt-8 divide-y divide-white/10 rounded-xl border border-white/10 bg-white/[0.04]">
                    {faqs.map(([question, answer]) => (
                        <div key={question} className="p-5">
                            <h3 className="text-sm font-bold">{question}</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-400">{answer}</p>
                        </div>
                    ))}
                </div>
            </section>

            <footer className="border-t border-white/10 px-5 py-8">
                <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
                    <p>SWHub. CRM, sites e automacoes para operacoes comerciais.</p>
                    <div className="flex gap-4">
                        <Link href="/login" className="hover:text-white">Login</Link>
                        <Link href="/registro" className="hover:text-white">Criar conta</Link>
                    </div>
                </div>
            </footer>
        </main>
    )
}

function BadgeLabel({ children }: { children: ReactNode }) {
    return (
        <span className="inline-flex rounded-full bg-violet-500 px-3 py-1 text-[11px] font-bold text-white">
            {children}
        </span>
    )
}
