import { Resend } from "resend"

let resendClient: Resend | null = null

export function getResendClient() {
    const apiKey = process.env.RESEND_API_KEY

    if (!apiKey) {
        throw new Error("RESEND_API_KEY nao configurada.")
    }

    if (!resendClient) {
        resendClient = new Resend(apiKey)
    }

    return resendClient
}

export function getResendFromEmail() {
    return process.env.RESEND_FROM_EMAIL || "SWHub <onboarding@resend.dev>"
}

export function getSupportEmail() {
    return process.env.SUPPORT_EMAIL || "suporte@swhub.com"
}
