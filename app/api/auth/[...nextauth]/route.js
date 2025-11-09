import NextAuth from "next-auth"
import SpotifyProvider from "next-auth/providers/spotify"

const scopes = [
    "user-read-email",
    "user-read-private",
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing",
    "user-read-recently-played",
    "user-top-read",
    "streaming",
    "playlist-read-private",
    "playlist-read-collaborative",
].join(" ")

const params = {
    scope: scopes,
}

const LOGIN_URL = `https://accounts.spotify.com/authorize?${new URLSearchParams(params)}`

async function refreshAccessToken(token) {
    const params = new URLSearchParams()
    params.append("grant_type", "refresh_token")
    params.append("refresh_token", token.refreshToken)

    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            Authorization: `Basic ${Buffer.from(
                `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
            ).toString("base64")}`,
        },
        body: params,
    })

    const data = await response.json()

    return {
        ...token,
        accessToken: data.access_token,
        refreshToken: data.refresh_token ?? token.refreshToken,
        accessTokenExpires: Date.now() + data.expires_in * 1000,
    }
}

const handler = NextAuth({
    providers: [
        SpotifyProvider({
            clientId: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
            authorization: LOGIN_URL,
        }),
    ],
    callbacks: {
        async jwt({ token, account, user }) {
            // Initial sign in
            if (account && user) {
                return {
                    accessToken: account.access_token,
                    refreshToken: account.refresh_token,
                    accessTokenExpires: account.expires_at * 1000,
                    user,
                }
            }

            // Return previous token if not expired
            if (Date.now() < token.accessTokenExpires) {
                return token
            }

            // Refresh token
            return await refreshAccessToken(token)
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken
            session.error = token.error
            session.user = token.user
            return session
        },
    },
    pages: {
        signIn: "/login",
    },
})

export { handler as GET, handler as POST }