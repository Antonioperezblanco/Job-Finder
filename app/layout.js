import './globals.css'

export const metadata = {
  title: 'CV Analyzer',
  description: 'Analiza tu CV y encuentra empleos',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}