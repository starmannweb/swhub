"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Settings, Plus, Trash2, Loader2, Save, KanbanSquare, ShieldCheck, LayoutTemplate, Download, ArrowRight, Bot, Share2, CreditCard, CheckCircle2, Clock, PlugZap, UserCog, Users, Mail
} from "lucide-react"
import Link from "next/link"

type PipelineStage = {
    id: string
    pipeline_id: string
    name: string
    order: number
    color: string
}

type ConfigTab = "geral" | "pipeline" | "integracoes" | "financeiro" | "equipe" | "admin"

const CONFIG_TABS: ConfigTab[] = ["geral", "pipeline", "integracoes", "financeiro", "equipe", "admin"]

type TeamRole = "admin" | "manager" | "sales" | "support"

type TeamMember = {
    id: string
    full_name: string | null
    email?: string | null
    role: string | null
    is_admin?: boolean | null
    created_at?: string | null
}

const TEAM_ROLES: { value: TeamRole; label: string; description: string }[] = [
    { value: "admin", label: "Administrador", description: "Acesso total a admin, dados e configuracoes." },
    { value: "manager", label: "Gestor", description: "Gerencia operacao, CRM e relatorios." },
    { value: "sales", label: "Comercial", description: "Opera leads, negocios e propostas." },
    { value: "support", label: "Suporte", description: "Atende clientes e acompanha materiais." },
]

const STAGE_COLORS = [
    { value: "gray", label: "Cinza", bg: "bg-gray-400" },
    { value: "blue", label: "Azul", bg: "bg-blue-400" },
    { value: "amber", label: "Amarelo", bg: "bg-amber-400" },
    { value: "green", label: "Verde", bg: "bg-green-400" },
    { value: "purple", label: "Roxo", bg: "bg-purple-400" },
    { value: "red", label: "Vermelho", bg: "bg-red-400" },
    { value: "pink", label: "Rosa", bg: "bg-pink-400" },
    { value: "emerald", label: "Esmeralda", bg: "bg-emerald-400" },
]

function isConfigTab(value: string | null): value is ConfigTab {
    return CONFIG_TABS.includes(value as ConfigTab)
}

