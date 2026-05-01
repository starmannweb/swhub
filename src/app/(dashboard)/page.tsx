import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import {
    Users,
    Globe,
    BarChart3,
    Zap,
    FileText,
    CreditCard,
    Megaphone,
    KanbanSquare,
    Briefcase,
    GraduationCap,
    MessageCircle,
    Plus,
    Rocket,
    Headset,
    Settings2,
    Palette,
    Target,
    GitBranch,
    Bot,
    ArrowRight,
} from "lucide-react"

const features = [
    {
        title: "Leads",
        description: "Captura e gestão de contatos",
        href: "/crm/contatos",
        icon: Users,
        color: "from-violet-600 to-indigo-700",
        iconBg: "bg-violet-500/20 text-violet-400",
    },
    {
        title: "CRM",
        description: "Vendas, negócios e propostas",
        href: "/crm/negocios",
        icon: KanbanSquare,
        color: "from-blue-600 to-blue-800",
        iconBg: "bg-blue-500/20 text-blue-400",
    },
    {
        title: "Projetos",
        description: "Gestão de projetos e entregas",
        href: "/colaboracao/projetos",
        icon: Briefcase,
        color: "from-purple-600 to-purple-800",
        iconBg: "bg-purple-500/20 text-purple-400",
    },
    {
        title: "Criar Site",
        description: "Crie landing pages e sites",
        href: "/sites",
        icon: Globe,
        color: "from-fuchsia-600 to-pink-700",
        iconBg: "bg-fuchsia-500/20 text-fuchsia-400",
    },
    {
        title: "Automações",
        description: "Fluxos automáticos e agentes de IA",
        href: "/automacoes",
        icon: Zap,
        color: "from-amber-500 to-orange-700",
        iconBg: "bg-amber-500/20 text-amber-400",
    },
    {
        title: "Indicações",
        description: "Receba indicações de parceiros",
        href: "/afiliados",
        icon: Megaphone,
        color: "from-pink-600 to-rose-700",
        iconBg: "bg-pink-500/20 text-pink-400",
    },
    {
        title: "Financeiro",
        description: "Faturamento e cobranças",
        href: "/financeiro/faturas",
        icon: CreditCard,
        color: "from-teal-600 to-cyan-800",
        iconBg: "bg-teal-500/20 text-teal-400",
    },
    {
        title: "Treinamentos",
        description: "Cursos e materiais de apoio",
        href: "/treinamentos",
        icon: GraduationCap,
        color: "from-orange-600 to-red-800",
        iconBg: "bg-orange-500/20 text-orange-400",
    },
    {
        title: "Comunidade",
        description: "Conecte-se com outros membros",
        href: "/comunidade",
        icon: MessageCircle,
        color: "from-indigo-600 to-violet-800",
        iconBg: "bg-indigo-500/20 text-indigo-400",
    },
    {
        title: "Relatórios",
        description: "Análises e métricas do sistema",
        href: "/relatorios",
        icon: BarChart3,
        color: "from-cyan-600 to-blue-800",
        iconBg: "bg-cyan-500/20 text-cyan-400",
    },
]

const stats = [
    { title: "LEADS ATIVOS", value: "0", icon: Users, iconBg: "bg-violet-500/15 text-violet-400" },
    { title: "PROJETOS EM ANDAMENTO", value: "0", icon: Briefcase, iconBg: "bg-purple-500/15 text-purple-400" },
    { title: "PROPOSTAS ENVIADAS", value: "0", icon: FileText, iconBg: "bg-fuchsia-500/15 text-fuchsia-400" },
    { title: "SITES PUBLICADOS", value: "0", icon: Globe, iconBg: "bg-blue-500/15 text-blue-400" },
]

