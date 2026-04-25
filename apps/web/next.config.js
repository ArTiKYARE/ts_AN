/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    domains: ['media.kitsu.io', 'cdn.myanimelist.net', 'img.anilist.co'],
  },
}

module.exports = nextConfig
