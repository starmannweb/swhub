"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import {
    ShieldCheck, LayoutTemplate, Download, Users, Globe, KanbanSquare,
    FileText, CreditCard, ArrowRight, Loader2, BarChart3, Settings,
    GraduationCap, Megaphone, Database, Trash2, Plus, AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"

type AdminStats = {
    totalUsers: number
    totalSites: number
    totalDeals: number
    totalTemplates: number
    totalMaterials: number
    totalProposals: number
}

const adminModules = [
    {
        title: "Modelos de Sites",
        description: "Gerenciar templates disponíveis para usuários",
        href: "/admin/modelos",
        icon: LayoutTemplate,
        color: "bg-violet-500/15 text-violet-400",
    },
    {
        title: "Materiais de Apoio",
        description: "Upload e gestão de arquivos para download",
        href: "/admin/materiais",
        icon: Download,
        color: "bg-purple-500/15 text-purple-400",
    },
    {
        title: "Gerenciar Usuários",
        description: "Visualizar e administrar contas de usuários",
        href: "/admin/usuarios",
        icon: Users,
        color: "bg-blue-500/15 text-blue-400",
    },
    {
        title: "Sites Publicados",
        description: "Monitorar todos os sites publicados na plataforma",
        href: "/admin/sites",
        icon: Globe,
        color: "bg-fuchsia-500/15 text-fuchsia-400",
    },
    {
        title: "Pipelines & CRM",
        description: "Visão geral de pipelines e negócios dos usuários",
        href: "/admin/crm",
        icon: KanbanSquare,
        color: "bg-indigo-500/15 text-indigo-400",
    },
    {
        title: "Treinamentos",
        description: "Gerenciar vídeo-aulas e conteúdos educativos",
        href: "/admin/treinamentos",
        icon: GraduationCap,
        color: "bg-orange-500/15 text-orange-400",
    },
    {
        title: "Indicações",
        description: "Visualizar indicações e NPS dos clientes",
        href: "/admin/indicacoes",
        icon: Megaphone,
        color: "bg-pink-500/15 text-pink-400",
    },
    {
        title: "Configurações do Sistema",
        description: "Planos, limites, variáveis e integrações globais",
        href: "/admin/config",
        icon: Settings,
        color: "bg-gray-500/15 text-slate-500 dark:text-gray-400",
    },
]

