"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Users, Search, Filter, Mail, Phone, MoreHorizontal, Loader2, LayoutGrid, AlignJustify, Linkedin, MessageSquare, Upload, FileText, Chrome } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import Link from "next/link"
import { ContactModal } from "@/components/modals/contact-modal"
import { Contact } from "@/types/crm"

type CsvContactRow = Record<string, string>

type ContactInsert = {
    user_id: string
    first_name: string
    last_name: string
    email: string | null
    phone: string | null
    company: string | null
    source: string
    status: "active" | "inactive" | "lead" | "customer"
}

const STATUS_VALUES = ["active", "inactive", "lead", "customer"] as const

function parseCsvLine(line: string, delimiter = ",") {
    const values: string[] = []
    let current = ""
    let inQuotes = false

    for (let index = 0; index < line.length; index += 1) {
        const char = line[index]
        const next = line[index + 1]

        if (char === '"' && next === '"') {
            current += '"'
            index += 1
            continue
        }

        if (char === '"') {
            inQuotes = !inQuotes
            continue
        }

        if (char === delimiter && !inQuotes) {
            values.push(current.trim())
            current = ""
            continue
        }

        current += char
    }

    values.push(current.trim())
    return values
}

function parseCsv(text: string) {
    const lines = text.replace(/\r/g, "").split("\n").filter((line) => line.trim().length > 0)
    if (lines.length < 2) return []

    const delimiter = lines[0].includes(";") && !lines[0].includes(",") ? ";" : ","
    const headers = parseCsvLine(lines[0], delimiter).map((header) => header.trim().toLowerCase())

    return lines.slice(1).map((line) => {
        const values = parseCsvLine(line, delimiter)
        return headers.reduce<CsvContactRow>((row, header, index) => {
            row[header] = values[index]?.trim() || ""
            return row
        }, {})
    })
}

function getCsvValue(row: CsvContactRow, keys: string[]) {
    for (const key of keys) {
        const value = row[key]
        if (value) return value
    }

    return ""
}

