"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Users, Clock, ShieldCheck, ShieldAlert,
    Copy, Share2, Mail, Megaphone, CheckCircle2, Star
} from "lucide-react"

export default function AffiliatesDashboard() {
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState(false)
    const [promoterData, setPromoterData] = useState<any>(null)
    const [indications, setIndications] = useState<any[]>([])
    const [npsScore, setNpsScore] = useState<number | null>(null)
    const [npsComment, setNpsComment] = useState("")
    const [npsSubmitted, setNpsSubmitted] = useState(false)

    // Parametrização estática temporária
    const referralCode = promoterData?.referral_code || "HUB12345"
    const referralLink = typeof window !== 'undefined'
        ? `${window.location.origin}/site-captura?ref=${referralCode}`
        : `https://meusite.com/?ref=${referralCode}`

    useEffect(() => {
        // Fetch data
        setTimeout(() => setLoading(false), 500)
    }, [])

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (loading) {
        return <div className="p-8 flex items-center justify-center h-full text-muted-foreground">Carregando painel de parcerias...</div>
    }

    return (
        <div className="flex-1 space-y-6 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Programa de Parceiros</h2>
                    <p className="text-muted-foreground">
                        Visão Geral das suas indicações e comissionamentos.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Users className="mr-2 h-4 w-4" /> Indicar Alguém Manualmente
                    </Button>
                </div>
            </div>

            {/* FBN Style Metric Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-l-4 border-l-blue-500 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total de Indicações
                        </CardTitle>
                        <Megaphone className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground mt-1">Cliques ou cadastros gerais</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-yellow-500 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Em Análise
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">4</div>
                        <p className="text-xs text-muted-foreground mt-1">No Kanbam do vendedor</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Amigos Protegidos
                        </CardTitle>
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-600">6</div>
                        <p className="text-xs text-emerald-600/80 mt-1 font-medium">Vendas finalizadas com sucesso</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-red-500 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Não Protegidos
                        </CardTitle>
                        <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">2</div>
                        <p className="text-xs text-muted-foreground mt-1">Negócios perdidos/rejeitados</p>
                    </CardContent>
                </Card>
            </div>

            {/* Link Generation Hub */}
            <Card className="border shadow-sm bg-gradient-to-br from-blue-50/50 to-white dark:from-slate-900 dark:to-background">
                <CardHeader>
                    <CardTitle className="flex items-center text-xl text-blue-700 dark:text-blue-400">
                        <Share2 className="mr-2 h-5 w-5" /> Seu Link de Indicação
                    </CardTitle>
                    <CardDescription>
                        Compartilhe este link com seus contatos. Quando eles se cadastrarem, a indicação entra no CRM!
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2 max-w-2xl">
                        <Input
                            readOnly
                            value={referralLink}
                            className="bg-muted/50 font-mono text-sm h-12"
                        />
                        <Button
                            variant={copied ? "default" : "secondary"}
                            size="lg"
                            className="w-32 h-12 shrink-0 transition-all font-semibold"
                            onClick={handleCopy}
                        >
                            {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                            {copied ? "Copiado!" : "Copiar"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 border shadow-sm">
                    <CardHeader>
                        <CardTitle>Histórico de Indicações</CardTitle>
                        <CardDescription>Ultimos leads gerados pela sua rede.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-muted/40 rounded-lg border">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">Matheus Gomes</p>
                                    <p className="text-sm text-muted-foreground">matheus@email.com</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full flex items-center">
                                        <CheckCircle2 className="w-3 h-3 mr-1" /> PROTEGIDO
                                    </span>
                                    <p className="text-sm font-medium text-emerald-600">+ R$ 150,00</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-muted/40 rounded-lg border">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">Julia Pereira</p>
                                    <p className="text-sm text-muted-foreground">Plano de Saúde</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center">
                                        <Clock className="w-3 h-3 mr-1" /> EM ANÁLISE
                                    </span>
                                    <p className="text-sm font-medium text-muted-foreground">Pendente</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3 border shadow-sm">
                    <CardHeader>
                        <CardTitle>Sua Carteira de Cashback</CardTitle>
                        <CardDescription>Acompanhe seus rendimentos e solicite saques.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-xl text-white mt-2 mx-6 relative overflow-hidden shadow-lg">
                        <p className="text-sm font-medium text-white/70 mb-2 relative z-10 w-full text-center">Saldo Disponível (Pix)</p>
                        <h3 className="text-4xl font-bold tracking-tight relative z-10">R$ 450,00</h3>

                        <Button className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-md relative z-10">
                            Solicitar Saque
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* NPS Section */}
            <Card className="border shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-amber-400" /> Avaliação NPS
                    </CardTitle>
                    <CardDescription>
                        Qual a probabilidade de você recomendar nosso serviço? Sua avaliação nos ajuda a melhorar.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {Array.from({ length: 11 }, (_, i) => i).map((score) => (
                            <button
                                key={score}
                                onClick={() => {
                                    setNpsScore(score)
                                    setNpsSubmitted(false)
                                }}
                                className={`w-11 h-11 rounded-lg text-sm font-bold transition-all border ${
                                    npsScore === score
                                        ? score <= 6
                                            ? "bg-red-500 text-white border-red-500 scale-110"
                                            : score <= 8
                                                ? "bg-amber-500 text-white border-amber-500 scale-110"
                                                : "bg-emerald-500 text-white border-emerald-500 scale-110"
                                        : "bg-muted/40 text-muted-foreground border-border hover:bg-muted hover:scale-105"
                                }`}
                            >
                                {score}
                            </button>
                        ))}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground px-1">
                        <span>Nada provável</span>
                        <span>Muito provável</span>
                    </div>
                    {npsScore !== null && !npsSubmitted && (
                        <div className="space-y-3 pt-2">
                            <Input
                                placeholder="Algum comentário? (opcional)"
                                value={npsComment}
                                onChange={(e) => setNpsComment(e.target.value)}
                                className="bg-muted/40"
                            />
                            <Button
                                onClick={() => {
                                    setNpsSubmitted(true)
                                }}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Enviar Avaliação
                            </Button>
                        </div>
                    )}
                    {npsSubmitted && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                                Obrigado pela sua avaliação! Nota: {npsScore}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
