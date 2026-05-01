import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin, role')
        .eq('id', user.id)
        .single()
        
    const isAdmin = profile?.is_admin === true || profile?.role === 'admin'

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar isAdmin={isAdmin} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header
                    userEmail={user.email}
                    userName={user.user_metadata?.full_name}
                />
                <main className="flex-1 overflow-y-auto bg-[#0a0c16] p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
