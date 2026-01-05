import type { NextConfig } from "next";

const isElectron = process.env.BUILD_TARGET === 'electron';

const nextConfig: NextConfig = isElectron
  ? {
      output: 'export',
      images: { unoptimized: true },
    }
  : {
      // Web/Dev: デフォルト挙動（API ルートを有効）
      images: { unoptimized: false },
    };

export default nextConfig;
