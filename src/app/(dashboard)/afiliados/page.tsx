"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Users, Copy, CheckCircle2, DollarSign, MousePointerClick, TrendingUp,
    Award, Share2, Mail, ArrowRight, Percent, Crown, Trophy, Star,
    ExternalLink, Loader2, Send, Gift, BarChart3, Wallet, Eye,
} from "lucide-react"

type AffiliateTab = "dashboard" | "afiliados" | "materiais" | "formulario"

type Affiliate = {
    id: string
    name: string
    email: string
    clicks: number
    conversions: number
    earnings: number
    status: "active" | "pending" | "inactive"
    tier: "bronze" | "prata" | "ouro"
    joinedAt: string
}

const TIERS = [
    {
        key: "bronze" as const,
        name: "Bronze",
        icon: Award,
        color: "from-amber-700 to-amber-900",
        textColor: "text-amber-400",
        bgColor: "bg-amber-500/15",
        borderColor: "border-amber-500/20",
        commission: "10%",
        minSales: 0,
        benefits: ["Link de afiliado exclusivo", "Comissão de 10% por venda", "Acesso ao painel de métricas", "Materiais de divulgação"],
    },
    {
        key: "prata" as const,
        name: "Prata",
        icon: Trophy,
        color: "from-gray-400 to-gray-600",
        textColor: "text-gray-300",
        bgColor: "bg-gray-400/15",
        borderColor: "border-gray-400/20",
        commission: "15%",
        minSales: 5,
        benefits: ["Tudo do Bronze", "Comissão de 15% por venda", "Materiais exclusivos de alta conversão", "Suporte prioritário", "Badge de parceiro no perfil"],
    },
    {
        key: "ouro" as const,
        name: "Ouro",
        icon: Crown,
        color: "from-yellow-500 to-amber-600",
        textColor: "text-yellow-400",
        bgColor: "bg-yellow-500/15",
        borderColor: "border-yellow-500/20",
        commission: "20%",
        minSales: 15,
        benefits: ["Tudo do Prata", "Comissão de 20% por venda", "Landing page personalizada", "Co-branding nos materiais", "Consultoria mensal gratuita", "Pagamento semanal"],
    },
]

const MOCK_AFFILIATES: Affiliate[] = [
    { id: "1", name: "Carlos Mendes", email: "carlos@empresa.com", clicks: 142, conversions: 8, earnings: 960, status: "active", tier: "prata", joinedAt: "2025-11-10" },
    { id: "2", name: "Ana Souza", email: "ana@agencia.com", clicks: 87, conversions: 3, earnings: 360, status: "active", tier: "bronze", joinedAt: "2025-12-05" },
    { id: "3", name: "Roberto Lima", email: "roberto@mkt.com", clicks: 312, conversions: 18, earnings: 3600, status: "active", tier: "ouro", joinedAt: "2025-09-20" },
    { id: "4", name: "Fernanda Costa", email: "fer@email.com", clicks: 24, conversions: 0, earnings: 0, status: "pending", tier: "bronze", joinedAt: "2026-02-28" },
]

const SHARE_MATERIALS = [
    { title: "Banner 728x90", desc: "Banner horizontal para sites e blogs", type: "Imagem", size: "45 KB" },
    { title: "Banner 300x250", desc: "Banner quadrado para sidebar e redes", type: "Imagem", size: "38 KB" },
    { title: "Story Instagram", desc: "Template de story pronto para postar", type: "Imagem", size: "120 KB" },
    { title: "Post Carrossel", desc: "5 slides para feed do Instagram", type: "PDF", size: "2.4 MB" },
    { title: "Copy para WhatsApp", desc: "Textos prontos para enviar por WhatsApp", type: "Texto", size: "—" },
    { title: "E-mail Template", desc: "HTML de e-mail para disparar à base", type: "HTML", size: "15 KB" },
]

