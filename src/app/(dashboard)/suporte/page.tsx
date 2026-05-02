import { Headset, Mail, FileQuestion } from "lucide-react"

function WhatsAppIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884M20.463 3.49A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.463 3.49" />
        </svg>
    )
}

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
                        <WhatsAppIcon className="h-6 w-6 text-emerald-500" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Chat ao Vivo</h3>
                    <p className="text-xs text-slate-500 dark:text-gray-500 mb-4">
                        Fale com um atendente em tempo real durante o horário comercial.
                    </p>
                    <a
                        href={`https://wa.me/?text=${encodeURIComponent("Ola! Preciso de suporte no SWHub.")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors text-center"
                    >
                        Iniciar WhatsApp
                    </a>
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
