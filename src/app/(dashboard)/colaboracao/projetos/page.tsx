"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
    Plus, Search, Filter,
    MoreHorizontal, Calendar, CheckSquare, Loader2, Briefcase, FileText
} from "lucide-react"
import { CrmProject } from "@/types/crm"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

export default function ProjetosPage() {
    const supabase = createClient()
    const [search, setSearch] = useState("")
    const [projetos, setProjetos] = useState<CrmProject[]>([])
    const [loading, setLoading] = useState(true)

    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [approvedProposals, setApprovedProposals] = useState<any[]>([])
    const [selectedProposal, setSelectedProposal] = useState<string>("")
    const [newProjectName, setNewProjectName] = useState("")
    const [creatingProject, setCreatingProject] = useState(false)

    useEffect(() => {
        fetchProjetos()
        fetchApprovedProposals()
    }, [])

    async function fetchApprovedProposals() {
        const { data: userAuth } = await supabase.auth.getUser()
        if (!userAuth.user) return

        const { data } = await supabase
            .from('crm_proposals')
            .select('id, title, total')
            .eq('user_id', userAuth.user.id)
            .eq('status', 'accepted')

        setApprovedProposals(data || [])
    }

    async function fetchProjetos() {
        setLoading(true)
        const { data: userAuth } = await supabase.auth.getUser()
        if (!userAuth.user) return

        const { data, error } = await supabase
            .from('crm_projects')
            .select('*')
            .eq('user_id', userAuth.user.id)
            .order('created_at', { ascending: false })

        if (!error && data) {
            setProjetos(data)
        }
        setLoading(false)
    }

    async function handleCreateProjectFromModal() {
        if (!newProjectName.trim()) return;
        setCreatingProject(true);

        const { data: userAuth } = await supabase.auth.getUser()
        if (!userAuth.user) return

        const { data, error } = await supabase
            .from('crm_projects')
            .insert({
                user_id: userAuth.user.id,
                name: newProjectName,
                status: 'planning',
                budget: 0,
            })
            .select()
            .single()

        if (!error && data) {
            setProjetos([data, ...projetos])
            setIsAddModalOpen(false)
            setNewProjectName("")
            setSelectedProposal("")
        }
        setCreatingProject(false)
    }

    const filteredProjetos = projetos.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

    return (
        <div className="flex-1 space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-pink-500/20 text-pink-400">
                        <Briefcase className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Projetos</h1>
                        <p className="text-sm text-slate-500 dark:text-gray-500">
                            Gestão e execução de entregáveis pós-venda.
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400 dark:text-gray-500" />
                        <Input
                            placeholder="Buscar projeto..."
                            className="pl-8 bg-slate-50 dark:bg-[#0d0f1a] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white placeholder:text-slate-400"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon" className="bg-white dark:bg-[#12142a] border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-white"><Filter className="h-4 w-4" /></Button>
                    <Button onClick={() => setIsAddModalOpen(true)} className="bg-violet-600 hover:bg-violet-700 text-white"><Plus className="mr-2 h-4 w-4" /> Novo Projeto</Button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredProjetos.map(projeto => {
                        // Dummy UI calc for now
                        const isCompleted = projeto.status === 'completed'
                        const progresso = isCompleted ? 100 : (projeto.status === 'active' ? 50 : 10)
                        const cor = isCompleted ? 'bg-emerald-500' : (projeto.status === 'active' ? 'bg-blue-500' : 'bg-slate-400')

                        return (
                            <Card key={projeto.id} className="group hover:border-violet-500/50 transition-all shadow-sm bg-white dark:bg-[#12142a] border-slate-200 dark:border-white/[0.06]">
                                <CardHeader className="pb-3 border-b border-slate-100 dark:border-white/5">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1 pr-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2.5 h-2.5 rounded-full ${cor}`} />
                                                <CardTitle className="text-lg leading-tight text-slate-900 dark:text-white">{projeto.name}</CardTitle>
                                            </div>
                                            <CardDescription className="text-slate-500 dark:text-gray-500">{projeto.description || "Sem descrição"}</CardDescription>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 -mr-2 text-slate-400 dark:text-gray-600 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4 pb-4 space-y-4">
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500 dark:text-gray-400 font-medium flex items-center">
                                                <CheckSquare className="w-3.5 h-3.5 mr-1" /> Tarefas
                                            </span>
                                            <span className="font-semibold text-slate-900 dark:text-white">{progresso}%</span>
                                        </div>
                                        <Progress value={progresso} className="h-2 bg-slate-100 dark:bg-white/10" />
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex items-center text-xs text-slate-400 dark:text-gray-500">
                                            <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                            {projeto.due_date ? new Date(projeto.due_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : 'Sem prazo'}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}

                    {/* Card de Adição */}
                    <Card onClick={() => setIsAddModalOpen(true)} className="flex flex-col items-center justify-center text-slate-400 dark:text-gray-500 bg-slate-50 dark:bg-[#0d0f1a] border-dashed border-slate-300 dark:border-white/20 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-violet-500 dark:hover:text-violet-400 transition-colors cursor-pointer min-h-[200px]">
                        <div className="rounded-full bg-slate-200 dark:bg-white/5 p-3 mb-2">
                            <Plus className="h-6 w-6" />
                        </div>
                        <span className="font-semibold text-sm">Criar um Projeto</span>
                    </Card>
                </div>
            )}

            {/* Modal Novo Projeto */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-[425px] bg-white dark:bg-[#12142a] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                    <DialogHeader>
                        <DialogTitle>Novo Projeto</DialogTitle>
                        <DialogDescription className="text-slate-500 dark:text-gray-400">
                            Crie um projeto em branco ou vincule a uma proposta aprovada.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 dark:text-gray-400">Nome do Projeto</label>
                            <Input
                                placeholder="Nome do Projeto"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                className="bg-slate-50 dark:bg-[#0d0f1a] border-slate-200 dark:border-white/[0.06]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 dark:text-gray-400">Vincular Proposta Aprovada (Opcional)</label>
                            <select
                                value={selectedProposal}
                                onChange={(e) => setSelectedProposal(e.target.value)}
                                className="w-full h-10 px-3 rounded-md bg-slate-50 dark:bg-[#0d0f1a] border border-slate-200 dark:border-white/[0.06] text-sm text-slate-900 dark:text-white outline-none focus:border-violet-500"
                            >
                                <option value="">Não vincular proposta</option>
                                {approvedProposals.map(p => (
                                    <option key={p.id} value={p.id}>{p.title} - R$ {p.total}</option>
                                ))}
                            </select>
                            {approvedProposals.length === 0 && (
                                <p className="text-[10px] text-amber-500 mt-1 flex items-center gap-1">
                                    <FileText className="w-3 h-3" /> Nenhuma proposta com status "Aprovado" encontrada.
                                </p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-gray-300">
                            Cancelar
                        </Button>
                        <Button onClick={handleCreateProjectFromModal} disabled={!newProjectName.trim() || creatingProject} className="bg-violet-600 hover:bg-violet-700 text-white">
                            {creatingProject ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Criar Projeto
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
