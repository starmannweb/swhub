"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, BookOpen, Search, Settings, Users, Globe, CreditCard, PlugZap, ShieldCheck } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqGroups = [
    {
        title: "Primeiros Passos",
        icon: BookOpen,
        items: [
            {
                question: "Como comeco a usar o SWHub?",
                answer: "Comece criando seus contatos em Leads, configure o pipeline em CRM e depois crie propostas, sites e automacoes conforme sua operacao. O menu lateral segue essa ordem de uso.",
            },
            {
                question: "Onde edito meus dados de perfil?",
                answer: "Clique na foto do canto superior direito e entre em Perfil. Ali ficam nome, e-mail e telefone/WhatsApp sem precisar abrir Configuracoes.",
            },
            {
                question: "Como alterno tema claro e escuro?",
                answer: "Use o botao de tema no topo. Quando estiver escuro, o sol aparece para clarear; quando estiver claro, a lua aparece para escurecer.",
            },
        ],
    },
    {
        title: "CRM e Vendas",
        icon: Users,
        items: [
            {
                question: "Como crio um novo negocio no CRM?",
                answer: "Acesse CRM > Negocios e clique em Novo Negocio. Se ainda nao houver pipeline, o sistema cria os estagios iniciais automaticamente.",
            },
            {
                question: "Posso importar contatos?",
                answer: "Sim. Em Leads e Clientes, use Importar para cadastrar manualmente, importar CSV ou preparar a captura por extensoes de LinkedIn e WhatsApp.",
            },
            {
                question: "Como funcionam as propostas?",
                answer: "As propostas ficam vinculadas a contatos e podem ser associadas a negocios do pipeline. Isso ajuda a acompanhar valor, status e historico comercial.",
            },
        ],
    },
    {
        title: "Sites e Builder",
        icon: Globe,
        items: [
            {
                question: "Qual builder devo usar?",
                answer: "O Admin pode escolher entre o builder padrao e o beta. O padrao e mais estavel; o beta e indicado para testar a nova experiencia visual.",
            },
            {
                question: "Como importo modelos de sites?",
                answer: "No Admin, acesse Modelos de Sites e use Importar JSON. O arquivo vira um modelo disponivel na biblioteca.",
            },
            {
                question: "O que significa a tag Rascunho?",
                answer: "Rascunho indica que o site ou fluxo ainda nao foi publicado. Quando estiver pronto, publique para liberar a versao final.",
            },
        ],
    },
    {
        title: "Financeiro e Afiliados",
        icon: CreditCard,
        items: [
            {
                question: "O que e o link de afiliado?",
                answer: "E um link com codigo de referencia. Quando um lead ou venda entra por esse link, o sistema pode atribuir a conversao ao afiliado e calcular comissao.",
            },
            {
                question: "Onde vejo a situacao financeira da plataforma?",
                answer: "Em Configuracoes > Situacao Financeira voce ve status da plataforma, plano, faturas e espaco reservado para gateway e cobrancas futuras.",
            },
            {
                question: "Como gero dados ficticios para teste?",
                answer: "No Admin, use Dados de Teste para criar ou remover seeds com contatos, negocios, propostas e faturas ficticias.",
            },
        ],
    },
    {
        title: "Integracoes",
        icon: PlugZap,
        items: [
            {
                question: "O Resend ja esta pronto para envio?",
                answer: "O pacote e a rota de envio estao instalados. Para funcionar em producao, configure RESEND_API_KEY, RESEND_FROM_EMAIL e SUPPORT_EMAIL no ambiente.",
            },
            {
                question: "Como conecto Meta Ads?",
                answer: "Configure Pixel ID, token da Conversions API, app Meta e webhooks para Lead Ads. Depois conecte esses dados no marketplace de integracoes.",
            },
            {
                question: "Como conecto WhatsApp oficial?",
                answer: "Crie/valide o app no Meta Developers, obtenha Phone Number ID e token permanente, configure webhook e use templates aprovados para disparos ativos.",
            },
        ],
    },
    {
        title: "Seguranca e Usuarios",
        icon: ShieldCheck,
        items: [
            {
                question: "Como concedo acesso admin?",
                answer: "O perfil precisa ter role admin ou is_admin true na tabela profiles. A aba Equipe & Acessos permite visualizar e ajustar niveis quando as politicas do Supabase liberam.",
            },
            {
                question: "Quais niveis de equipe existem?",
                answer: "Administrador, Gestor, Comercial e Suporte. Cada nivel organiza responsabilidades internas para administrar a empresa.",
            },
            {
                question: "Por que nao devo criar usuarios pelo frontend com chave master?",
                answer: "A chave service role nunca deve ir para o navegador. Criacao real de usuarios precisa ocorrer em rota server-side ou diretamente pelo Supabase Admin.",
            },
        ],
    },
]

export default function FaqPage() {
    const [query, setQuery] = useState("")

    const filteredGroups = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase()
        if (!normalizedQuery) return faqGroups

        return faqGroups
            .map((group) => ({
                ...group,
                items: group.items.filter((item) =>
                    `${group.title} ${item.question} ${item.answer}`.toLowerCase().includes(normalizedQuery)
                ),
            }))
            .filter((group) => group.items.length > 0)
    }, [query])

    const totalItems = faqGroups.reduce((total, group) => total + group.items.length, 0)

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link
                    href="/suporte"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-[#12142a] dark:text-gray-300 dark:hover:bg-white/[0.04]"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <div className="p-2 rounded-lg bg-violet-500/20 text-violet-400">
                    <BookOpen className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Base de Conhecimento</h1>
                    <p className="text-sm text-slate-500 dark:text-gray-500">Tutoriais, FAQs e guias rapidos para operar o SWHub.</p>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.06] dark:bg-[#12142a]">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <Badge className="bg-violet-500/15 text-violet-500 dark:text-violet-300">{totalItems} respostas</Badge>
                        <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">Encontre ajuda por modulo, fluxo ou integracao.</p>
                    </div>
                    <div className="relative w-full md:max-w-sm">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Buscar na base..."
                            className="pl-9 bg-slate-50 dark:bg-[#0d0f1a] border-slate-200 dark:border-white/[0.06]"
                        />
                    </div>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                {filteredGroups.map((group) => (
                    <div key={group.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.06] dark:bg-[#12142a]">
                        <div className="mb-3 flex items-center gap-3">
                            <div className="rounded-lg bg-slate-100 p-2 text-slate-600 dark:bg-white/[0.04] dark:text-gray-300">
                                <group.icon className="h-4 w-4" />
                            </div>
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">{group.title}</h2>
                        </div>
                        <Accordion type="single" collapsible className="w-full">
                            {group.items.map((item, index) => (
                                <AccordionItem key={item.question} value={`${group.title}-${index}`} className="border-slate-100 dark:border-white/[0.06]">
                                    <AccordionTrigger className="text-slate-800 hover:text-violet-600 dark:text-gray-200 dark:hover:text-violet-300">
                                        {item.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-slate-500 dark:text-gray-400">
                                        {item.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                ))}
            </div>

            {filteredGroups.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center dark:border-white/10 dark:bg-[#12142a]">
                    <Settings className="mx-auto mb-3 h-8 w-8 text-slate-300 dark:text-gray-700" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-gray-300">Nenhuma resposta encontrada</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-gray-500">Tente buscar por CRM, sites, Resend, Meta ou usuarios.</p>
                </div>
            )}
        </div>
    )
}
