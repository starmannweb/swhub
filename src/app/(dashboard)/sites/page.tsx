"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Globe, Loader2, Edit, Trash2, ExternalLink, ArrowRight,
    FileCode2, LayoutTemplate, Sparkles, Copy, GlobeLock,
} from "lucide-react"
import { Site } from "@/types/sites"

type CreationMode = "blank" | "template" | "ai"
type SitesTab = "rascunhos" | "publicados"

export default function SitesPage() {
    const [sites, setSites] = useState<Site[]>([])
    const [loading, setLoading] = useState(true)
    const [siteName, setSiteName] = useState("")
    const [creationMode, setCreationMode] = useState<CreationMode>("blank")
    const [creating, setCreating] = useState(false)
    const [activeTab, setActiveTab] = useState<SitesTab>("rascunhos")
    const router = useRouter()
    const supabase = createClient()

    const fetchSites = useCallback(async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from("sites")
                .select("*")
                .order("created_at", { ascending: false })

            if (error) throw error
            setSites(data || [])
        } catch (error) {
            console.error("Erro ao buscar sites:", error)
        } finally {
            setLoading(false)
        }
    }, [supabase])

    useEffect(() => {
        fetchSites()
    }, [fetchSites])

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Tem certeza que deseja apagar o site "${name}"?`)) return
        const { error } = await supabase.from("sites").delete().eq("id", id)
        if (!error) fetchSites()
    }

    const handleCreateSite = async () => {
        if (!siteName.trim()) return
        if (creationMode === "template") {
            router.push(`/sites/new?name=${encodeURIComponent(siteName)}`)
            return
        }

        setCreating(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setCreating(false); return }

        const slug = siteName.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "")

        const { data, error } = await supabase
            .from("sites")
            .insert({ user_id: user.id, name: siteName, slug })
            .select("id")
            .single()

        if (!error && data) {
            router.push(`/sites/${data.id}`)
        } else {
            alert("Erro ao criar site.")
        }
        setCreating(false)
    }

    const draftSites = sites.filter(s => !s.is_published)
    const publishedSites = sites.filter(s => s.is_published)
    const displayedSites = activeTab === "rascunhos" ? draftSites : publishedSites

    const creationModes: { key: CreationMode; icon: React.ReactNode; title: string; desc: string; badge?: string }[] = [
        { key: "blank", icon: <FileCode2 className="h-6 w-6" />, title: "Página em Branco", desc: "Comece do zero com total liberdade criativa" },
        { key: "template", icon: <LayoutTemplate className="h-6 w-6" />, title: "Usar Template", desc: "Escolha entre dezenas de templates prontos" },
        { key: "ai", icon: <Sparkles className="h-6 w-6" />, title: "Criar com IA", desc: "Deixe a IA criar uma página para você", badge: "Em breve" },
    ]

    return (
        <div className="space-y-8">
            {/* ── Create New Site ── */}
            <div>
                <h1 className="text-2xl font-bold text-white mb-1">Criar Novo Site</h1>
                <p className="text-sm text-gray-500 mb-6">Escolha como deseja começar seu novo projeto</p>

                <div className="rounded-xl bg-[#1a1a1a] border border-white/5 p-6 space-y-6">
                    {/* Site Name */}
                    <div>
                        <label className="text-xs font-semibold text-gray-400 mb-2 block">Nome do Site</label>
                        <Input
                            placeholder="Minha Landing Page"
                            value={siteName}
                            onChange={(e) => setSiteName(e.target.value)}
                            className="bg-[#161616] border-white/10 text-white placeholder:text-gray-600 max-w-md h-12 text-base"
                        />
                    </div>

                    {/* Creation Mode Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {creationModes.map((mode) => {
                            const isActive = creationMode === mode.key
                            const isDisabled = mode.key === "ai"
                            return (
                                <button
                                    key={mode.key}
                                    onClick={() => !isDisabled && setCreationMode(mode.key)}
                                    disabled={isDisabled}
                                    className={`relative text-left p-5 rounded-xl border-2 transition-all ${
                                        isDisabled
                                            ? "border-white/5 opacity-50 cursor-not-allowed"
                                            : isActive
                                                ? "border-violet-500 bg-violet-500/5"
                                                : "border-white/10 bg-[#161616] hover:border-white/20"
                                    }`}
                                >
                                    {isActive && (
                                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}
                                    {mode.badge && (
                                        <span className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded bg-violet-500/20 text-violet-400 font-medium">
                                            {mode.badge}
                                        </span>
                                    )}
                                    <div className={`mb-3 ${isActive ? "text-violet-400" : "text-gray-500"}`}>
                                        {mode.icon}
                                    </div>
                                    <p className="font-semibold text-sm text-white mb-1">{mode.title}</p>
                                    <p className="text-[11px] text-gray-500 leading-relaxed">{mode.desc}</p>
                                </button>
                            )
                        })}
                    </div>

                    {/* Create Button */}
                    <div className="flex justify-end">
                        <Button
                            onClick={handleCreateSite}
                            disabled={!siteName.trim() || creating || creationMode === "ai"}
                            className="bg-violet-600 hover:bg-violet-700 text-white px-6"
                        >
                            {creating ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Criando...</>
                            ) : (
                                <>Criar Site <ArrowRight className="ml-2 h-4 w-4" /></>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Replicator Banner */}
                <div className="mt-4 rounded-xl bg-[#1a1a1a] border border-white/5 p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Copy className="h-5 w-5 text-gray-500" />
                        <div>
                            <p className="text-sm font-semibold text-white">Prefere clonar um site existente?</p>
                            <p className="text-xs text-gray-500">Use nosso Replicador para clonar qualquer site em segundos</p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10 shrink-0"
                        onClick={() => router.push("/sites/replicate")}
                    >
                        Ir para Replicador <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* ── Sites List with Tabs ── */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center rounded-lg border border-white/10 bg-[#1e1e1e] p-0.5">
                        <button
                            onClick={() => setActiveTab("rascunhos")}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium transition-colors ${
                                activeTab === "rascunhos"
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : "text-gray-500 hover:text-gray-300"
                            }`}
                        >
                            <Edit className="h-3.5 w-3.5" />
                            Rascunhos
                            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-white/5">{draftSites.length}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("publicados")}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium transition-colors ${
                                activeTab === "publicados"
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : "text-gray-500 hover:text-gray-300"
                            }`}
                        >
                            <Globe className="h-3.5 w-3.5" />
                            Publicados
                            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-white/5">{publishedSites.length}</span>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                    </div>
                ) : displayedSites.length === 0 ? (
                    <div className="rounded-xl bg-[#1e1e1e] border border-white/5 p-12 text-center">
                        <Globe className="h-10 w-10 text-gray-600 mx-auto mb-3" />
                        <h3 className="text-sm font-semibold text-gray-300 mb-1">
                            {activeTab === "rascunhos" ? "Nenhum rascunho" : "Nenhum site publicado"}
                        </h3>
                        <p className="text-xs text-gray-600">
                            {activeTab === "rascunhos"
                                ? "Crie seu primeiro site usando o formulário acima."
                                : "Publique um site para ele aparecer aqui."
                            }
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {displayedSites.map((site) => (
                            <div key={site.id} className="rounded-xl bg-[#1a1a1a] border border-white/5 overflow-hidden hover:border-violet-500/20 transition-all group">
                                <div className="h-32 bg-[#161616] flex items-center justify-center relative overflow-hidden">
                                    {site.preview_image ? (
                                        <img src={site.preview_image} alt={site.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    ) : (
                                        <Globe className="h-8 w-8 text-gray-700" />
                                    )}
                                    <div className="absolute top-2 right-2">
                                        {site.is_published ? (
                                            <Badge className="bg-emerald-500/80 text-white text-[10px]">Publicado</Badge>
                                        ) : (
                                            <Badge className="bg-gray-600/80 text-gray-300 text-[10px]">Rascunho</Badge>
                                        )}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="text-sm font-semibold text-white truncate">{site.name}</h3>
                                    <p className="text-[11px] text-gray-600 truncate mt-0.5">/{site.slug}</p>
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-gray-400 hover:text-white hover:bg-white/5 text-xs h-8 px-3"
                                            onClick={() => router.push(`/sites/${site.id}`)}
                                        >
                                            <Edit className="mr-1.5 h-3 w-3" /> Editar
                                        </Button>
                                        <div className="flex gap-1">
                                            {site.is_published && (
                                                <button className="p-1.5 rounded-md hover:bg-white/5 text-gray-500 hover:text-emerald-400 transition-colors" title="Domínio">
                                                    <GlobeLock className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                            {site.is_published && (
                                                <button className="p-1.5 rounded-md hover:bg-white/5 text-gray-500 hover:text-gray-300 transition-colors" title="Acessar">
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(site.id, site.name)}
                                                className="p-1.5 rounded-md hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                                                title="Excluir"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
