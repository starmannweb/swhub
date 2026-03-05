"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    GlobeLock, Plus, Trash2, Loader2, CheckCircle2, AlertCircle,
    Copy, ExternalLink, ShieldCheck, Server,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

type Domain = {
    id: string
    site_id: string
    domain: string
    status: "pending" | "active" | "error"
    created_at: string
    site_name?: string
}

export default function DominiosPage() {
    const supabase = createClient()
    const [domains, setDomains] = useState<Domain[]>([])
    const [sites, setSites] = useState<{ id: string; name: string }[]>([])
    const [loading, setLoading] = useState(true)
    const [showAdd, setShowAdd] = useState(false)
    const [newDomain, setNewDomain] = useState("")
    const [selectedSiteId, setSelectedSiteId] = useState("")
    const [saving, setSaving] = useState(false)
    const [copied, setCopied] = useState<string | null>(null)

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: sitesData } = await supabase
            .from("sites")
            .select("id, name")
            .eq("user_id", user.id)
            .eq("is_published", true)
            .order("name")

        setSites(sitesData || [])

        const { data: domainsData } = await supabase
            .from("site_domains")
            .select("*")
            .order("created_at", { ascending: false })

        if (domainsData) {
            const enriched = domainsData.map(d => ({
                ...d,
                site_name: sitesData?.find(s => s.id === d.site_id)?.name || "Site removido"
            }))
            setDomains(enriched)
        }
        setLoading(false)
    }

    async function handleAddDomain() {
        if (!newDomain.trim() || !selectedSiteId) return
        setSaving(true)

        const { error } = await supabase.from("site_domains").insert({
            site_id: selectedSiteId,
            domain: newDomain.trim().toLowerCase(),
            status: "pending",
        })

        if (!error) {
            setNewDomain("")
            setSelectedSiteId("")
            setShowAdd(false)
            fetchData()
        } else {
            alert("Erro ao adicionar domínio.")
            console.error(error)
        }
        setSaving(false)
    }

    async function handleDelete(id: string) {
        if (!confirm("Remover este domínio?")) return
        await supabase.from("site_domains").delete().eq("id", id)
        fetchData()
    }

    function handleCopy(text: string, key: string) {
        navigator.clipboard.writeText(text)
        setCopied(key)
        setTimeout(() => setCopied(null), 2000)
    }

    const statusInfo: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
        pending: { label: "Pendente", color: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: <AlertCircle className="h-3 w-3" /> },
        active: { label: "Ativo", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: <CheckCircle2 className="h-3 w-3" /> },
        error: { label: "Erro", color: "bg-red-500/10 text-red-400 border-red-500/20", icon: <AlertCircle className="h-3 w-3" /> },
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-violet-500/20 text-violet-400">
                        <GlobeLock className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Domínios</h1>
                        <p className="text-sm text-gray-500">Gerencie seus domínios personalizados</p>
                    </div>
                </div>
                <Button
                    onClick={() => setShowAdd(!showAdd)}
                    className="bg-violet-600 hover:bg-violet-700 text-white"
                >
                    <Plus className="mr-2 h-4 w-4" /> Adicionar Domínio
                </Button>
            </div>

            {/* Add Domain Form */}
            {showAdd && (
                <div className="rounded-xl bg-[#1a1a1a] border border-white/5 p-6 space-y-5">
                    <div>
                        <h2 className="text-lg font-bold text-white mb-1">Adicionar Novo Domínio</h2>
                        <p className="text-sm text-gray-500">Conecte seu domínio personalizado para usar com seus sites</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-400">Domínio</label>
                            <Input
                                placeholder="meusite.com.br"
                                value={newDomain}
                                onChange={(e) => setNewDomain(e.target.value)}
                                className="bg-[#161616] border-white/10 text-white placeholder:text-gray-600 h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-400">Site vinculado</label>
                            <select
                                value={selectedSiteId}
                                onChange={(e) => setSelectedSiteId(e.target.value)}
                                className="w-full h-11 rounded-md bg-[#161616] border border-white/10 text-white text-sm px-3"
                            >
                                <option value="">Selecione um site publicado...</option>
                                {sites.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* DNS Instructions */}
                    <div className="rounded-lg bg-violet-500/5 border border-violet-500/10 p-4 space-y-3">
                        <h3 className="text-sm font-semibold text-violet-400">Configuração DNS</h3>
                        <p className="text-xs text-gray-400">
                            Após adicionar, configure o DNS do seu domínio com os seguintes registros:
                        </p>

                        <div className="rounded-lg bg-[#111] border border-white/5 overflow-hidden">
                            <div className="grid grid-cols-3 gap-4 p-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider border-b border-white/5">
                                <div>Tipo</div>
                                <div>Nome</div>
                                <div>Valor</div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 p-3 items-center">
                                <div className="text-xs font-bold text-white">CNAME</div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-300 font-mono">@</span>
                                    <button
                                        onClick={() => handleCopy("@", "name")}
                                        className="text-gray-500 hover:text-white transition-colors"
                                    >
                                        {copied === "name" ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-emerald-400 font-mono">proxy.swhub.com.br</span>
                                    <button
                                        onClick={() => handleCopy("proxy.swhub.com.br", "value")}
                                        className="text-gray-500 hover:text-white transition-colors"
                                    >
                                        {copied === "value" ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SSL Badge */}
                    <div className="flex items-center gap-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-4">
                        <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-emerald-400">SSL Automático Gratuito</p>
                            <p className="text-xs text-gray-500">Todos os domínios conectados recebem certificado SSL automaticamente.</p>
                        </div>
                    </div>

                    {/* Hosting Recommendation */}
                    <div className="flex items-center gap-3 rounded-lg bg-blue-500/5 border border-blue-500/10 p-4">
                        <Server className="h-5 w-5 text-blue-400 shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-blue-400">Precisa de hospedagem?</p>
                            <p className="text-xs text-gray-500">Recomendamos a Napoleon Host para hospedar seu domínio com qualidade.</p>
                        </div>
                        <a
                            href="https://painel.napoleon.com.br/aff.php?aff=5426"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button variant="outline" size="sm" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 shrink-0">
                                <ExternalLink className="mr-1.5 h-3 w-3" /> Ver Planos
                            </Button>
                        </a>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowAdd(false)} className="border-white/10 text-gray-400 hover:bg-white/5">
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleAddDomain}
                            disabled={!newDomain.trim() || !selectedSiteId || saving}
                            className="bg-violet-600 hover:bg-violet-700 text-white"
                        >
                            {saving ? "Adicionando..." : "Adicionar"}
                        </Button>
                    </div>
                </div>
            )}

            {/* Domain List */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                </div>
            ) : domains.length === 0 ? (
                <div className="rounded-xl bg-[#1e1e1e] border border-white/5 p-12 text-center">
                    <GlobeLock className="h-10 w-10 text-gray-600 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-gray-300 mb-1">Nenhum domínio configurado</h3>
                    <p className="text-xs text-gray-600">Adicione um domínio personalizado para seus sites publicados.</p>
                </div>
            ) : (
                <div className="rounded-xl bg-[#1a1a1a] border border-white/5 overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 p-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-b border-white/5 bg-[#161616]">
                        <div className="col-span-4">Domínio</div>
                        <div className="col-span-3">Site</div>
                        <div className="col-span-2 text-center">Status</div>
                        <div className="col-span-2 text-center">Adicionado em</div>
                        <div className="col-span-1 text-right">Ações</div>
                    </div>
                    <div className="divide-y divide-white/5">
                        {domains.map((d) => {
                            const st = statusInfo[d.status] || statusInfo.pending
                            return (
                                <div key={d.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/[0.02] transition-colors">
                                    <div className="col-span-4 flex items-center gap-2">
                                        <GlobeLock className="h-4 w-4 text-violet-400 shrink-0" />
                                        <span className="text-sm font-semibold text-white truncate">{d.domain}</span>
                                    </div>
                                    <div className="col-span-3">
                                        <span className="text-xs text-gray-400 truncate">{d.site_name}</span>
                                    </div>
                                    <div className="col-span-2 flex justify-center">
                                        <Badge variant="outline" className={`flex items-center gap-1 text-[10px] ${st.color}`}>
                                            {st.icon} {st.label}
                                        </Badge>
                                    </div>
                                    <div className="col-span-2 text-center">
                                        <span className="text-xs text-gray-500">
                                            {new Date(d.created_at).toLocaleDateString("pt-BR")}
                                        </span>
                                    </div>
                                    <div className="col-span-1 flex justify-end">
                                        <button
                                            onClick={() => handleDelete(d.id)}
                                            className="p-1.5 rounded-md hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                                            title="Remover"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
