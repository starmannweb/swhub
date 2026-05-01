"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Users, Search, Filter, Mail, Phone, MapPin, MoreHorizontal, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ContactModal } from "@/components/modals/contact-modal"
import { Contact } from "@/types/crm"

export default function CrmContactsPage() {
    const supabase = createClient()
    const [contacts, setContacts] = useState<Contact[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        fetchContacts()
    }, [])

    async function fetchContacts() {
        setLoading(true)
        const { data: userAuth } = await supabase.auth.getUser()
        if (!userAuth.user) return

        const { data, error } = await supabase
            .from('contacts')
            .select('*')
            .eq('user_id', userAuth.user.id)
            .order('created_at', { ascending: false })

        if (!error && data) {
            setContacts(data)
        }
        setLoading(false)
    }

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

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Leads e Clientes</h2>
                    <p className="text-gray-400">
                        Liste e gerencie sua base de contatos.
                    </p>
                </div>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Buscar contato..."
                            className="pl-8 bg-[#12142a] border-white/[0.06] text-white"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon" className="bg-[#12142a] border-white/[0.06] text-white hover:bg-white/[0.02]">
                        <Filter className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => setIsModalOpen(true)} className="bg-violet-600 hover:bg-violet-700 text-white">
                        <Plus className="mr-2 h-4 w-4" /> Novo Contato
                    </Button>
                </div>
            </div>

            <Card className="bg-[#12142a] border border-white/[0.06] shadow-sm overflow-hidden">
                <CardHeader className="bg-white/[0.02] border-b border-white/[0.06] p-4">
                    <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-400 uppercase tracking-wider items-center">
                        <div className="col-span-12 md:col-span-4">Nome & Empresa</div>
                        <div className="col-span-12 md:col-span-3 hidden md:block">Contato</div>
                        <div className="col-span-12 md:col-span-2 hidden md:block text-center">Status</div>
                        <div className="col-span-12 md:col-span-2 hidden md:block text-center">Origem</div>
                        <div className="col-span-12 md:col-span-1 text-right">Ações</div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 divide-y divide-white/[0.06] min-h-[300px] relative">
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                        </div>
                    ) : filteredContacts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <Users className="h-12 w-12 text-white/[0.1] mb-4" />
                            <p>Nenhum contato encontrado.</p>
                        </div>
                    ) : (
                        filteredContacts.map(contact => (
                            <div key={contact.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/[0.02] transition-colors">
                                <div className="col-span-10 md:col-span-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center font-bold shrink-0">
                                        {contact.first_name?.[0]?.toUpperCase() || 'C'}
                                    </div>
                                    <div className="min-w-0">
                                        <Link href={`/contatos/${contact.id}`} className="font-semibold text-white hover:text-violet-400 truncate block">
                                            {contact.first_name} {contact.last_name}
                                        </Link>
                                        <div className="text-xs text-gray-500 truncate mt-0.5">
                                            {contact.company || 'Sem empresa'}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-12 md:col-span-3 hidden md:block space-y-1">
                                    {contact.email && (
                                        <div className="flex items-center text-xs text-gray-400">
                                            <Mail className="h-3 w-3 mr-1.5 shrink-0" />
                                            <span className="truncate">{contact.email}</span>
                                        </div>
                                    )}
                                    {contact.phone && (
                                        <div className="flex items-center text-xs text-gray-400">
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
                                    <span className="text-sm text-gray-400 truncate max-w-[120px]" title={contact.source || '-'}>
                                        {contact.source || '-'}
                                    </span>
                                </div>
                                <div className="col-span-2 md:col-span-1 flex justify-end">
                                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" asChild>
                                        <Link href={`/contatos/${contact.id}`}>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>

            <ContactModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={fetchContacts} 
            />
        </div>
    )
}
