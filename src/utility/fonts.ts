import localFont from 'next/font/local'

export const lobular = localFont({
  src: "../assets/fonts/lobular/lobular-regular.woff2",
  variable: "--font-lobular"
})

export const fungis = localFont({
  variable: "--font-fungis",
  src: [
    {
      path: "../assets/fonts/fungis/fungis-regular.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/fungis/fungis-bold.woff",
      weight: "700",
      style: "normal",
    },
  ]
})
