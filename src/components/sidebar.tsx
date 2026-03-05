"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Users,
    Globe,
    BarChart3,
    Settings,
    Zap,
    KanbanSquare,
    Briefcase,
    CheckSquare,
    FileText,
    CreditCard,
    Megaphone,
    PanelLeftClose,
    PanelLeftOpen,
    ChevronDown,
    GraduationCap,
    MessageCircle,
    LayoutTemplate,
    Headset,
    Download,
    ShieldCheck,
    GlobeLock,
    type LucideIcon,
} from "lucide-react"

interface NavItem {
    title: string
    href: string
    icon: LucideIcon
}

interface NavSection {
    title: string
    icon: LucideIcon
    href?: string
    items?: NavItem[]
}

const navigation: NavSection[] = [
    {
        title: "Início",
        icon: LayoutDashboard,
        href: "/",
    },
    {
        title: "CRM",
        icon: KanbanSquare,
        items: [
            { title: "Leads", href: "/crm/contatos", icon: Users },
            { title: "Pipeline", href: "/crm/negocios", icon: KanbanSquare },
            { title: "Propostas", href: "/crm/propostas", icon: FileText },
        ],
    },
    {
        title: "Tarefas",
        icon: CheckSquare,
        href: "/colaboracao/tarefas",
    },
    {
        title: "Projetos",
        icon: Briefcase,
        href: "/colaboracao/projetos",
    },
    {
        title: "Criar Site",
        icon: Globe,
        href: "/sites",
    },
    {
        title: "Domínios",
        icon: GlobeLock,
        href: "/dominios",
    },
    {
        title: "Automações",
        icon: Zap,
        href: "/automacoes",
    },
    {
        title: "Indicações",
        icon: Megaphone,
        href: "/afiliados",
    },
    {
        title: "Treinamentos",
        icon: GraduationCap,
        href: "/treinamentos",
    },
    {
        title: "Comunidade",
        icon: MessageCircle,
        href: "/comunidade",
    },
    {
        title: "Financeiro",
        icon: CreditCard,
        href: "/financeiro/faturas",
    },
    {
        title: "Relatórios",
        icon: BarChart3,
        href: "/relatorios",
    },
    {
        title: "Materiais",
        icon: Download,
        href: "/materiais",
    },
    {
        title: "Suporte",
        icon: Headset,
        href: "/suporte",
    },
    {
        title: "Admin",
        icon: ShieldCheck,
        items: [
            { title: "Modelos de Sites", href: "/admin/modelos", icon: LayoutTemplate },
            { title: "Materiais de Apoio", href: "/admin/materiais", icon: Download },
        ],
    },
    {
        title: "Configurações",
        icon: Settings,
        href: "/configuracoes",
    },
]

