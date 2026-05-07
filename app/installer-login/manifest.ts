import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'M.G. Enterprises Solar Engineer App',
    short_name: 'MG Solar Engineer',
    description: 'Solar installation and management app for engineers',
    start_url: '/installer-login',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/mgsolarlogo.jpg',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/mgsolarlogo.jpg',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  }
}