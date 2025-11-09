import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'Vibeflow',
  description: 'An unofficial Spotify player',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}