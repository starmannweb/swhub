"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import {
    BarChart3, Eye, Clock, TrendingUp, Users, DollarSign,
    ArrowDownRight, Megaphone, Filter,
} from "lucide-react"

type ReportTab = "sites" | "crm" | "financeiro"

const FUNNEL_COLORS = [
    "bg-blue-400/80",
    "bg-blue-400/60",
    "bg-blue-400/45",
    "bg-blue-400/30",
    "bg-emerald-500/60",
]

export default function RelatoriosPage() {
    const supabase = createClient()
    const [tab, setTab] = useState<ReportTab>("sites")
    const [stages, setStages] = useState<{ name: string; count: number }[]>([])
    const [lostCount, setLostCount] = useState(0)

    useEffect(() => {
        if (tab === "crm") fetchFunnel()
    }, [tab])

    async function fetchFunnel() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: pipeline } = await supabase
            .from("crm_pipelines")
            .select("id")
            .eq("user_id", user.id)
            .eq("is_default", true)
            .single()

        if (!pipeline) return

        const { data: stagesData } = await supabase
            .from("crm_pipeline_stages")
            .select("id, name, order")
            .eq("pipeline_id", pipeline.id)
            .order("order")

        if (!stagesData) return

        const { data: deals } = await supabase
            .from("crm_deals")
            .select("stage_id, status")
            .eq("pipeline_id", pipeline.id)

        const result = stagesData.map(s => ({
            name: s.name,
            count: deals?.filter(d => d.stage_id === s.id && d.status !== 'lost').length || 0,
        }))

        setStages(result)
        setLostCount(deals?.filter(d => d.status === 'lost').length || 0)
    }

    const tabs: { key: ReportTab; label: string; icon: React.ReactNode }[] = [
        { key: "sites", label: "Sites", icon: <Eye className="h-3.5 w-3.5" /> },
        { key: "crm", label: "CRM", icon: <Users className="h-3.5 w-3.5" /> },
        { key: "financeiro", label: "Financeiro", icon: <DollarSign className="h-3.5 w-3.5" /> },
    ]

    const maxFunnelCount = Math.max(...stages.map(s => s.count), 1)

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-500/20 text-violet-400">
                    <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Relatórios</h1>
                    <p className="text-sm text-slate-500 dark:text-gray-500">Análises e métricas do sistema</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1e1e1e] p-0.5 w-fit">
                {tabs.map(t => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium transition-colors ${
                            tab === t.key
                                ? "bg-violet-500/20 text-violet-600 dark:text-violet-400"
                                : "text-slate-500 dark:text-gray-500 hover:text-slate-700 dark:text-gray-300"
                        }`}
                    >
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            {/* ── Sites Tab ── */}
            {tab === "sites" && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="rounded-xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs text-slate-500 dark:text-gray-500 font-medium">Visualizações</span>
                                <Eye className="h-4 w-4 text-blue-400" />
                            </div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">0</p>
                            <p className="text-[10px] text-slate-400 dark:text-gray-600 mt-1">Total de visitas nos seus sites</p>
                        </div>
                        <div className="rounded-xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs text-slate-500 dark:text-gray-500 font-medium">Tempo Médio</span>
                                <Clock className="h-4 w-4 text-amber-400" />
                            </div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">0s</p>
                            <p className="text-[10px] text-slate-400 dark:text-gray-600 mt-1">Tempo médio por sessão</p>
                        </div>
                        <div className="rounded-xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs text-slate-500 dark:text-gray-500 font-medium">Taxa de Conversão</span>
                                <TrendingUp className="h-4 w-4 text-emerald-400" />
                            </div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">0%</p>
                            <p className="text-[10px] text-slate-400 dark:text-gray-600 mt-1">Visitantes que converteram</p>
                        </div>
                        <div className="rounded-xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs text-slate-500 dark:text-gray-500 font-medium">Visitantes Únicos</span>
                                <Users className="h-4 w-4 text-violet-400" />
                            </div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">0</p>
                            <p className="text-[10px] text-slate-400 dark:text-gray-600 mt-1">Pessoas distintas</p>
                        </div>
                    </div>

                    <div className="rounded-xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 p-8 text-center">
                        <Eye className="h-8 w-8 text-gray-700 mx-auto mb-3" />
                        <p className="text-sm text-gray-400 font-semibold">Rastreamento em breve</p>
                        <p className="text-xs text-slate-400 dark:text-gray-600 mt-1">As métricas de visitação serão coletadas automaticamente após configurar o tracking nos seus sites.</p>
                    </div>
                </div>
            )}

            {/* ── CRM Tab (Funnel) ── */}
            {tab === "crm" && (
                <div className="space-y-6">
                    <div className="rounded-xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 p-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Funil de Negócios</h2>

                        {stages.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-sm text-slate-500 dark:text-gray-500">Crie negócios no pipeline para visualizar o funil.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3 max-w-md mx-auto">
                                {stages.map((stage, i) => {
                                    const widthPercent = 100 - (i * (60 / stages.length))
                                    return (
                                        <div
                                            key={stage.name}
                                            className={`${FUNNEL_COLORS[i % FUNNEL_COLORS.length]} rounded-full flex items-center justify-between px-6 py-3 transition-all`}
                                            style={{ width: `${widthPercent}%` }}
                                        >
                                            <span className="text-sm font-medium text-slate-900 dark:text-white">{stage.name}</span>
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">{stage.count}</span>
                                        </div>
                                    )
                                })}

                                {/* Lost deals circle */}
                                <div className="mt-4 flex flex-col items-center">
                                    <div className="w-16 h-16 rounded-full bg-blue-500 flex flex-col items-center justify-center text-white">
                                        <span className="text-lg font-bold">{lostCount}</span>
                                    </div>
                                    <span className="text-xs text-slate-500 dark:text-gray-500 mt-2">Negócio perdido</span>
                                    <span className="text-[10px] text-slate-400 dark:text-gray-600">Negócio perdido {lostCount}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* CRM extra cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="rounded-xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs text-slate-500 dark:text-gray-500 font-medium">Rastreamento</span>
                                <Filter className="h-4 w-4 text-blue-400" />
                            </div>
                            <p className="text-xs text-slate-400 dark:text-gray-600">Acompanhe de onde vêm seus leads (Ads, Indicação, Orgânico)</p>
                        </div>
                        <div className="rounded-xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs text-slate-500 dark:text-gray-500 font-medium">Tarefas</span>
                                <BarChart3 className="h-4 w-4 text-amber-400" />
                            </div>
                            <p className="text-xs text-slate-400 dark:text-gray-600">Métricas de tarefas concluídas vs pendentes</p>
                        </div>
                        <div className="rounded-xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs text-slate-500 dark:text-gray-500 font-medium">Propostas</span>
                                <TrendingUp className="h-4 w-4 text-emerald-400" />
                            </div>
                            <p className="text-xs text-slate-400 dark:text-gray-600">Taxa de aprovação e valor total de propostas</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Financeiro Tab ── */}
            {tab === "financeiro" && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="rounded-xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs text-slate-500 dark:text-gray-500 font-medium">Gastos em Ads</span>
                                <Megaphone className="h-4 w-4 text-blue-400" />
                            </div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">R$ 0,00</p>
                            <p className="text-[10px] text-slate-400 dark:text-gray-600 mt-1">Total investido em anúncios</p>
                        </div>
                        <div className="rounded-xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs text-slate-500 dark:text-gray-500 font-medium">Entrada de Clientes</span>
                                <DollarSign className="h-4 w-4 text-emerald-400" />
                            </div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">R$ 0,00</p>
                            <p className="text-[10px] text-slate-400 dark:text-gray-600 mt-1">Receita total de novos clientes</p>
                        </div>
                        <div className="rounded-xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs text-slate-500 dark:text-gray-500 font-medium">ROI</span>
                                <ArrowDownRight className="h-4 w-4 text-amber-400" />
                            </div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">0%</p>
                            <p className="text-[10px] text-slate-400 dark:text-gray-600 mt-1">Retorno sobre investimento</p>
                        </div>
                    </div>

                    <div className="rounded-xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 p-8 text-center">
                        <DollarSign className="h-8 w-8 text-gray-700 mx-auto mb-3" />
                        <p className="text-sm text-gray-400 font-semibold">Integração financeira em breve</p>
                        <p className="text-xs text-slate-400 dark:text-gray-600 mt-1">Conecte suas contas de Ads e pagamentos para visualizar relatórios financeiros automaticamente.</p>
                    </div>
                </div>
            )}
        </div>
    )
}
