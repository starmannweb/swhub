"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    CheckSquare, Plus, Search, Filter,
    ArrowUp, ArrowDown, ArrowRight, Circle, Loader2, Calendar
} from "lucide-react"
import { CrmTask } from "@/types/crm"

export default function TarefasPage() {
    const supabase = createClient()
    const [search, setSearch] = useState("")
    const [tarefas, setTarefas] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchTarefas()
    }, [])

    async function fetchTarefas() {
        setLoading(true)
        const { data: userAuth } = await supabase.auth.getUser()
        if (!userAuth.user) return

        const { data, error } = await supabase
            .from('crm_tasks')
            .select(`
                *,
                crm_projects ( name )
            `)
            .eq('user_id', userAuth.user.id)
            .order('created_at', { ascending: false })

        if (!error && data) {
            setTarefas(data)
        }
        setLoading(false)
    }

    async function handleAddTarefa() {
        const title = prompt("Digite o título da nova tarefa:");
        if (!title) return;

        const { data: userAuth } = await supabase.auth.getUser()
        if (!userAuth.user) return

        const { data, error } = await supabase
            .from('crm_tasks')
            .insert({
                user_id: userAuth.user.id,
                title: title,
                status: 'todo',
                priority: 'medium',
            })
            .select(`*, crm_projects(name)`)
            .single()

        if (!error && data) {
            setTarefas([data, ...tarefas])
        }
    }

    async function toggleStatus(id: string, currentStatus: string) {
        const newStatus = currentStatus === 'done' ? 'todo' : 'done'
        const { error } = await supabase
            .from('crm_tasks')
            .update({ status: newStatus })
            .eq('id', id)

        if (!error) {
            setTarefas(tarefas.map(t => t.id === id ? { ...t, status: newStatus } : t))
        }
    }

    const priorityIcon = {
        urgent: <ArrowUp className="w-4 h-4 text-red-600 font-bold" />,
        high: <ArrowUp className="w-4 h-4 text-red-500" />,
        medium: <ArrowRight className="w-4 h-4 text-amber-500" />,
        low: <ArrowDown className="w-4 h-4 text-blue-500" />
    }

    const filteredTarefas = tarefas.filter(t => t.title.toLowerCase().includes(search.toLowerCase()))

    return (
        <div className="flex-1 space-y-6 pt-6 px-4 md:px-8 max-w-7xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Minhas Tarefas</h2>
                    <p className="text-muted-foreground">
                        Organize e priorize suas entregas diárias.
                    </p>
                </div>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Procurar tarefa..."
                            className="pl-8 bg-muted/40"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
                    <Button onClick={handleAddTarefa}><Plus className="mr-2 h-4 w-4" /> Nova Tarefa</Button>
                </div>
            </div>

            <Card className="border-t-4 border-t-violet-500 shadow-sm overflow-hidden bg-[#12142a] border border-white/[0.06]">
                <CardHeader className="bg-white/[0.02] border-b border-white/[0.06] p-4">
                    <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-400 uppercase tracking-wider items-center">
                        <div className="col-span-6 md:col-span-5 flex items-center gap-2">
                            <span>Status</span> <span className="ml-4">Título da Tarefa</span>
                        </div>
                        <div className="col-span-3 hidden md:block">Projeto</div>
                        <div className="col-span-3 md:col-span-2 text-center">Data</div>
                        <div className="col-span-3 md:col-span-2 flex justify-end">Prioridade</div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 divide-y divide-white/[0.06] flex-1 min-h-[300px] relative">
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredTarefas.length === 0 ? (
                        <div className="flex items-center justify-center p-8 text-muted-foreground">
                            Nenhuma tarefa encontrada.
                        </div>
                    ) : (
                        filteredTarefas.map(tarefa => (
                            <div key={tarefa.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/[0.02] transition-colors group">
                                <div className="col-span-6 md:col-span-5 flex items-center gap-4">
                                    <button
                                        onClick={() => toggleStatus(tarefa.id, tarefa.status)}
                                        className="shrink-0 text-gray-500 hover:text-violet-400 transition-colors"
                                    >
                                        {tarefa.status === 'done' ? (
                                            <CheckSquare className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                                        ) : (
                                            <Circle className="w-5 h-5" />
                                        )}
                                    </button>
                                    <div className="space-y-1">
                                        <span className={`font-medium ${tarefa.status === 'done' ? 'line-through text-gray-500' : 'text-white'}`}>
                                            {tarefa.title}
                                        </span>
                                        {/* Mobile Only Project display */}
                                        <div className="block md:hidden text-xs text-muted-foreground">
                                            {tarefa.crm_projects?.name || 'Avulsa'}
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-3 hidden md:flex items-center">
                                    <Badge variant="outline" className="font-normal text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-full bg-violet-500/10 text-violet-300 border-violet-500/20">
                                        {tarefa.crm_projects?.name || 'Avulsa'}
                                    </Badge>
                                </div>

                                <div className="col-span-3 md:col-span-2 text-center flex items-center justify-center text-sm text-gray-400">
                                    <Calendar className="w-3.5 h-3.5 mr-1" /> {tarefa.due_date ? new Date(tarefa.due_date).toLocaleDateString() : 'Hoje'}
                                </div>

                                <div className="col-span-3 md:col-span-2 flex justify-end items-center gap-4">
                                    <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-white">
                                        {priorityIcon[tarefa.priority as keyof typeof priorityIcon]}
                                        <span className="text-xs uppercase font-medium">{tarefa.priority}</span>
                                    </div>
                                    <div className="sm:hidden">
                                        {priorityIcon[tarefa.priority as keyof typeof priorityIcon]}
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-violet-600/20 border-2 border-[#12142a] flex items-center justify-center shrink-0 shadow-sm opacity-50 group-hover:opacity-100 transition-opacity">
                                        <span className="text-xs font-semibold text-violet-300">Eu</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>

        </div>
    )
}
