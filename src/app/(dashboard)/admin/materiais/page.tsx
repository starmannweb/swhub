"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Plus, Trash2, Download, FileText, Image as ImageIcon, FileArchive, Film,
    Loader2, ExternalLink,
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type Material = {
    id: string
    title: string
    description: string | null
    category: string
    file_url: string
    file_type: string | null
    file_size: number | null
    thumbnail_url: string | null
    is_public: boolean
    download_count: number
    created_at: string
}

const fileTypeIcons: Record<string, React.ReactNode> = {
    pdf: <FileText className="h-5 w-5 text-red-400" />,
    doc: <FileText className="h-5 w-5 text-blue-400" />,
    docx: <FileText className="h-5 w-5 text-blue-400" />,
    png: <ImageIcon className="h-5 w-5 text-green-400" />,
    jpg: <ImageIcon className="h-5 w-5 text-green-400" />,
    jpeg: <ImageIcon className="h-5 w-5 text-green-400" />,
    zip: <FileArchive className="h-5 w-5 text-amber-400" />,
    rar: <FileArchive className="h-5 w-5 text-amber-400" />,
    mp4: <Film className="h-5 w-5 text-violet-400" />,
}

function getFileIcon(fileType: string | null) {
    if (!fileType) return <FileText className="h-5 w-5 text-gray-400" />
    const ext = fileType.toLowerCase()
    return fileTypeIcons[ext] || <FileText className="h-5 w-5 text-gray-400" />
}

function formatFileSize(bytes: number | null) {
    if (!bytes) return "—"
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function AdminMateriaisPage() {
    const supabase = useMemo(() => createClient(), [])
    const [materials, setMaterials] = useState<Material[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [saving, setSaving] = useState(false)

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [category, setCategory] = useState("geral")
    const [fileUrl, setFileUrl] = useState("")
    const [fileType, setFileType] = useState("")
    const [thumbnailUrl, setThumbnailUrl] = useState("")

    const fetchMaterials = useCallback(async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from("materials")
            .select("*")
            .order("created_at", { ascending: false })

        if (!error && data) setMaterials(data)
        setLoading(false)
    }, [supabase])

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void fetchMaterials()
        }, 0)

        return () => window.clearTimeout(timer)
    }, [fetchMaterials])

    function resetForm() {
        setTitle("")
        setDescription("")
        setCategory("geral")
        setFileUrl("")
        setFileType("")
        setThumbnailUrl("")
    }

    async function handleSave() {
        if (!title || !fileUrl) {
            alert("Preencha ao menos o título e a URL do arquivo.")
            return
        }

        setSaving(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setSaving(false); return }

        const ext = fileUrl.split(".").pop()?.split("?")[0] || ""

        const { error } = await supabase.from("materials").insert({
            user_id: user.id,
            title,
            description: description || null,
            category,
            file_url: fileUrl,
            file_type: fileType || ext,
            thumbnail_url: thumbnailUrl || null,
            is_public: true,
        })

        if (!error) {
            fetchMaterials()
            setIsModalOpen(false)
            resetForm()
        } else {
            alert("Erro ao salvar material.")
            console.error(error)
        }
        setSaving(false)
    }

    async function handleDelete(id: string) {
        if (!confirm("Excluir este material?")) return
        const { error } = await supabase.from("materials").delete().eq("id", id)
        if (!error) fetchMaterials()
    }

    return (
        <div className="space-y-6 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Materiais de Apoio</h2>
                    <p className="text-sm text-gray-500">Gerencie os arquivos disponíveis para download dos usuários.</p>
                </div>
                <Button
                    onClick={() => { resetForm(); setIsModalOpen(true) }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                    <Plus className="mr-2 h-4 w-4" /> Novo Material
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                </div>
            ) : materials.length === 0 ? (
                <div className="rounded-xl bg-[#1e1e1e] border border-white/5 p-12 text-center">
                    <Download className="h-10 w-10 text-gray-600 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-gray-300 mb-1">Nenhum material cadastrado</h3>
                    <p className="text-xs text-gray-600">Adicione PDFs, planilhas, templates e outros recursos para seus usuários.</p>
                </div>
            ) : (
                <div className="rounded-xl bg-[#1a1a1a] border border-white/5 overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 p-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-b border-white/5 bg-[#161616]">
                        <div className="col-span-5">Material</div>
                        <div className="col-span-2">Categoria</div>
                        <div className="col-span-2 text-center">Tipo / Tamanho</div>
                        <div className="col-span-1 text-center">Downloads</div>
                        <div className="col-span-2 text-right">Ações</div>
                    </div>
                    <div className="divide-y divide-white/5">
                        {materials.map((mat) => (
                            <div key={mat.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/[0.02] transition-colors">
                                <div className="col-span-5 flex items-center gap-3">
                                    <div className="shrink-0 w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                                        {getFileIcon(mat.file_type)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-white truncate">{mat.title}</p>
                                        {mat.description && (
                                            <p className="text-[11px] text-gray-600 truncate">{mat.description}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-xs text-gray-400 capitalize">{mat.category}</span>
                                </div>
                                <div className="col-span-2 text-center">
                                    <span className="text-[10px] text-gray-500 uppercase">{mat.file_type || "—"}</span>
                                    <span className="text-[10px] text-gray-700 ml-1">· {formatFileSize(mat.file_size)}</span>
                                </div>
                                <div className="col-span-1 text-center">
                                    <span className="text-xs text-gray-400 font-medium">{mat.download_count}</span>
                                </div>
                                <div className="col-span-2 flex justify-end gap-2">
                                    <a
                                        href={mat.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 rounded-md hover:bg-white/5 text-gray-500 hover:text-gray-300 transition-colors"
                                        title="Abrir link"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                    <button
                                        onClick={() => handleDelete(mat.id)}
                                        className="p-1.5 rounded-md hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                                        title="Excluir"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal Novo Material */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[520px]">
                    <DialogHeader>
                        <DialogTitle>Novo Material de Apoio</DialogTitle>
                        <DialogDescription>
                            Cadastre um arquivo para ficar disponível na área de downloads dos usuários.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Título *</Label>
                            <Input
                                placeholder="Ex: Checklist de Onboarding"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Descrição</Label>
                            <Textarea
                                placeholder="Breve descrição do material..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={2}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Categoria</Label>
                                <Input
                                    placeholder="Ex: onboarding, vendas, geral"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Tipo do arquivo</Label>
                                <Input
                                    placeholder="pdf, zip, docx..."
                                    value={fileType}
                                    onChange={(e) => setFileType(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>URL do Arquivo *</Label>
                            <Input
                                placeholder="https://storage.exemplo.com/arquivo.pdf"
                                value={fileUrl}
                                onChange={(e) => setFileUrl(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>URL da Thumbnail (opcional)</Label>
                            <Input
                                placeholder="https://exemplo.com/thumb.png"
                                value={thumbnailUrl}
                                onChange={(e) => setThumbnailUrl(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                            {saving ? "Salvando..." : "Salvar Material"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
