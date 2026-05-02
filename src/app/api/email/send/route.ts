import { NextResponse } from "next/server"
import { z } from "zod"
import { getResendClient, getResendFromEmail, getSupportEmail } from "@/lib/resend"

const supportEmailSchema = z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(180),
    subject: z.string().trim().min(3).max(160),
    message: z.string().trim().min(10).max(4000),
})

export async function POST(request: Request) {
    const parsed = supportEmailSchema.safeParse(await request.json().catch(() => null))

    if (!parsed.success) {
        return NextResponse.json(
            { error: "Dados invalidos para envio." },
            { status: 400 }
        )
    }

    try {
        const resend = getResendClient()
        const { name, email, subject, message } = parsed.data

        const { data, error } = await resend.emails.send({
            from: getResendFromEmail(),
            to: [getSupportEmail()],
            replyTo: email,
            subject: `[SWHub] ${subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
                    <h2 style="margin: 0 0 12px;">Nova solicitacao de suporte</h2>
                    <p><strong>Nome:</strong> ${escapeHtml(name)}</p>
                    <p><strong>E-mail:</strong> ${escapeHtml(email)}</p>
                    <p><strong>Assunto:</strong> ${escapeHtml(subject)}</p>
                    <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                    <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
                </div>
            `,
            text: `Nova solicitacao de suporte\n\nNome: ${name}\nE-mail: ${email}\nAssunto: ${subject}\n\n${message}`,
        })

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 502 }
            )
        }

        return NextResponse.json({ id: data?.id })
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao enviar e-mail."
        return NextResponse.json({ error: message }, { status: 503 })
    }
}

function escapeHtml(value: string) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
}
