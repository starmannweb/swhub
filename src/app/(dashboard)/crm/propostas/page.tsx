"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Plus, Search,
    FileText, Send, CheckCircle2, Clock, XCircle, Link2, MoreVertical, Loader2
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type ContactOption = {
    id: string
    name: string
    company: string | null
}

type DealOption = {
    id: string
    title: string
    value: number | null
    contact_id: string | null
}

type ProposalFormState = {
    title: string
    contactId: string
    dealId: string
    totalValue: string
    validUntil: string
    description: string
}

type ProposalRow = {
    id: string
    title: string
    status: string
    total_value: number
    valid_until: string | null
    crm_contacts?: {
        name: string | null
        company: string | null
    } | null
    crm_deals?: {
        title: string
        value: number | null
    } | null
}

const NO_DEAL_VALUE = "none"

function getDefaultValidUntil() {
    return new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

function parseMoneyInput(value: string) {
    const normalized = value.replace(/\./g, "").replace(",", ".")
    const parsed = Number.parseFloat(normalized)
    return Number.isFinite(parsed) ? parsed : 0
}

export default function CrmPropostasPage() {
    const supabase = useMemo(() => createClient(), [])
    const [search, setSearch] = useState("")
    const [propostas, setPropostas] = useState<ProposalRow[]>([])
    const [loading, setLoading] = useState(true)
    const [contatos, setContatos] = useState<ContactOption[]>([])
    const [deals, setDeals] = useState<DealOption[]>([])
    const [isProposalDialogOpen, setIsProposalDialogOpen] = useState(false)
    const [savingProposal, setSavingProposal] = useState(false)
    const [proposalError, setProposalError] = useState("")
    const [proposalForm, setProposalForm] = useState<ProposalFormState>({
        title: "",
        contactId: "",
        dealId: NO_DEAL_VALUE,
        totalValue: "",
        validUntil: getDefaultValidUntil(),
        description: "",
    })

    const fetchPropostas = useCallback(async () => {
        setLoading(true)
        const { data: userAuth } = await supabase.auth.getUser()
        if (!userAuth.user) {
            setLoading(false)
            return
        }

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
    }, [supabase])

    const fetchFormOptions = useCallback(async () => {
        const { data: userAuth } = await supabase.auth.getUser()
        if (!userAuth.user) return

        const [{ data: contactData }, { data: dealData }] = await Promise.all([
            supabase
                .from('crm_contacts')
                .select('id, name, company')
                .eq('user_id', userAuth.user.id)
                .order('created_at', { ascending: false })
                .limit(100),
            supabase
                .from('crm_deals')
                .select('id, title, value, contact_id')
                .eq('user_id', userAuth.user.id)
                .neq('status', 'lost')
                .order('created_at', { ascending: false })
                .limit(100),
        ])

        setContatos(contactData || [])
        setDeals(dealData || [])
    }, [supabase])

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void fetchPropostas()
            void fetchFormOptions()
        }, 0)

        return () => window.clearTimeout(timer)
    }, [fetchFormOptions, fetchPropostas])

    function openProposalDialog() {
        setProposalForm({
            title: "",
            contactId: contatos[0]?.id || "",
            dealId: NO_DEAL_VALUE,
            totalValue: "",
            validUntil: getDefaultValidUntil(),
            description: "",
        })
        setProposalError("")
        setIsProposalDialogOpen(true)
    }

    function handleProposalDealChange(value: string) {
        const selectedDeal = deals.find((deal) => deal.id === value)
        setProposalForm((current) => ({
            ...current,
            dealId: value,
            contactId: selectedDeal?.contact_id || current.contactId,
            totalValue: selectedDeal?.value ? String(selectedDeal.value).replace(".", ",") : current.totalValue,
            title: current.title || (selectedDeal ? `Proposta - ${selectedDeal.title}` : current.title),
        }))
    }

    async function handleCreateProposta(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setProposalError("")

        if (contatos.length === 0) {
            setProposalError("Crie um contato ou lead antes de cadastrar uma proposta.")
            return
        }

        const title = proposalForm.title.trim()
        if (!title) {
            setProposalError("Informe o título da proposta.")
            return
        }

        if (!proposalForm.contactId) {
            setProposalError("Selecione o cliente ou lead da proposta.")
            return
        }

        setSavingProposal(true)
        const { data: userAuth } = await supabase.auth.getUser()
        if (!userAuth.user) {
            setSavingProposal(false)
            return
        }

        const { data, error } = await supabase
            .from('crm_proposals')
            .insert({
                user_id: userAuth.user.id,
                contact_id: proposalForm.contactId,
                deal_id: proposalForm.dealId === NO_DEAL_VALUE ? null : proposalForm.dealId,
                title,
                description: proposalForm.description,
                status: 'draft',
                total_value: parseMoneyInput(proposalForm.totalValue),
                valid_until: proposalForm.validUntil || null
            })
            .select(`*, crm_contacts:contact_id(name, company), crm_deals:deal_id(title, value)`)
            .single()

        if (!error && data) {
            setPropostas((current) => [data, ...current])
            setIsProposalDialogOpen(false)
        } else {
            console.error(error)
            setProposalError(error?.message || "Erro ao criar proposta.")
        }
        setSavingProposal(false)
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

    const updateStatus = async (id: string, newStatus: string) => {
        const { error } = await supabase.from('crm_proposals').update({ status: newStatus }).eq('id', id)
        if (!error) {
            setPropostas(propostas.map(p => p.id === id ? { ...p, status: newStatus } : p))
        }
    }

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
                            className="pl-9 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 dark:bg-[#12142a] dark:border-white/10 dark:text-white dark:placeholder:text-gray-600"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={openProposalDialog}
                        className="bg-violet-600 hover:bg-violet-700 text-white shrink-0"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Nova Proposta
                    </Button>
                </div>
            </div>

            <Dialog open={isProposalDialogOpen} onOpenChange={setIsProposalDialogOpen}>
                <DialogContent className="sm:max-w-[620px] bg-white dark:bg-[#12142a] border-slate-200 dark:border-white/10">
                    <DialogHeader>
                        <DialogTitle>Nova Proposta</DialogTitle>
                        <DialogDescription>
                            Crie uma proposta vinculada a um contato e, se quiser, a um negócio do CRM.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateProposta} className="space-y-4">
                        {proposalError && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                                {proposalError}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="proposal-title">Título</Label>
                            <Input
                                id="proposal-title"
                                value={proposalForm.title}
                                onChange={(event) => setProposalForm({ ...proposalForm, title: event.target.value })}
                                placeholder="Ex: Proposta de site institucional"
                                className="bg-slate-50 dark:bg-[#0d0f1a] border-slate-200 dark:border-white/10"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Cliente / lead</Label>
                                <Select
                                    value={proposalForm.contactId}
                                    onValueChange={(value) => setProposalForm({ ...proposalForm, contactId: value })}
                                    disabled={contatos.length === 0}
                                >
                                    <SelectTrigger className="w-full bg-slate-50 dark:bg-[#0d0f1a] border-slate-200 dark:border-white/10">
                                        <SelectValue placeholder={contatos.length === 0 ? "Nenhum contato cadastrado" : "Selecione"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {contatos.map((contato) => (
                                            <SelectItem key={contato.id} value={contato.id}>
                                                {contato.company ? `${contato.name} · ${contato.company}` : contato.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Negócio</Label>
                                <Select value={proposalForm.dealId} onValueChange={handleProposalDealChange}>
                                    <SelectTrigger className="w-full bg-slate-50 dark:bg-[#0d0f1a] border-slate-200 dark:border-white/10">
                                        <SelectValue placeholder="Não vincular" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={NO_DEAL_VALUE}>Não vincular</SelectItem>
                                        {deals.map((deal) => (
                                            <SelectItem key={deal.id} value={deal.id}>
                                                {deal.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="proposal-value">Valor total</Label>
                                <Input
                                    id="proposal-value"
                                    value={proposalForm.totalValue}
                                    onChange={(event) => setProposalForm({ ...proposalForm, totalValue: event.target.value })}
                                    placeholder="0,00"
                                    inputMode="decimal"
                                    className="bg-slate-50 dark:bg-[#0d0f1a] border-slate-200 dark:border-white/10"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="proposal-valid-until">Validade</Label>
                                <Input
                                    id="proposal-valid-until"
                                    type="date"
                                    value={proposalForm.validUntil}
                                    onChange={(event) => setProposalForm({ ...proposalForm, validUntil: event.target.value })}
                                    className="bg-slate-50 dark:bg-[#0d0f1a] border-slate-200 dark:border-white/10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="proposal-description">Descrição</Label>
                            <Textarea
                                id="proposal-description"
                                value={proposalForm.description}
                                onChange={(event) => setProposalForm({ ...proposalForm, description: event.target.value })}
                                placeholder="Resumo do escopo, itens inclusos ou observações."
                                className="bg-slate-50 dark:bg-[#0d0f1a] border-slate-200 dark:border-white/10"
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsProposalDialogOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={savingProposal || contatos.length === 0} className="bg-violet-600 hover:bg-violet-700 text-white">
                                {savingProposal ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
                                ) : (
                                    <><Plus className="mr-2 h-4 w-4" /> Criar Proposta</>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="w-5 h-5 rounded-full border-t-2 border-emerald-500 animate-spin" />
                </div>
            ) : filteredPropostas.length === 0 ? (
                <div className="rounded-xl bg-white dark:bg-[#12142a] border border-slate-200 dark:border-white/[0.06] p-12 text-center shadow-sm">
                    <FileText className="h-10 w-10 text-slate-300 dark:text-gray-600 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1">Nenhuma proposta encontrada</h3>
                    <p className="text-xs text-slate-500 dark:text-gray-600">Crie sua primeira proposta e vincule a um negócio do pipeline.</p>
                    <Button onClick={openProposalDialog} variant="outline" className="mt-4 border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5">
                        Criar Proposta
                    </Button>
                </div>
            ) : (
                <div className="rounded-xl bg-white dark:bg-[#12142a] border border-slate-200 dark:border-white/[0.06] overflow-hidden shadow-sm">
                    <div className="grid grid-cols-12 gap-4 p-4 text-[11px] font-semibold text-slate-500 dark:text-gray-500 uppercase tracking-wider border-b border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-[#0d0f1a] hidden md:grid">
                        <div className="col-span-4">Cliente & Título</div>
                        <div className="col-span-2 text-center">Negócio</div>
                        <div className="col-span-2 text-center">Valor</div>
                        <div className="col-span-2 text-center">Status</div>
                        <div className="col-span-2 text-center">Validade</div>
                        <div className="col-span-1 text-center"></div>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-white/5">
                        {filteredPropostas.map(proposta => {
                            const status = getStatusInfo(proposta.status)
                            const isExpired = proposta.valid_until
                                ? new Date(proposta.valid_until) < new Date() && proposta.status !== 'accepted' && proposta.status !== 'rejected'
                                : false

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

                                    <div className="col-span-1 md:col-span-1 flex justify-end">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-900 dark:hover:text-white">
                                                    <span className="sr-only">Abrir menu</span>
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-white dark:bg-[#12142a] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                                                <DropdownMenuItem className="cursor-pointer" onClick={() => updateStatus(proposta.id, 'sent')}>
                                                    <Send className="mr-2 h-4 w-4 text-blue-500" /> Marcar como Enviada
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="cursor-pointer" onClick={() => updateStatus(proposta.id, 'accepted')}>
                                                    <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" /> Marcar como Aceita
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="cursor-pointer" onClick={() => updateStatus(proposta.id, 'rejected')}>
                                                    <XCircle className="mr-2 h-4 w-4 text-red-500" /> Marcar como Recusada
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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
