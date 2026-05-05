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
    FileText,
    CreditCard,
    Megaphone,
    PanelLeftClose,
    PanelLeftOpen,
    ChevronDown,
    GraduationCap,
    Headset,
    type LucideIcon,
} from "lucide-react"

interface NavItem {
    title: string
    href: string
    icon: LucideIcon
    adminOnly?: boolean
    external?: boolean
}

interface NavSection {
    title: string
    icon: LucideIcon
    href?: string
    items?: NavItem[]
    adminOnly?: boolean
    external?: boolean
}

const navigation: NavSection[] = [
    {
        title: "Início",
        icon: LayoutDashboard,
        href: "/",
    },
    {
        title: "Leads",
        icon: Users,
        href: "/crm/contatos",
    },
    {
        title: "CRM",
        icon: KanbanSquare,
        href: "/crm/negocios",
    },
    {
        title: "Propostas",
        icon: FileText,
        href: "/crm/propostas",
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
        title: "Automações",
        icon: Zap,
        href: "/automacoes",
    },
    {
        title: "Afiliados",
        icon: Megaphone,
        href: "/afiliados",
    },
    {
        title: "Treinamentos",
        icon: GraduationCap,
        href: "/treinamentos",
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
        title: "Suporte",
        icon: Headset,
        href: "/suporte",
    },
    {
        title: "Configurações",
        icon: Settings,
        href: "/configuracoes",
    },
]

export function Sidebar({ isAdmin = false }: { isAdmin?: boolean }) {
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [expandedSections, setExpandedSections] = useState<string[]>(["CRM", "Admin"])

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
            "hidden md:flex h-screen flex-col bg-white dark:bg-[#0d0f1a] overflow-y-auto transition-all duration-300 ease-in-out z-40 border-r border-slate-200 dark:border-white/[0.06]",
            isCollapsed ? "w-[72px]" : "w-64"
        )}>
            {/* Header - Logo & Toggle */}
            <div className="flex shrink-0 items-center justify-between px-4 py-5 sticky top-0 bg-white dark:bg-[#0d0f1a] z-10">
                <div className={cn("flex items-center gap-3 overflow-hidden", isCollapsed && "w-0 opacity-0")}>
                    <div className="flex shrink-0 h-10 w-10 items-center justify-center">
                        <img src="/sw-hub-logo.webp" alt="SWHub Logo" className="h-full w-full object-contain" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate tracking-wide">SWHub</p>
                        <p className="text-[10px] text-gray-500 font-medium">v0.5.0</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={cn(
                        "p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-900 dark:hover:bg-white/10 dark:text-gray-500 dark:hover:text-white transition-colors shrink-0",
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
                    {navigation.filter(section => !section.adminOnly || isAdmin).map((section) => {
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
                                                ? "bg-gradient-to-r from-violet-100 via-purple-100 to-fuchsia-50 text-violet-700 ring-1 ring-violet-200/70 shadow-sm dark:from-violet-600/35 dark:via-purple-600/25 dark:to-fuchsia-600/15 dark:text-white dark:ring-violet-400/10"
                                                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-white/[0.06] dark:hover:text-gray-200",
                                            isCollapsed ? "justify-center p-2.5 mx-auto w-10 h-10" : "gap-3 px-3 py-2.5 text-sm font-medium"
                                        )}
                                    >
                                        <section.icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-violet-600 dark:text-violet-300")} />
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
                                        <div className="ml-5 mt-1 space-y-1 border-l border-slate-200 dark:border-white/10">
                                            {section.items!.filter(item => !item.adminOnly || isAdmin).map((item) => {
                                                const itemActive = isItemActive(item.href)
                                                return (
                                                    <Link
                                                        key={item.href}
                                                        href={item.href}
                                                        target={item.external ? "_blank" : undefined}
                                                        className={cn(
                                                            "flex items-center gap-3 px-4 py-2 text-[13px] font-medium transition-all relative",
                                                            itemActive
                                                                ? "bg-gradient-to-r from-violet-100 via-purple-100 to-fuchsia-50 text-violet-700 dark:from-violet-600/35 dark:via-purple-600/25 dark:to-fuchsia-600/15 dark:text-white"
                                                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-white/[0.06]"
                                                        )}
                                                    >
                                                        {itemActive && (
                                                            <div className="absolute left-[-1px] top-0 bottom-0 w-[2px] bg-violet-600 dark:bg-violet-300 rounded-r-full" />
                                                        )}
                                                        <item.icon className={cn("h-[14px] w-[14px] shrink-0", itemActive && "text-violet-600 dark:text-violet-300")} />
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
                                target={section.external ? "_blank" : undefined}
                                title={isCollapsed ? section.title : undefined}
                                className={cn(
                                    "flex items-center rounded-xl transition-colors",
                                    active
                                        ? "bg-gradient-to-r from-violet-100 via-purple-100 to-fuchsia-50 text-violet-700 ring-1 ring-violet-200/70 shadow-sm dark:from-violet-600/35 dark:via-purple-600/25 dark:to-fuchsia-600/15 dark:text-white dark:ring-violet-400/10"
                                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-white/[0.06] dark:hover:text-gray-200",
                                    isCollapsed ? "justify-center p-2.5 mx-auto w-10 h-10" : "gap-3 px-3 py-2.5 text-sm font-medium"
                                )}
                            >
                                <section.icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-violet-600 dark:text-violet-300")} />
                                {!isCollapsed && <span className="whitespace-nowrap">{section.title}</span>}
                            </Link>
                        )
                    })}
                </div>
            </nav>

            {/* Footer */}
            <div className="border-t border-slate-200 dark:border-white/[0.06] p-4 shrink-0 mt-auto sticky bottom-0 bg-white dark:bg-[#0d0f1a] overflow-hidden">
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
