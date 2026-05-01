"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Plus, MoreHorizontal,
    DollarSign, Loader2, Calendar, GripVertical,
    LayoutList, KanbanSquare, Megaphone, Globe, Search, Zap, MessageSquare, HelpCircle,
} from "lucide-react"

import type { CrmPipeline, CrmPipelineStage, CrmDeal, CrmDealStatus, CrmLeadSource } from "@/types/crm"

type ViewMode = 'kanban' | 'list'

const sourceLabels: Record<string, { label: string; color: string }> = {
    ads: { label: 'Ads', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    indicacao: { label: 'Indicação', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
    organico: { label: 'Orgânico', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    whatsapp: { label: 'WhatsApp', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    site: { label: 'Site', color: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
    outro: { label: 'Outro', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
}

const sourceIcon: Record<string, React.ReactNode> = {
    ads: <Megaphone className="h-3 w-3" />,
    indicacao: <Megaphone className="h-3 w-3" />,
    organico: <Search className="h-3 w-3" />,
    whatsapp: <MessageSquare className="h-3 w-3" />,
    site: <Globe className="h-3 w-3" />,
    outro: <HelpCircle className="h-3 w-3" />,
}

export default function CrmDealsPage() {
    const [loading, setLoading] = useState(true)
    const [pipeline, setPipeline] = useState<CrmPipeline | null>(null)
    const [stages, setStages] = useState<CrmPipelineStage[]>([])
    const [deals, setDeals] = useState<CrmDeal[]>([])
    const [viewMode, setViewMode] = useState<ViewMode>('kanban')

    const [draggedDealId, setDraggedDealId] = useState<string | null>(null)

    const loadPipelineData = async () => {
        setLoading(true)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            setLoading(false)
            return
        }

        try {
            let { data: pl_data } = await supabase
                .from('crm_pipelines')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: true })
                .limit(1)
                .single()

            if (!pl_data) {
                const { data: pl_new, error: pl_err } = await supabase
                    .from('crm_pipelines')
                    .insert({ user_id: user.id, name: 'Pipeline Comercial', is_default: true })
                    .select().single()

                if (pl_err) throw pl_err
                pl_data = pl_new

                const defaultStages = [
                    { pipeline_id: pl_data.id, name: 'Lead', order: 1, color: 'gray' },
                    { pipeline_id: pl_data.id, name: 'Qualificado', order: 2, color: 'blue' },
                    { pipeline_id: pl_data.id, name: 'Proposta', order: 3, color: 'amber' },
                    { pipeline_id: pl_data.id, name: 'Fechado', order: 4, color: 'green' },
                    { pipeline_id: pl_data.id, name: 'Retenção', order: 5, color: 'purple' },
                ]
                await supabase.from('crm_pipeline_stages').insert(defaultStages)
            }

            setPipeline(pl_data)

            const { data: stages_data } = await supabase
                .from('crm_pipeline_stages')
                .select('*')
                .eq('pipeline_id', pl_data.id)
                .order('order', { ascending: true })

            if (stages_data) setStages(stages_data)

            const { data: deals_data } = await supabase
                .from('crm_deals')
                .select('*')
                .eq('pipeline_id', pl_data.id)
                .neq('status', 'lost')

            if (deals_data) setDeals(deals_data)

        } catch (error) {
            console.error("Pipeline load error:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadPipelineData()
    }, [])

    // Drag Handlers
    const handleDragStart = (e: React.DragEvent, dealId: string) => {
        setDraggedDealId(dealId)
        e.currentTarget.classList.add('opacity-50', 'scale-95')
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragEnd = (e: React.DragEvent) => {
        e.currentTarget.classList.remove('opacity-50', 'scale-95')
        setDraggedDealId(null)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }

    const handleDrop = async (e: React.DragEvent, targetStageId: string) => {
        e.preventDefault()
        if (!draggedDealId) return

        const dealToMove = deals.find(d => d.id === draggedDealId)
        if (!dealToMove || dealToMove.stage_id === targetStageId) return

        setDeals(prev => prev.map(d =>
            d.id === draggedDealId ? { ...d, stage_id: targetStageId } : d
        ))

        const supabase = createClient()
        const { error } = await supabase
            .from('crm_deals')
            .update({ stage_id: targetStageId })
            .eq('id', draggedDealId)

        if (error) {
            console.error(error)
            loadPipelineData()
            return
        }

        // Auto-create proposal when deal moves to a "Proposta" stage
        const targetStage = stages.find(s => s.id === targetStageId)
        if (targetStage && targetStage.name.toLowerCase().includes('proposta')) {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                // Check if proposal already exists for this deal
                const { data: existing } = await supabase
                    .from('crm_proposals')
                    .select('id')
                    .eq('deal_id', draggedDealId)
                    .limit(1)

                if (!existing || existing.length === 0) {
                    await supabase.from('crm_proposals').insert({
                        user_id: user.id,
                        title: `Proposta — ${dealToMove.title}`,
                        status: 'draft',
                        total: dealToMove.value || 0,
                        deal_id: draggedDealId,
                    })
                }
            }
        }
    }

    const handleQuickAdd = async (stageId: string) => {
        const title = prompt("Nome do negócio ou empresa:")
        if (!title || !pipeline) return

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const newDeal = {
            user_id: user.id,
            pipeline_id: pipeline.id,
            stage_id: stageId,
            title: title,
            status: 'open' as CrmDealStatus,
            value: 0
        }

        const { data, error } = await supabase
            .from('crm_deals')
            .insert(newDeal)
            .select()
            .single()

        if (!error && data) {
            setDeals(prev => [...prev, data])
        }
    }

    const stageColors: Record<string, string> = {
        'gray': 'bg-gray-500',
        'blue': 'bg-blue-500',
        'orange': 'bg-orange-500',
        'green': 'bg-emerald-500',
        'red': 'bg-red-500',
        'amber': 'bg-amber-500',
        'purple': 'bg-purple-500',
    }

    const stageColorsDot: Record<string, string> = {
        'gray': 'bg-gray-400',
        'blue': 'bg-blue-400',
        'orange': 'bg-orange-400',
        'green': 'bg-emerald-400',
        'red': 'bg-red-400',
        'amber': 'bg-amber-400',
        'purple': 'bg-purple-400',
    }

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

    const getStageForDeal = (deal: CrmDeal) => stages.find(s => s.id === deal.stage_id)

    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center pt-20">
                <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-[calc(100vh-theme(spacing.16))]">
            {/* Header */}
            <div className="flex-none pb-4 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-violet-500/20 text-violet-400">
                            <KanbanSquare className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">CRM — Negócios</h1>
                            <p className="text-sm text-slate-500 dark:text-gray-500">
                                Pipeline: {pipeline?.name || 'Comercial'} · {deals.length} negócio{deals.length !== 1 ? 's' : ''} ativo{deals.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* View Toggle */}
                        <div className="flex items-center rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#12142a] p-0.5">
                            <button
                                onClick={() => setViewMode('kanban')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                    viewMode === 'kanban'
                                        ? 'bg-violet-500/20 text-violet-400'
                                        : 'text-slate-500 dark:text-gray-500 hover:text-slate-700 dark:text-gray-300'
                                }`}
                            >
                                <KanbanSquare className="h-3.5 w-3.5" /> Kanban
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                    viewMode === 'list'
                                        ? 'bg-violet-500/20 text-violet-400'
                                        : 'text-slate-500 dark:text-gray-500 hover:text-slate-700 dark:text-gray-300'
                                }`}
                            >
                                <LayoutList className="h-3.5 w-3.5" /> Lista
                            </button>
                        </div>

                        <Button
                            onClick={() => handleQuickAdd(stages[0]?.id)}
                            className="bg-violet-600 hover:bg-violet-700 text-white text-sm"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Novo Negócio
                        </Button>
                    </div>
                </div>

                {/* Pipeline Summary Bar */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {stages.map((stage) => {
                        const count = deals.filter(d => d.stage_id === stage.id).length
                        const total = deals.filter(d => d.stage_id === stage.id).reduce((s, d) => s + (d.value || 0), 0)
                        const colorClass = stageColorsDot[stage.color || 'blue'] || 'bg-blue-400'
                        return (
                            <div key={stage.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-[#12142a] border border-slate-200 dark:border-white/[0.06] min-w-fit">
                                <div className={`h-2 w-2 rounded-full ${colorClass}`} />
                                <span className="text-xs text-gray-400 font-medium">{stage.name}</span>
                                <span className="text-xs text-white font-bold">{count}</span>
                                <span className="text-[10px] text-slate-400 dark:text-gray-600">·</span>
                                <span className="text-[10px] text-slate-500 dark:text-gray-500">{formatCurrency(total)}</span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Kanban View */}
            {viewMode === 'kanban' && (
                <div className="flex-1 overflow-x-auto overflow-y-hidden pb-8 pt-2">
                    <div className="flex h-full gap-4 items-start">
                        {stages.map((stage) => {
                            const stageDeals = deals.filter(d => d.stage_id === stage.id)
                            const stageTotal = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0)
                            const colorClass = stageColors[stage.color || 'blue'] || 'bg-primary'

                            return (
                                <div
                                    key={stage.id}
                                    className="flex flex-col flex-none w-[300px] max-h-full rounded-xl bg-white dark:bg-[#12142a] border border-slate-200 dark:border-white/[0.06]"
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, stage.id)}
                                >
                                    {/* Stage Header */}
                                    <div className="p-3 pb-2 flex items-center justify-between shrink-0">
                                        <div className="flex items-center gap-2">
                                            <div className={`h-2.5 w-2.5 rounded-full ${colorClass}`} />
                                            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">{stage.name}</h3>
                                            <span className="text-[10px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded-full font-medium">
                                                {stageDeals.length}
                                            </span>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-slate-400 dark:text-gray-600 hover:text-slate-700 dark:text-gray-300">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="px-3 pb-2 shrink-0">
                                        <span className="text-[10px] text-slate-400 dark:text-gray-600 font-medium">
                                            Total: {formatCurrency(stageTotal)}
                                        </span>
                                    </div>

                                    {/* Deal Cards */}
                                    <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2 min-h-[80px]">
                                        {stageDeals.map((deal) => (
                                            <div
                                                key={deal.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, deal.id)}
                                                onDragEnd={handleDragEnd}
                                                className="group cursor-grab active:cursor-grabbing rounded-lg bg-slate-50 dark:bg-[#1a1f3a] border border-slate-200 dark:border-white/[0.06] p-3 hover:border-violet-500/30 transition-all duration-200"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="space-y-1 pr-2 min-w-0">
                                                        <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight truncate">{deal.title}</p>
                                                        <p className="text-[11px] text-slate-500 dark:text-gray-500">
                                                            {deal.contact_id ? 'Contato vinculado' : 'Sem contato'}
                                                        </p>
                                                    </div>
                                                    <GripVertical className="h-4 w-4 text-gray-700 opacity-0 group-hover:opacity-50 transition-opacity shrink-0" />
                                                </div>

                                                <div className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-1.5 font-medium text-violet-400">
                                                        <DollarSign className="h-3 w-3" />
                                                        {deal.value > 0 ? formatCurrency(deal.value) : '---'}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {deal.source && sourceLabels[deal.source] && (
                                                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${sourceLabels[deal.source].color}`}>
                                                                {sourceIcon[deal.source]}
                                                                {sourceLabels[deal.source].label}
                                                            </span>
                                                        )}
                                                        <span className="flex items-center gap-1 text-slate-400 dark:text-gray-600">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(deal.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Quick Add */}
                                    <div className="p-3 pt-1 shrink-0">
                                        <button
                                            onClick={() => handleQuickAdd(stage.id)}
                                            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-slate-400 dark:text-gray-600 hover:text-slate-700 dark:text-gray-300 hover:bg-white/5 text-xs font-medium transition-colors"
                                        >
                                            <Plus className="h-3 w-3" /> Adicionar
                                        </button>
                                    </div>
                                </div>
                            )
                        })}

                        <div className="flex-none w-[280px] shrink-0">
                            <button className="w-full border border-dashed border-slate-200 dark:border-white/10 rounded-xl h-12 text-slate-400 dark:text-gray-600 hover:text-gray-400 hover:border-white/20 text-xs font-medium transition-colors flex items-center justify-center gap-2">
                                <Plus className="h-3.5 w-3.5" /> Novo Estágio
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
                <div className="flex-1 overflow-y-auto pb-8 pt-2">
                    <div className="rounded-xl bg-white dark:bg-[#12142a] border border-slate-200 dark:border-white/[0.06] overflow-hidden">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 p-4 text-[11px] font-semibold text-slate-500 dark:text-gray-500 uppercase tracking-wider border-b border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-[#0d0f1a]">
                            <div className="col-span-4">Negócio</div>
                            <div className="col-span-2">Estágio</div>
                            <div className="col-span-2 text-right">Valor</div>
                            <div className="col-span-2 text-center">Origem</div>
                            <div className="col-span-2 text-right">Data</div>
                        </div>

                        {/* Rows */}
                        {deals.length === 0 ? (
                            <div className="flex items-center justify-center py-16 text-slate-400 dark:text-gray-600 text-sm">
                                Nenhum negócio ativo. Crie o primeiro acima.
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-200 dark:divide-white/5">
                                {deals.map((deal) => {
                                    const stage = getStageForDeal(deal)
                                    const colorClass = stageColorsDot[stage?.color || 'blue'] || 'bg-blue-400'

                                    return (
                                        <div key={deal.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group cursor-pointer">
                                            <div className="col-span-4">
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{deal.title}</p>
                                                <p className="text-[11px] text-slate-400 dark:text-gray-600 mt-0.5">
                                                    {deal.contact_id ? 'Contato vinculado' : 'Sem contato'}
                                                </p>
                                            </div>

                                            <div className="col-span-2">
                                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-gray-300">
                                                    <div className={`h-2 w-2 rounded-full ${colorClass}`} />
                                                    {stage?.name || '—'}
                                                </span>
                                            </div>

                                            <div className="col-span-2 text-right">
                                                <span className="text-sm font-semibold text-violet-400">
                                                    {deal.value > 0 ? formatCurrency(deal.value) : '---'}
                                                </span>
                                            </div>

                                            <div className="col-span-2 flex justify-center">
                                                {deal.source && sourceLabels[deal.source] ? (
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium border ${sourceLabels[deal.source].color}`}>
                                                        {sourceIcon[deal.source]}
                                                        {sourceLabels[deal.source].label}
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-gray-700">—</span>
                                                )}
                                            </div>

                                            <div className="col-span-2 text-right text-xs text-slate-500 dark:text-gray-500">
                                                {new Date(deal.created_at).toLocaleDateString('pt-BR')}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
