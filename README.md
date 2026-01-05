# WakeOnLan

[English](./README_en.md) | 日本語

ネットワーク上のコンピュータをリモートで起動するためのWake-on-LAN（WoL）アプリケーションです。WebアプリケーションまたはElectronデスクトップアプリとして動作します。

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📋 目次

- [特徴](#-特徴)
- [スクリーンショット](#-スクリーンショット)
- [技術スタック](#-技術スタック)
- [前提条件](#-前提条件)
- [インストール](#-インストール)
- [使い方](#-使い方)
  - [開発モード](#開発モード)
  - [本番ビルド（Web版）](#本番ビルドweb版)
  - [Electronデスクトップアプリ](#electronデスクトップアプリ)
- [プロジェクト構造](#-プロジェクト構造)
- [設定](#-設定)
- [トラブルシューティング](#-トラブルシューティング)
- [ライセンス](#-ライセンス)

## ✨ 特徴

- 🖥️ **マシン管理**: 名前とMACアドレスを登録してマシンを管理
- 🚀 **Wake-on-LAN**: マジックパケットを送信してリモートでマシンを起動
- 💾 **データ永続化**: マシン情報をJSONファイルに保存
- 🌐 **デュアルモード対応**:
  - Webアプリケーション（Next.js）
  - デスクトップアプリケーション（Electron）
- 🎨 **モダンUI**: Tailwind CSSとHeroUIを使用した美しいインターフェース
- ⚡ **高速**: Next.js 15のApp Routerを使用
- 🔔 **通知**: Sonnerを使用したトースト通知

## 📸 スクリーンショット

*(スクリーンショットを追加してください)*

## 🛠️ 技術スタック

### フロントエンド
- **Next.js 15.1.6** - Reactフレームワーク
- **React 19** - UIライブラリ
- **@heroui/react** - UIコンポーネント
- **Tailwind CSS** - スタイリング
- **Framer Motion** - アニメーション
- **Sonner** - トースト通知

### バックエンド
- **Next.js API Routes** - REST API（Web版）
- **Electron IPC** - プロセス間通信（Desktop版）
- **wake_on_lan** - Wake-on-LANパケット送信

### デスクトップ
- **Electron 39** - デスクトップアプリフレームワーク
- **electron-builder** - アプリケーションビルド

### 開発ツール
- **TypeScript** - 型安全な開発
- **ESLint** - コード品質
- **tsup** - TypeScriptビルド
- **Bun** - パッケージマネージャー

## 📦 前提条件

- Node.js 20以上
- Bun（推奨）または npm/yarn/pnpm
- Wake-on-LANを使用するマシンでWoL機能が有効になっていること

## 🚀 インストール

1. リポジトリをクローン:
```bash
git clone <repository-url>
cd wakeonlan
```

2. 依存関係をインストール:
```bash
bun install
# または
npm install
```

## 💻 使い方

### 開発モード

Webアプリケーションとして開発サーバーを起動:

```bash
bun run dev
# または
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

### 本番ビルド（Web版）

```bash
bun run build
bun run start
```

### Electronデスクトップアプリ

#### 開発モード
```bash
bun run electron-dev
# または
npm run electron-dev
```

#### ビルド（配布用パッケージ作成）
```bash
bun run electron-build
# または
npm run electron-build
```

ビルドされたアプリケーションは`release`ディレクトリに作成されます。

## 📁 プロジェクト構造

```
wakeonlan/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API Routes（Web版）
│   │   ├── layout.tsx    # ルートレイアウト
│   │   └── page.tsx      # メインページ
│   ├── components/       # Reactコンポーネント
│   └── lib/              # ユーティリティとヘルパー
├── electron/
│   └── main.ts           # Electronメインプロセス
├── public/               # 静的ファイル
├── machines.json         # マシンデータ（自動生成）
└── package.json          # プロジェクト設定
```

## ⚙️ 設定

### データファイルの場所

デフォルトでは、マシン情報は`machines.json`に保存されます。環境変数で変更可能:

```bash
export WOL_DATA_FILE=/path/to/custom/machines.json
```

### machines.jsonフォーマット

```json
[
  {
    "id": "uuid-v4-string",
    "name": "マイPC",
    "mac": "00:11:22:33:44:55"
  }
]
```

## 🔧 トラブルシューティング

### Wake-on-LANが機能しない

1. ターゲットマシンのBIOS/UEFIでWoL機能が有効になっていることを確認
2. ネットワークアダプタの設定でWoLが有効になっていることを確認
3. マシンが同じローカルネットワークにあることを確認
4. MACアドレスが正しいことを確認（コロン区切り形式: `00:11:22:33:44:55`）

### Electronアプリがビルドできない

```bash
# 依存関係を再インストール
rm -rf node_modules bun.lockb
bun install

# Electronをリビルド
bun run compile-electron
```

## 📄 ライセンス

このプロジェクトは[MITライセンス](./LICENSE)の下で公開されています。

### サードパーティライセンス

本ソフトウェアは、多数のオープンソースライブラリを使用しています:

- **主要ライブラリ**: React, Next.js, Electron, Tailwind CSS等
- **総依存パッケージ数**: 533個
- **使用ライセンス**: MIT (435個), ISC (47個), Apache-2.0 (15個), BSD等

詳細な情報については、以下のファイルを参照してください:
- [THIRD-PARTY-LICENSES.md](./THIRD-PARTY-LICENSES.md) - 主要な依存ライブラリの帰属表示
- [LICENSE-REPORT.md](./LICENSE-REPORT.md) - 全依存ライブラリの詳細なライセンス点検レポート

全ての依存ライブラリは、商用利用、改変、再配布が可能なライセンスを使用しています。

---

## 🤝 貢献

このプロジェクトはプライベートプロジェクトです。

## 📧 お問い合わせ

問題や質問がある場合は、Issueを作成してください。

---

Made with ❤️ using Next.js and Electron