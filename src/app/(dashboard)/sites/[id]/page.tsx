"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Site, SitePage } from "@/types/sites"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Edit, FileText, Plus, Trash2, Home, Loader2, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function SiteDashboardPage() {
    const params = useParams()
    const router = useRouter()
    const siteId = params.id as string
    const supabase = useMemo(() => createClient(), [])

    const [site, setSite] = useState<Site | null>(null)
    const [pages, setPages] = useState<SitePage[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreatingPage, setIsCreatingPage] = useState(false)
    const [newPageName, setNewPageName] = useState("")
    const [newPageSlug, setNewPageSlug] = useState("")
    const [errorMsg, setErrorMsg] = useState("")

    const fetchSiteData = useCallback(async () => {
        try {
            setLoading(true)

            // 1. Fetch site
            const { data: siteData, error: siteError } = await supabase
                .from("sites")
                .select("*")
                .eq("id", siteId)
                .single()

            if (siteError) throw siteError
            setSite(siteData)

            // 2. Fetch its pages
            const { data: pagesData, error: pagesError } = await supabase
                .from("site_pages")
                .select("*")
                .eq("site_id", siteId)
                .order("created_at", { ascending: true })

            if (pagesError) throw pagesError
            setPages(pagesData || [])

        } catch (error) {
            console.error("Erro ao carregar os dados do site:", error)
        } finally {
            setLoading(false)
        }
    }, [siteId, supabase])

    useEffect(() => {
        fetchSiteData()
    }, [fetchSiteData])

    // Auto-preencher slug quando digitar o nome
    useEffect(() => {
        if (!newPageSlug && newPageName) {
            setNewPageSlug(
                newPageName
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)+/g, '')
            )
        }
    }, [newPageName, newPageSlug])

    const handleCreatePage = async () => {
        setErrorMsg("")
        if (!newPageName || !newPageSlug) {
            setErrorMsg("Preencha o nome e a URL da página.")
            return
        }

        try {
            const isFirst = pages.length === 0

            const { error } = await supabase
                .from("site_pages")
                .insert([{
                    site_id: siteId,
                    name: newPageName,
                    slug: newPageSlug,
                    is_home: isFirst // The first created page is automatically the home
                }])
                .select()
                .single()

            if (error) {
                if (error.code === '23505') { // Postgres unique violation code
                    setErrorMsg("Já existe uma página com esta URL (slug) neste site.")
                } else {
                    throw error
                }
                return
            }

            // Cleanup & Reload
            setNewPageName("")
            setNewPageSlug("")
            setIsCreatingPage(false)
            fetchSiteData()

        } catch (error) {
            console.error("Erro ao criar a página:", error)
            setErrorMsg("Houve um erro ao criar a página. Tente novamente.")
        }
    }

    const handleDeletePage = async (pageId: string, pageName: string) => {
        if (!confirm(`Tem certeza que deseja apagar a página "${pageName}"?`)) return

        try {
            const { error } = await supabase.from("site_pages").delete().eq("id", pageId)
            if (error) throw error
            fetchSiteData()
        } catch (error) {
            console.error("Erro ao deletar página:", error)
            alert("Erro ao remover a página.")
        }
    }

    const handleOpenBuilder = useCallback((pageId: string) => {
        const builderMode = window.localStorage.getItem("swhub-builder-mode")

        if (builderMode === "beta") {
            router.push(`/sites-beta?siteId=${siteId}&pageId=${pageId}`)
            return
        }

        router.push(`/sites/${siteId}/pages/${pageId}/editor`)
    }, [router, siteId])

    if (loading) {
        return (
            <div className="flex flex-1 h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!site) {
        return (
            <div className="p-8">
                <p>Site não encontrado ou você não tem permissão de visualização.</p>
                <Button onClick={() => router.push("/sites")} className="mt-4">Voltar</Button>
            </div>
        )
    }

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.push("/sites")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{site.name}</h2>
                    <p className="text-muted-foreground flex items-center gap-2">
                        <span>URL Base: suamarca.com.br/s/{site.slug}</span>
                        {site.is_published ? (
                            <Badge className="bg-green-500">Online</Badge>
                        ) : (
                            <Badge className="bg-slate-100 text-slate-700 border border-slate-200 shadow-sm dark:bg-slate-800/90 dark:text-slate-200 dark:border-slate-700">Rascunho</Badge>
                        )}
                    </p>
                </div>

                <div className="ml-auto">
                    <Dialog open={isCreatingPage} onOpenChange={setIsCreatingPage}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Nova Página (Passo)
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Criar Nova Página</DialogTitle>
                                <DialogDescription>
                                    Adicione uma nova etapa ao seu funil (ex: Captura, Vendas, Obrigado).
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                {errorMsg && (
                                    <div className="flex items-center p-3 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50" role="alert">
                                        <AlertCircle className="w-4 h-4 mr-2" />
                                        {errorMsg}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="page-name">Nome da Página</Label>
                                    <Input
                                        id="page-name"
                                        placeholder="Ex: Página de Captura"
                                        value={newPageName}
                                        onChange={(e) => setNewPageName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="page-slug">Caminho da URL (Slug)</Label>
                                    <div className="flex items-center">
                                        <div className="bg-muted px-3 py-2 border border-r-0 rounded-l-md text-sm text-muted-foreground">
                                            /{site.slug}/
                                        </div>
                                        <Input
                                            id="page-slug"
                                            className="rounded-l-none"
                                            placeholder="captura"
                                            value={newPageSlug}
                                            onChange={(e) => setNewPageSlug(e.target.value)}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">Mantenha limpo, sem espaços, use hífen para espaços.</p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreatingPage(false)}>Cancelar</Button>
                                <Button onClick={handleCreatePage}>Salvar Página</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Passos do Funil (Páginas)</h3>

                {pages.length === 0 ? (
                    <Card className="flex flex-col items-center py-10">
                        <FileText className="h-10 w-10 text-muted-foreground/30 mb-4" />
                        <CardTitle className="mb-2">Seu site precisa de páginas!</CardTitle>
                        <CardDescription className="mb-4">
                            Você não criou nenhuma página (Home, Captura) para este site ainda.
                        </CardDescription>
                        <Button onClick={() => setIsCreatingPage(true)} variant="outline">
                            Criar primeira página
                        </Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pages.map((page) => (
                            <Card key={page.id} className="flex flex-col hover:border-primary/50 transition-colors">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            {page.name}
                                            <span title="Página Inicial do Funil">
                                                {page.is_home && <Home className="h-4 w-4 text-blue-500" />}
                                            </span>
                                        </CardTitle>
                                    </div>
                                    <CardDescription className="font-mono text-xs">
                                        /.../{page.slug}
                                    </CardDescription>
                                </CardHeader>
                                <CardFooter className="flex justify-between border-t p-4 mt-auto">
                                    <Button size="sm" onClick={() => handleOpenBuilder(page.id)}>
                                        <Edit className="mr-2 h-3.5 w-3.5" /> Abrir Builder
                                    </Button>
                                    <div className="space-x-1">
                                        <Button variant="ghost" size="icon" title="Excluir" onClick={() => handleDeletePage(page.id, page.name)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