const implementationServices = [
    { icon: Settings2, title: "Setup do Sistema", desc: "Configuração inicial completa da plataforma", href: "/configuracoes" },
    { icon: Palette, title: "Customização", desc: "Personalização visual e funcional do seu Hub", href: "/sites" },
    { icon: Target, title: "Integração com Ads", desc: "Meta Ads, Google Ads, pixels e conversões", href: "/configuracoes?tab=integracoes" },
    { icon: GitBranch, title: "Ajuste de Funil", desc: "Otimização do pipeline e etapas de vendas", href: "/configuracoes?tab=pipeline" },
    { icon: Bot, title: "Automações de IA", desc: "Agentes inteligentes e follow-up automatizado", href: "/automacoes" },
]

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const fullName = user?.user_metadata?.full_name || "usuário"

    return (
        <div className="space-y-8">
            {/* Hero Banner — purple/pink gradient */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-500 p-8 md:p-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.12),transparent_60%)]" />
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1.5 flex items-center gap-2">
                            Bem-vindo de volta, {fullName} <Rocket className="h-6 w-6" />
                        </h1>
                        <p className="text-white/70 text-sm md:text-base max-w-lg">
                            Continue criando sites incríveis e acompanhe suas métricas em tempo real.
                        </p>
                    </div>
                    <Link
                        href="/sites"
                        className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white text-sm font-semibold transition-all border border-white/20"
                    >
                        <Plus className="h-4 w-4" /> Criar Novo Site
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div
                        key={stat.title}
                        className="rounded-xl bg-white dark:bg-[#12142a] border border-slate-200 dark:border-white/[0.06] p-5 flex items-start justify-between shadow-sm"
                    >
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-500 mb-2">
                                {stat.title}
                            </p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                        </div>
                        <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                            <stat.icon className="h-5 w-5" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Modules Grid */}
            <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Funcionalidades</h2>
                <p className="text-sm text-slate-500 dark:text-gray-500 mb-5">Acesse os serviços integrados do seu Hub</p>

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {features.map((mod) => (
                        <Link
                            key={mod.title}
                            href={mod.href}
                            className="group rounded-xl bg-white dark:bg-[#12142a] border border-slate-200 dark:border-white/[0.06] overflow-hidden hover:border-violet-300 dark:hover:border-violet-500/30 transition-all duration-200 hover:shadow-lg hover:shadow-violet-900/10 shadow-sm"
                        >
                            <div className={`h-24 bg-gradient-to-br ${mod.color} flex items-center justify-center`}>
                                <mod.icon className="h-10 w-10 text-white/80 group-hover:scale-110 transition-transform duration-200" />
                            </div>
                            <div className="p-4">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{mod.title}</h3>
                                <p className="text-xs text-slate-500 dark:text-gray-500 leading-relaxed">{mod.description}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Suporte & Implantação */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Suporte */}
                <div className="rounded-xl bg-white dark:bg-[#12142a] border border-slate-200 dark:border-white/[0.06] p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 rounded-xl bg-violet-500/15">
                            <Headset className="h-5 w-5 text-violet-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Suporte</h3>
                            <p className="text-[11px] text-slate-500 dark:text-gray-500">Precisa de ajuda? Estamos aqui.</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Link href="/suporte" className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-[#0d0f1a] border border-slate-200 dark:border-white/[0.06] hover:border-violet-300 dark:hover:border-violet-500/20 transition-colors group">
                            <div className="flex items-center gap-3">
                                <MessageCircle className="h-4 w-4 text-slate-400 dark:text-gray-500 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors" />
                                <span className="text-sm text-slate-600 dark:text-gray-300">Abrir ticket de suporte</span>
                            </div>
                            <ArrowRight className="h-4 w-4 text-slate-300 dark:text-gray-700 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors" />
                        </Link>
                        <a href="https://discord.gg/seu-link-aqui" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-[#0d0f1a] border border-slate-200 dark:border-white/[0.06] hover:border-violet-300 dark:hover:border-violet-500/20 transition-colors group">
                            <div className="flex items-center gap-3">
                                <Users className="h-4 w-4 text-slate-400 dark:text-gray-500 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors" />
                                <span className="text-sm text-slate-600 dark:text-gray-300">Comunidade Discord</span>
                            </div>
                            <ArrowRight className="h-4 w-4 text-slate-300 dark:text-gray-700 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors" />
                        </a>
                        <Link href="/treinamentos" className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-[#0d0f1a] border border-slate-200 dark:border-white/[0.06] hover:border-violet-300 dark:hover:border-violet-500/20 transition-colors group">
                            <div className="flex items-center gap-3">
                                <GraduationCap className="h-4 w-4 text-slate-400 dark:text-gray-500 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors" />
                                <span className="text-sm text-slate-600 dark:text-gray-300">Tutoriais em vídeo</span>
                            </div>
                            <ArrowRight className="h-4 w-4 text-slate-300 dark:text-gray-700 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors" />
                        </Link>
                    </div>
                </div>

                {/* Implantação */}
                <div className="rounded-xl bg-white dark:bg-[#12142a] border border-slate-200 dark:border-white/[0.06] p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 rounded-xl bg-fuchsia-500/15">
                            <Settings2 className="h-5 w-5 text-fuchsia-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Implantação</h3>
                            <p className="text-[11px] text-slate-500 dark:text-gray-500">Serviços de setup e configuração assistida</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {implementationServices.map((service) => (
                            <Link key={service.title} href={service.href} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-[#0d0f1a] border border-slate-200 dark:border-white/[0.06] hover:border-fuchsia-300 dark:hover:border-fuchsia-500/20 transition-colors group">
                                <div className="p-1.5 rounded-lg bg-fuchsia-500/10">
                                    <service.icon className="h-3.5 w-3.5 text-fuchsia-400/70" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-700 dark:text-gray-300 font-medium">{service.title}</p>
                                    <p className="text-[10px] text-slate-400 dark:text-gray-600">{service.desc}</p>
                                </div>
                                <ArrowRight className="h-4 w-4 text-slate-300 dark:text-gray-700 group-hover:text-fuchsia-500 dark:group-hover:text-fuchsia-400 transition-colors shrink-0" />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
