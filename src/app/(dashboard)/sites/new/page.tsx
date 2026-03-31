"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, LayoutTemplate, SquareDashedMousePointer, Search, Star, Eye, Heart, FolderOpen, Check, Users } from "lucide-react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// ── Real Template Data (based on TriiaHub library) ─────────────
const TEMPLATES = [
    { id: "blank", name: "Em Branco", category: "blank", image: null },
    // ── Automotive (37 in TriiaHub) ──
    { id: "appliance-repair", name: "Appliance Repair", category: "Automotive", image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=600&h=400&fit=crop" },
    { id: "muffler-brakes", name: "Muffler & Brakes Shop", category: "Automotive", image: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=600&h=400&fit=crop" },
    { id: "rental-cars", name: "Rental Cars", category: "Automotive", image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0484?q=80&w=600&h=400&fit=crop" },
    { id: "auto-dealers", name: "Auto Dealers", category: "Automotive", image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=600&h=400&fit=crop" },
    { id: "tire-store", name: "Tire Store", category: "Automotive", image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=600&h=400&fit=crop" },
    { id: "auto-body-paint", name: "Auto Body and Painting", category: "Automotive", image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=600&h=400&fit=crop" },
    { id: "auto-repair-mechanic", name: "Automotive Repair/Mechanic", category: "Automotive", image: "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?q=80&w=600&h=400&fit=crop" },
    { id: "auto-dealership", name: "Auto Dealership", category: "Automotive", image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=600&h=400&fit=crop" },
    // ── Beauty & Fashion (49 in TriiaHub) ──
    { id: "modeling-agency", name: "Modeling Agency", category: "Beauty & Fashion", image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600&h=400&fit=crop" },
    { id: "hair-stylist", name: "Hair Stylist", category: "Beauty & Fashion", image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600&h=400&fit=crop" },
    { id: "jewelry", name: "Jewelry", category: "Beauty & Fashion", image: "https://images.unsplash.com/photo-1515562141589-67f0d569b6fc?q=80&w=600&h=400&fit=crop" },
    { id: "nail-spa", name: "Nail Spa", category: "Beauty & Fashion", image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=600&h=400&fit=crop" },
    { id: "serenity-spa", name: "Serenity Spa", category: "Beauty & Fashion", image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=600&h=400&fit=crop" },
    { id: "model-portfolio", name: "Model Portfolio", category: "Beauty & Fashion", image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=600&h=400&fit=crop" },
    { id: "barber-stylist", name: "Barber Stylist", category: "Beauty & Fashion", image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=600&h=400&fit=crop" },
    { id: "spa-retreat", name: "Spa Retreat", category: "Beauty & Fashion", image: "https://images.unsplash.com/photo-1540555700478-4be289fbec6e?q=80&w=600&h=400&fit=crop" },
    { id: "skin-care", name: "Skin Care", category: "Beauty & Fashion", image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=600&h=400&fit=crop" },
    // ── Business, Coaching & Consulting (48 in TriiaHub) ──
    { id: "it-advisor", name: "IT Advisor", category: "Business, Coaching & Consulting", image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600&h=400&fit=crop" },
    { id: "title-company", name: "Title Company", category: "Business, Coaching & Consulting", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&h=400&fit=crop" },
    { id: "digital-studio", name: "Digital Studio Solutions", category: "Business, Coaching & Consulting", image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=600&h=400&fit=crop" },
    { id: "business-consulting", name: "Business Consulting", category: "Business, Coaching & Consulting", image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=600&h=400&fit=crop" },
    { id: "coaching-agency", name: "Coaching Agency", category: "Business, Coaching & Consulting", image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=600&h=400&fit=crop" },
    { id: "consulting-firm", name: "Consulting Firm", category: "Business, Coaching & Consulting", image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=600&h=400&fit=crop" },
    // ── Creative (37 in TriiaHub) ──
    { id: "photography", name: "Photography Portfolio", category: "Creative", image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?q=80&w=600&h=400&fit=crop" },
    { id: "design-agency", name: "Design Agency", category: "Creative", image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?q=80&w=600&h=400&fit=crop" },
    { id: "child-education", name: "Child Education", category: "Creative", image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=600&h=400&fit=crop" },
    { id: "music-studio", name: "Music Studio", category: "Creative", image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=600&h=400&fit=crop" },
    // ── Financial (39 in TriiaHub) ──
    { id: "investment-advisor", name: "Investment Advisor", category: "Financial", image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=600&h=400&fit=crop" },
    { id: "tax-experts", name: "Tax Experts", category: "Financial", image: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?q=80&w=600&h=400&fit=crop" },
    { id: "financial-consultant", name: "Financial Consultant", category: "Financial", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&h=400&fit=crop" },
    { id: "secure-wallet", name: "Secure Mobile Wallet", category: "Financial", image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=600&h=400&fit=crop" },
    // ── Health & Wellness (44 in TriiaHub) ──
    { id: "yoga", name: "Yoga", category: "Health & Wellness", image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&h=400&fit=crop" },
    { id: "health-care", name: "Health Care", category: "Health & Wellness", image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=600&h=400&fit=crop" },
    { id: "trusted-wellness", name: "Trusted Wellness Solutions", category: "Health & Wellness", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=600&h=400&fit=crop" },
    { id: "fitness-gym", name: "Fitness & Gym", category: "Health & Wellness", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&h=400&fit=crop" },
    { id: "serene-life", name: "Serene Life", category: "Health & Wellness", image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600&h=400&fit=crop" },
    { id: "meditation", name: "Meditation", category: "Health & Wellness", image: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?q=80&w=600&h=400&fit=crop" },
    // ── Home Services (79 in TriiaHub) ──
    { id: "framing-construction", name: "Framing Construction", category: "Home Services", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600&h=400&fit=crop" },
    { id: "pet-salon", name: "Pet Salon", category: "Home Services", image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=600&h=400&fit=crop" },
    { id: "electrician", name: "Electrician", category: "Home Services", image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=600&h=400&fit=crop" },
    { id: "plumber", name: "Plumber Services", category: "Home Services", image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=600&h=400&fit=crop" },
    { id: "roofer", name: "Roofer", category: "Home Services", image: "https://images.unsplash.com/photo-1632759145351-1d592919f522?q=80&w=600&h=400&fit=crop" },
    { id: "cleaning-service", name: "Cleaning Service", category: "Home Services", image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=600&h=400&fit=crop" },
    { id: "landscaping", name: "Landscaping", category: "Home Services", image: "https://images.unsplash.com/photo-1558904541-efa843a96f01?q=80&w=600&h=400&fit=crop" },
    { id: "painting-service", name: "Painting Service", category: "Home Services", image: "https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?q=80&w=600&h=400&fit=crop" },
    // ── Insurance (22 in TriiaHub) ──
    { id: "insurance-agency", name: "Insurance Agency", category: "Insurance", image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=600&h=400&fit=crop" },
    { id: "life-insurance", name: "Life Insurance", category: "Insurance", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600&h=400&fit=crop" },
    { id: "health-insurance", name: "Health Insurance", category: "Insurance", image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=600&h=400&fit=crop" },
    // ── Legal (28 in TriiaHub) ──
    { id: "law-firm", name: "Law Firm", category: "Legal", image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=600&h=400&fit=crop" },
    { id: "family-attorney", name: "Family Attorney", category: "Legal", image: "https://images.unsplash.com/photo-1521791055366-0d553872125f?q=80&w=600&h=400&fit=crop" },
    { id: "immigration-lawyer", name: "Immigration Lawyer", category: "Legal", image: "https://images.unsplash.com/photo-1436450412740-6b988f486c6b?q=80&w=600&h=400&fit=crop" },
    // ── Marketing Agency (45 in TriiaHub) ──
    { id: "marketing-digital", name: "Digital Marketing Agency", category: "Marketing Agency", image: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?q=80&w=600&h=400&fit=crop" },
    { id: "social-media-agency", name: "Social Media Agency", category: "Marketing Agency", image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=600&h=400&fit=crop" },
    { id: "seo-agency", name: "SEO Agency", category: "Marketing Agency", image: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?q=80&w=600&h=400&fit=crop" },
    // ── Medical (47 in TriiaHub) ──
    { id: "dental-clinic", name: "Dental Clinic", category: "Medical", image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=600&h=400&fit=crop" },
    { id: "dermatologist", name: "Dermatologist", category: "Medical", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=600&h=400&fit=crop" },
    { id: "chiropractor", name: "Chiropractor", category: "Medical", image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=600&h=400&fit=crop" },
    { id: "veterinary", name: "Veterinary Clinic", category: "Medical", image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?q=80&w=600&h=400&fit=crop" },
    // ── Real Estate (44 in TriiaHub) ──
    { id: "prime-realty", name: "Prime Realty", category: "Real Estate", image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=600&h=400&fit=crop" },
    { id: "mortgage-lender", name: "Mortgage Lender", category: "Real Estate", image: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?q=80&w=600&h=400&fit=crop" },
    { id: "luxury-realtor", name: "Luxury Realtor", category: "Real Estate", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=600&h=400&fit=crop" },
    { id: "home-inspector", name: "Residential Home Inspector", category: "Real Estate", image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=600&h=400&fit=crop" },
    // ── Restaurant & Bar (37 in TriiaHub) ──
    { id: "cafe", name: "Cafe", category: "Restaurant & Bar", image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=600&h=400&fit=crop" },
    { id: "restaurant", name: "Restaurant", category: "Restaurant & Bar", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&h=400&fit=crop" },
    { id: "pizzeria", name: "Pizzeria", category: "Restaurant & Bar", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&h=400&fit=crop" },
    { id: "sushi-bar", name: "Sushi Bar", category: "Restaurant & Bar", image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=600&h=400&fit=crop" },
    // ── Travel & Hospitality (20 in TriiaHub) ──
    { id: "rv-rental", name: "RV Rental Agency", category: "Travel & Hospitality", image: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=600&h=400&fit=crop" },
    { id: "travel-agency", name: "Travel Agency", category: "Travel & Hospitality", image: "https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=600&h=400&fit=crop" },
    { id: "hotel-resort", name: "Hotel & Resort", category: "Travel & Hospitality", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&h=400&fit=crop" },
]

// Build categories dynamically
const CATEGORY_LIST = (() => {
    const counts: Record<string, number> = {}
    TEMPLATES.forEach(t => {
        if (t.category && t.category !== "blank") {
            counts[t.category] = (counts[t.category] || 0) + 1
        }
    })
    return Object.entries(counts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, count]) => ({ name, count }))
})()

type SidebarTab = "all" | "favorites" | "my-templates" | "shared"

export default function NewSitePage() {
    const [name, setName] = useState("")
    const [slug, setSlug] = useState("")
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [activeCategories, setActiveCategories] = useState<string[]>([])
    const [sidebarTab, setSidebarTab] = useState<SidebarTab>("all")
    const router = useRouter()
    const supabase = createClient()

    // Filter logic
    const filteredTemplates = useMemo(() => {
        return TEMPLATES.filter(t => {
            if (t.category === "blank") return false
            const matchesSearch = !searchQuery ||
                t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.category.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesCategory = activeCategories.length === 0 || activeCategories.includes(t.category)
            return matchesSearch && matchesCategory
        })
    }, [searchQuery, activeCategories])

    const toggleCategory = (categoryName: string) => {
        setActiveCategories(prev =>
            prev.includes(categoryName)
                ? prev.filter(c => c !== categoryName)
                : [...prev, categoryName]
        )
    }

    const generateSlug = (text: string) => {
        return text.toString().normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
            .replace(/\s+/g, "-").replace(/[^\w-]+/g, "").replace(/--+/g, "-")
    }

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setName(value)
        setSlug(generateSlug(value))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Usuário não autenticado")

            const { data, error: insertError } = await supabase
                .from("sites")
                .insert({
                    user_id: user.id,
                    name: name,
                    slug: slug.trim() || generateSlug(name)
                })
                .select("id")
                .single()

            if (insertError) {
                if (insertError.code === '23505') {
                    throw new Error("Você já possui um site com essa URL (slug).")
                }
                throw insertError
            }

            // Create the initial home page automatically
            const { data: pageData, error: pageError } = await supabase
                .from("site_pages")
                .insert({
                    site_id: data.id,
                    name: "Página Inicial",
                    slug: "home",
                    is_home: true
                })
                .select("id")
                .single()

            if (pageError) {
                console.error("Error creating home page:", pageError)
                throw new Error("Erro ao criar página inicial do site.")
            }

            // Save selected template to localStorage so the editor can pick it up
            if (selectedTemplate && selectedTemplate !== "blank") {
                const tpl = TEMPLATES.find(t => t.id === selectedTemplate)
                if (tpl) {
                    localStorage.setItem(`site_template_${data.id}`, JSON.stringify({
                        templateId: tpl.id,
                        templateName: tpl.name,
                        category: tpl.category,
                    }))
                }
            }

            router.push(`/sites/${data.id}/pages/${pageData.id}/editor`)
        } catch (err: unknown) {
            console.error("Erro ao criar site:", err)
            if (err instanceof Error) {
                setError(err.message)
            } else {
                setError("Erro desconhecido ao criar.")
            }
        } finally {
            setLoading(false)
        }
    }

    const totalCount = TEMPLATES.length - 1 // exclude blank

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" onClick={() => router.push("/sites")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-3xl font-bold tracking-tight">Criar Novo Projeto</h2>
            </div>

            <div className="max-w-2xl mx-auto mt-10">
                <Card>
                    <form onSubmit={handleSubmit}>
                        <CardHeader>
                            <CardTitle>Detalhes Iniciais</CardTitle>
                            <CardDescription>
                                Dê um nome ao seu projeto para começarmos a organizar as coisas.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {error && (
                                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome do Site / Landing Page</Label>
                                <Input id="name" placeholder="Ex: Landing Page E-book" value={name} onChange={handleNameChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug">URL do Projeto (Slug)</Label>
                                <div className="flex items-center">
                                    <span className="bg-muted px-3 border border-r-0 rounded-l-md text-sm text-muted-foreground h-10 flex items-center">seusite.com/</span>
                                    <Input id="slug" className="rounded-l-none" placeholder="landing-page-ebook" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))} required />
                                </div>
                                <p className="text-xs text-muted-foreground">Este será o endereço único do seu site.</p>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end border-t pt-6 bg-muted/50 rounded-b-xl">
                            <Button type="button" variant="outline" className="mr-2" onClick={() => router.push("/sites")} disabled={loading}>Cancelar</Button>
                            <Button type="submit" disabled={!name || !slug || loading}>
                                {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando ambiente...</>) : ("Continuar para o Construtor")}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>

            {/* ═══ TEMPLATE LIBRARY MODAL ═══ */}
            <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
                <DialogContent className="max-w-[95vw] w-[1400px] h-[92vh] p-0 overflow-hidden bg-white gap-0 flex flex-col border-0 shadow-2xl rounded-2xl">

                    {/* Header */}
                    <DialogHeader className="px-6 py-4 border-b bg-white shrink-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <DialogTitle className="text-xl font-semibold text-gray-900">Biblioteca de Modelos</DialogTitle>
                                <p className="text-sm text-gray-500 mt-0.5">Escolha um ponto de partida para o seu novo site</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        className="h-9 w-[280px] pl-9 text-sm border-gray-200 bg-gray-50 rounded-lg focus-visible:ring-blue-500"
                                        placeholder="Pesquisar um Modelo"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Body */}
                    <div className="flex flex-1 overflow-hidden">

                        {/* Left Sidebar */}
                        <div className="w-[260px] border-r bg-gray-50/70 shrink-0 flex flex-col overflow-y-auto">
                            <div className="p-4">
                                {/* Websites label */}
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Websites</p>

                                <div className="space-y-0.5 mb-5">
                                    <button
                                        onClick={() => { setSidebarTab("all"); setActiveCategories([]) }}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] rounded-lg transition-all ${sidebarTab === "all" && activeCategories.length === 0 ? "bg-blue-600 text-white font-medium shadow-sm" : "text-gray-700 hover:bg-white hover:shadow-sm"}`}
                                    >
                                        <LayoutTemplate className="h-4 w-4 shrink-0" />
                                        Todos os modelos
                                        <span className={`ml-auto text-[11px] px-1.5 py-0.5 rounded-full font-medium ${sidebarTab === "all" && activeCategories.length === 0 ? "bg-blue-500/80" : "bg-gray-200 text-gray-600"}`}>{totalCount}</span>
                                    </button>
                                    <button
                                        onClick={() => setSidebarTab("my-templates")}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] rounded-lg transition-all ${sidebarTab === "my-templates" ? "bg-blue-600 text-white font-medium shadow-sm" : "text-gray-700 hover:bg-white hover:shadow-sm"}`}
                                    >
                                        <FolderOpen className="h-4 w-4 shrink-0" />
                                        Meus modelos
                                    </button>
                                    <button
                                        onClick={() => setSidebarTab("shared")}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] rounded-lg transition-all ${sidebarTab === "shared" ? "bg-blue-600 text-white font-medium shadow-sm" : "text-gray-700 hover:bg-white hover:shadow-sm"}`}
                                    >
                                        <Users className="h-4 w-4 shrink-0" />
                                        Compartilhado comigo
                                    </button>
                                    <button
                                        onClick={() => setSidebarTab("favorites")}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] rounded-lg transition-all ${sidebarTab === "favorites" ? "bg-blue-600 text-white font-medium shadow-sm" : "text-gray-700 hover:bg-white hover:shadow-sm"}`}
                                    >
                                        <Heart className="h-4 w-4 shrink-0" />
                                        Favoritos
                                    </button>
                                </div>

                                {/* Category Filters */}
                                <div className="border-t border-gray-200/80 pt-4">
                                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
                                        Procurar categorias
                                    </h3>
                                    <div className="space-y-0.5">
                                        {CATEGORY_LIST.map(cat => {
                                            const isActive = activeCategories.includes(cat.name)
                                            return (
                                                <button
                                                    key={cat.name}
                                                    onClick={() => { setSidebarTab("all"); toggleCategory(cat.name) }}
                                                    className={`w-full flex items-center justify-between px-3 py-2 text-[13px] rounded-lg transition-all ${isActive ? "bg-blue-50 text-blue-700 font-medium border border-blue-200" : "text-gray-600 hover:bg-white hover:shadow-sm border border-transparent"}`}
                                                >
                                                    <span className="flex items-center gap-2 truncate">
                                                        {isActive && <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />}
                                                        <span className="truncate">{cat.name}</span>
                                                    </span>
                                                    <span className={`text-[11px] px-1.5 py-0.5 rounded-full shrink-0 ml-2 ${isActive ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                                                        {cat.count}
                                                    </span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Grid */}
                        <div className="flex-1 flex flex-col overflow-hidden bg-white">
                            {/* Active Filters */}
                            {activeCategories.length > 0 && (
                                <div className="px-6 py-2.5 border-b bg-gray-50 flex items-center gap-2 shrink-0 flex-wrap">
                                    <span className="text-xs text-gray-500">Filtrando por:</span>
                                    {activeCategories.map(cat => (
                                        <button key={cat} onClick={() => toggleCategory(cat)}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200 hover:bg-blue-100 transition-colors">
                                            {cat} <span className="text-blue-400 hover:text-blue-600 ml-0.5">✕</span>
                                        </button>
                                    ))}
                                    <button onClick={() => setActiveCategories([])} className="text-xs text-gray-400 hover:text-gray-600 ml-2 underline">
                                        Limpar tudo
                                    </button>
                                </div>
                            )}

                            {/* Grid */}
                            <div className="flex-1 overflow-y-auto">
                                <div className="p-6">
                                    <p className="text-sm text-gray-500 mb-5">
                                        Exibindo <span className="font-semibold text-gray-800">{filteredTemplates.length + (activeCategories.length === 0 ? 1 : 0)}</span> modelos
                                        {activeCategories.length > 0 && <span> em {activeCategories.length} categoria{activeCategories.length > 1 ? "s" : ""}</span>}
                                    </p>

                                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                        {/* Blank Card */}
                                        {activeCategories.length === 0 && !searchQuery && (
                                            <div
                                                className={`group cursor-pointer rounded-xl border-2 transition-all duration-200 overflow-hidden bg-white hover:shadow-lg ${selectedTemplate === "blank" ? "border-blue-500 ring-4 ring-blue-500/10 shadow-lg" : "border-dashed border-gray-300 hover:border-blue-300"}`}
                                                onClick={() => setSelectedTemplate("blank")}
                                            >
                                                <div className="aspect-[4/3] flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100/50 group-hover:from-blue-50/30 group-hover:to-blue-100/20 transition-all">
                                                    <div className={`p-4 rounded-2xl mb-3 transition-colors ${selectedTemplate === "blank" ? "bg-blue-100" : "bg-gray-100 group-hover:bg-blue-50"}`}>
                                                        <SquareDashedMousePointer className={`h-8 w-8 ${selectedTemplate === "blank" ? "text-blue-600" : "text-gray-400 group-hover:text-blue-500"}`} />
                                                    </div>
                                                    <span className="font-semibold text-gray-800 text-sm">A partir do zero</span>
                                                    <span className="text-xs text-gray-500 mt-1">Canvas em branco</span>
                                                </div>
                                                <div className={`px-4 py-3 border-t transition-colors ${selectedTemplate === "blank" ? "bg-blue-50 border-blue-100" : "bg-white"}`}>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium text-gray-900">Em Branco</span>
                                                        {selectedTemplate === "blank" && <span className="flex items-center gap-1 text-xs text-blue-600 font-medium"><Check className="h-3.5 w-3.5" /> Selecionado</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Template Cards */}
                                        {filteredTemplates.map(template => (
                                            <div
                                                key={template.id}
                                                className={`group cursor-pointer rounded-xl border-2 transition-all duration-200 overflow-hidden bg-white hover:shadow-lg ${selectedTemplate === template.id ? "border-blue-500 ring-4 ring-blue-500/10 shadow-lg" : "border-gray-200/80 hover:border-blue-300"}`}
                                                onClick={() => setSelectedTemplate(template.id)}
                                            >
                                                <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                                                    {template.image ? (
                                                        <img src={template.image} alt={template.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                                    ) : (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                                            <LayoutTemplate className="h-12 w-12 text-gray-300" />
                                                        </div>
                                                    )}
                                                    {/* Hover overlay */}
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                                        <Button size="sm" className="bg-white/90 backdrop-blur-sm text-gray-900 hover:bg-white text-xs h-8 px-3 shadow-lg">
                                                            <Eye className="h-3.5 w-3.5 mr-1.5" /> Pré-visualizar
                                                        </Button>
                                                    </div>
                                                    {/* Favorite */}
                                                    <button className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-110 shadow-sm">
                                                        <Star className="h-3.5 w-3.5 text-gray-500" />
                                                    </button>
                                                </div>
                                                {/* Footer */}
                                                <div className={`px-4 py-3 border-t transition-colors ${selectedTemplate === template.id ? "bg-blue-50 border-blue-100" : "bg-white"}`}>
                                                    <div className="flex items-center justify-between">
                                                        <div className="min-w-0">
                                                            <div className="font-medium text-gray-900 text-sm leading-tight truncate">{template.name}</div>
                                                            <div className="text-[11px] text-gray-400 mt-0.5 truncate">{template.category}</div>
                                                        </div>
                                                        {selectedTemplate === template.id && <span className="flex items-center text-blue-600 shrink-0 ml-2"><Check className="h-4 w-4" /></span>}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Empty State */}
                                    {filteredTemplates.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-20 text-center">
                                            <Search className="h-12 w-12 text-gray-300 mb-4" />
                                            <h3 className="text-lg font-medium text-gray-700 mb-1">Nenhum modelo encontrado</h3>
                                            <p className="text-sm text-gray-500 mb-4">Tente ajustar seus filtros ou pesquisar por outro termo</p>
                                            <Button variant="outline" size="sm" onClick={() => { setActiveCategories([]); setSearchQuery("") }}>Limpar filtros</Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <DialogFooter className="px-6 py-4 bg-white border-t shrink-0">
                        <div className="flex items-center justify-between w-full">
                            <p className="text-sm text-gray-500">
                                {selectedTemplate
                                    ? <>Selecionado: <span className="font-medium text-gray-800">{TEMPLATES.find(t => t.id === selectedTemplate)?.name}</span></>
                                    : "Selecione um modelo para continuar"
                                }
                            </p>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="h-9 px-5 border-gray-200" onClick={() => router.push("/sites")}>Cancelar</Button>
                                <Button onClick={() => setIsTemplateModalOpen(false)} disabled={!selectedTemplate} size="sm" className="h-9 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm">
                                    Continuar com este modelo
                                </Button>
                            </div>
                        </div>
                    </DialogFooter>

                </DialogContent>
            </Dialog>
        </div>
    )
}
