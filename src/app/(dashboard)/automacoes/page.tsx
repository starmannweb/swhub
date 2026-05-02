"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Zap, Plus, Save, CircleDot,
    MessageSquare, Clock, X, Sparkles, Minus, Maximize,
    Tags, UserPlus, FileEdit, ChevronLeft, GitBranch, LayoutGrid, Mail,
    Trash2
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type WorkflowStep = {
    id: string;
    type: string;
    iconUrl?: string;
    title: string;
    description: string;
    colorClass: string;
};

// --- DRAGGABLE ACTION ITEM ---
function SortableActionItem({
    action, onRemove, onEdit
}: {
    action: WorkflowStep;
    onRemove: (id: string) => void;
    onEdit: (id: string) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: action.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const getIcon = (type: string) => {
        if (type === 'whatsapp') return <MessageSquare className="w-5 h-5" />;
        if (type === 'wait') return <Clock className="w-5 h-5" />;
        if (type === 'email') return <Mail className="w-5 h-5" />;
        if (type === 'tag') return <Tags className="w-5 h-5" />;
        if (type === 'ifelse') return <GitBranch className="w-5 h-5" />;
        return <Zap className="w-5 h-5" />;
    };

    return (
        <div ref={setNodeRef} style={style} className="flex flex-col items-center w-full relative z-10 group/action w-[320px]">
            <div
                className={`bg-white dark:bg-slate-900 border border-slate-200 shadow-sm rounded-lg p-3 w-full flex items-center gap-3 cursor-grab active:cursor-grabbing hover:border-primary hover:shadow-md transition-all relative ${action.colorClass}`}
                {...attributes}
                {...listeners}
                onClick={(e) => { e.stopPropagation(); onEdit(action.id); }}
            >
                {/* Icon Box */}
                <div className="p-2.5 rounded-md text-inherit bg-current/10 border border-current/20 shrink-0">
                    {getIcon(action.type)}
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0 pr-6">
                    <p className="font-semibold text-sm text-foreground">{action.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{action.description}</p>
                </div>

                {/* Remove button (Hover only) */}
                <div
                    role="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/action:opacity-100 p-1.5 hover:bg-red-50 hover:text-red-500 rounded-md text-slate-400 transition-all z-20 cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove(action.id);
                    }}
                >
                    <Trash2 className="w-4 h-4" />
                </div>
            </div>

            {/* Next connector visual (only visual, actual button handled separately) */}
            <div className="w-px h-10 bg-slate-300 dark:bg-slate-700 relative flex items-center justify-center"></div>
        </div>
    );
}

