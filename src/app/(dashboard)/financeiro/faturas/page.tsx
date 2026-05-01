"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Plus, Search, Filter,
    MoreHorizontal, Calendar,
    CreditCard, Banknote, QrCode, ShieldCheck, Clock, CheckCircle2, Copy
} from "lucide-react"

export default function FaturasPage() {
    const supabase = createClient()
    const [search, setSearch] = useState("")
    const [faturas, setFaturas] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState<string | null>(null)

    useEffect(() => {
        fetchFaturas()
    }, [])

    async function fetchFaturas() {
        setLoading(true)
        const { data: userAuth } = await supabase.auth.getUser()
        if (!userAuth.user) return

        const { data, error } = await supabase
            .from('crm_invoices')
            .select(`
                *,
                crm_contacts:contact_id ( name, email ),
                crm_projects:project_id ( name )
            `)
            .eq('user_id', userAuth.user.id)
            .order('created_at', { ascending: false })

        if (!error && data) {
            setFaturas(data)
        }
        setLoading(false)
    }

    async function handleAddFatura() {
        alert("Para gerar uma fatura precisamos selecionar um Cliente (Contato). Como estamos num MVP sem modal complexo, simular gerando uma fatura PIX pro contato genérico.");

        const { data: userAuth } = await supabase.auth.getUser()
        if (!userAuth.user) return

        // Procura um contato pra vincular
        const { data: contatos } = await supabase.from('crm_contacts').select('id').eq('user_id', userAuth.user.id).limit(1)

        if (!contatos || contatos.length === 0) {
            alert("Aviso: Crie um Contato/Lead no CRM antes de gerar faturas.")
            return;
        }

        const description = prompt("Descrição / Serviço da Fatura:");
        if (!description) return;

        const amountStr = prompt("Valor em Reais (ex: 1500.00):");
        if (!amountStr) return;

        const { data, error } = await supabase
            .from('crm_invoices')
            .insert({
                user_id: userAuth.user.id,
                contact_id: contatos[0].id,
                description: description,
                status: 'pending',
                amount: parseFloat(amountStr),
                payment_method: 'pix',
                pix_code: '00020126580014BR.GOV.BCB.PIX0136hub-pix-key-ficticia52040000530398654051500.005802BR5915HUB Pagamentos6009SAO PAULO62140510HUBFATURA26304ED1A',
                due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            })
            .select(`*, crm_contacts:contact_id(name, email), crm_projects:project_id(name)`)
            .single()

        if (!error && data) {
            setFaturas([data, ...faturas])
        }
    }

    async function toggleStatusPagamento(id: string, currentStatus: string) {
        const newStatus = currentStatus === 'paid' ? 'pending' : 'paid'
        const { error } = await supabase
            .from('crm_invoices')
            .update({ status: newStatus, paid_at: newStatus === 'paid' ? new Date().toISOString() : null })
            .eq('id', id)

        if (!error) {
            setFaturas(faturas.map(f => f.id === id ? { ...f, status: newStatus } : f))
        }
    }

    const handleCopyPix = (code: string | null) => {
        if (!code) return;
        navigator.clipboard.writeText(code)
        setCopied(code)
        setTimeout(() => setCopied(null), 2000)
    }

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)
    }

    const filteredFaturas = faturas.filter(f =>
        f.description?.toLowerCase().includes(search.toLowerCase()) ||
        f.crm_contacts?.name?.toLowerCase().includes(search.toLowerCase())
    )

    const getTotalPendente = () => faturas.filter(f => f.status === 'pending').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const getTotalRecebido = () => faturas.filter(f => f.status === 'paid').reduce((acc, curr) => acc + Number(curr.amount), 0);

    return (
        <div className="flex-1 space-y-6 pt-6 px-4 md:px-8 max-w-7xl mx-auto w-full mb-10">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Faturas & Cobranças</h2>
                    <p className="text-muted-foreground">
                        Centro de recebimentos financeiros PIX, Boleto e Cartão.
                    </p>
                </div>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar fatura..."
                            className="pl-8 bg-muted/40"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
                    <Button onClick={handleAddFatura} className="bg-emerald-600 hover:bg-emerald-700"><Plus className="mr-2 h-4 w-4" /> Nova Cobrança</Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-emerald-500 shadow-sm bg-[#12142a] border-y border-r border-white/[0.06]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Caixa Recebido</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-400">{formatCurrency(getTotalRecebido())}</div>
                        <p className="text-xs text-gray-500 mt-1">Total de Faturas Pagas</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-amber-500 shadow-sm bg-[#12142a] border-y border-r border-white/[0.06]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">A Receber</CardTitle>
                        <Clock className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{formatCurrency(getTotalPendente())}</div>
                        <p className="text-xs text-gray-500 mt-1">Aguardando Pagamento</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full flex justify-center py-10">
                        <span className="text-muted-foreground flex items-center gap-2"><div className="w-5 h-5 rounded-full border-t-2 border-primary animate-spin"></div> Carregando financeiro...</span>
                    </div>
                ) : filteredFaturas.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                        Você ainda não gerou nenhuma cobrança.
                    </div>
                ) : (
                    filteredFaturas.map(fatura => {
                        const isPaid = fatura.status === 'paid'
                        const isOverdue = fatura.status === 'overdue'

                        return (
                            <Card key={fatura.id} className={`overflow-hidden transition-all border ${isPaid ? 'border-emerald-500/30 bg-emerald-950/20' : isOverdue ? 'border-red-500/50 bg-[#12142a]' : 'border-white/[0.06] hover:border-violet-500/50 bg-[#12142a]'} shadow-sm flex flex-col text-white`}>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            {fatura.payment_method === 'pix' ? <QrCode className="w-5 h-5 text-teal-500" /> :
                                                fatura.payment_method === 'credit_card' ? <CreditCard className="w-5 h-5 text-blue-500" /> :
                                                    <Banknote className="w-5 h-5 text-emerald-600" />}
                                            <Badge variant="outline" className={`uppercase text-[10px] tracking-wider ${isPaid ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'}`}>
                                                {fatura.status}
                                            </Badge>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="h-4 w-4" /></Button>
                                    </div>
                                    <CardTitle className="text-lg mt-2 truncate" title={fatura.description}>{fatura.description}</CardTitle>
                                    <CardDescription>{fatura.crm_contacts?.name || 'Cliente Removido'}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 pb-4">
                                    <h3 className={`text-3xl font-bold tracking-tight mb-4 ${isPaid ? 'text-emerald-400' : 'text-white'}`}>
                                        {formatCurrency(fatura.amount)}
                                    </h3>

                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <div className="flex justify-between">
                                            <span>Vencimento</span>
                                            <span className={`font-medium ${isOverdue ? 'text-red-500' : 'text-foreground'}`}>
                                                {fatura.due_date ? new Date(fatura.due_date).toLocaleDateString() : 'Imediato'}
                                            </span>
                                        </div>
                                        {fatura.crm_projects?.name && (
                                            <div className="flex justify-between">
                                                <span>Projeto</span>
                                                <span className="truncate max-w-[120px]" title={fatura.crm_projects.name}>{fatura.crm_projects.name}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Box based on Status */}
                                    {!isPaid && fatura.payment_method === 'pix' && fatura.pix_code && (
                                        <div className="mt-4 p-3 bg-muted/40 rounded-md border flex items-center justify-between gap-2">
                                            <div className="truncate text-xs font-mono opacity-60">
                                                {fatura.pix_code.substring(0, 15)}...
                                            </div>
                                            <Button
                                                size="sm" variant="secondary" className="h-7 text-xs flex items-center gap-1 shrink-0"
                                                onClick={() => handleCopyPix(fatura.pix_code)}
                                            >
                                                {copied === fatura.pix_code ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                                {copied === fatura.pix_code ? 'Copiado' : 'PIX Copia e Cola'}
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                                <div className={`p-3 text-xs border-t border-white/[0.06] mt-auto flex justify-between items-center ${isPaid ? 'bg-emerald-500/10' : 'bg-white/[0.02]'}`}>
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        {isPaid ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Clock className="w-3.5 h-3.5" />}
                                        {isPaid ? `Pago em ${new Date(fatura.paid_at).toLocaleDateString()}` : 'Aguardando Cliente'}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-xs font-semibold"
                                        onClick={() => toggleStatusPagamento(fatura.id, fatura.status)}
                                    >
                                        {isPaid ? 'Marcar Pendente' : 'Marcar como Pago'}
                                    </Button>
                                </div>
                            </Card>
                        )
                    })
                )}
            </div>
        </div>
    )
}
