import { Headset, MessageCircle, Mail, FileQuestion } from "lucide-react"

export default function SuportePage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Headset className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Suporte</h1>
                    <p className="text-sm text-slate-500 dark:text-gray-500">Entre em contato com nossa equipe</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl bg-white dark:bg-[#12142a] border border-slate-200 dark:border-white/[0.06] p-6 text-center hover:border-emerald-500/20 transition-colors">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 mb-4">
                        <MessageCircle className="h-6 w-6 text-emerald-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Chat ao Vivo</h3>
                    <p className="text-xs text-slate-500 dark:text-gray-500 mb-4">
                        Fale com um atendente em tempo real durante o horário comercial.
                    </p>
                    <button className="w-full px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors">
                        Iniciar Chat
                    </button>
                </div>

                <div className="rounded-xl bg-white dark:bg-[#12142a] border border-slate-200 dark:border-white/[0.06] p-6 text-center hover:border-blue-500/20 transition-colors">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 mb-4">
                        <Mail className="h-6 w-6 text-blue-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">E-mail</h3>
                    <p className="text-xs text-slate-500 dark:text-gray-500 mb-4">
                        Envie sua dúvida por e-mail e responderemos em até 24h úteis.
                    </p>
                    <a
                        href="mailto:suporte@swhub.com"
                        className="block w-full px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors text-center"
                    >
                        Enviar E-mail
                    </a>
                </div>

                <div className="rounded-xl bg-white dark:bg-[#12142a] border border-slate-200 dark:border-white/[0.06] p-6 text-center hover:border-violet-500/20 transition-colors">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-violet-500/20 mb-4">
                        <FileQuestion className="h-6 w-6 text-violet-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Base de Conhecimento</h3>
                    <p className="text-xs text-slate-500 dark:text-gray-500 mb-4">
                        Consulte tutoriais, FAQs e guias de uso da plataforma.
                    </p>
                    <button className="w-full px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors">
                        Acessar FAQ
                    </button>
                </div>
            </div>

            <div className="rounded-xl bg-white dark:bg-[#12142a] border border-slate-200 dark:border-white/[0.06] p-6">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Enviar uma solicitação</h3>
                <form className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 dark:text-gray-400 mb-1.5">Assunto</label>
                        <input
                            type="text"
                            placeholder="Descreva brevemente o problema"
                            className="w-full px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-[#0d0f1a] border border-slate-200 dark:border-white/[0.06] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:text-gray-600 focus:outline-none focus:border-emerald-500/50"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 dark:text-gray-400 mb-1.5">Mensagem</label>
                        <textarea
                            rows={4}
                            placeholder="Detalhe sua dúvida ou problema..."
                            className="w-full px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-[#0d0f1a] border border-slate-200 dark:border-white/[0.06] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:text-gray-600 focus:outline-none focus:border-emerald-500/50 resize-none"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
                    >
                        Enviar Solicitação
                    </button>
                </form>
            </div>
        </div>
    )
}