export default function AdminPage() {
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [seeding, setSeeding] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [stats, setStats] = useState<AdminStats>({
        totalUsers: 0,
        totalSites: 0,
        totalDeals: 0,
        totalTemplates: 0,
        totalMaterials: 0,
        totalProposals: 0,
    })

    useEffect(() => {
        async function fetchStats() {
            try {
                const [
                    { count: usersCount },
                    { count: sitesCount },
                    { count: dealsCount },
                    { count: templatesCount },
                    { count: materialsCount },
                    { count: proposalsCount },
                ] = await Promise.all([
                    supabase.from("profiles").select("*", { count: "exact", head: true }),
                    supabase.from("sites").select("*", { count: "exact", head: true }),
                    supabase.from("crm_deals").select("*", { count: "exact", head: true }),
                    supabase.from("site_templates").select("*", { count: "exact", head: true }),
                    supabase.from("materials").select("*", { count: "exact", head: true }),
                    supabase.from("crm_proposals").select("*", { count: "exact", head: true }),
                ])

                setStats({
                    totalUsers: usersCount || 0,
                    totalSites: sitesCount || 0,
                    totalDeals: dealsCount || 0,
                    totalTemplates: templatesCount || 0,
                    totalMaterials: materialsCount || 0,
                    totalProposals: proposalsCount || 0,
                })
            } catch (err) {
                console.error("Admin stats error:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    const statCards = [
        { title: "Usuários", value: stats.totalUsers, icon: Users, color: "bg-violet-500/15 text-violet-400" },
        { title: "Sites", value: stats.totalSites, icon: Globe, color: "bg-fuchsia-500/15 text-fuchsia-400" },
        { title: "Negócios", value: stats.totalDeals, icon: KanbanSquare, color: "bg-blue-500/15 text-blue-400" },
        { title: "Templates", value: stats.totalTemplates, icon: LayoutTemplate, color: "bg-purple-500/15 text-purple-400" },
        { title: "Materiais", value: stats.totalMaterials, icon: Download, color: "bg-indigo-500/15 text-indigo-400" },
        { title: "Propostas", value: stats.totalProposals, icon: FileText, color: "bg-pink-500/15 text-pink-400" },
    ]

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-violet-600/20">
                    <ShieldCheck className="h-7 w-7 text-violet-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Painel Administrativo</h1>
                    <p className="text-sm text-slate-500 dark:text-gray-500">Gerencie toda a plataforma a partir daqui</p>
                </div>
            </div>

            {/* Stats */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {statCards.map((stat) => (
                        <div key={stat.title} className="rounded-xl bg-white dark:bg-[#12142a] border border-slate-200 dark:border-white/[0.06] p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-semibold text-slate-500 dark:text-gray-500 uppercase tracking-wider">{stat.title}</span>
                                <div className={`p-1.5 rounded-lg ${stat.color}`}>
                                    <stat.icon className="h-3.5 w-3.5" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Admin Modules Grid */}
            <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Módulos de Administração</h2>
                <p className="text-xs text-slate-500 dark:text-gray-500 mb-4">Acesse as ferramentas de gestão da plataforma</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {adminModules.map((mod) => (
                        <Link
                            key={mod.title}
                            href={mod.href}
                            className="group flex items-start gap-4 p-5 rounded-xl bg-white dark:bg-[#12142a] border border-slate-200 dark:border-white/[0.06] hover:border-violet-500/20 transition-all"
                        >
                            <div className={`p-2.5 rounded-xl shrink-0 ${mod.color}`}>
                                <mod.icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white mb-0.5">{mod.title}</p>
                                <p className="text-[11px] text-slate-500 dark:text-gray-500 leading-relaxed">{mod.description}</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-slate-300 dark:text-gray-700 group-hover:text-violet-400 transition-colors shrink-0 mt-1" />
                        </Link>
                    ))}
                </div>
            </div>

            {/* Seed Management */}
            <div className="rounded-xl bg-white dark:bg-[#12142a] border border-slate-200 dark:border-white/[0.06] p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-amber-500/15">
                        <Database className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Dados de Teste (Seeds)</h2>
                        <p className="text-xs text-slate-500 dark:text-gray-500">Crie ou remova dados fictícios para testar a plataforma.</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 mb-4">
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                    <p className="text-xs text-amber-700 dark:text-amber-400">Atenção: Deletar seeds remove permanentemente os dados de teste. Essa ação não pode ser desfeita.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#0d0f1a] border border-slate-200 dark:border-white/[0.06] space-y-3">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <Plus className="h-4 w-4 text-emerald-500" /> Alimentar Seeds
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-gray-500">Criar contatos, negócios, propostas, faturas e tarefas fictícias para testes.</p>
                        <Button
                            onClick={async () => {
                                setSeeding(true)
                                try {
                                    const { data: { user } } = await supabase.auth.getUser()
                                    if (!user) return

                                    // Seed contacts
                                    const contacts = [
                                        { first_name: 'Ana', last_name: 'Costa', email: 'ana@teste.com', phone: '11999990001', company: 'Digital Co', status: 'lead', source: 'linkedin', user_id: user.id },
                                        { first_name: 'Bruno', last_name: 'Souza', email: 'bruno@teste.com', phone: '11999990002', company: 'Agencia X', status: 'active', source: 'whatsapp', user_id: user.id },
                                        { first_name: 'Carla', last_name: 'Lima', email: 'carla@teste.com', phone: '11999990003', company: 'E-commerce Y', status: 'customer', source: 'linkedin', user_id: user.id },
                                        { first_name: 'Diego', last_name: 'Santos', email: 'diego@teste.com', phone: '11999990004', company: 'StartUp Z', status: 'lead', source: 'whatsapp', user_id: user.id },
                                        { first_name: 'Elena', last_name: 'Martins', email: 'elena@teste.com', phone: '11999990005', company: 'Consulting K', status: 'active', source: 'manual', user_id: user.id },
                                    ]
                                    await supabase.from('contacts').insert(contacts)

                                    // Seed invoices
                                    const { data: seedContacts } = await supabase.from('contacts').select('id').eq('user_id', user.id).limit(3)
                                    if (seedContacts && seedContacts.length > 0) {
                                        const invoices = seedContacts.map((c, i) => ({
                                            user_id: user.id,
                                            contact_id: c.id,
                                            description: `Fatura teste #${i+1} - Serviço de ${['Site', 'CRM', 'Marketing'][i % 3]}`,
                                            status: i === 0 ? 'paid' : 'pending',
                                            amount: (i + 1) * 500,
                                            payment_method: 'pix',
                                            pix_code: '00020126580014BR.GOV.BCB.PIX0136hub-seed-test52040000530398654051500.005802BR5915HUB Test6009SP62140510SEED000' + i + '6304',
                                            due_date: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
                                            paid_at: i === 0 ? new Date().toISOString() : null,
                                        }))
                                        await supabase.from('crm_invoices').insert(invoices)
                                    }

                                    alert('✅ Seeds criados com sucesso! 5 contatos e faturas de teste foram adicionados.')
                                } catch (err) {
                                    console.error(err)
                                    alert('Erro ao criar seeds')
                                } finally {
                                    setSeeding(false)
                                }
                            }}
                            disabled={seeding}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            {seeding ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Criando...</> : <><Plus className="mr-2 h-4 w-4" /> Criar Dados de Teste</>}
                        </Button>
                    </div>

                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#0d0f1a] border border-slate-200 dark:border-white/[0.06] space-y-3">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <Trash2 className="h-4 w-4 text-red-500" /> Limpar Seeds
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-gray-500">Remove todos os contatos, negócios, faturas e propostas de teste do sistema.</p>
                        <Button
                            onClick={async () => {
                                if (!confirm('Tem certeza que deseja deletar TODOS os dados de teste? Isso irá remover contatos com @teste.com e faturas com "teste" na descrição.')) return
                                setDeleting(true)
                                try {
                                    const { data: { user } } = await supabase.auth.getUser()
                                    if (!user) return

                                    // Delete test contacts (cascades to invoices linked to them)
                                    await supabase.from('contacts').delete().eq('user_id', user.id).like('email', '%@teste.com')
                                    // Delete test invoices
                                    await supabase.from('crm_invoices').delete().eq('user_id', user.id).like('description', '%teste%')

                                    alert('🗑️ Seeds removidos com sucesso!')
                                } catch (err) {
                                    console.error(err)
                                    alert('Erro ao remover seeds')
                                } finally {
                                    setDeleting(false)
                                }
                            }}
                            disabled={deleting}
                            variant="outline"
                            className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500/10"
                        >
                            {deleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Removendo...</> : <><Trash2 className="mr-2 h-4 w-4" /> Deletar Dados de Teste</>}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
