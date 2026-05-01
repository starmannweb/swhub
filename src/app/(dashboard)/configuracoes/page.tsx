"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Settings, Plus, Trash2, GripVertical, Loader2, Save, KanbanSquare, Palette, ShieldCheck, LayoutTemplate, Download, ArrowRight, User, Bot, Share2
} from "lucide-react"
import Link from "next/link"

type PipelineStage = {
    id: string
    pipeline_id: string
    name: string
    order: number
    color: string
}

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

export default function ConfiguracoesPage() {
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [pipelineId, setPipelineId] = useState<string | null>(null)
    const [pipelineName, setPipelineName] = useState("")
    const [stages, setStages] = useState<PipelineStage[]>([])
    const [tab, setTab] = useState<"conta" | "pipeline" | "geral" | "admin">("conta")
    const [isAdmin, setIsAdmin] = useState(false)
    const [profile, setProfile] = useState({ full_name: "", email: "", phone: "" })
    const [savingProfile, setSavingProfile] = useState(false)

    useEffect(() => {
        fetchPipeline()
    }, [])

    async function fetchPipeline() {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Check if admin
        const { data: profileData } = await supabase.from('profiles').select('is_admin, role, full_name, phone').eq('id', user.id).single()
        if (profileData?.is_admin || profileData?.role === 'admin') {
            setIsAdmin(true)
        }
        setProfile({
            full_name: profileData?.full_name || user.user_metadata?.full_name || "",
            email: user.email || "",
            phone: profileData?.phone || ""
        })

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
    }

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
            <div className="flex items-center rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#12142a] p-0.5 w-fit">
                <button
                    onClick={() => setTab("conta")}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium transition-colors ${
                        tab === "conta" ? "bg-white dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 shadow-sm" : "text-slate-500 hover:text-slate-900 dark:text-gray-500 dark:hover:text-gray-300"
                    }`}
                >
                    <User className="h-3.5 w-3.5" /> Meus Dados
                </button>
                <button
                    onClick={() => setTab("geral")}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium transition-colors ${
                        tab === "geral" ? "bg-white dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 shadow-sm" : "text-slate-500 hover:text-slate-900 dark:text-gray-500 dark:hover:text-gray-300"
                    }`}
                >
                    <Settings className="h-3.5 w-3.5" /> Geral
                </button>
                <button
                    onClick={() => setTab("pipeline")}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium transition-colors ${
                        tab === "pipeline" ? "bg-white dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 shadow-sm" : "text-slate-500 hover:text-slate-900 dark:text-gray-500 dark:hover:text-gray-300"
                    }`}
                >
                    <KanbanSquare className="h-3.5 w-3.5" /> Pipeline CRM
                </button>
                <button
                    onClick={() => setTab("integracoes")}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium transition-colors ${
                        tab === "integracoes" ? "bg-white dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 shadow-sm" : "text-slate-500 hover:text-slate-900 dark:text-gray-500 dark:hover:text-gray-300"
                    }`}
                >
                    <Share2 className="h-3.5 w-3.5" /> Integrações (IA / Meta)
                </button>
                {isAdmin && (
                    <button
                        onClick={() => setTab("admin")}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium transition-colors ${
                            tab === "admin" ? "bg-white dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 shadow-sm" : "text-slate-500 hover:text-slate-900 dark:text-gray-500 dark:hover:text-gray-300"
                        }`}
                    >
                        <ShieldCheck className="h-3.5 w-3.5" /> Administração
                    </button>
                )}
            </div>

            {/* Meus Dados Tab */}
            {tab === "conta" && (
                <div className="space-y-6 max-w-2xl">
                    <div className="rounded-xl bg-white dark:bg-[#12142a] border border-slate-200 dark:border-white/[0.06] p-6 space-y-5 shadow-sm">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Informações Pessoais</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500 dark:text-gray-400">Nome Completo</label>
                                <Input
                                    value={profile.full_name}
                                    onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                                    className="bg-slate-50 dark:bg-[#0d0f1a] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500 dark:text-gray-400">E-mail</label>
                                <Input
                                    value={profile.email}
                                    disabled
                                    className="bg-slate-100 dark:bg-[#0d0f1a] border-slate-200 dark:border-white/[0.06] text-slate-500 dark:text-gray-400 h-11 cursor-not-allowed"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-semibold text-slate-500 dark:text-gray-400">Telefone / WhatsApp</label>
                                <Input
                                    value={profile.phone}
                                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                                    placeholder="(11) 99999-9999"
                                    className="bg-slate-50 dark:bg-[#0d0f1a] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white h-11"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button
                                onClick={async () => {
                                    setSavingProfile(true)
                                    const { data: { user } } = await supabase.auth.getUser()
                                    if (user) {
                                        await supabase.from('profiles').update({
                                            full_name: profile.full_name,
                                            phone: profile.phone
                                        }).eq('id', user.id)
                                        await supabase.auth.updateUser({ data: { full_name: profile.full_name } })
                                    }
                                    setSavingProfile(false)
                                    alert("Perfil atualizado!")
                                }}
                                disabled={savingProfile}
                                className="bg-violet-600 hover:bg-violet-700 text-white px-6"
                            >
                                {savingProfile ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
                                ) : (
                                    <><Save className="mr-2 h-4 w-4" /> Salvar Alterações</>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Integrações Tab */}
            {tab === "integracoes" && (
                <div className="space-y-6 max-w-4xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    </div>
                </div>
            )}

            {/* Pipeline Settings */}
            {tab === "pipeline" && (
                <div className="space-y-6">
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
                <div className="rounded-xl bg-white dark:bg-[#12142a] border border-slate-200 dark:border-white/[0.06] p-8 text-center shadow-sm">
                    <Settings className="h-8 w-8 text-slate-300 dark:text-gray-700 mx-auto mb-3" />
                    <p className="text-sm text-slate-500 dark:text-gray-400 font-semibold">Configurações gerais em breve</p>
                    <p className="text-xs text-slate-400 dark:text-gray-600 mt-1">Perfil, notificações, integrações e preferências do sistema.</p>
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
