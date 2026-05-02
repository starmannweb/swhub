"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Plus, Edit2, Trash2, LayoutTemplate, Upload } from "lucide-react"

import { TemplateModal } from "./components/template-modal"

type SiteTemplate = {
    id: string
    name: string
    category: string
    content: Record<string, unknown> | unknown[]
    preview_image: string | null
    is_public: boolean
    created_at: string
}

export default function AdminModelosPage() {
    const supabase = useMemo(() => createClient(), [])
    const jsonInputRef = useRef<HTMLInputElement>(null)
    const [templates, setTemplates] = useState<SiteTemplate[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingTemplate, setEditingTemplate] = useState<SiteTemplate | undefined>()

    const fetchTemplates = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from("site_templates")
                .select("*")
                .order("created_at", { ascending: false })

            if (error) throw error
            setTemplates(data || [])
        } catch (error) {
            console.error("Erro ao buscar modelos:", error)
            alert("Erro ao carregar modelos")
        } finally {
            setLoading(false)
        }
    }, [supabase])

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void fetchTemplates()
        }, 0)

        return () => window.clearTimeout(timer)
    }, [fetchTemplates])

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este modelo?")) return

        try {
            const { error } = await supabase
                .from("site_templates")
                .delete()
                .eq("id", id)

            if (error) throw error

            alert("Modelo excluído com sucesso")
            void fetchTemplates()
        } catch (error) {
            console.error("Erro ao excluir modelo:", error)
            alert("Erro ao excluir modelo")
        }
    }

    const handleCreate = () => {
        setEditingTemplate(undefined)
        setIsModalOpen(true)
    }

    const handleEdit = (template: SiteTemplate) => {
        setEditingTemplate(template)
        setIsModalOpen(true)
    }

    const handleSaved = () => {
        void fetchTemplates()
    }

    const handleImportJsonFile = useCallback((file?: File) => {
        if (!file) return

        const reader = new FileReader()
        reader.onload = async (event) => {
            try {
                const parsed = JSON.parse(String(event.target?.result || "{}"))
                const { data: { session } } = await supabase.auth.getSession()

                if (!session?.user?.id) {
                    alert("Voce precisa estar logado para importar modelos.")
                    return
                }

                const content = parsed.content || parsed.project || parsed
                const fallbackName = file.name.replace(/\.json$/i, "").replace(/[-_]+/g, " ")
                const modelData = {
                    name: parsed.name || parsed.title || fallbackName,
                    category: parsed.category || parsed.segment || "Importado",
                    content,
                    preview_image: parsed.preview_image || parsed.previewImage || parsed.image_url || null,
                    is_public: parsed.is_public ?? true,
                    user_id: session.user.id,
                }

                const { error } = await supabase.from("site_templates").insert([modelData])
                if (error) throw error

                alert("Modelo importado com sucesso!")
                void fetchTemplates()
            } catch (error) {
                console.error("Erro ao importar JSON:", error)
                alert("Nao foi possivel importar esse JSON como modelo.")
            }
        }
        reader.readAsText(file)
    }, [fetchTemplates, supabase])

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Modelos de Sites</h2>
                    <p className="text-muted-foreground">
                        Gerencie a biblioteca de modelos (templates) disponíveis para os usuários.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" onClick={() => jsonInputRef.current?.click()}>
                        <Upload className="mr-2 h-4 w-4" /> Importar JSON
                    </Button>
                    <input
                        ref={jsonInputRef}
                        type="file"
                        accept=".json,application/json"
                        className="hidden"
                        onChange={(event) => {
                            handleImportJsonFile(event.target.files?.[0])
                            event.target.value = ""
                        }}
                    />
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" /> Novo Modelo
                    </Button>
                </div>
            </div>

            {loading ? (
                <div>Carregando modelos...</div>
            ) : templates.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg border-dashed">
                    <LayoutTemplate className="h-10 w-10 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Nenhum modelo encontrado</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Você ainda não possui nenhum modelo cadastrado na biblioteca.
                    </p>
                    <Button onClick={handleCreate} variant="outline">
                        <Plus className="mr-2 h-4 w-4" /> Adicionar Primeiro Modelo
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {templates.map((template) => (
                        <Card key={template.id} className="overflow-hidden flex flex-col">
                            {template.preview_image ? (
                                <div className="aspect-video relative bg-muted flex items-center justify-center overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={template.preview_image}
                                        alt={template.name}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            ) : (
                                <div className="aspect-video bg-muted flex items-center justify-center">
                                    <LayoutTemplate className="h-10 w-10 text-muted-foreground/30" />
                                </div>
                            )}
                            <CardHeader className="p-4 pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg leading-tight truncate">
                                        {template.name}
                                    </CardTitle>
                                    {template.is_public && (
                                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-500/10 text-green-500 border-transparent">
                                            Público
                                        </span>
                                    )}
                                </div>
                                <CardDescription className="text-xs truncate">
                                    {template.category}
                                </CardDescription>
                            </CardHeader>
                            <CardFooter className="p-4 pt-2 flex justify-between mt-auto">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full mr-2"
                                    onClick={() => handleEdit(template)}
                                >
                                    <Edit2 className="mr-2 h-4 w-4" />
                                    Editar
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDelete(template.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            <TemplateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSaved={handleSaved}
                template={editingTemplate}
            />
        </div>
    )
}
