"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, Bell, MessageCircle, HelpCircle, Loader2, Save } from "lucide-react"

interface HeaderProps {
    userEmail?: string
    userName?: string
}

export function Header({ userEmail, userName }: HeaderProps) {
    const router = useRouter()
    const supabase = createClient()
    const [profileOpen, setProfileOpen] = useState(false)
    const [profile, setProfile] = useState({
        full_name: userName || "",
        email: userEmail || "",
        phone: "",
    })
    const [loadingProfile, setLoadingProfile] = useState(false)
    const [savingProfile, setSavingProfile] = useState(false)
    const [profileError, setProfileError] = useState("")

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push("/login")
        router.refresh()
    }

    useEffect(() => {
        if (!profileOpen) return

        async function loadProfile() {
            setLoadingProfile(true)
            setProfileError("")
            const profileClient = createClient()
            const { data: { user } } = await profileClient.auth.getUser()

            if (user) {
                const { data, error } = await profileClient
                    .from("profiles")
                    .select("full_name, phone")
                    .eq("id", user.id)
                    .single()

                if (error && error.code !== "PGRST116") {
                    setProfileError("Não foi possível carregar seus dados agora.")
                }

                setProfile({
                    full_name: data?.full_name || user.user_metadata?.full_name || userName || "",
                    email: user.email || userEmail || "",
                    phone: data?.phone || "",
                })
            }
            setLoadingProfile(false)
        }

        loadProfile()
    }, [profileOpen, userEmail, userName])

    const handleSaveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setSavingProfile(true)
        setProfileError("")

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            setSavingProfile(false)
            return
        }

        const { error } = await supabase
            .from("profiles")
            .update({
                full_name: profile.full_name,
                phone: profile.phone,
            })
            .eq("id", user.id)

        if (error) {
            setProfileError(error.message || "Não foi possível salvar seus dados.")
            setSavingProfile(false)
            return
        }

        await supabase.auth.updateUser({ data: { full_name: profile.full_name } })
        setSavingProfile(false)
        setProfileOpen(false)
        router.refresh()
    }

    const displayName = profile.full_name || userName

    const initials = displayName
        ? displayName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : userEmail
            ? userEmail[0].toUpperCase()
            : "U"

    return (
        <header className="flex h-14 items-center justify-between border-b border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#0d0f1a] px-6">
            <div />

            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/[0.06]">
                    <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/[0.06]" asChild>
                    <a href="https://discord.gg/seu-link-aqui" target="_blank" rel="noopener noreferrer" title="Comunidade Discord">
                        <MessageCircle className="h-4 w-4" />
                    </a>
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/[0.06]" asChild>
                    <Link href="/suporte" title="Ajuda e Suporte">
                        <HelpCircle className="h-4 w-4" />
                    </Link>
                </Button>

                <ThemeToggle />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="relative h-9 w-9 rounded-full"
                        >
                            <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-violet-600 text-white text-sm">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                {displayName && (
                                    <p className="text-sm font-medium leading-none">{displayName}</p>
                                )}
                                <p className="text-xs leading-none text-muted-foreground">
                                    {userEmail}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onSelect={(event) => {
                                event.preventDefault()
                                setProfileOpen(true)
                            }}
                        >
                            <User className="mr-2 h-4 w-4" />
                            Perfil
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                            <LogOut className="mr-2 h-4 w-4" />
                            Sair
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
                    <DialogContent className="sm:max-w-[480px] bg-white dark:bg-[#12142a] border-slate-200 dark:border-white/10">
                        <DialogHeader>
                            <DialogTitle>Meus Dados</DialogTitle>
                            <DialogDescription>
                                Edite seus dados principais sem sair do menu de perfil.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSaveProfile} className="space-y-4">
                            {profileError && (
                                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                                    {profileError}
                                </div>
                            )}

                            {loadingProfile ? (
                                <div className="flex items-center justify-center py-8 text-sm text-slate-500 dark:text-gray-400">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Carregando dados...
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="profile-name">Nome completo</Label>
                                        <Input
                                            id="profile-name"
                                            value={profile.full_name}
                                            onChange={(event) => setProfile({ ...profile, full_name: event.target.value })}
                                            className="bg-slate-50 dark:bg-[#0d0f1a] border-slate-200 dark:border-white/10"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="profile-email">E-mail</Label>
                                        <Input
                                            id="profile-email"
                                            value={profile.email}
                                            disabled
                                            className="bg-slate-100 text-slate-500 dark:bg-[#0d0f1a] dark:text-gray-400 border-slate-200 dark:border-white/10 cursor-not-allowed"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="profile-phone">Telefone / WhatsApp</Label>
                                        <Input
                                            id="profile-phone"
                                            value={profile.phone}
                                            onChange={(event) => setProfile({ ...profile, phone: event.target.value })}
                                            placeholder="(11) 99999-9999"
                                            className="bg-slate-50 dark:bg-[#0d0f1a] border-slate-200 dark:border-white/10"
                                        />
                                    </div>
                                </>
                            )}

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setProfileOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={savingProfile || loadingProfile} className="bg-violet-600 hover:bg-violet-700 text-white">
                                    {savingProfile ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
                                    ) : (
                                        <><Save className="mr-2 h-4 w-4" /> Salvar Dados</>
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </header>
    )
}
