/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "/u/**",
      },
      {
        protocol: "https",
        hostname: "private-avatars.githubusercontent.com",
        port: "",
        pathname: "/u/**",
      },
    ],
  },
  experimental: {
    esmExternals: "loose",
  },
};

export default nextConfig;