export default function ConfiguracoesPage() {
    const supabase = useMemo(() => createClient(), [])
    const router = useRouter()
    const searchParams = useSearchParams()
    const tabParam = searchParams.get("tab")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [pipelineId, setPipelineId] = useState<string | null>(null)
    const [pipelineName, setPipelineName] = useState("")
    const [stages, setStages] = useState<PipelineStage[]>([])
    const [tab, setTab] = useState<ConfigTab>(() => isConfigTab(tabParam) ? tabParam : "geral")
    const [isAdmin, setIsAdmin] = useState(false)
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
    const [teamLoading, setTeamLoading] = useState(false)
    const [teamFeedback, setTeamFeedback] = useState("")
    const [newMember, setNewMember] = useState({ name: "", email: "", role: "sales" as TeamRole })

    const handleTabChange = useCallback((nextTab: ConfigTab) => {
        setTab(nextTab)
        router.replace(nextTab === "geral" ? "/configuracoes" : `/configuracoes?tab=${nextTab}`, { scroll: false })
    }, [router])

    const fetchPipeline = useCallback(async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            setLoading(false)
            return
        }

        // Check if admin
        const { data: profileData } = await supabase.from('profiles').select('is_admin, role').eq('id', user.id).single()
        if (profileData?.is_admin || profileData?.role === 'admin') {
            setIsAdmin(true)
        }

        const { data: pipeline } = await supabase
            .from("crm_pipelines")
            .select("*")
            .eq("user_id", user.id)
            .eq("is_default", true)
            .single()

        if (pipeline) {
            setPipelineId(pipeline.id)
            setPipelineName(pipeline.name)

            const { data: stagesData } = await supabase
                .from("crm_pipeline_stages")
                .select("*")
                .eq("pipeline_id", pipeline.id)
                .order("order")

            setStages(stagesData || [])
        }
        setLoading(false)
    }, [supabase])

    const fetchTeamMembers = useCallback(async () => {
        setTeamLoading(true)
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("id, full_name, email, role, is_admin, created_at")
                .order("created_at", { ascending: false })

            if (!error) {
                setTeamMembers((data || []) as TeamMember[])
                return
            }

            const { data: fallbackData } = await supabase
                .from("profiles")
                .select("id, full_name, role, is_admin, created_at")
                .order("created_at", { ascending: false })

            setTeamMembers((fallbackData || []) as TeamMember[])
        } finally {
            setTeamLoading(false)
        }
    }, [supabase])

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void fetchPipeline()
            void fetchTeamMembers()
        }, 0)

        return () => window.clearTimeout(timer)
    }, [fetchPipeline, fetchTeamMembers])

    useEffect(() => {
        const timer = window.setTimeout(() => {
            if (isConfigTab(tabParam) && tabParam !== tab) {
                setTab(tabParam)
            }
        }, 0)

        return () => window.clearTimeout(timer)
    }, [tab, tabParam])

    function handleAddStage() {
        if (!pipelineId) return
        const maxOrder = stages.length > 0 ? Math.max(...stages.map(s => s.order)) : 0
        setStages([...stages, {
            id: `new_${Date.now()}`,
            pipeline_id: pipelineId,
            name: "",
            order: maxOrder + 1,
            color: "gray",
        }])
    }

    function handleRemoveStage(id: string) {
        setStages(stages.filter(s => s.id !== id))
    }

    function handleStageChange(id: string, field: "name" | "color", value: string) {
        setStages(stages.map(s => s.id === id ? { ...s, [field]: value } : s))
    }

    function handleMoveStage(index: number, direction: "up" | "down") {
        const newStages = [...stages]
        const swapIndex = direction === "up" ? index - 1 : index + 1
        if (swapIndex < 0 || swapIndex >= newStages.length) return

        const tempOrder = newStages[index].order
        newStages[index].order = newStages[swapIndex].order
        newStages[swapIndex].order = tempOrder

        const temp = newStages[index]
        newStages[index] = newStages[swapIndex]
        newStages[swapIndex] = temp

        setStages(newStages)
    }

    async function handleSave() {
        if (!pipelineId) return
        setSaving(true)

        // Update pipeline name
        await supabase.from("crm_pipelines").update({ name: pipelineName }).eq("id", pipelineId)

        // Get existing stages
        const { data: existing } = await supabase
            .from("crm_pipeline_stages")
            .select("id")
            .eq("pipeline_id", pipelineId)

        const existingIds = existing?.map(e => e.id) || []
        const currentIds = stages.filter(s => !s.id.startsWith("new_")).map(s => s.id)

        // Delete removed stages
        const toDelete = existingIds.filter(id => !currentIds.includes(id))
        for (const id of toDelete) {
            await supabase.from("crm_pipeline_stages").delete().eq("id", id)
        }

        // Upsert stages
        for (const stage of stages) {
            if (stage.id.startsWith("new_")) {
                await supabase.from("crm_pipeline_stages").insert({
                    pipeline_id: pipelineId,
                    name: stage.name,
                    order: stage.order,
                    color: stage.color,
                })
            } else {
                await supabase.from("crm_pipeline_stages").update({
                    name: stage.name,
                    order: stage.order,
                    color: stage.color,
                }).eq("id", stage.id)
            }
        }

        await fetchPipeline()
        setSaving(false)
        alert("Pipeline salvo com sucesso!")
    }

    async function handleTeamRoleChange(memberId: string, role: TeamRole) {
        setTeamFeedback("")
        const { error } = await supabase
            .from("profiles")
            .update({ role, is_admin: role === "admin" })
            .eq("id", memberId)

        if (error) {
            setTeamFeedback("Nao foi possivel alterar o nivel desse usuario.")
            return
        }

        setTeamFeedback("Nivel atualizado com sucesso.")
        void fetchTeamMembers()
    }

    function handleInviteMember(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!newMember.email.trim()) {
            setTeamFeedback("Informe o e-mail do usuario.")
            return
        }

        const roleLabel = TEAM_ROLES.find((role) => role.value === newMember.role)?.label || "Comercial"
        const subject = "Convite para acessar o SWHub"
        const body = `Ola${newMember.name ? ` ${newMember.name}` : ""},\n\nVoce foi convidado para acessar o SWHub com nivel ${roleLabel}.\n\nAcesse a plataforma e finalize seu cadastro.`

        window.location.href = `mailto:${newMember.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
        setTeamFeedback("Convite preparado no seu cliente de e-mail.")
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 text-slate-500 dark:bg-gray-500/20 dark:text-gray-400">
                    <Settings className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Configurações</h1>
                    <p className="text-sm text-slate-500 dark:text-gray-500">Ajustes da conta e do sistema</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center flex-wrap gap-2 md:gap-0 md:flex-nowrap rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#12142a] p-0.5 w-fit">
                <button
                    onClick={() => handleTabChange("geral")}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium transition-colors ${
                        tab === "geral" ? "bg-white dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 shadow-sm" : "text-slate-500 hover:text-slate-900 dark:text-gray-500 dark:hover:text-gray-300"
                    }`}
                >
                    <Settings className="h-3.5 w-3.5" /> Geral
                </button>
                <button
                    onClick={() => handleTabChange("pipeline")}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium transition-colors ${
                        tab === "pipeline" ? "bg-white dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 shadow-sm" : "text-slate-500 hover:text-slate-900 dark:text-gray-500 dark:hover:text-gray-300"
                    }`}
                >
                    <KanbanSquare className="h-3.5 w-3.5" /> Pipeline CRM
                </button>
                <button
                    onClick={() => handleTabChange("integracoes")}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium transition-colors ${
                        tab === "integracoes" ? "bg-white dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 shadow-sm" : "text-slate-500 hover:text-slate-900 dark:text-gray-500 dark:hover:text-gray-300"
                    }`}
                >
                    <Share2 className="h-3.5 w-3.5" /> Marketplace & Integrações
                </button>
                <button
                    onClick={() => handleTabChange("financeiro")}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium transition-colors ${
                        tab === "financeiro" ? "bg-white dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 shadow-sm" : "text-slate-500 hover:text-slate-900 dark:text-gray-500 dark:hover:text-gray-300"
                    }`}
                >
                    <CreditCard className="h-3.5 w-3.5" /> Situação Financeira
                </button>
                <button
                    onClick={() => handleTabChange("equipe")}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium transition-colors ${
                        tab === "equipe" ? "bg-white dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 shadow-sm" : "text-slate-500 hover:text-slate-900 dark:text-gray-500 dark:hover:text-gray-300"
                    }`}
                >
                    <UserCog className="h-3.5 w-3.5" /> Equipe & Acessos
                </button>
                {isAdmin && (
                    <button
                        onClick={() => handleTabChange("admin")}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium transition-colors ${
                            tab === "admin" ? "bg-white dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 shadow-sm" : "text-slate-500 hover:text-slate-900 dark:text-gray-500 dark:hover:text-gray-300"
                        }`}
                    >
                        <ShieldCheck className="h-3.5 w-3.5" /> Administração
                    </button>
                )}
            </div>

            {/* Situação Financeira Tab */}
            {tab === "financeiro" && (
                <div className="space-y-5 w-full">
                    <div className="rounded-xl bg-white dark:bg-[#12142a] border border-slate-200 dark:border-white/[0.06] p-6 shadow-sm">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">Plataforma ativa</p>
                                    <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">Sua conta está apta para usar CRM, sites, propostas e automações.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Em dia
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="rounded-xl bg-white dark:bg-[#12142a] border border-slate-200 dark:border-white/[0.06] p-5 shadow-sm">
                            <p className="text-xs font-semibold text-slate-500 dark:text-gray-400">Plano atual</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white mt-2">SWHub Pro</p>
                            <p className="text-xs text-slate-400 dark:text-gray-600 mt-1">Recursos principais liberados</p>
                        </div>
                        <div className="rounded-xl bg-white dark:bg-[#12142a] border border-slate-200 dark:border-white/[0.06] p-5 shadow-sm">
                            <p className="text-xs font-semibold text-slate-500 dark:text-gray-400">Próxima cobrança</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white mt-2">A definir</p>
                            <p className="text-xs text-slate-400 dark:text-gray-600 mt-1">Conecte o gateway para automatizar</p>
                        </div>
                        <div className="rounded-xl bg-white dark:bg-[#12142a] border border-slate-200 dark:border-white/[0.06] p-5 shadow-sm">
                            <p className="text-xs font-semibold text-slate-500 dark:text-gray-400">Faturas da plataforma</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white mt-2">0 pendentes</p>
                            <p className="text-xs text-slate-400 dark:text-gray-600 mt-1">Histórico financeiro em preparação</p>
                        </div>
                    </div>

                    <div className="rounded-xl bg-white dark:bg-[#12142a] border border-slate-200 dark:border-white/[0.06] p-5 shadow-sm">
                        <div className="flex items-start gap-3">
                            <Clock className="h-5 w-5 text-amber-500 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">Gestão financeira da plataforma</p>
                                <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">Este espaço fica reservado para assinatura, faturas, pagamentos e gateway da própria plataforma.</p>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* Integrações Tab */}
            {tab === "integracoes" && (
                <div className="space-y-6 w-full">
                    <div className="rounded-xl bg-white dark:bg-[#12142a] border border-slate-200 dark:border-white/[0.06] p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="h-10 w-10 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center">
                                <PlugZap className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Marketplace de Integrações</h2>
                                <p className="text-xs text-slate-500 dark:text-gray-400">Conectores essenciais para captar leads, automatizar e medir resultados.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            {[
                                { name: "OpenAI", desc: "Geração de sites e automações com IA", status: "Configurar" },
                                { name: "Meta Ads", desc: "Leads, pixel e API de conversões", status: "Configurar" },
                                { name: "Resend", desc: "E-mails transacionais e suporte", status: "Configurar" },
                                { name: "WhatsApp", desc: "Disparos e atendimento conectado", status: "Em breve" },
                            ].map((item) => (
                                <div key={item.name} className="rounded-lg border border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-[#0d0f1a] p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
                                        </div>
                                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                            item.status === "Em breve"
                                                ? "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                                                : "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300"
                                        }`}>
                                            {item.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* IA Integration */}
                        <div className="rounded-xl bg-white dark:bg-[#12142a] border border-slate-200 dark:border-white/[0.06] p-6 space-y-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-violet-500/10">
                                    <Bot className="h-6 w-6 text-violet-500" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Integração com IA</h2>
                                    <p className="text-xs text-slate-500 dark:text-gray-400">Configure seu assistente e geração de sites.</p>
                                </div>
                            </div>
                            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-white/[0.06]">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 dark:text-gray-400">API Key OpenAI</label>
                                    <Input
                                        type="password"
                                        placeholder="sk-..."
                                        className="bg-slate-50 dark:bg-[#0d0f1a] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white"
                                    />
                                </div>
                                <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white">
                                    Salvar Configuração de IA
                                </Button>
                            </div>
                        </div>

                        {/* Meta Integration */}
                        <div className="rounded-xl bg-white dark:bg-[#12142a] border border-slate-200 dark:border-white/[0.06] p-6 space-y-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-blue-500/10">
                                    <Share2 className="h-6 w-6 text-blue-500" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Meta (Facebook/Instagram)</h2>
                                    <p className="text-xs text-slate-500 dark:text-gray-400">Integre campanhas, leads e conversões.</p>
                                </div>
                            </div>
                            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-white/[0.06]">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 dark:text-gray-400">Pixel ID Principal</label>
                                    <Input
                                        placeholder="1234567890"
                                        className="bg-slate-50 dark:bg-[#0d0f1a] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 dark:text-gray-400">Token da API de Conversões (CAPI)</label>
                                    <Input
                                        type="password"
                                        placeholder="EAA..."
                                        className="bg-slate-50 dark:bg-[#0d0f1a] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white"
                                    />
                                </div>
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                    Salvar Integração Meta
                                </Button>
                            </div>
                        </div>

                        <div className="rounded-xl bg-white dark:bg-[#12142a] border border-slate-200 dark:border-white/[0.06] p-6 space-y-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-emerald-500/10">
                                    <Mail className="h-6 w-6 text-emerald-500" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Resend</h2>
                                    <p className="text-xs text-slate-500 dark:text-gray-400">Envios transacionais e solicitacoes de suporte.</p>
                                </div>
                            </div>
                            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-white/[0.06]">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 dark:text-gray-400">RESEND_API_KEY</label>
                                    <Input
                                        type="password"
                                        placeholder="re_..."
                                        className="bg-slate-50 dark:bg-[#0d0f1a] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 dark:text-gray-400">Remetente padrao</label>
                                    <Input
                                        placeholder="SWHub <suporte@seudominio.com>"
                                        className="bg-slate-50 dark:bg-[#0d0f1a] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white"
                                    />
                                </div>
                                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                                    Salvar Integracao Resend
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Equipe Tab */}
            {tab === "equipe" && (
                <div className="space-y-6 w-full">
                    {teamFeedback && (
                        <div className="rounded-lg border border-violet-200 bg-violet-50 px-4 py-3 text-xs text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300">
                            {teamFeedback}
                        </div>
                    )}

                    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6">
                        <div className="rounded-xl bg-white dark:bg-[#12142a] border border-slate-200 dark:border-white/[0.06] p-6 shadow-sm">
                            <div className="flex items-center justify-between gap-4 mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Usuarios e niveis</h2>
                                        <p className="text-xs text-slate-500 dark:text-gray-400">Gerencie quem administra a empresa dentro da plataforma.</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => void fetchTeamMembers()}>
                                    Atualizar
                                </Button>
                            </div>

                            {teamLoading ? (
                                <div className="flex justify-center py-10">
                                    <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
                                </div>
                            ) : teamMembers.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center dark:border-white/10">
                                    <Users className="h-8 w-8 text-slate-300 dark:text-gray-700 mx-auto mb-2" />
                                    <p className="text-sm font-semibold text-slate-700 dark:text-gray-300">Nenhum usuario listado</p>
                                    <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">Verifique as politicas da tabela profiles para liberar a leitura.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {teamMembers.map((member) => (
                                        <div key={member.id} className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/[0.06] dark:bg-[#0d0f1a]">
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{member.full_name || member.email || "Usuario sem nome"}</p>
                                                <p className="text-xs text-slate-500 dark:text-gray-500 truncate">{member.email || member.id}</p>
                                            </div>
                                            <select
                                                value={(member.is_admin ? "admin" : member.role || "sales") as TeamRole}
                                                onChange={(event) => void handleTeamRoleChange(member.id, event.target.value as TeamRole)}
                                                className="h-9 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-violet-400 dark:border-white/10 dark:bg-[#12142a] dark:text-gray-200"
                                                disabled={!isAdmin}
                                            >
                                                {TEAM_ROLES.map((role) => (
                                                    <option key={role.value} value={role.value}>{role.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="rounded-xl bg-white dark:bg-[#12142a] border border-slate-200 dark:border-white/[0.06] p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                    <UserCog className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Convidar usuario</h2>
                                    <p className="text-xs text-slate-500 dark:text-gray-400">Prepare o convite com o nivel de acesso.</p>
                                </div>
                            </div>

                            <form onSubmit={handleInviteMember} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 dark:text-gray-400">Nome</label>
                                    <Input
                                        value={newMember.name}
                                        onChange={(event) => setNewMember({ ...newMember, name: event.target.value })}
                                        placeholder="Nome completo"
                                        className="bg-slate-50 dark:bg-[#0d0f1a] border-slate-200 dark:border-white/[0.06]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 dark:text-gray-400">E-mail</label>
                                    <Input
                                        type="email"
                                        value={newMember.email}
                                        onChange={(event) => setNewMember({ ...newMember, email: event.target.value })}
                                        placeholder="usuario@empresa.com"
                                        className="bg-slate-50 dark:bg-[#0d0f1a] border-slate-200 dark:border-white/[0.06]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 dark:text-gray-400">Nivel</label>
                                    <select
                                        value={newMember.role}
                                        onChange={(event) => setNewMember({ ...newMember, role: event.target.value as TeamRole })}
                                        className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-violet-400 dark:border-white/[0.06] dark:bg-[#0d0f1a] dark:text-white"
                                    >
                                        {TEAM_ROLES.map((role) => (
                                            <option key={role.value} value={role.value}>{role.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white">
                                    Gerar Convite
                                </Button>
                            </form>

                            <div className="mt-5 space-y-2">
                                {TEAM_ROLES.map((role) => (
                                    <div key={role.value} className="rounded-lg bg-slate-50 p-3 dark:bg-[#0d0f1a]">
                                        <p className="text-xs font-semibold text-slate-900 dark:text-white">{role.label}</p>
                                        <p className="text-[11px] text-slate-500 dark:text-gray-500 mt-0.5">{role.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Pipeline Settings */}
            {tab === "pipeline" && (
                <div className="space-y-6 w-full">
                    {loading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="h-6 w-6 animate-spin text-slate-400 dark:text-gray-500" />
                        </div>
                    ) : !pipelineId ? (
                        <div className="rounded-xl bg-white dark:bg-[#12142a] border border-slate-200 dark:border-white/[0.06] p-12 text-center shadow-sm">
                            <KanbanSquare className="h-10 w-10 text-slate-400 dark:text-gray-600 mx-auto mb-3" />
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1">Nenhum pipeline encontrado</h3>
                            <p className="text-xs text-slate-500 dark:text-gray-600">Acesse o CRM para criar seu pipeline automaticamente.</p>
                        </div>
                    ) : (
                        <>
                            {/* Pipeline Name */}
                            <div className="rounded-xl bg-white dark:bg-[#12142a] border border-slate-200 dark:border-white/[0.06] p-6 space-y-4 shadow-sm">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 mb-2 block">Nome do Pipeline</label>
                                    <Input
                                        value={pipelineName}
                                        onChange={(e) => setPipelineName(e.target.value)}
                                        className="bg-slate-50 dark:bg-[#0d0f1a] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white max-w-sm h-11"
                                    />
                                </div>
                            </div>

                            {/* Stages Editor */}
                            <div className="rounded-xl bg-white dark:bg-[#12142a] border border-slate-200 dark:border-white/[0.06] p-6 space-y-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Estágios do Pipeline</h2>
                                        <p className="text-xs text-slate-500 dark:text-gray-500 mt-0.5">Arraste, edite ou remova os estágios do seu funil de vendas</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAddStage}
                                        className="border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
                                    >
                                        <Plus className="mr-1.5 h-3.5 w-3.5" /> Novo Estágio
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    {stages.map((stage, index) => (
                                        <div key={stage.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-[#0d0f1a] border border-slate-200 dark:border-white/[0.06] group">
                                            <div className="flex flex-col gap-0.5">
                                                <button
                                                    onClick={() => handleMoveStage(index, "up")}
                                                    disabled={index === 0}
                                                    className="text-slate-400 hover:text-slate-600 dark:text-gray-600 dark:hover:text-gray-300 disabled:opacity-20 text-[10px]"
                                                >▲</button>
                                                <button
                                                    onClick={() => handleMoveStage(index, "down")}
                                                    disabled={index === stages.length - 1}
                                                    className="text-slate-400 hover:text-slate-600 dark:text-gray-600 dark:hover:text-gray-300 disabled:opacity-20 text-[10px]"
                                                >▼</button>
                                            </div>

                                            <span className="text-xs text-slate-400 dark:text-gray-600 font-mono w-6 text-center">{index + 1}</span>

                                            {/* Color selector */}
                                            <div className="flex items-center gap-1">
                                                {STAGE_COLORS.map(c => (
                                                    <button
                                                        key={c.value}
                                                        onClick={() => handleStageChange(stage.id, "color", c.value)}
                                                        className={`w-4 h-4 rounded-full ${c.bg} transition-all ${
                                                            stage.color === c.value ? "ring-2 ring-white/50 scale-125" : "opacity-40 hover:opacity-80"
                                                        }`}
                                                        title={c.label}
                                                    />
                                                ))}
                                            </div>

                                            <Input
                                                value={stage.name}
                                                onChange={(e) => handleStageChange(stage.id, "name", e.target.value)}
                                                placeholder="Nome do estágio..."
                                                className="bg-transparent border-transparent focus-visible:border-slate-200 dark:border-transparent dark:focus-visible:border-white/10 text-slate-900 dark:text-white text-sm h-9 flex-1"
                                            />

                                            <button
                                                onClick={() => handleRemoveStage(stage.id)}
                                                className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 dark:hover:bg-red-500/10 dark:text-gray-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                                title="Remover"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {stages.length === 0 && (
                                    <div className="text-center py-6">
                                        <p className="text-xs text-slate-500 dark:text-gray-600">Nenhum estágio. Adicione ao menos um.</p>
                                    </div>
                                )}
                            </div>

                            {/* Save */}
                            <div className="flex justify-end">
                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="bg-violet-600 hover:bg-violet-700 text-white px-6"
                                >
                                    {saving ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
                                    ) : (
                                        <><Save className="mr-2 h-4 w-4" /> Salvar Pipeline</>
                                    )}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Geral Tab */}
            {tab === "geral" && (
                <div className="space-y-6 w-full rounded-xl bg-white dark:bg-[#12142a] border border-slate-200 dark:border-white/[0.06] p-8 text-center shadow-sm">
                    <Settings className="h-8 w-8 text-slate-300 dark:text-gray-700 mx-auto mb-3" />
                    <p className="text-sm text-slate-500 dark:text-gray-400 font-semibold">Configurações gerais em breve</p>
                    <p className="text-xs text-slate-400 dark:text-gray-600 mt-1">Preferências do sistema, notificações e comportamento global.</p>
                </div>
            )}

            {/* Admin Tab */}
            {tab === "admin" && isAdmin && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link href="/admin" className="rounded-xl bg-white dark:bg-[#12142a] border border-slate-200 dark:border-white/[0.06] p-6 hover:border-violet-300 dark:hover:border-violet-500/30 transition-colors shadow-sm group">
                        <div className="h-10 w-10 rounded-lg bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-4">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                            Painel de Controle <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">Visão geral, gestão de usuários, planos e estatísticas vitais do Hub.</p>
                    </Link>

                    <Link href="/admin/modelos" className="rounded-xl bg-white dark:bg-[#12142a] border border-slate-200 dark:border-white/[0.06] p-6 hover:border-blue-300 dark:hover:border-blue-500/30 transition-colors shadow-sm group">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                            <LayoutTemplate className="h-5 w-5" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                            Modelos de Sites <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">Gerencie os templates disponíveis para os clientes no construtor de sites.</p>
                    </Link>

                    <Link href="/admin/materiais" className="rounded-xl bg-white dark:bg-[#12142a] border border-slate-200 dark:border-white/[0.06] p-6 hover:border-emerald-300 dark:hover:border-emerald-500/30 transition-colors shadow-sm group">
                        <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                            <Download className="h-5 w-5" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                            Gestão de Materiais <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">Faça o upload e organize os materiais de apoio de treinamentos e afiliados.</p>
                    </Link>
                </div>
            )}
        </div>
    )
}
