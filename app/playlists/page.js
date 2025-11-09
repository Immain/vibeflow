"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Playlists() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [playlists, setPlaylists] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
        }
    }, [status, router])

    // Fetch user playlists
    useEffect(() => {
        if (!session?.accessToken) return

        const fetchPlaylists = async () => {
            try {
                const response = await fetch(
                    "https://api.spotify.com/v1/me/playlists?limit=50",
                    {
                        headers: {
                            Authorization: `Bearer ${session.accessToken}`,
                        },
                    }
                )
                const data = await response.json()
                setPlaylists(data.items || [])
                setLoading(false)
            } catch (error) {
                console.error("Error fetching playlists:", error)
                setLoading(false)
            }
        }

        fetchPlaylists()
    }, [session?.accessToken])

    // Play a playlist
    const playPlaylist = async (playlistUri) => {
        if (!session?.accessToken) return

        try {
            const response = await fetch(
                "https://api.spotify.com/v1/me/player/play",
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${session.accessToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        context_uri: playlistUri,
                    }),
                }
            )

            if (response.status === 204) {
                // Success - redirect to player
                router.push("/player")
            } else if (response.status === 404) {
                alert("No active device found. Please open Spotify on a device first.")
            }
        } catch (error) {
            console.error("Error playing playlist:", error)
            alert("Failed to play playlist. Make sure Spotify is open on a device.")
        }
    }

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-green-400 text-2xl">Loading...</div>
            </div>
        )
    }

    if (!session) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-900 to-black text-white">
            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <button
                            onClick={() => router.push("/player")}
                            className="mb-4 flex items-center gap-2 text-white/70 hover:text-white transition cursor-pointer"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Player
                        </button>
                        <h1 className="text-5xl font-bold">Your Playlists</h1>
                        <p className="text-white/60 mt-2">{playlists.length} playlists</p>
                    </div>
                </div>

                {/* Playlists Grid */}
                {playlists.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {playlists.map((playlist) => (
                            <div
                                key={playlist.id}
                                onClick={() => playPlaylist(playlist.uri)}
                                className="bg-black/30 rounded-xl p-4 hover:bg-black/50 transition cursor-pointer group"
                            >
                                <div className="relative mb-4">
                                    {playlist.images?.[0] ? (
                                        <img
                                            src={playlist.images[0].url}
                                            alt={playlist.name}
                                            className="w-full aspect-square rounded-lg object-cover"
                                        />
                                    ) : (
                                        <div className="w-full aspect-square rounded-lg bg-white/10 flex items-center justify-center text-4xl">
                                            🎵
                                        </div>
                                    )}
                                    {/* Play button overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-2xl">
                                            <svg className="w-8 h-8 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <h3 className="font-bold truncate mb-1">{playlist.name}</h3>
                                <p className="text-sm text-white/60 truncate">
                                    {playlist.tracks.total} tracks
                                </p>
                                {playlist.description && (
                                    <p className="text-xs text-white/40 line-clamp-2 mt-1">
                                        {playlist.description.replace(/<[^>]*>/g, '')}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-white/60 text-xl">No playlists found</p>
                        <p className="text-white/40 mt-2">Create playlists in Spotify to see them here!</p>
                    </div>
                )}
            </div>
        </div>
    )
}
