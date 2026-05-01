"use client"

import { useState, useMemo } from "react"
import {
    Play, Search, ChevronLeft, ChevronRight, Youtube, Clock,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type VideoAula = {
    id: string
    title: string
    youtubeId: string
    duration: string
}

const AULAS: VideoAula[] = [
    { id: "1", title: "Conheça o SWHub", youtubeId: "dQw4w9WgXcQ", duration: "05:00" },
    { id: "2", title: "Como Criar e Editar uma Landing Page", youtubeId: "dQw4w9WgXcQ", duration: "10:00" },
    { id: "3", title: "Configurando seu Domínio Personalizado", youtubeId: "dQw4w9WgXcQ", duration: "07:30" },
    { id: "4", title: "Pipeline do CRM: do Lead ao Fechamento", youtubeId: "dQw4w9WgXcQ", duration: "12:00" },
    { id: "5", title: "Criando Propostas Comerciais", youtubeId: "dQw4w9WgXcQ", duration: "08:45" },
    { id: "6", title: "Replicador de Sites: Clone em 1 Clique", youtubeId: "dQw4w9WgXcQ", duration: "06:20" },
    { id: "7", title: "Automações e Follow-up Inteligente", youtubeId: "dQw4w9WgXcQ", duration: "15:00" },
    { id: "8", title: "Indicações e Programa de Parceiros", youtubeId: "dQw4w9WgXcQ", duration: "09:10" },
    { id: "9", title: "Relatórios e Métricas do Sistema", youtubeId: "dQw4w9WgXcQ", duration: "11:30" },
    { id: "10", title: "Dicas Avançadas e Boas Práticas", youtubeId: "dQw4w9WgXcQ", duration: "14:00" },
]

export default function TreinamentosPage() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [search, setSearch] = useState("")

    const currentAula = AULAS[currentIndex]

    const filteredAulas = useMemo(() => {
        if (!search) return AULAS
        return AULAS.filter(a => a.title.toLowerCase().includes(search.toLowerCase()))
    }, [search])

    const handleSelect = (aula: VideoAula) => {
        const idx = AULAS.findIndex(a => a.id === aula.id)
        if (idx >= 0) setCurrentIndex(idx)
    }

    const handlePrev = () => {
        if (currentIndex > 0) setCurrentIndex(currentIndex - 1)
    }

    const handleNext = () => {
        if (currentIndex < AULAS.length - 1) setCurrentIndex(currentIndex + 1)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-violet-500/20 text-violet-400">
                        <Play className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tutoriais em Vídeo</h1>
                        <p className="text-sm text-slate-500 dark:text-gray-500">Assista, aplique e publique mais rápido.</p>
                    </div>
                </div>
            </div>

            {/* Main Content: Player + Playlist */}
            <div className="flex flex-col lg:flex-row gap-5">
                {/* Player Area */}
                <div className="flex-1 min-w-0">
                    <div className="relative w-full rounded-xl overflow-hidden bg-black aspect-video">
                        <iframe
                            src={`https://www.youtube.com/embed/${currentAula.youtubeId}?rel=0`}
                            title={currentAula.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="absolute inset-0 w-full h-full"
                        />
                    </div>

                    {/* Video Info + Nav */}
                    <div className="mt-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{currentAula.title}</h2>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-gray-500">
                                    <Clock className="h-3 w-3" /> {currentAula.duration}
                                </span>
                                <a
                                    href={`https://www.youtube.com/watch?v=${currentAula.youtubeId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
                                >
                                    <Youtube className="h-3 w-3" /> Assistir no YouTube
                                </a>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePrev}
                                disabled={currentIndex === 0}
                                className="border-slate-200 dark:border-white/10 text-gray-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30"
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleNext}
                                disabled={currentIndex === AULAS.length - 1}
                                className="bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-30"
                            >
                                Próximo <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Playlist Sidebar */}
                <div className="w-full lg:w-[320px] shrink-0 rounded-xl bg-white dark:bg-[#12142a] border border-slate-200 dark:border-white/[0.06] flex flex-col overflow-hidden">
                    {/* Playlist Header */}
                    <div className="p-4 border-b border-slate-200 dark:border-white/[0.06]">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Aulas</h3>
                            <span className="text-xs text-slate-500 dark:text-gray-500">{currentIndex + 1}/{AULAS.length}</span>
                        </div>
                        {/* Progress bar */}
                        <div className="w-full h-1 rounded-full bg-white/[0.06] mb-3">
                            <div
                                className="h-1 rounded-full bg-violet-500 transition-all duration-300"
                                style={{ width: `${((currentIndex + 1) / AULAS.length) * 100}%` }}
                            />
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 dark:text-gray-500" />
                            <Input
                                placeholder="Buscar nesta playlist..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 h-9 bg-slate-50 dark:bg-[#0d0f1a] border-slate-200 dark:border-white/[0.06] text-white text-xs placeholder:text-slate-400 dark:text-gray-600"
                            />
                        </div>
                    </div>

                    {/* Playlist Items */}
                    <div className="flex-1 overflow-y-auto max-h-[500px]">
                        {filteredAulas.length === 0 ? (
                            <div className="p-6 text-center">
                                <p className="text-xs text-slate-400 dark:text-gray-600">Nenhuma aula encontrada.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/[0.04]">
                                {filteredAulas.map((aula) => {
                                    const globalIdx = AULAS.findIndex(a => a.id === aula.id)
                                    const isActive = globalIdx === currentIndex
                                    return (
                                        <button
                                            key={aula.id}
                                            onClick={() => handleSelect(aula)}
                                            className={`w-full flex items-start gap-3 p-3 text-left transition-colors ${
                                                isActive
                                                    ? "bg-violet-600/10"
                                                    : "hover:bg-white/[0.03]"
                                            }`}
                                        >
                                            {/* Thumbnail */}
                                            <div className="relative shrink-0 w-24 h-14 rounded-lg overflow-hidden bg-slate-50 dark:bg-[#0d0f1a]">
                                                <img
                                                    src={`https://img.youtube.com/vi/${aula.youtubeId}/mqdefault.jpg`}
                                                    alt={aula.title}
                                                    className="w-full h-full object-cover"
                                                />
                                                {isActive && (
                                                    <div className="absolute inset-0 bg-violet-600/40 flex items-center justify-center">
                                                        <Play className="h-4 w-4 text-white fill-white" />
                                                    </div>
                                                )}
                                                <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/70 text-[9px] text-white font-medium">
                                                    {aula.duration}
                                                </span>
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0 pt-0.5">
                                                <p className={`text-xs font-medium leading-snug line-clamp-2 ${
                                                    isActive ? "text-violet-400" : "text-slate-700 dark:text-gray-300"
                                                }`}>
                                                    {aula.title}
                                                </p>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
