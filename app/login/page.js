"use client"

import { signIn } from "next-auth/react"
import { useEffect, useState } from "react"

export default function Login() {
    const [currentImage, setCurrentImage] = useState(0)

    // Curated concert/music event photos from Unsplash
    const concertImages = [
        "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1920&q=80", // Concert crowd
        "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1920&q=80", // Stage lights
        "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1920&q=80", // DJ/Producer
        "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1920&q=80", // Festival crowd
        "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1920&q=80", // Live performance
        "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1920&q=80", // Music festival
    ]

    // Change image every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % concertImages.length)
        }, 10000)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Background Images with Crossfade */}
            <div className="absolute inset-0">
                {concertImages.map((img, index) => (
                    <div
                        key={index}
                        className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                        style={{
                            opacity: currentImage === index ? 1 : 0,
                            backgroundImage: `url(${img})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    />
                ))}
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
                <div className="text-center">
                    <h1 className="mb-8 text-7xl font-bold text-green-400 drop-shadow-2xl animate-fade-in md:text-8xl">
                        Vibeflow
                    </h1>

                    <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-black/60 p-8 shadow-2xl backdrop-blur-xl md:p-12">
                        <h2 className="mb-8 text-2xl font-semibold text-white md:text-3xl">
                            Log in with Spotify
                        </h2>

                        <button
                            onClick={() => signIn("spotify", { callbackUrl: "/player" })}
                            className="mx-auto flex items-center justify-center gap-3 rounded-full bg-green-500 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all transform hover:scale-105 hover:bg-green-600 active:scale-95"
                        >
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                            </svg>
                            CONNECT WITH SPOTIFY
                        </button>

                        <p className="mt-8 text-sm leading-relaxed text-white/60">
                            Disclaimer: Vibeflow is an unofficial third-party app. We're not affiliated
                            with or endorsed by Spotify. Spotify® is a registered trademark of Spotify AB.
                        </p>
                    </div>

                    {/* Image Indicators */}
                    <div className="mt-6 flex justify-center gap-2">
                        {concertImages.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentImage(index)}
                                className={`transition-all ${currentImage === index
                                    ? "h-2 w-8 rounded-full bg-green-400"
                                    : "h-2 w-2 rounded-full bg-white/40 hover:bg-white/60"
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
        </div>
    )
}