export default function AutomacoesPage() {
    const supabase = useMemo(() => createClient(), []);
    const [workflowId, setWorkflowId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [workflowName, setWorkflowName] = useState("Meu Novo Funil de Vendas");
    const [status, setStatus] = useState<'draft' | 'active'>('draft');

    // Panel States
    const [sidePanelOpen, setSidePanelOpen] = useState<'none' | 'trigger' | 'action'>('none');
    const [insertIndex, setInsertIndex] = useState<number | null>(null);

    const [triggers, setTriggers] = useState<WorkflowStep[]>([]);
    const [actions, setActions] = useState<WorkflowStep[]>([]);

    const loadWorkflow = useCallback(async () => {
        setIsLoading(true);
        // Load the most recent workflow or create one
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setIsLoading(false);
            return;
        }

        const { data: existing } = await supabase
            .from('automation_workflows')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (existing) {
            setWorkflowId(existing.id);
            setWorkflowName(existing.name);
            setStatus(existing.is_active ? 'active' : 'draft');
            setTriggers(existing.triggers || []);
            setActions(existing.actions || []);
        }
        setIsLoading(false);
    }, [supabase]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void loadWorkflow();
        }, 0);

        return () => window.clearTimeout(timer);
    }, [loadWorkflow]);

    const handleSave = async () => {
        if (!workflowName.trim()) return;
        setIsSaving(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const payload = {
            user_id: user.id,
            name: workflowName,
            is_active: status === 'active',
            triggers,
            actions
        };

        if (workflowId) {
            await supabase.from('automation_workflows').update(payload).eq('id', workflowId);
        } else {
            const { data } = await supabase.from('automation_workflows').insert(payload).select().single();
            if (data) setWorkflowId(data.id);
        }

        setTimeout(() => setIsSaving(false), 500); // UI feedback
    };

    // --- DRAG AND DROP HANDLERS ---
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setActions((items) => {
                const oldIndex = items.findIndex(t => t.id === active.id);
                const newIndex = items.findIndex(t => t.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    // --- ADDING/REMOVING NODES ---
    const openAddTrigger = () => setSidePanelOpen('trigger');
    const openAddAction = (index: number) => {
        setInsertIndex(index);
        setSidePanelOpen('action');
    };

    const addTriggerNode = (type: string, title: string, desc: string, colorClass: string) => {
        const newTrigger = { id: `trig_${Date.now()}`, type, title, description: desc, colorClass };
        setTriggers([...triggers, newTrigger]);
        setSidePanelOpen('none');
    };

    const addActionNode = (type: string, title: string, desc: string, colorClass: string) => {
        const newAction = { id: `act_${Date.now()}`, type, title, description: desc, colorClass };

        if (insertIndex !== null) {
            const newArr = [...actions];
            newArr.splice(insertIndex, 0, newAction);
            setActions(newArr);
        } else {
            setActions([...actions, newAction]);
        }
        setSidePanelOpen('none');
        setInsertIndex(null);
    };

    const removeTrigger = (id: string) => setTriggers(triggers.filter(t => t.id !== id));
    const removeAction = (id: string) => setActions(actions.filter(a => a.id !== id));

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#f8fafc] dark:bg-slate-950 overflow-hidden relative font-sans text-slate-800 dark:text-slate-200" aria-busy={isLoading}>

            {/* 1. TOP BAR (Responsive & Fixed Layout) */}
            <div className="min-h-16 px-4 md:px-6 bg-white dark:bg-slate-900 border-b flex flex-col md:flex-row items-center justify-between shrink-0 z-30 shadow-sm gap-4 py-2 md:py-0 w-full">

                {/* Left controls */}
                <div className="flex items-center gap-4 w-full md:w-auto shrink-0 justify-between md:justify-start">
                    <button className="flex items-center text-sm font-semibold text-foreground hover:text-primary transition-colors whitespace-nowrap">
                        <ChevronLeft className="w-5 h-5 mr-1" /> Voltar
                    </button>

                    <div className="hidden lg:flex items-center text-sm bg-muted/50 px-3 py-1.5 rounded-md border text-muted-foreground whitespace-nowrap">
                        Construtor Padrão
                        <ChevronLeft className="w-4 h-4 -rotate-90 ml-2 opacity-50" />
                    </div>
                </div>

                {/* Center Title (Editable) */}
                <div className="flex-1 flex justify-center w-full md:w-auto min-w-[200px]">
                    <div className="flex items-center gap-2 group focus-within:ring-2 ring-primary/20 px-3 py-1.5 rounded-md border border-transparent hover:border-slate-200 transition-colors w-full max-w-sm bg-transparent">
                        <FileEdit className="w-4 h-4 text-muted-foreground shrink-0" />
                        <input
                            value={workflowName}
                            onChange={(e) => setWorkflowName(e.target.value)}
                            className="bg-transparent border-none outline-none font-semibold text-lg w-full text-center text-slate-900 dark:text-slate-100"
                        />
                    </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-end shrink-0">
                    <div className="flex items-center gap-2 text-sm font-medium mr-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-full px-3 border shadow-inner">
                        <span className={status === 'draft' ? 'text-slate-700 dark:text-slate-200 font-semibold text-xs uppercase' : 'text-slate-400 text-xs uppercase'}>Rascunho</span>
                        <div
                            className={`w-10 h-5 rounded-full relative cursor-pointer shadow-inner transition-colors ${status === 'active' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                            onClick={() => setStatus(status === 'active' ? 'draft' : 'active')}
                        >
                            <div className={`absolute top-[2px] w-4 h-4 shadow-sm bg-white rounded-full transition-all ${status === 'active' ? 'left-[22px]' : 'left-[2px]'}`}></div>
                        </div>
                        <span className={status === 'active' ? 'text-emerald-600 font-bold text-xs uppercase' : 'text-slate-400 text-xs uppercase'}>Publicar</span>
                    </div>

                    <Button className="bg-primary hover:bg-primary/90 h-9 px-6 shadow-sm hidden sm:flex" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <CircleDot className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        {isSaving ? 'Salvando...' : 'Salvar'}
                    </Button>
                </div>
            </div>

            {/* MAIN CANVAS AREA */}
            <div className="flex-1 flex relative overflow-hidden bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.08),transparent_34%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.16),transparent_34%),linear-gradient(180deg,#070914_0%,#050711_100%)]">

                {/* INFINITE GRID BACKGROUND */}
                <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-violet-500/[0.04] via-transparent to-blue-500/[0.035] dark:from-violet-400/[0.08] dark:to-blue-400/[0.04]"></div>
                <div
                    className="absolute inset-0 z-0 pointer-events-none opacity-[0.04] dark:opacity-[0.02]"
                    style={{ backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', backgroundSize: '30px 30px', color: '#94a3b8' }}
                ></div>

                {/* 3. CANVAS CONTENT */}
                <ScrollArea className="flex-1 relative z-10 w-full h-full">
                    {/* Inner wrapper for centering content */}
                    <div className="flex flex-col items-center py-12 px-4 min-w-max min-h-full">

                        {/* AI Prompt Box */}
                        <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-t-0 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6 mb-16 relative overflow-hidden ring-1 ring-slate-950/5 mx-auto">
                            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-primary"></div>
                            <div className="flex flex-col items-center text-center space-y-2 mb-6 mt-2">
                                <h3 className="text-xl font-bold flex items-center justify-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-fuchsia-100 dark:bg-fuchsia-500/20"><Sparkles className="w-5 h-5 text-fuchsia-600 dark:text-fuchsia-400" /></div>
                                    O que você deseja automatizar?
                                    <Badge variant="secondary" className="text-[10px] ml-1 bg-slate-100 text-slate-500 uppercase font-bold tracking-wider cursor-default">Beta</Badge>
                                </h3>
                                <p className="text-sm text-slate-500">Crie fluxos de trabalho instantâneos conversando com a nossa IA.</p>
                            </div>
                            <div className="relative mx-4 sm:mx-10">
                                <Input
                                    placeholder="Ex: Quando um lead entrar, espere 1 hora e envie um WhatsApp..."
                                    className="pr-14 h-14 bg-slate-50 dark:bg-slate-950 border-slate-200 shadow-inner rounded-xl text-[15px]"
                                />
                                <Button size="icon" className="absolute right-1.5 top-1.5 h-11 w-11 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-700 text-white transition-colors shadow">
                                    <Sparkles className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        {/* TRIGGERS SECTION */}
                        <div className="w-full flex justify-center mb-10 relative">
                            <div className="w-[80%] max-w-xl h-px bg-slate-300 dark:bg-slate-700"></div>
                            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#f8fafc] dark:bg-slate-950 px-3 text-[12px] font-bold text-slate-400 uppercase tracking-widest">Gatilhos Iniciais</span>
                        </div>

                        <div className="flex flex-col items-center w-full max-w-4xl relative z-10 mb-4 px-4">

                            {/* Horizontal trigger list (OR Logic) */}
                            <div className="flex flex-wrap justify-center items-stretch gap-6 w-full relative">
                                {/* Connecting line behind triggers if multiple */}
                                {triggers.length > 1 && (
                                    <div className="absolute top-1/2 left-[10%] right-[10%] h-[2px] bg-slate-300 dark:bg-slate-700 -z-10 -translate-y-1/2 rounded"></div>
                                )}

                                {triggers.map(trigger => (
                                    <div key={trigger.id} className="relative group/trigger">
                                        <div
                                            className={`bg-white dark:bg-slate-900 border-2 border-slate-200 rounded-xl p-4 w-[280px] h-full flex items-center gap-3 cursor-pointer hover:border-blue-500 shadow-sm transition-all relative ${sidePanelOpen === 'trigger' ? '' : 'hover:-translate-y-1'} ${trigger.colorClass}`}
                                            onClick={() => openAddTrigger()}
                                        >
                                            <div className="p-3 rounded-lg text-inherit bg-current/10 shrink-0">
                                                {trigger.type === 'form' ? <UserPlus className="w-6 h-6" /> : <Tags className="w-6 h-6" />}
                                            </div>
                                            <div className="flex-1 min-w-0 pr-6">
                                                <p className="font-bold text-[15px] leading-tight text-slate-800 dark:text-slate-100">{trigger.title}</p>
                                                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-snug">{trigger.description}</p>
                                            </div>

                                            {/* Remove btn */}
                                            <div
                                                role="button"
                                                className="absolute -top-2 -right-2 bg-red-100 text-red-600 border border-red-200 rounded-full p-1.5 opacity-0 group-hover/trigger:opacity-100 shadow-sm transition-all cursor-pointer hover:scale-110 z-20"
                                                onClick={(e) => { e.stopPropagation(); removeTrigger(trigger.id); }}
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Add Trigger Box */}
                                <div
                                    className="bg-blue-50/50 dark:bg-blue-900/10 border-2 border-dashed border-blue-400 dark:border-blue-600 rounded-xl p-4 w-[280px] h-[88px] flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors shadow-sm z-10 hover:border-blue-500 group"
                                    onClick={() => openAddTrigger()}
                                >
                                    <Plus className="w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform bg-white rounded-full p-0.5 shadow-sm" />
                                    <span className="font-semibold text-sm text-blue-600 dark:text-blue-400">Adicionar Novo Gatilho</span>
                                </div>
                            </div>
                        </div>

                        {/* STEM LINE DOWN TO ACTIONS */}
                        <div className="flex flex-col items-center w-full">
                            <div className="w-px h-16 bg-slate-300 dark:bg-slate-700 relative flex items-center justify-center group/conn z-20">
                                <button
                                    onClick={() => openAddAction(0)}
                                    className="w-8 h-8 rounded-full border border-dashed border-slate-400 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 shadow-sm hover:border-primary hover:text-primary transition-all opacity-0 group-hover/conn:opacity-100 absolute hover:scale-110"
                                    title="Inserir Ação Inicial"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* ACTIONS LIST (Sortable Vector Line) */}
                        <div className="flex flex-col items-center w-full max-w-sm">
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={actions.map(a => a.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {actions.map((action, index) => (
                                        <div key={action.id} className="w-full flex flex-col items-center">

                                            <SortableActionItem
                                                action={action}
                                                onRemove={removeAction}
                                                onEdit={() => openAddAction(index)}
                                            />

                                            {/* Connector AFTER each block */}
                                            <div className="w-px h-12 bg-slate-300 dark:bg-slate-700 relative flex items-center justify-center group/conn -mt-10 z-0">
                                                <button
                                                    onClick={() => openAddAction(index + 1)}
                                                    className="w-7 h-7 rounded-full border border-dashed border-slate-400 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 shadow-sm hover:border-primary hover:text-primary transition-all opacity-0 group-hover/conn:opacity-100 absolute hover:scale-110 z-30"
                                                    title="Inserir Próxima Ação"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </SortableContext>
                            </DndContext>

                            {/* FINAL ADD BUTTON IF EMPTY */}
                            {actions.length === 0 && (
                                <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 relative -mt-10"></div>
                            )}

                            {/* END NODE */}
                            <button
                                onClick={() => openAddAction(actions.length)}
                                className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-500 shadow-sm z-20 hover:border-primary hover:text-primary transition-all group mt-[-2px] hover:scale-105"
                            >
                                <Plus className="w-5 h-5 mb-0.5" />
                            </button>
                            <div className="mt-4 bg-slate-200/80 dark:bg-slate-800 text-slate-500 px-5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest shadow-sm">
                                Fim do Fluxo
                            </div>
                        </div>

                    </div>
                </ScrollArea>

                {/* ZOOM & CONTROLS (Bottom Left Fixed) */}
                <div className="absolute bottom-6 left-6 z-30 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 rounded-lg shadow-lg overflow-hidden w-11 shadow-slate-200/50">
                    <button className="h-11 flex items-center justify-center border-b hover:bg-slate-50 hover:text-primary text-slate-600 transition-colors"><Plus className="w-5 h-5" /></button>
                    <div className="h-11 flex items-center justify-center border-b text-[12px] font-bold text-slate-700 bg-slate-50 cursor-default select-none">100%</div>
                    <button className="h-11 flex items-center justify-center border-b hover:bg-slate-50 hover:text-primary text-slate-600 transition-colors"><Minus className="w-5 h-5" /></button>
                    <button className="h-11 flex items-center justify-center hover:bg-slate-50 hover:text-primary text-slate-600 transition-colors"><Maximize className="w-4 h-4" /></button>
                </div>

                {/* Right Sidebar Slide-in */}
                {sidePanelOpen !== 'none' && (
                    <div className="absolute top-0 right-0 w-full sm:w-[420px] h-full bg-white dark:bg-slate-900 border-l shadow-2xl z-40 flex flex-col animate-in slide-in-from-right-8 duration-300 ease-out">
                        <div className="h-16 flex items-center justify-between px-6 shrink-0 border-b">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                                    {sidePanelOpen === 'trigger' ? 'Gatilhos de Fluxo' : 'Adicionar Ação'}
                                </h3>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:bg-slate-100 rounded-full" onClick={() => { setSidePanelOpen('none'); setInsertIndex(null); }}><X className="w-5 h-5" /></Button>
                        </div>

                        <div className="px-6 py-4 shrink-0 border-b bg-slate-50/50 dark:bg-slate-900">
                            <div className="relative">
                                <LayoutGrid className="w-4 h-4 absolute text-slate-400 left-3 top-3" />
                                <Input placeholder={`Pesquisar ${sidePanelOpen === 'trigger' ? 'Gatilhos' : 'Ações'}...`} className="pl-9 bg-white dark:bg-slate-950 shadow-sm h-10 border-slate-200 focus-visible:ring-primary/30" />
                            </div>
                        </div>

                        <ScrollArea className="flex-1">
                            {sidePanelOpen === 'action' ? (
                                <div className="p-4 space-y-6">
                                    {/* Coms */}
                                    <div>
                                        <h4 className="font-bold text-[12px] text-slate-500 uppercase tracking-widest px-2 mb-3">CRM & Comunicação</h4>
                                        <div className="space-y-2">
                                            <div
                                                className="border border-slate-200 rounded-xl p-3 flex items-center gap-4 cursor-pointer hover:border-green-500 hover:bg-green-50/30 shadow-sm hover:shadow transition-all group"
                                                onClick={() => addActionNode('whatsapp', 'Enviar WhatsApp', 'Envie uma mensagem B2B com templates', 'text-green-600')}
                                            >
                                                <div className="w-11 h-11 rounded-lg bg-green-500 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform shadow-sm"><MessageSquare className="w-5 h-5" /></div>
                                                <div>
                                                    <h5 className="font-bold text-slate-800 text-sm">Enviar WhatsApp</h5>
                                                    <p className="text-[12px] text-slate-500 mt-0.5 line-clamp-1">Mensagem usando a API Oficial</p>
                                                </div>
                                            </div>

                                            <div
                                                className="border border-slate-200 rounded-xl p-3 flex items-center gap-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 shadow-sm hover:shadow transition-all group"
                                                onClick={() => addActionNode('email', 'Enviar E-mail', 'Dispare comunicação via SMTP', 'text-blue-600')}
                                            >
                                                <div className="w-11 h-11 rounded-lg bg-blue-500 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform shadow-sm"><Mail className="w-5 h-5" /></div>
                                                <div>
                                                    <h5 className="font-bold text-slate-800 text-sm">Enviar E-mail SMTP</h5>
                                                    <p className="text-[12px] text-slate-500 mt-0.5 line-clamp-1">Marketing e Transacional</p>
                                                </div>
                                            </div>

                                            <div
                                                className="border border-slate-200 rounded-xl p-3 flex items-center gap-4 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30 shadow-sm hover:shadow transition-all group"
                                                onClick={() => addActionNode('tag', 'Adicionar/Remover Tag', 'Atualize as tags do lead no CRM', 'text-emerald-600')}
                                            >
                                                <div className="w-11 h-11 rounded-lg bg-emerald-500 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform shadow-sm"><Tags className="w-5 h-5" /></div>
                                                <div>
                                                    <h5 className="font-bold text-slate-800 text-sm">Gerenciar Tags</h5>
                                                    <p className="text-[12px] text-slate-500 mt-0.5 line-clamp-1">Atualizar perfil do contato</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Logic */}
                                    <div>
                                        <h4 className="font-bold text-[12px] text-slate-500 uppercase tracking-widest px-2 mb-3">Algoritmo / Lógica</h4>
                                        <div className="space-y-2">
                                            <div
                                                className="border border-slate-200 rounded-xl p-3 flex items-center gap-4 cursor-pointer hover:border-purple-500 hover:bg-purple-50/30 shadow-sm hover:shadow transition-all group"
                                                onClick={() => addActionNode('ifelse', 'Se / Então (Condição)', 'Divida o fluxo em caminhos diferentes', 'text-purple-600')}
                                            >
                                                <div className="w-11 h-11 rounded-lg bg-purple-500 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform shadow-sm"><GitBranch className="w-5 h-5" /></div>
                                                <div>
                                                    <h5 className="font-bold text-slate-800 text-sm">Se / Então (If/Else)</h5>
                                                    <p className="text-[12px] text-slate-500 mt-0.5 line-clamp-1">Rotas de decisão baseadas no CRM</p>
                                                </div>
                                            </div>

                                            <div
                                                className="border border-slate-200 rounded-xl p-3 flex items-center gap-4 cursor-pointer hover:border-slate-500 hover:bg-slate-50/30 shadow-sm hover:shadow transition-all group"
                                                onClick={() => addActionNode('wait', 'Aguardar (Delay)', 'Pausa estratégica na automação', 'text-slate-600')}
                                            >
                                                <div className="w-11 h-11 rounded-lg bg-slate-600 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform shadow-sm"><Clock className="w-5 h-5" /></div>
                                                <div>
                                                    <h5 className="font-bold text-slate-800 text-sm">Aguardar Passo</h5>
                                                    <p className="text-[12px] text-slate-500 mt-0.5 line-clamp-1">Delay por Minutos, Horas, Dias ou Evento</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            ) : (
                                <div className="p-4 space-y-6">
                                    <div>
                                        <h4 className="font-bold text-[12px] text-slate-500 uppercase tracking-widest px-2 mb-3">Gatilhos Iniciais</h4>
                                        <div className="space-y-2">
                                            <div
                                                className="border border-slate-200 rounded-xl p-3 flex items-center gap-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50 shadow-sm hover:shadow transition-all group"
                                                onClick={() => addTriggerNode('form', 'Novo Lead em Formulário', 'Quando cliente envia dados no site builder', 'text-blue-600')}
                                            >
                                                <div className="w-11 h-11 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-blue-200"><UserPlus className="w-5 h-5" /></div>
                                                <div>
                                                    <h5 className="font-bold text-slate-800 text-sm">Submissão de Formulário</h5>
                                                    <p className="text-[12px] text-slate-500 mt-0.5 line-clamp-1">Gere actions com base na captação</p>
                                                </div>
                                            </div>

                                            <div
                                                className="border border-slate-200 rounded-xl p-3 flex items-center gap-4 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 shadow-sm hover:shadow transition-all group"
                                                onClick={() => addTriggerNode('tag', 'Tag de Contato Adicionada', 'Dispara por movimentações no CRM', 'text-emerald-600')}
                                            >
                                                <div className="w-11 h-11 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-emerald-200"><Tags className="w-5 h-5" /></div>
                                                <div>
                                                    <h5 className="font-bold text-slate-800 text-sm">Adição de Tag</h5>
                                                    <p className="text-[12px] text-slate-500 mt-0.5 line-clamp-1">Ex: Tag [Vip] Adicionada ao contato</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                )}
            </div>
        </div>
    );
}