export default function AfiliadosPage() {
    const supabase = createClient()
    const [tab, setTab] = useState<AffiliateTab>("dashboard")
    const [copied, setCopied] = useState(false)
    const [copiedForm, setCopiedForm] = useState(false)

    const affiliateCode = "SWH-AF2025"
    const affiliateLink = typeof window !== "undefined"
        ? `${window.location.origin}/parceiro?ref=${affiliateCode}`
        : `https://app.swhub.com.br/parceiro?ref=${affiliateCode}`
    const formLink = typeof window !== "undefined"
        ? `${window.location.origin}/seja-afiliado?ref=${affiliateCode}`
        : `https://app.swhub.com.br/seja-afiliado?ref=${affiliateCode}`

    const handleCopy = (text: string, setter: (v: boolean) => void) => {
        navigator.clipboard.writeText(text)
        setter(true)
        setTimeout(() => setter(false), 2000)
    }

    const totalClicks = MOCK_AFFILIATES.reduce((s, a) => s + a.clicks, 0)
    const totalConversions = MOCK_AFFILIATES.reduce((s, a) => s + a.conversions, 0)
    const totalEarnings = MOCK_AFFILIATES.reduce((s, a) => s + a.earnings, 0)
    const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : "0"

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val)

    const tierBadge = (tier: string) => {
        const t = TIERS.find(t => t.key === tier)
        if (!t) return null
        return <Badge className={`${t.bgColor} ${t.textColor} border ${t.borderColor} text-[10px]`}>{t.name}</Badge>
    }

    const statusBadge = (status: string) => {
        if (status === "active") return <Badge className="bg-violet-500/20 text-violet-400 border border-violet-500/30 text-[10px]">Ativo</Badge>
        if (status === "pending") return <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px]">Pendente</Badge>
        return <Badge className="bg-gray-500/20 text-gray-400 border border-gray-500/30 text-[10px]">Inativo</Badge>
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-violet-600/20">
                        <Users className="h-6 w-6 text-violet-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Programa de Afiliados</h1>
                        <p className="text-sm text-gray-500">Transforme seus clientes em promotores e ganhe comissões recorrentes.</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center rounded-lg border border-white/10 bg-[#12142a] p-0.5 w-fit">
                {[
                    { key: "dashboard" as const, label: "Visão Geral", icon: BarChart3 },
                    { key: "afiliados" as const, label: "Meus Afiliados", icon: Users },
                    { key: "materiais" as const, label: "Materiais", icon: Share2 },
                    { key: "formulario" as const, label: "Formulário", icon: Send },
                ].map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium transition-colors ${
                            tab === t.key ? "bg-violet-500/20 text-violet-400" : "text-gray-500 hover:text-gray-300"
                        }`}
                    >
                        <t.icon className="h-3.5 w-3.5" /> {t.label}
                    </button>
                ))}
            </div>

            {/* ═══════ DASHBOARD TAB ═══════ */}
            {tab === "dashboard" && (
                <div className="space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { title: "CLIQUES TOTAIS", value: totalClicks.toString(), icon: MousePointerClick, color: "bg-violet-500/15 text-violet-400" },
                            { title: "CONVERSÕES", value: totalConversions.toString(), icon: TrendingUp, color: "bg-fuchsia-500/15 text-fuchsia-400" },
                            { title: "TAXA DE CONVERSÃO", value: `${conversionRate}%`, icon: Percent, color: "bg-blue-500/15 text-blue-400" },
                            { title: "COMISSÕES GERADAS", value: formatCurrency(totalEarnings), icon: DollarSign, color: "bg-purple-500/15 text-purple-400" },
                        ].map((stat) => (
                            <div key={stat.title} className="rounded-xl bg-[#12142a] border border-white/[0.06] p-5 flex items-start justify-between">
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-2">{stat.title}</p>
                                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                                </div>
                                <div className={`p-2 rounded-xl ${stat.color}`}>
                                    <stat.icon className="h-4 w-4" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Affiliate Link */}
                    <div className="rounded-xl bg-gradient-to-r from-violet-600/10 to-purple-600/5 border border-violet-500/10 p-6 space-y-4">
                        <div className="flex items-center gap-2">
                            <Share2 className="h-5 w-5 text-violet-400" />
                            <h3 className="text-sm font-bold text-white">Seu Link de Afiliado</h3>
                        </div>
                        <p className="text-xs text-gray-400">Compartilhe este link. Cada venda gerada por ele gera comissão automática para você.</p>
                        <div className="flex gap-2 max-w-2xl">
                            <Input
                                readOnly
                                value={affiliateLink}
                                className="bg-[#0d0f1a] border-white/[0.06] text-white font-mono text-sm h-11"
                            />
                            <Button
                                onClick={() => handleCopy(affiliateLink, setCopied)}
                                className={`shrink-0 h-11 px-5 ${copied ? "bg-violet-600 text-white" : "bg-white/[0.06] text-gray-300 hover:bg-white/10"}`}
                            >
                                {copied ? <><CheckCircle2 className="h-4 w-4 mr-1.5" /> Copiado!</> : <><Copy className="h-4 w-4 mr-1.5" /> Copiar</>}
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Wallet */}
                        <div className="rounded-xl bg-[#12142a] border border-white/[0.06] p-6 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Wallet className="h-5 w-5 text-violet-400" />
                                <h3 className="text-sm font-bold text-white">Carteira de Comissões</h3>
                            </div>
                            <div className="rounded-xl bg-gradient-to-br from-violet-600/30 to-purple-700/20 border border-violet-500/10 p-6 text-center">
                                <p className="text-xs text-white/50 font-medium mb-1">Saldo Disponível</p>
                                <p className="text-4xl font-bold text-white mb-1">{formatCurrency(totalEarnings)}</p>
                                <p className="text-[10px] text-white/40">Pagamento via Pix • Mínimo R$ 50,00</p>
                            </div>
                            <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white">
                                <DollarSign className="h-4 w-4 mr-2" /> Solicitar Saque
                            </Button>
                        </div>

                        {/* Top Affiliates */}
                        <div className="rounded-xl bg-[#12142a] border border-white/[0.06] p-6 space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Trophy className="h-5 w-5 text-yellow-400" />
                                    <h3 className="text-sm font-bold text-white">Top Afiliados</h3>
                                </div>
                                <button onClick={() => setTab("afiliados")} className="text-[11px] text-violet-400 hover:text-violet-300 transition-colors">Ver todos →</button>
                            </div>
                            <div className="space-y-2">
                                {MOCK_AFFILIATES
                                    .sort((a, b) => b.earnings - a.earnings)
                                    .slice(0, 3)
                                    .map((aff, idx) => (
                                        <div key={aff.id} className="flex items-center justify-between p-3 rounded-lg bg-[#0d0f1a] border border-white/[0.06]">
                                            <div className="flex items-center gap-3">
                                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                                    idx === 0 ? "bg-yellow-500/20 text-yellow-400" : idx === 1 ? "bg-gray-400/20 text-gray-300" : "bg-amber-700/20 text-amber-400"
                                                }`}>{idx + 1}</span>
                                                <div>
                                                    <p className="text-sm font-medium text-white">{aff.name}</p>
                                                    <p className="text-[10px] text-gray-600">{aff.conversions} conversões</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-violet-400">{formatCurrency(aff.earnings)}</p>
                                                {tierBadge(aff.tier)}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>

                    {/* Commission Tiers */}
                    <div>
                        <h3 className="text-sm font-bold text-white mb-1">Níveis de Comissão</h3>
                        <p className="text-xs text-gray-500 mb-4">Seus afiliados sobem de tier conforme vendem mais.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {TIERS.map((tier) => (
                                <div key={tier.key} className={`rounded-xl bg-[#12142a] border ${tier.borderColor} overflow-hidden`}>
                                    <div className={`bg-gradient-to-r ${tier.color} p-4 flex items-center gap-3`}>
                                        <tier.icon className="h-6 w-6 text-white" />
                                        <div>
                                            <p className="font-bold text-white text-sm">{tier.name}</p>
                                            <p className="text-[10px] text-white/60">{tier.minSales > 0 ? `A partir de ${tier.minSales} vendas` : "Nível inicial"}</p>
                                        </div>
                                        <span className="ml-auto text-2xl font-bold text-white">{tier.commission}</span>
                                    </div>
                                    <div className="p-4 space-y-2">
                                        {tier.benefits.map((b, i) => (
                                            <div key={i} className="flex items-start gap-2">
                                                <CheckCircle2 className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${tier.textColor}`} />
                                                <span className="text-xs text-gray-400">{b}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════ AFILIADOS TAB ═══════ */}
            {tab === "afiliados" && (
                <div className="space-y-4">
                    <div className="rounded-xl bg-[#12142a] border border-white/[0.06] overflow-hidden">
                        <div className="grid grid-cols-12 gap-4 p-4 text-[10px] font-semibold text-gray-500 uppercase tracking-wider border-b border-white/[0.06] bg-[#0d0f1a]">
                            <div className="col-span-3">Afiliado</div>
                            <div className="col-span-1 text-center">Tier</div>
                            <div className="col-span-1 text-center">Status</div>
                            <div className="col-span-2 text-center">Cliques</div>
                            <div className="col-span-2 text-center">Conversões</div>
                            <div className="col-span-2 text-right">Comissão</div>
                            <div className="col-span-1 text-right">Entrada</div>
                        </div>
                        {MOCK_AFFILIATES.length === 0 ? (
                            <div className="p-12 text-center">
                                <Users className="h-8 w-8 text-gray-700 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">Nenhum afiliado cadastrado ainda.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/[0.04]">
                                {MOCK_AFFILIATES.map((aff) => (
                                    <div key={aff.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/[0.02] transition-colors">
                                        <div className="col-span-3">
                                            <p className="text-sm font-medium text-white">{aff.name}</p>
                                            <p className="text-[11px] text-gray-600">{aff.email}</p>
                                        </div>
                                        <div className="col-span-1 flex justify-center">{tierBadge(aff.tier)}</div>
                                        <div className="col-span-1 flex justify-center">{statusBadge(aff.status)}</div>
                                        <div className="col-span-2 text-center">
                                            <p className="text-sm font-medium text-white">{aff.clicks}</p>
                                        </div>
                                        <div className="col-span-2 text-center">
                                            <p className="text-sm font-medium text-white">{aff.conversions}</p>
                                        </div>
                                        <div className="col-span-2 text-right">
                                            <p className="text-sm font-bold text-violet-400">{formatCurrency(aff.earnings)}</p>
                                        </div>
                                        <div className="col-span-1 text-right text-[11px] text-gray-500">
                                            {new Date(aff.joinedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ═══════ MATERIAIS TAB ═══════ */}
            {tab === "materiais" && (
                <div className="space-y-4">
                    <p className="text-xs text-gray-400">Materiais prontos para seus afiliados compartilharem. Baixe ou envie diretamente.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {SHARE_MATERIALS.map((mat) => (
                            <div key={mat.title} className="rounded-xl bg-[#12142a] border border-white/[0.06] p-5 flex flex-col justify-between hover:border-violet-500/20 transition-all">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <Badge className="bg-violet-500/15 text-violet-400 border border-violet-500/20 text-[10px]">{mat.type}</Badge>
                                        {mat.size !== "—" && <span className="text-[10px] text-gray-600">{mat.size}</span>}
                                    </div>
                                    <h4 className="text-sm font-semibold text-white mb-1">{mat.title}</h4>
                                    <p className="text-[11px] text-gray-500 leading-relaxed">{mat.desc}</p>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <Button variant="outline" size="sm" className="flex-1 border-white/10 text-gray-400 hover:text-white hover:bg-white/[0.06] text-xs">
                                        <Eye className="h-3 w-3 mr-1" /> Preview
                                    </Button>
                                    <Button size="sm" className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-xs">
                                        <ArrowRight className="h-3 w-3 mr-1" /> Baixar
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ═══════ FORMULÁRIO TAB ═══════ */}
            {tab === "formulario" && (
                <div className="space-y-6">
                    {/* Form Link */}
                    <div className="rounded-xl bg-gradient-to-r from-violet-600/10 to-fuchsia-600/5 border border-violet-500/10 p-6 space-y-4">
                        <div className="flex items-center gap-2">
                            <Send className="h-5 w-5 text-fuchsia-400" />
                            <h3 className="text-sm font-bold text-white">Formulário de Cadastro de Afiliados</h3>
                        </div>
                        <p className="text-xs text-gray-400">
                            Envie este link para a sua base de clientes. Quem preencher o formulário entra como afiliado e já recebe o link de divulgação personalizado.
                        </p>
                        <div className="flex gap-2 max-w-2xl">
                            <Input
                                readOnly
                                value={formLink}
                                className="bg-[#0d0f1a] border-white/[0.06] text-white font-mono text-sm h-11"
                            />
                            <Button
                                onClick={() => handleCopy(formLink, setCopiedForm)}
                                className={`shrink-0 h-11 px-5 ${copiedForm ? "bg-violet-600 text-white" : "bg-white/[0.06] text-gray-300 hover:bg-white/10"}`}
                            >
                                {copiedForm ? <><CheckCircle2 className="h-4 w-4 mr-1.5" /> Copiado!</> : <><Copy className="h-4 w-4 mr-1.5" /> Copiar</>}
                            </Button>
                        </div>
                    </div>

                    {/* How it works */}
                    <div className="rounded-xl bg-[#12142a] border border-white/[0.06] p-6">
                        <h3 className="text-sm font-bold text-white mb-4">Como Funciona a Afiliação</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {[
                                { step: "1", title: "Envie o formulário", desc: "Dispare o link do formulário por e-mail, WhatsApp ou redes sociais para sua base de clientes.", icon: Send },
                                { step: "2", title: "Cliente se cadastra", desc: "Seu cliente preenche o formulário e automaticamente recebe um link de afiliado com seu código.", icon: Users },
                                { step: "3", title: "Afiliado divulga", desc: "O afiliado compartilha o link e cada venda gerada é rastreada automaticamente.", icon: Share2 },
                                { step: "4", title: "Comissão automática", desc: "As comissões são calculadas e creditadas na carteira. Você e o afiliado ganham!", icon: Gift },
                            ].map((item) => (
                                <div key={item.step} className="text-center p-4 rounded-xl bg-[#0d0f1a] border border-white/[0.06]">
                                    <div className="w-10 h-10 rounded-full bg-violet-600/20 flex items-center justify-center mx-auto mb-3">
                                        <item.icon className="h-4 w-4 text-violet-400" />
                                    </div>
                                    <span className="text-[10px] text-violet-400 font-bold uppercase tracking-wider">Passo {item.step}</span>
                                    <p className="text-sm font-semibold text-white mt-1 mb-1">{item.title}</p>
                                    <p className="text-[11px] text-gray-500 leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Share Buttons */}
                    <div className="rounded-xl bg-[#12142a] border border-white/[0.06] p-6">
                        <h3 className="text-sm font-bold text-white mb-3">Compartilhar Formulário</h3>
                        <p className="text-xs text-gray-500 mb-4">Envie o convite diretamente por estes canais:</p>
                        <div className="flex flex-wrap gap-3">
                            <a
                                href={`https://wa.me/?text=${encodeURIComponent(`Quer ganhar comissões divulgando nossos serviços? Cadastre-se no nosso programa de afiliados: ${formLink}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600/20 border border-green-500/20 text-green-400 text-xs font-semibold hover:bg-green-600/30 transition-colors"
                            >
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                WhatsApp
                            </a>
                            <a
                                href={`mailto:?subject=${encodeURIComponent("Convite: Programa de Afiliados")}&body=${encodeURIComponent(`Olá!\n\nQuero te convidar para participar do nosso Programa de Afiliados. Você divulga nossos serviços e ganha comissões por cada venda!\n\nCadastre-se aqui: ${formLink}\n\nQualquer dúvida, estou à disposição.`)}`}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600/20 border border-blue-500/20 text-blue-400 text-xs font-semibold hover:bg-blue-600/30 transition-colors"
                            >
                                <Mail className="h-4 w-4" /> E-mail
                            </a>
                            <button
                                onClick={() => handleCopy(formLink, setCopiedForm)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600/20 border border-violet-500/20 text-violet-400 text-xs font-semibold hover:bg-violet-600/30 transition-colors"
                            >
                                <Copy className="h-4 w-4" /> Copiar Link
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
