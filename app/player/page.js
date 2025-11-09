"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"

export default function Player() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [currentTrack, setCurrentTrack] = useState(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [volume, setVolume] = useState(75)
    const [artistFacts, setArtistFacts] = useState([])
    const [currentFactIndex, setCurrentFactIndex] = useState(0)
    const [loadingFacts, setLoadingFacts] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const [progress, setProgress] = useState(0)
    const [duration, setDuration] = useState(0)
    const [isSeeking, setIsSeeking] = useState(false)
    const progressInterval = useRef(null)

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
        }
    }, [status, router])

    // Auto-rotate artist facts every 8 seconds
    useEffect(() => {
        if (artistFacts.length <= 1) return

        const interval = setInterval(() => {
            setCurrentFactIndex((prev) => (prev < artistFacts.length - 1 ? prev + 1 : 0))
        }, 8000)

        return () => clearInterval(interval)
    }, [artistFacts.length])

    // Update progress bar
    useEffect(() => {
        if (isPlaying && !isSeeking && duration > 0) {
            progressInterval.current = setInterval(() => {
                setProgress((prev) => {
                    const newProgress = prev + 1000
                    return newProgress >= duration ? duration : newProgress
                })
            }, 1000)
        } else {
            if (progressInterval.current) {
                clearInterval(progressInterval.current)
            }
        }

        return () => {
            if (progressInterval.current) {
                clearInterval(progressInterval.current)
            }
        }
    }, [isPlaying, isSeeking, duration])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showDropdown && !event.target.closest('.dropdown-container')) {
                setShowDropdown(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [showDropdown])

    // Fetch artist facts when track changes
    useEffect(() => {
        if (!currentTrack?.artists?.[0]?.id || !session?.accessToken) {
            setArtistFacts([])
            return
        }

        const fetchArtistFacts = async () => {
            setLoadingFacts(true)
            try {
                const response = await fetch(
                    `https://api.spotify.com/v1/artists/${currentTrack.artists[0].id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${session.accessToken}`,
                        },
                    }
                )

                if (!response.ok) {
                    setLoadingFacts(false)
                    return
                }

                const artist = await response.json()
                const facts = []
                const artistName = artist.name

                if (artist.genres && artist.genres.length > 0) {
                    facts.push(`${artistName} is known for ${artist.genres.slice(0, 3).join(', ')} music`)
                }

                if (artist.popularity) {
                    if (artist.popularity > 80) {
                        facts.push(`${artistName} is one of the most popular artists on Spotify right now!`)
                    } else if (artist.popularity > 60) {
                        facts.push(`${artistName} has a massive following with a popularity score of ${artist.popularity}/100`)
                    } else if (artist.popularity > 40) {
                        facts.push(`${artistName} is steadily growing in popularity on Spotify`)
                    } else {
                        facts.push(`${artistName} is an up-and-coming artist worth discovering`)
                    }
                }

                if (artist.followers?.total) {
                    const followers = artist.followers.total
                    if (followers >= 10000000) {
                        facts.push(`${artistName} has an incredible ${(followers / 1000000).toFixed(1)} million followers!`)
                    } else if (followers >= 1000000) {
                        facts.push(`${artistName} has ${(followers / 1000000).toFixed(1)}M loyal fans on Spotify`)
                    } else if (followers >= 100000) {
                        facts.push(`${artistName} has built a strong fanbase of ${(followers / 1000).toFixed(0)}K followers`)
                    } else {
                        facts.push(`${artistName} has ${followers.toLocaleString()} followers and counting`)
                    }
                }

                const topTracksResponse = await fetch(
                    `https://api.spotify.com/v1/artists/${currentTrack.artists[0].id}/top-tracks?market=US`,
                    {
                        headers: {
                            Authorization: `Bearer ${session.accessToken}`,
                        },
                    }
                )

                if (topTracksResponse.ok) {
                    const topTracksData = await topTracksResponse.json()
                    if (topTracksData.tracks && topTracksData.tracks.length > 0) {
                        const topTrack = topTracksData.tracks[0]
                        facts.push(`${artistName}'s biggest hit is "${topTrack.name}"`)
                    }
                }

                setArtistFacts(facts.length > 0 ? facts : [`No additional info available for ${artistName}`])
                setCurrentFactIndex(0)
            } catch (error) {
                console.error("Error fetching artist facts:", error)
                setArtistFacts(['Unable to load artist information'])
            } finally {
                setLoadingFacts(false)
            }
        }

        fetchArtistFacts()
    }, [currentTrack?.artists?.[0]?.id, session?.accessToken])

    // Fetch currently playing track
    useEffect(() => {
        if (!session?.accessToken) return

        fetchCurrentTrack()
        const interval = setInterval(fetchCurrentTrack, 5000)

        return () => clearInterval(interval)
    }, [session])

    const togglePlayPause = async () => {
        if (!session?.accessToken) return

        try {
            const endpoint = isPlaying
                ? "https://api.spotify.com/v1/me/player/pause"
                : "https://api.spotify.com/v1/me/player/play"

            const response = await fetch(endpoint, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
            })

            if (response.status === 204) {
                setIsPlaying(!isPlaying)
            } else if (response.status === 404) {
                alert("No active device found. Please open Spotify on a device and start playing music.")
            }
        } catch (error) {
            console.error("Error toggling playback:", error)
        }
    }

    const skipToPrevious = async () => {
        if (!session?.accessToken) return

        try {
            const response = await fetch("https://api.spotify.com/v1/me/player/previous", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
            })

            if (response.status === 204) {
                setTimeout(() => {
                    fetchCurrentTrack()
                }, 500)
            }
        } catch (error) {
            console.error("Error skipping to previous:", error)
        }
    }

    const skipToNext = async () => {
        if (!session?.accessToken) return

        try {
            const response = await fetch("https://api.spotify.com/v1/me/player/next", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
            })

            if (response.status === 204) {
                setTimeout(() => {
                    fetchCurrentTrack()
                }, 500)
            }
        } catch (error) {
            console.error("Error skipping to next:", error)
        }
    }

    const handleVolumeChange = async (e) => {
        const newVolume = e.target.value
        setVolume(newVolume)

        if (!session?.accessToken) return

        try {
            await fetch(`https://api.spotify.com/v1/me/player/volume?volume_percent=${newVolume}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
            })
        } catch (error) {
            console.error("Error changing volume:", error)
        }
    }

    const handleSeek = async (e) => {
        const newProgress = parseInt(e.target.value)
        setProgress(newProgress)
        setIsSeeking(true)
    }

    const handleSeekComplete = async (e) => {
        const newProgress = parseInt(e.target.value)

        if (!session?.accessToken) {
            setIsSeeking(false)
            return
        }

        try {
            await fetch(`https://api.spotify.com/v1/me/player/seek?position_ms=${newProgress}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
            })
        } catch (error) {
            console.error("Error seeking:", error)
        } finally {
            setIsSeeking(false)
        }
    }

    const fetchCurrentTrack = async () => {
        if (!session?.accessToken) return

        try {
            const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
            })

            if (response.status === 204 || !response.ok) {
                setCurrentTrack(null)
                setIsPlaying(false)
                return
            }

            const data = await response.json()
            setCurrentTrack(data.item)
            setIsPlaying(data.is_playing)
            setProgress(data.progress_ms || 0)
            setDuration(data.item?.duration_ms || 0)
        } catch (error) {
            console.error("Error fetching current track:", error)
        }
    }

    const formatTime = (ms) => {
        const minutes = Math.floor(ms / 60000)
        const seconds = Math.floor((ms % 60000) / 1000)
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-green-400 text-2xl">Loading...</div>
            </div>
        )
    }

    if (!session) return null

    return (
        <div className="min-h-screen relative text-white overflow-hidden">
            {currentTrack?.album?.images?.[0] && (
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url(${currentTrack.album.images[0].url})`,
                        filter: 'blur(40px)',
                        transform: 'scale(1.2)',
                    }}
                />
            )}
            {!currentTrack?.album?.images?.[0] && (
                <div className="absolute inset-0 bg-gradient-to-br from-orange-900 via-red-900 to-black" />
            )}

            <div className="absolute inset-0 bg-black/40" />

            <div className="relative z-10">
                <header className="flex justify-end items-center p-6 dropdown-container">
                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="w-12 h-12 rounded-full bg-white/20 overflow-hidden hover:bg-white/30 transition cursor-pointer"
                        >
                            {session.user?.image ? (
                                <img src={session.user.image} alt="Profile" className="w-full h-full object-cover pointer-events-none" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center pointer-events-none">
                                    👤
                                </div>
                            )}
                        </button>

                        {showDropdown && (
                            <div className="absolute right-0 mt-2 w-40 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg shadow-lg text-sm text-white py-2 z-50 animate-fadeIn">
                                <button
                                    onClick={() => {
                                        setShowDropdown(false)
                                        router.push("/playlists")
                                    }}
                                    className="block w-full text-left px-4 py-2 hover:bg-white/10 transition cursor-pointer"
                                >
                                    Playlists
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDropdown(false)
                                        router.push("/profile")
                                    }}
                                    className="block w-full text-left px-4 py-2 hover:bg-white/10 transition cursor-pointer"
                                >
                                    View Profile
                                </button>
                                <button
                                    onClick={() => signOut({ callbackUrl: "/login" })}
                                    className="block w-full text-left px-4 py-2 hover:bg-white/10 transition cursor-pointer"
                                >
                                    Log Out
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                <div className="flex flex-col items-center justify-center px-8 py-16">
                    <div className="w-80 h-80 bg-gray-800 rounded-3xl mb-8 overflow-hidden shadow-2xl">
                        {currentTrack?.album?.images?.[0] ? (
                            <img
                                src={currentTrack.album.images[0].url}
                                alt={currentTrack.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-6xl">
                                🎵
                            </div>
                        )}
                    </div>

                    <div className="text-center mb-4">
                        <h1 className="text-4xl font-bold mb-2">
                            {currentTrack?.name || "No track playing"}
                        </h1>
                        <p className="text-2xl text-white/70">
                            {currentTrack?.artists?.[0]?.name || "Unknown Artist"}
                        </p>
                        <p className="text-lg text-white/50 mt-2">
                            {currentTrack?.album?.name || ""}
                        </p>
                    </div>

                    <div className="max-w-2xl mx-auto text-center my-8 bg-black/30 rounded-2xl p-6 min-h-[120px] flex flex-col items-center justify-center">
                        {loadingFacts ? (
                            <p className="text-white/60">Loading artist info...</p>
                        ) : artistFacts.length > 0 ? (
                            <div className="w-full">
                                <p className="text-white/80 leading-relaxed mb-4">
                                    {artistFacts[currentFactIndex]}
                                </p>
                                {artistFacts.length > 1 && (
                                    <div className="flex gap-2 justify-center">
                                        {artistFacts.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentFactIndex(index)}
                                                className={`w-2 h-2 rounded-full transition ${index === currentFactIndex ? 'bg-white' : 'bg-white/30'}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : currentTrack ? (
                            <p className="text-white/60">No artist info available</p>
                        ) : (
                            <p className="text-white/80 leading-relaxed">
                                Welcome to Vibeflow! Sign in to Spotify and start playing music.
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-6 mb-8">
                        <button
                            onClick={skipToPrevious}
                            className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 transition flex items-center justify-center active:scale-95"
                        >
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                            </svg>
                        </button>

                        <button
                            onClick={togglePlayPause}
                            className="w-20 h-20 rounded-full bg-white hover:bg-white/90 transition flex items-center justify-center shadow-2xl active:scale-95"
                        >
                            {isPlaying ? (
                                <svg className="w-10 h-10 text-black" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                </svg>
                            ) : (
                                <svg className="w-10 h-10 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            )}
                        </button>

                        <button
                            onClick={skipToNext}
                            className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 transition flex items-center justify-center active:scale-95"
                        >
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M16 18h2V6h-2v12zm-4-6l-8.5-6v12z" />
                            </svg>
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full max-w-md mb-8">
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-white/60 min-w-[40px]">
                                {formatTime(progress)}
                            </span>
                            <input
                                type="range"
                                min="0"
                                max={duration}
                                value={progress}
                                onChange={handleSeek}
                                onMouseUp={handleSeekComplete}
                                onTouchEnd={handleSeekComplete}
                                className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer progress-bar"
                                disabled={!currentTrack}
                            />
                            <span className="text-sm text-white/60 min-w-[40px] text-right">
                                {formatTime(duration)}
                            </span>
                        </div>
                    </div>

                    {/* Volume Control */}
                    <div className="flex items-center justify-center gap-4 w-full max-w-xs mx-auto">
                        <button
                            onClick={() => setVolume(0)}
                            className="text-white/50 hover:text-white transition"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M7 9v6h4l5 5V4l-5 5H7z" />
                            </svg>
                        </button>
                        <div className="flex-1 relative">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer slider"
                                style={{
                                    background: `linear-gradient(to right, rgb(239, 68, 68) 0%, rgb(249, 115, 22) ${volume}%, rgba(255,255,255,0.2) ${volume}%, rgba(255,255,255,0.2) 100%)`
                                }}
                            />
                        </div>
                        <button
                            onClick={() => setVolume(100)}
                            className="text-white hover:text-white/70 transition"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                            </svg>
                        </button>
                    </div>
                </div>

                <style jsx>{`
                    .slider::-webkit-slider-thumb {
                        appearance: none;
                        width: 16px;
                        height: 16px;
                        border-radius: 50%;
                        background: white;
                        cursor: pointer;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    }
                    .slider::-moz-range-thumb {
                        width: 16px;
                        height: 16px;
                        border-radius: 50%;
                        background: white;
                        cursor: pointer;
                        border: none;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    }
                    .progress-bar::-webkit-slider-thumb {
                        appearance: none;
                        width: 12px;
                        height: 12px;
                        border-radius: 50%;
                        background: white;
                        cursor: pointer;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    }
                    .progress-bar::-moz-range-thumb {
                        width: 12px;
                        height: 12px;
                        border-radius: 50%;
                        background: white;
                        cursor: pointer;
                        border: none;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(-5px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fadeIn {
                        animation: fadeIn 0.15s ease-out forwards;
                    }
                `}</style>
            </div>
        </div>
    )
}