"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Plus, Search, Filter,
    MoreHorizontal, Calendar, FileText, Send, CheckCircle2, Clock, XCircle, Link2
} from "lucide-react"

export default function CrmPropostasPage() {
    const supabase = createClient()
    const [search, setSearch] = useState("")
    const [propostas, setPropostas] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchPropostas()
    }, [])

    async function fetchPropostas() {
        setLoading(true)
        const { data: userAuth } = await supabase.auth.getUser()
        if (!userAuth.user) return

        const { data, error } = await supabase
            .from('crm_proposals')
            .select(`
                *,
                crm_contacts:contact_id ( name, company ),
                crm_deals:deal_id ( title, value )
            `)
            .eq('user_id', userAuth.user.id)
            .order('created_at', { ascending: false })

        if (!error && data) {
            setPropostas(data)
        }
        setLoading(false)
    }

    async function handleAddProposta() {
        const { data: userAuth } = await supabase.auth.getUser()
        if (!userAuth.user) return

        const { data: contatos } = await supabase.from('crm_contacts').select('id, name').eq('user_id', userAuth.user.id).limit(20)

        if (!contatos || contatos.length === 0) {
            alert("Crie um Contato/Lead no CRM antes de criar propostas.")
            return
        }

        const { data: deals } = await supabase.from('crm_deals').select('id, title').eq('user_id', userAuth.user.id).limit(20)

        const title = prompt("Título da Proposta:")
        if (!title) return

        const amountStr = prompt("Valor Total (R$):")
        if (!amountStr) return

        let dealId = null
        if (deals && deals.length > 0) {
            const dealNames = deals.map((d, i) => `${i + 1}. ${d.title}`).join("\n")
            const dealChoice = prompt(`Vincular a um negócio? (número)\n${dealNames}\n\nDeixe em branco para não vincular:`)
            if (dealChoice) {
                const idx = parseInt(dealChoice) - 1
                if (deals[idx]) dealId = deals[idx].id
            }
        }

        const { data, error } = await supabase
            .from('crm_proposals')
            .insert({
                user_id: userAuth.user.id,
                contact_id: contatos[0].id,
                deal_id: dealId,
                title: title,
                description: '',
                status: 'draft',
                total_value: parseFloat(amountStr),
                valid_until: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
            })
            .select(`*, crm_contacts:contact_id(name, company), crm_deals:deal_id(title, value)`)
            .single()

        if (!error && data) {
            setPropostas([data, ...propostas])
        } else {
            console.error(error)
            alert("Erro ao criar proposta.")
        }
    }

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)
    }

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'draft': return { color: 'bg-gray-500/10 text-gray-400 border-gray-500/20', icon: <FileText className="w-3.5 h-3.5" />, label: 'Rascunho' }
            case 'sent': return { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: <Send className="w-3.5 h-3.5" />, label: 'Enviada' }
            case 'accepted': return { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: 'Aprovada' }
            case 'rejected': return { color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: <XCircle className="w-3.5 h-3.5" />, label: 'Recusada' }
            case 'expired': return { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: <Clock className="w-3.5 h-3.5" />, label: 'Expirada' }
            default: return { color: 'bg-gray-500/10 text-gray-400', icon: <FileText className="w-3.5 h-3.5" />, label: status }
        }
    }

    const filteredPropostas = propostas.filter(p =>
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.crm_contacts?.name?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-violet-500/20 text-violet-400">
                        <FileText className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Propostas</h1>
                        <p className="text-sm text-slate-500 dark:text-gray-500">Orçamentos e contratos vinculados aos negócios do CRM</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Buscar proposta..."
                            className="pl-9 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 dark:bg-[#1e1e1e] dark:border-white/10 dark:text-white dark:placeholder:text-gray-600"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={handleAddProposta}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Nova Proposta
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="w-5 h-5 rounded-full border-t-2 border-emerald-500 animate-spin" />
                </div>
            ) : filteredPropostas.length === 0 ? (
                <div className="rounded-xl bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-white/5 p-12 text-center shadow-sm">
                    <FileText className="h-10 w-10 text-slate-300 dark:text-gray-600 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1">Nenhuma proposta encontrada</h3>
                    <p className="text-xs text-slate-500 dark:text-gray-600">Crie sua primeira proposta e vincule a um negócio do pipeline.</p>
                    <Button onClick={handleAddProposta} variant="outline" className="mt-4 border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5">
                        Criar Proposta
                    </Button>
                </div>
            ) : (
                <div className="rounded-xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
                    <div className="grid grid-cols-12 gap-4 p-4 text-[11px] font-semibold text-slate-500 dark:text-gray-500 uppercase tracking-wider border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#161616] hidden md:grid">
                        <div className="col-span-4">Cliente & Título</div>
                        <div className="col-span-2 text-center">Negócio</div>
                        <div className="col-span-2 text-center">Valor</div>
                        <div className="col-span-2 text-center">Status</div>
                        <div className="col-span-2 text-center">Validade</div>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-white/5">
                        {filteredPropostas.map(proposta => {
                            const status = getStatusInfo(proposta.status)
                            const isExpired = new Date(proposta.valid_until) < new Date() && proposta.status !== 'accepted' && proposta.status !== 'rejected'

                            return (
                                <div key={proposta.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                                    <div className="col-span-1 md:col-span-4">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{proposta.title}</p>
                                        <p className="text-[11px] text-slate-500 dark:text-gray-500 mt-0.5">
                                            {proposta.crm_contacts?.name || 'Sem cliente'}
                                            {proposta.crm_contacts?.company && (
                                                <span className="ml-1.5 text-slate-400 dark:text-gray-600">· {proposta.crm_contacts.company}</span>
                                            )}
                                        </p>
                                    </div>

                                    <div className="col-span-1 md:col-span-2 flex justify-center">
                                        {proposta.crm_deals ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                <Link2 className="h-3 w-3" />
                                                {proposta.crm_deals.title}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] text-slate-400 dark:text-gray-700">Sem vínculo</span>
                                        )}
                                    </div>

                                    <div className="col-span-1 md:col-span-2 text-center">
                                        <span className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(proposta.total_value)}</span>
                                    </div>

                                    <div className="col-span-1 md:col-span-2 flex justify-center">
                                        <Badge variant="outline" className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] ${isExpired ? getStatusInfo('expired').color : status.color}`}>
                                            {isExpired ? getStatusInfo('expired').icon : status.icon}
                                            {isExpired ? 'Expirada' : status.label}
                                        </Badge>
                                    </div>

                                    <div className="col-span-1 md:col-span-2 text-center">
                                        <span className="text-xs text-slate-500 dark:text-gray-500">
                                            {proposta.valid_until ? new Date(proposta.valid_until).toLocaleDateString('pt-BR') : '—'}
                                        </span>
                                        {isExpired && <span className="text-red-500 text-[10px] ml-1">(Vencida)</span>}
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