export function Sidebar() {
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [expandedSections, setExpandedSections] = useState<string[]>(["CRM"])

    const toggleSection = (title: string) => {
        setExpandedSections((prev) =>
            prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
        )
    }

    const isItemActive = (href: string) =>
        pathname === href || (href !== "/" && pathname.startsWith(href))

    const isSectionActive = (section: NavSection) => {
        if (section.href) return isItemActive(section.href)
        return section.items?.some((item) => isItemActive(item.href)) ?? false
    }

    return (
        <aside className={cn(
            "hidden md:flex h-screen flex-col bg-[#0d0f1a] overflow-y-auto transition-all duration-300 ease-in-out z-40 border-r border-white/[0.06]",
            isCollapsed ? "w-[72px]" : "w-64"
        )}>
            {/* Header - Logo & Toggle */}
            <div className="flex shrink-0 items-center justify-between px-4 py-5 sticky top-0 bg-[#0d0f1a] z-10">
                <div className={cn("flex items-center gap-3 overflow-hidden", isCollapsed && "w-0 opacity-0")}>
                    <div className="flex shrink-0 h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 shadow-lg shadow-violet-900/30">
                        <span className="text-sm font-bold text-white">S</span>
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate tracking-wide">SWHub</p>
                        <p className="text-[10px] text-gray-500 font-medium">v0.5.0</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={cn(
                        "p-1.5 rounded-md hover:bg-white/10 text-gray-500 hover:text-white transition-colors shrink-0",
                        isCollapsed && "mx-auto"
                    )}
                    title={isCollapsed ? "Expandir" : "Recolher"}
                >
                    {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
                </button>
            </div>

            {/* Navigation */}
            <nav className={cn("flex-1 py-2", isCollapsed ? "px-2" : "px-3")}>
                <div className="space-y-0.5">
                    {navigation.map((section) => {
                        const active = isSectionActive(section)
                        const isExpanded = expandedSections.includes(section.title)
                        const hasItems = section.items && section.items.length > 0

                        if (hasItems) {
                            return (
                                <div key={section.title}>
                                    <button
                                        onClick={() => {
                                            if (!isCollapsed) toggleSection(section.title)
                                        }}
                                        title={isCollapsed ? section.title : undefined}
                                        className={cn(
                                            "flex items-center w-full rounded-xl transition-colors",
                                            active
                                                ? "text-violet-400"
                                                : "text-gray-400 hover:bg-white/[0.04] hover:text-gray-200",
                                            isCollapsed ? "justify-center p-2.5 mx-auto w-10 h-10" : "gap-3 px-3 py-2.5 text-sm font-medium"
                                        )}
                                    >
                                        <section.icon className="h-[18px] w-[18px] shrink-0" />
                                        {!isCollapsed && (
                                            <>
                                                <span className="flex-1 text-left whitespace-nowrap">{section.title}</span>
                                                <ChevronDown className={cn(
                                                    "h-4 w-4 shrink-0 transition-transform duration-200 text-gray-600",
                                                    isExpanded && "rotate-180"
                                                )} />
                                            </>
                                        )}
                                    </button>

                                    {!isCollapsed && isExpanded && (
                                        <div className="ml-4 mt-0.5 space-y-0.5 border-l border-violet-500/10 pl-3">
                                            {section.items!.map((item) => {
                                                const itemActive = isItemActive(item.href)
                                                return (
                                                    <Link
                                                        key={item.href}
                                                        href={item.href}
                                                        className={cn(
                                                            "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                                                            itemActive
                                                                ? "text-white bg-violet-600/20"
                                                                : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]"
                                                        )}
                                                    >
                                                        <item.icon className="h-4 w-4 shrink-0" />
                                                        <span className="whitespace-nowrap">{item.title}</span>
                                                    </Link>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            )
                        }

                        return (
                            <Link
                                key={section.title}
                                href={section.href!}
                                title={isCollapsed ? section.title : undefined}
                                className={cn(
                                    "flex items-center rounded-xl transition-colors",
                                    active
                                        ? "text-white bg-gradient-to-r from-violet-600/30 to-violet-700/10 shadow-sm"
                                        : "text-gray-400 hover:bg-white/[0.04] hover:text-gray-200",
                                    isCollapsed ? "justify-center p-2.5 mx-auto w-10 h-10" : "gap-3 px-3 py-2.5 text-sm font-medium"
                                )}
                            >
                                <section.icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-violet-400")} />
                                {!isCollapsed && <span className="whitespace-nowrap">{section.title}</span>}
                            </Link>
                        )
                    })}
                </div>
            </nav>

            {/* Footer */}
            <div className="border-t border-white/[0.06] p-4 shrink-0 mt-auto sticky bottom-0 bg-[#0d0f1a] overflow-hidden">
                {!isCollapsed ? (
                    <p className="text-[11px] text-gray-600 text-center whitespace-nowrap">
                        SWHub v0.5.0
                    </p>
                ) : (
                    <div className="w-full flex justify-center">
                        <div className="w-2 h-2 rounded-full bg-violet-500/50"></div>
                    </div>
                )}
            </div>
        </aside>
    )
}
