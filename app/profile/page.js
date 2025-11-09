"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Profile() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [userProfile, setUserProfile] = useState(null)
    const [topArtists, setTopArtists] = useState([])
    const [topTracks, setTopTracks] = useState([])
    const [recentlyPlayed, setRecentlyPlayed] = useState([])
    const [listeningStats, setListeningStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
        }
    }, [status, router])

    // Fetch user profile and stats
    useEffect(() => {
        if (!session?.accessToken) return

        const fetchProfile = async () => {
            try {
                // Get user profile
                const profileResponse = await fetch("https://api.spotify.com/v1/me", {
                    headers: {
                        Authorization: `Bearer ${session.accessToken}`,
                    },
                })
                const profileData = await profileResponse.json()
                setUserProfile(profileData)

                // Get top artists
                const artistsResponse = await fetch(
                    "https://api.spotify.com/v1/me/top/artists?limit=5&time_range=medium_term",
                    {
                        headers: {
                            Authorization: `Bearer ${session.accessToken}`,
                        },
                    }
                )
                const artistsData = await artistsResponse.json()
                setTopArtists(artistsData.items || [])

                // Get top tracks (get more for better calculation)
                const tracksResponse = await fetch(
                    "https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=medium_term",
                    {
                        headers: {
                            Authorization: `Bearer ${session.accessToken}`,
                        },
                    }
                )
                const tracksData = await tracksResponse.json()
                const tracks = tracksData.items || []
                setTopTracks(tracks.slice(0, 5)) // Only show 5 in UI

                // Calculate listening stats
                if (tracks.length > 0) {
                    const totalMs = tracks.reduce((sum, track) => sum + track.duration_ms, 0)
                    const avgTrackLength = totalMs / tracks.length

                    // Estimate: If these are top 50 tracks, assume they've been played multiple times
                    // Conservative estimate: average 10 plays per top track
                    const estimatedPlays = 10
                    const estimatedTotalMs = totalMs * estimatedPlays

                    const hours = Math.floor(estimatedTotalMs / (1000 * 60 * 60))
                    const minutes = Math.floor((estimatedTotalMs % (1000 * 60 * 60)) / (1000 * 60))

                    setListeningStats({
                        estimatedHours: hours,
                        estimatedMinutes: minutes,
                        topTracksCount: tracks.length,
                        avgTrackDuration: Math.floor(avgTrackLength / 1000 / 60) // in minutes
                    })
                }

                // Get recently played
                const recentResponse = await fetch(
                    "https://api.spotify.com/v1/me/player/recently-played?limit=10",
                    {
                        headers: {
                            Authorization: `Bearer ${session.accessToken}`,
                        },
                    }
                )
                const recentData = await recentResponse.json()
                setRecentlyPlayed(recentData.items || [])

                setLoading(false)
            } catch (error) {
                console.error("Error fetching profile:", error)
                setLoading(false)
            }
        }

        fetchProfile()
    }, [session?.accessToken])

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-green-400 text-2xl">Loading...</div>
            </div>
        )
    }

    if (!session || !userProfile) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Back Button */}
                <button
                    onClick={() => router.push("/player")}
                    className="mb-6 flex items-center gap-2 text-white/70 hover:text-white transition"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Player
                </button>

                {/* Profile Header */}
                <div className="flex items-center gap-6 mb-12 bg-black/30 rounded-2xl p-8">
                    {userProfile.images?.[0] ? (
                        <img
                            src={userProfile.images[0].url}
                            alt={userProfile.display_name}
                            className="w-32 h-32 rounded-full object-cover shadow-2xl"
                        />
                    ) : (
                        <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center text-6xl">
                            👤
                        </div>
                    )}
                    <div>
                        <h1 className="text-5xl font-bold mb-2">{userProfile.display_name}</h1>
                        <p className="text-white/60 text-lg">{userProfile.email}</p>
                        <div className="flex gap-4 mt-4 text-sm flex-wrap">
                            <div className="bg-white/10 px-4 py-2 rounded-full">
                                <span className="text-white/60">Followers:</span>{" "}
                                <span className="font-semibold">{userProfile.followers?.total.toLocaleString() || 0}</span>
                            </div>
                            <div className="bg-white/10 px-4 py-2 rounded-full">
                                <span className="text-white/60">Country:</span>{" "}
                                <span className="font-semibold">{userProfile.country || "N/A"}</span>
                            </div>
                            <div className="bg-white/10 px-4 py-2 rounded-full">
                                <span className="text-white/60">Subscription:</span>{" "}
                                <span className="font-semibold capitalize">{userProfile.product || "Free"}</span>
                            </div>
                            {listeningStats && (
                                <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 px-4 py-2 rounded-full border border-green-500/30">
                                    <span className="text-white/60">Est. Listening Time:</span>{" "}
                                    <span className="font-semibold text-green-400">
                                        ~{listeningStats.estimatedHours}h {listeningStats.estimatedMinutes}m
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Listening Stats Card */}
                {listeningStats && (
                    <div className="mb-12 bg-gradient-to-br from-green-900/30 to-blue-900/30 rounded-2xl p-6 border border-green-500/20">
                        <h2 className="text-2xl font-bold mb-4">Your Listening Stats</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="bg-black/30 rounded-xl p-4">
                                <p className="text-white/60 text-sm mb-1">Estimated Hours</p>
                                <p className="text-3xl font-bold text-green-400">
                                    {listeningStats.estimatedHours}h
                                </p>
                            </div>
                            <div className="bg-black/30 rounded-xl p-4">
                                <p className="text-white/60 text-sm mb-1">Top Tracks Analyzed</p>
                                <p className="text-3xl font-bold">{listeningStats.topTracksCount}</p>
                            </div>
                            <div className="bg-black/30 rounded-xl p-4">
                                <p className="text-white/60 text-sm mb-1">Avg Track Length</p>
                                <p className="text-3xl font-bold">{listeningStats.avgTrackDuration}m</p>
                            </div>
                        </div>
                        <p className="text-xs text-white/40 mt-4">
                            * Estimated based on your top tracks over the last 6 months. Actual listening time may vary.
                        </p>
                    </div>
                )}

                {/* Top Artists */}
                <div className="mb-12">
                    <h2 className="text-3xl font-bold mb-6">Your Top Artists</h2>
                    {topArtists.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {topArtists.map((artist, index) => (
                                <div
                                    key={artist.id}
                                    className="bg-black/30 rounded-xl p-4 hover:bg-black/50 transition"
                                >
                                    {artist.images?.[0] && (
                                        <img
                                            src={artist.images[0].url}
                                            alt={artist.name}
                                            className="w-full aspect-square rounded-lg object-cover mb-3"
                                        />
                                    )}
                                    <p className="font-semibold truncate">{artist.name}</p>
                                    <p className="text-sm text-white/60">#{index + 1} Top Artist</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-white/60">No top artists data available yet. Keep listening!</p>
                    )}
                </div>

                {/* Top Tracks */}
                <div className="mb-12">
                    <h2 className="text-3xl font-bold mb-6">Your Top Tracks</h2>
                    {topTracks.length > 0 ? (
                        <div className="space-y-3">
                            {topTracks.map((track, index) => (
                                <div
                                    key={track.id}
                                    className="flex items-center gap-4 bg-black/30 rounded-xl p-4 hover:bg-black/50 transition"
                                >
                                    <span className="text-2xl font-bold text-white/40 w-8">{index + 1}</span>
                                    {track.album.images?.[0] && (
                                        <img
                                            src={track.album.images[0].url}
                                            alt={track.name}
                                            className="w-16 h-16 rounded-lg object-cover"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold truncate">{track.name}</p>
                                        <p className="text-sm text-white/60 truncate">
                                            {track.artists.map(a => a.name).join(", ")}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-white/60">No top tracks data available yet. Keep listening!</p>
                    )}
                </div>

                {/* Recently Played */}
                <div>
                    <h2 className="text-3xl font-bold mb-6">Recently Played</h2>
                    {recentlyPlayed.length > 0 ? (
                        <div className="space-y-3">
                            {recentlyPlayed.map((item, index) => (
                                <div
                                    key={`${item.track.id}-${index}`}
                                    className="flex items-center gap-4 bg-black/30 rounded-xl p-4 hover:bg-black/50 transition"
                                >
                                    {item.track.album.images?.[0] && (
                                        <img
                                            src={item.track.album.images[0].url}
                                            alt={item.track.name}
                                            className="w-16 h-16 rounded-lg object-cover"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold truncate">{item.track.name}</p>
                                        <p className="text-sm text-white/60 truncate">
                                            {item.track.artists.map(a => a.name).join(", ")}
                                        </p>
                                        <p className="text-xs text-white/40 mt-1">
                                            {new Date(item.played_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-white/60">No recently played tracks available.</p>
                    )}
                </div>
            </div>
        </div>
    )
}