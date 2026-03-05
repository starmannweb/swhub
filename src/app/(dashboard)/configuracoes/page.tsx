"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Settings, Plus, Trash2, GripVertical, Loader2, Save, KanbanSquare, Palette,
} from "lucide-react"

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
    const [tab, setTab] = useState<"pipeline" | "geral">("pipeline")

    useEffect(() => {
        fetchPipeline()
    }, [])

    async function fetchPipeline() {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

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
                <div className="p-2 rounded-lg bg-gray-500/20 text-gray-400">
                    <Settings className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Configurações</h1>
                    <p className="text-sm text-gray-500">Ajustes da conta e do sistema</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center rounded-lg border border-white/10 bg-[#1e1e1e] p-0.5 w-fit">
                <button
                    onClick={() => setTab("pipeline")}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium transition-colors ${
                        tab === "pipeline" ? "bg-emerald-500/20 text-emerald-400" : "text-gray-500 hover:text-gray-300"
                    }`}
                >
                    <KanbanSquare className="h-3.5 w-3.5" /> Pipeline CRM
                </button>
                <button
                    onClick={() => setTab("geral")}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium transition-colors ${
                        tab === "geral" ? "bg-emerald-500/20 text-emerald-400" : "text-gray-500 hover:text-gray-300"
                    }`}
                >
                    <Settings className="h-3.5 w-3.5" /> Geral
                </button>
            </div>

            {/* Pipeline Settings */}
            {tab === "pipeline" && (
                <div className="space-y-6">
                    {loading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                        </div>
                    ) : !pipelineId ? (
                        <div className="rounded-xl bg-[#1e1e1e] border border-white/5 p-12 text-center">
                            <KanbanSquare className="h-10 w-10 text-gray-600 mx-auto mb-3" />
                            <h3 className="text-sm font-semibold text-gray-300 mb-1">Nenhum pipeline encontrado</h3>
                            <p className="text-xs text-gray-600">Acesse o CRM para criar seu pipeline automaticamente.</p>
                        </div>
                    ) : (
                        <>
                            {/* Pipeline Name */}
                            <div className="rounded-xl bg-[#1a1a1a] border border-white/5 p-6 space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-400 mb-2 block">Nome do Pipeline</label>
                                    <Input
                                        value={pipelineName}
                                        onChange={(e) => setPipelineName(e.target.value)}
                                        className="bg-[#161616] border-white/10 text-white max-w-sm h-11"
                                    />
                                </div>
                            </div>

                            {/* Stages Editor */}
                            <div className="rounded-xl bg-[#1a1a1a] border border-white/5 p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-sm font-bold text-white">Estágios do Pipeline</h2>
                                        <p className="text-xs text-gray-500 mt-0.5">Arraste, edite ou remova os estágios do seu funil de vendas</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAddStage}
                                        className="border-white/10 text-gray-300 hover:bg-white/5"
                                    >
                                        <Plus className="mr-1.5 h-3.5 w-3.5" /> Novo Estágio
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    {stages.map((stage, index) => (
                                        <div key={stage.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#161616] border border-white/5 group">
                                            <div className="flex flex-col gap-0.5">
                                                <button
                                                    onClick={() => handleMoveStage(index, "up")}
                                                    disabled={index === 0}
                                                    className="text-gray-600 hover:text-gray-300 disabled:opacity-20 text-[10px]"
                                                >▲</button>
                                                <button
                                                    onClick={() => handleMoveStage(index, "down")}
                                                    disabled={index === stages.length - 1}
                                                    className="text-gray-600 hover:text-gray-300 disabled:opacity-20 text-[10px]"
                                                >▼</button>
                                            </div>

                                            <span className="text-xs text-gray-600 font-mono w-6 text-center">{index + 1}</span>

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
                                                className="bg-transparent border-white/5 text-white text-sm h-9 flex-1"
                                            />

                                            <button
                                                onClick={() => handleRemoveStage(stage.id)}
                                                className="p-1.5 rounded-md hover:bg-red-500/10 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                                title="Remover"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {stages.length === 0 && (
                                    <div className="text-center py-6">
                                        <p className="text-xs text-gray-600">Nenhum estágio. Adicione ao menos um.</p>
                                    </div>
                                )}
                            </div>

                            {/* Save */}
                            <div className="flex justify-end">
                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
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
                <div className="rounded-xl bg-[#1a1a1a] border border-white/5 p-8 text-center">
                    <Settings className="h-8 w-8 text-gray-700 mx-auto mb-3" />
                    <p className="text-sm text-gray-400 font-semibold">Configurações gerais em breve</p>
                    <p className="text-xs text-gray-600 mt-1">Perfil, notificações, integrações e preferências do sistema.</p>
                </div>
            )}
        </div>
    )
}