export default function CrmContactsPage() {
    const supabase = useMemo(() => createClient(), [])
    const [contacts, setContacts] = useState<Contact[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid')
    const [isImportOpen, setIsImportOpen] = useState(false)
    const [importData, setImportData] = useState({ name: "", email: "", phone: "", company: "", source: "manual" })
    const [csvContacts, setCsvContacts] = useState<CsvContactRow[]>([])
    const [csvFileName, setCsvFileName] = useState("")
    const [importFeedback, setImportFeedback] = useState("")

    const fetchContacts = useCallback(async () => {
        setLoading(true)
        const { data: userAuth } = await supabase.auth.getUser()
        if (!userAuth.user) {
            setLoading(false)
            return
        }

        const { data, error } = await supabase
            .from('contacts')
            .select('*')
            .eq('user_id', userAuth.user.id)
            .order('created_at', { ascending: false })

        if (!error && data) {
            setContacts(data)
        }
        setLoading(false)
    }, [supabase])

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void fetchContacts()
        }, 0)

        return () => window.clearTimeout(timer)
    }, [fetchContacts])

    const filteredContacts = contacts.filter(c => 
        c.first_name?.toLowerCase().includes(search.toLowerCase()) || 
        c.last_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.company?.toLowerCase().includes(search.toLowerCase())
    )

    const statusColors: Record<string, string> = {
        'active': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        'inactive': 'bg-gray-500/10 text-gray-400 border-gray-500/20',
        'lead': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        'customer': 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    }

    const statusLabels: Record<string, string> = {
        'active': 'Ativo',
        'inactive': 'Inativo',
        'lead': 'Lead',
        'customer': 'Cliente'
    }

    const buildContactPayload = useCallback((data: {
        name: string
        email?: string
        phone?: string
        company?: string
        source?: string
        status?: string
    }, userId: string): ContactInsert => {
        const nameParts = data.name.trim().split(/\s+/)
        const status = STATUS_VALUES.includes(data.status as ContactInsert["status"])
            ? data.status as ContactInsert["status"]
            : "lead"

        return {
            user_id: userId,
            first_name: nameParts[0] || "",
            last_name: nameParts.slice(1).join(" ") || "",
            email: data.email || null,
            phone: data.phone || null,
            company: data.company || null,
            source: data.source || "manual",
            status,
        }
    }, [])

    const handleCsvFile = useCallback((file?: File) => {
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            const text = String(event.target?.result || "")
            const rows = parseCsv(text)
            setCsvContacts(rows)
            setCsvFileName(file.name)
            setImportFeedback(rows.length > 0
                ? `${rows.length} contato(s) lido(s) do CSV.`
                : "Nao encontrei contatos validos nesse CSV.")
        }
        reader.readAsText(file)
    }, [])

    const handleManualImport = useCallback(async () => {
        if (!importData.name.trim()) {
            alert("Nome e obrigatorio")
            return
        }

        const { data: userAuth } = await supabase.auth.getUser()
        if (!userAuth.user) return

        const { error } = await supabase.from('contacts').insert(
            buildContactPayload(importData, userAuth.user.id)
        )

        if (!error) {
            setIsImportOpen(false)
            setImportData({ name: "", email: "", phone: "", company: "", source: "manual" })
            setCsvContacts([])
            setCsvFileName("")
            setImportFeedback("")
            void fetchContacts()
        } else {
            alert("Erro ao importar contato")
        }
    }, [buildContactPayload, fetchContacts, importData, supabase])

    const handleCsvImport = useCallback(async () => {
        if (csvContacts.length === 0) {
            alert("Selecione um CSV com contatos antes de importar.")
            return
        }

        const { data: userAuth } = await supabase.auth.getUser()
        if (!userAuth.user) return

        const payload = csvContacts
            .map((row) => {
                const firstName = getCsvValue(row, ["first_name", "primeiro_nome"])
                const lastName = getCsvValue(row, ["last_name", "sobrenome"])
                const name = getCsvValue(row, ["name", "nome", "full_name", "nome completo", "nome_completo"]) || `${firstName} ${lastName}`.trim()

                return buildContactPayload({
                    name,
                    email: getCsvValue(row, ["email", "e-mail", "mail"]),
                    phone: getCsvValue(row, ["phone", "telefone", "whatsapp", "celular"]),
                    company: getCsvValue(row, ["company", "empresa", "organizacao", "organization"]),
                    source: getCsvValue(row, ["source", "origem"]) || "csv",
                    status: getCsvValue(row, ["status", "situacao"]) || "lead",
                }, userAuth.user.id)
            })
            .filter((contact) => contact.first_name)

        if (payload.length === 0) {
            alert("O CSV precisa ter ao menos uma coluna de nome/name ou first_name.")
            return
        }

        const { error } = await supabase.from('contacts').insert(payload)

        if (!error) {
            setIsImportOpen(false)
            setCsvContacts([])
            setCsvFileName("")
            setImportFeedback("")
            void fetchContacts()
        } else {
            alert("Erro ao importar CSV")
        }
    }, [buildContactPayload, csvContacts, fetchContacts, supabase])

    const handleExtensionInstall = useCallback((source: "linkedin" | "whatsapp") => {
        const label = source === "linkedin" ? "LinkedIn" : "WhatsApp"
        setImportData((current) => ({ ...current, source }))
        setImportFeedback(`Extensao ${label}: deixe o pacote da extensao publicado e configure o token de captura para liberar a instalacao real.`)
    }, [])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-violet-500/20 text-violet-400">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Leads e Clientes</h1>
                        <p className="text-sm text-slate-500 dark:text-gray-500">Liste e gerencie sua base de contatos.</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500 dark:text-gray-500" />
                        <Input
                            placeholder="Buscar contato..."
                            className="pl-8 bg-white dark:bg-[#12142a] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon" className="bg-white dark:bg-[#12142a] border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/[0.02]">
                        <Filter className="h-4 w-4" />
                    </Button>
                    <div className="flex border border-slate-200 dark:border-white/[0.06] rounded-md overflow-hidden bg-white dark:bg-[#12142a]">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className={`rounded-none h-9 w-9 ${viewMode === 'list' ? 'bg-slate-100 text-slate-900 dark:bg-white/[0.1] dark:text-white' : 'text-slate-500 dark:text-gray-400'}`}
                            onClick={() => setViewMode('list')}
                        >
                            <AlignJustify className="h-4 w-4" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className={`rounded-none h-9 w-9 ${viewMode === 'grid' ? 'bg-slate-100 text-slate-900 dark:bg-white/[0.1] dark:text-white' : 'text-slate-500 dark:text-gray-400'}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button variant="outline" onClick={() => setIsImportOpen(true)} className="border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/[0.03]">
                        <Upload className="mr-2 h-4 w-4" /> Importar
                    </Button>
                    <Button onClick={() => setIsModalOpen(true)} className="bg-violet-600 hover:bg-violet-700 text-white">
                        <Plus className="mr-2 h-4 w-4" /> Novo Contato
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-violet-500 dark:text-violet-400" />
                </div>
            ) : filteredContacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-gray-500 bg-white dark:bg-[#12142a] rounded-xl border border-slate-200 dark:border-white/[0.06]">
                    <Users className="h-12 w-12 text-slate-200 dark:text-white/[0.1] mb-4" />
                    <p>Nenhum contato encontrado.</p>
                </div>
            ) : viewMode === 'list' ? (
                <Card className="bg-white dark:bg-[#12142a] border border-slate-200 dark:border-white/[0.06] shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/[0.06] p-4">
                        <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider items-center">
                            <div className="col-span-12 md:col-span-4">Nome & Empresa</div>
                            <div className="col-span-12 md:col-span-3 hidden md:block">Contato</div>
                            <div className="col-span-12 md:col-span-2 hidden md:block text-center">Status</div>
                            <div className="col-span-12 md:col-span-2 hidden md:block text-center">Origem</div>
                            <div className="col-span-12 md:col-span-1 text-right">Ações</div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 divide-y divide-slate-100 dark:divide-white/[0.06] min-h-[300px] relative">
                        {filteredContacts.map(contact => (
                            <div key={contact.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                <div className="col-span-10 md:col-span-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300 flex items-center justify-center font-bold shrink-0">
                                        {contact.first_name?.[0]?.toUpperCase() || 'C'}
                                    </div>
                                    <div className="min-w-0">
                                        <Link href={`/contatos/${contact.id}`} className="font-semibold text-slate-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 truncate block">
                                            {contact.first_name} {contact.last_name}
                                        </Link>
                                        <div className="text-xs text-slate-500 dark:text-gray-500 truncate mt-0.5">
                                            {contact.company || 'Sem empresa'}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-12 md:col-span-3 hidden md:block space-y-1">
                                    {contact.email && (
                                        <div className="flex items-center text-xs text-slate-500 dark:text-gray-400">
                                            <Mail className="h-3 w-3 mr-1.5 shrink-0" />
                                            <span className="truncate">{contact.email}</span>
                                        </div>
                                    )}
                                    {contact.phone && (
                                        <div className="flex items-center text-xs text-slate-500 dark:text-gray-400">
                                            <Phone className="h-3 w-3 mr-1.5 shrink-0" />
                                            <span className="truncate">{contact.phone}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="col-span-12 md:col-span-2 hidden md:flex justify-center">
                                    <Badge variant="outline" className={`font-normal ${statusColors[contact.status || 'lead'] || statusColors['lead']}`}>
                                        {statusLabels[contact.status || 'lead'] || 'Lead'}
                                    </Badge>
                                </div>
                                <div className="col-span-12 md:col-span-2 hidden md:flex justify-center">
                                    <span className="text-sm text-slate-500 dark:text-gray-400 truncate max-w-[120px]" title={contact.source || '-'}>
                                        {contact.source || '-'}
                                    </span>
                                </div>
                                <div className="col-span-2 md:col-span-1 flex justify-end">
                                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white" asChild>
                                        <Link href={`/contatos/${contact.id}`}>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredContacts.map(contact => (
                        <Card key={contact.id} className="bg-white dark:bg-[#12142a] border border-slate-200 dark:border-white/[0.06] shadow-sm hover:shadow-md hover:border-violet-200 dark:hover:border-violet-500/30 transition-all flex flex-col">
                            <CardHeader className="p-4 pb-2">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-100 to-fuchsia-100 text-violet-700 dark:from-violet-500/20 dark:to-fuchsia-500/10 dark:text-violet-300 flex items-center justify-center text-lg font-bold shrink-0 border-2 border-white dark:border-[#1a1d36] shadow-sm">
                                        {contact.first_name?.[0]?.toUpperCase() || 'C'}
                                    </div>
                                    <Badge variant="outline" className={`font-medium text-[10px] uppercase tracking-wider ${statusColors[contact.status || 'lead'] || statusColors['lead']}`}>
                                        {statusLabels[contact.status || 'lead'] || 'Lead'}
                                    </Badge>
                                </div>
                                <Link href={`/contatos/${contact.id}`} className="font-bold text-base text-slate-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 truncate block mt-1">
                                    {contact.first_name} {contact.last_name}
                                </Link>
                                <CardDescription className="text-xs font-medium text-slate-500 dark:text-gray-400 truncate">
                                    {contact.company || 'Pessoa Física'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-2 flex-1 space-y-3">
                                <div className="space-y-2">
                                    {contact.email ? (
                                        <div className="flex items-center text-xs text-slate-600 dark:text-gray-400">
                                            <Mail className="h-3.5 w-3.5 mr-2 shrink-0 text-slate-400" />
                                            <span className="truncate">{contact.email}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-xs text-slate-400 dark:text-gray-600 italic">
                                            <Mail className="h-3.5 w-3.5 mr-2 shrink-0 opacity-50" />
                                            Sem e-mail
                                        </div>
                                    )}
                                    {contact.phone ? (
                                        <div className="flex items-center text-xs text-slate-600 dark:text-gray-400">
                                            <Phone className="h-3.5 w-3.5 mr-2 shrink-0 text-slate-400" />
                                            <span className="truncate">{contact.phone}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-xs text-slate-400 dark:text-gray-600 italic">
                                            <Phone className="h-3.5 w-3.5 mr-2 shrink-0 opacity-50" />
                                            Sem telefone
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="p-4 pt-3 border-t border-slate-100 dark:border-white/[0.04] bg-slate-50/50 dark:bg-white/[0.01] flex justify-between items-center text-xs">
                                <span className="text-slate-500 dark:text-gray-500 truncate max-w-[120px]">
                                    {contact.source ? `Origem: ${contact.source}` : 'Direto'}
                                </span>
                                <Button variant="ghost" size="sm" className="h-7 px-2 text-violet-600 hover:text-violet-700 hover:bg-violet-50 dark:text-violet-400 dark:hover:text-violet-300 dark:hover:bg-violet-500/10" asChild>
                                    <Link href={`/contatos/${contact.id}`}>Ver Detalhes</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            <ContactModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={fetchContacts} 
            />

            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogContent className="sm:max-w-[720px] bg-white dark:bg-[#12142a] border border-slate-200 dark:border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-slate-900 dark:text-white">Importar Contatos</DialogTitle>
                        <DialogDescription className="text-slate-500 dark:text-gray-400">
                            Importe por CSV, cadastre um contato manualmente ou conecte as extensoes de captura.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-5 py-4">
                        {importFeedback && (
                            <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300">
                                {importFeedback}
                            </div>
                        )}

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-[#0d0f1a]">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                    <div className="rounded-lg bg-violet-100 p-2 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300">
                                        <FileText className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Importar CSV</p>
                                        <p className="text-xs text-slate-500 dark:text-gray-400">Aceita colunas como nome/name, email, telefone/phone, empresa/company, origem/source e status.</p>
                                        {csvFileName && (
                                            <p className="mt-1 text-[11px] font-medium text-violet-600 dark:text-violet-300">{csvFileName}</p>
                                        )}
                                    </div>
                                </div>
                                <label className="inline-flex h-9 cursor-pointer items-center rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-[#12142a] dark:text-gray-200 dark:hover:bg-white/[0.04]">
                                    Selecionar CSV
                                    <input
                                        type="file"
                                        accept=".csv,text/csv"
                                        className="hidden"
                                        onChange={(event) => {
                                            handleCsvFile(event.target.files?.[0])
                                            event.target.value = ""
                                        }}
                                    />
                                </label>
                            </div>
                            <Button
                                type="button"
                                onClick={handleCsvImport}
                                disabled={csvContacts.length === 0}
                                className="mt-4 w-full bg-violet-600 text-white hover:bg-violet-700"
                            >
                                <Upload className="mr-2 h-4 w-4" /> Importar {csvContacts.length > 0 ? `${csvContacts.length} contato(s)` : "CSV"}
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                { key: "linkedin" as const, label: "Extensao LinkedIn", icon: Linkedin, color: "blue" },
                                { key: "whatsapp" as const, label: "Extensao WhatsApp", icon: MessageSquare, color: "green" },
                            ].map((item) => (
                                <div key={item.key} className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
                                    <div className="flex items-start gap-3">
                                        <div className={`rounded-lg p-2 ${item.color === "blue" ? "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300" : "bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-300"}`}>
                                            <item.icon className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.label}</p>
                                            <p className="mt-1 text-xs text-slate-500 dark:text-gray-400">Captura contatos da tela e envia para o CRM com origem marcada.</p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleExtensionInstall(item.key)}
                                        className="mt-4 w-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-200 dark:hover:bg-white/[0.06]"
                                    >
                                        <Chrome className="mr-2 h-4 w-4" /> Instalar extensao
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setImportData({...importData, source: "linkedin"})}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${importData.source === 'linkedin' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' : 'border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/30'}`}
                            >
                                <Linkedin className={`h-6 w-6 ${importData.source === 'linkedin' ? 'text-blue-600' : 'text-slate-400 dark:text-gray-500'}`} />
                                <span className={`text-sm font-medium ${importData.source === 'linkedin' ? 'text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-gray-300'}`}>LinkedIn</span>
                            </button>
                            <button
                                onClick={() => setImportData({...importData, source: "whatsapp"})}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${importData.source === 'whatsapp' ? 'border-green-500 bg-green-50 dark:bg-green-500/10' : 'border-slate-200 dark:border-white/10 hover:border-green-300 dark:hover:border-green-500/30'}`}
                            >
                                <MessageSquare className={`h-6 w-6 ${importData.source === 'whatsapp' ? 'text-green-600' : 'text-slate-400 dark:text-gray-500'}`} />
                                <span className={`text-sm font-medium ${importData.source === 'whatsapp' ? 'text-green-700 dark:text-green-400' : 'text-slate-600 dark:text-gray-300'}`}>WhatsApp</span>
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-gray-300">Nome do Contato</label>
                                <Input placeholder="Ex: João Silva" className="bg-white dark:bg-[#0d0f1a] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white" value={importData.name} onChange={e => setImportData({...importData, name: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-gray-300">E-mail</label>
                                    <Input placeholder="email@empresa.com" className="bg-white dark:bg-[#0d0f1a] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white" value={importData.email} onChange={e => setImportData({...importData, email: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-gray-300">Telefone</label>
                                    <Input placeholder="(11) 99999-9999" className="bg-white dark:bg-[#0d0f1a] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white" value={importData.phone} onChange={e => setImportData({...importData, phone: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-gray-300">Empresa</label>
                                <Input placeholder="Empresa S.A." className="bg-white dark:bg-[#0d0f1a] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white" value={importData.company} onChange={e => setImportData({...importData, company: e.target.value})} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsImportOpen(false)} className="border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300">Cancelar</Button>
                        <Button 
                            onClick={handleManualImport}
                            className={importData.source === 'linkedin' ? 'bg-blue-600 hover:bg-blue-700 text-white' : importData.source === 'whatsapp' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-violet-600 hover:bg-violet-700 text-white'}
                        >
                            <Upload className="mr-2 h-4 w-4" /> Importar Contato
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
