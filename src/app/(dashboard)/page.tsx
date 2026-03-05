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
                        className="rounded-xl bg-[#12142a] border border-white/[0.06] p-5 flex items-start justify-between"
                    >
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
                                {stat.title}
                            </p>
                            <p className="text-3xl font-bold text-white">{stat.value}</p>
                        </div>
                        <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                            <stat.icon className="h-5 w-5" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Modules Grid */}
            <div>
                <h2 className="text-lg font-semibold text-white mb-1">Funcionalidades</h2>
                <p className="text-sm text-gray-500 mb-5">Acesse os serviços integrados do seu Hub</p>

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {features.map((mod) => (
                        <Link
                            key={mod.title}
                            href={mod.href}
                            className="group rounded-xl bg-[#12142a] border border-white/[0.06] overflow-hidden hover:border-violet-500/30 transition-all duration-200 hover:shadow-lg hover:shadow-violet-900/10"
                        >
                            <div className={`h-24 bg-gradient-to-br ${mod.color} flex items-center justify-center`}>
                                <mod.icon className="h-10 w-10 text-white/80 group-hover:scale-110 transition-transform duration-200" />
                            </div>
                            <div className="p-4">
                                <h3 className="text-sm font-semibold text-white mb-1">{mod.title}</h3>
                                <p className="text-xs text-gray-500 leading-relaxed">{mod.description}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
