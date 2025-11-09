"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

export default function Home() {
    const router = useRouter()
    const { data: session, status } = useSession()

    useEffect(() => {
        if (status === "loading") return // Wait for session to load

        if (session) {
            router.push("/player")
        } else {
            router.push("/login")
        }
    }, [session, status, router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="text-green-400 text-2xl">Loading...</div>
        </div>
    )
}