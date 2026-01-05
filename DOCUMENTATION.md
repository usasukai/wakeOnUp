# WakeOnLan プロジェクトドキュメント

## 目次
1. [プロジェクト概要](#プロジェクト概要)
2. [技術スタック](#技術スタック)
3. [アーキテクチャ](#アーキテクチャ)
4. [ディレクトリ構造](#ディレクトリ構造)
5. [主要コンポーネント](#主要コンポーネント)
6. [データフロー](#データフロー)
7. [セットアップと使い方](#セットアップと使い方)
8. [開発方法](#開発方法)
9. [ビルドとデプロイ](#ビルドとデプロイ)

---

## プロジェクト概要

**WakeOnLan**は、ネットワーク上のコンピュータをリモートで起動するためのWake-on-LAN（WoL）機能を提供するアプリケーションです。

### 主な機能
- マシンの登録・管理（名前とMACアドレス）
- Wake-on-LANマジックパケットの送信
- マシン情報の永続化（JSON形式）
- デュアルモード対応：
    - **Webアプリケーション**: ブラウザで動作
    - **デスクトップアプリケーション**: Electronで動作

---

## 技術スタック

### フロントエンド
- **Next.js 15.1.6** - Reactフレームワーク（App Router使用）
- **React 19** - UIライブラリ
- **@heroui/react** - UIコンポーネントライブラリ
- **Tailwind CSS** - スタイリング
- **Framer Motion** - アニメーション
- **Sonner** - トースト通知

### バックエンド
- **Next.js API Routes** - REST API（Web版）
- **Electron IPC** - プロセス間通信（Desktop版）
- **wake_on_lan** - Wake-on-LANパケット送信ライブラリ

### デスクトップ
- **Electron 39** - デスクトップアプリケーションフレームワーク
- **electron-builder** - アプリケーションビルドツール

### 開発ツール
- **TypeScript** - 型安全な開発
- **ESLint** - コード品質チェック
- **tsup** - TypeScriptビルドツール
- **Bun** - パッケージマネージャー

---

## アーキテクチャ

### デュアルモード設計

このアプリケーションは、同一のコードベースで2つのモードで動作します：

#### 1. Webモード
```
ブラウザ
  └─> Next.js Frontend (React)
       └─> Next.js API Routes (/api/*)
            └─> wake_on_lan パッケージ
                 └─> ネットワークへマジックパケット送信
```

#### 2. Electronモード
```
Electron App
  ├─> Renderer Process (Next.js Frontend)
  │    └─> IPC通信
  └─> Main Process (main.ts)
       ├─> IPC Handlers
       └─> wake_on_lan パッケージ
            └─> ネットワークへマジックパケット送信
```

### データ永続化

マシン情報は`machines.json`ファイルに保存されます：

```json
[
  {
    "id": "uuid-v4",
    "name": "マシン名",
    "mac": "00:11:22:33:44:55"
  }
]
```

- **保存場所**: プロジェクトルートの`machines.json`（デフォルト）
- **カスタマイズ**: 環境変数`WOL_DATA_FILE`で変更可能

---

## ディレクトリ構造

```
wakeonlan/
├── src/                          # ソースコード
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API Routes
│   │   │   ├── wake/
│   │   │   │   └── route.ts      # Wake-on-LAN API
│   │   │   └── machines/
│   │   │       ├── route.ts      # マシン一覧・追加API
│   │   │       └── [id]/
│   │   │           └── route.ts  # マシン削除API
│   │   ├── layout.tsx            # アプリケーションレイアウト
│   │   ├── page.tsx              # メインページ
│   │   ├── providers.tsx         # UIプロバイダー
│   │   └── globals.css           # グローバルスタイル
│   ├── components/               # Reactコンポーネント
│   │   ├── machine-card.tsx      # マシンカードコンポーネント
│   │   └── add-machine-modal.tsx # マシン追加モーダル
│   └── lib/                      # ユーティリティライブラリ
│       ├── storage.ts            # データ永続化ロジック
│       ├── storage.test.ts       # ストレージテスト
│       └── api-client.ts         # API通信クライアント
├── electron/                     # Electronアプリケーション
│   ├── main.ts                   # メインプロセス
│   └── preload.ts                # プリロードスクリプト
├── dist/                         # Electronビルド出力
├── out/                          # Next.js静的エクスポート出力
├── release/                      # electron-builderの出力
├── public/                       # 静的ファイル
├── test/                         # テストファイル
├── native/                       # ネイティブビルド関連（別プロジェクト構造）
├── machines.json                 # マシン情報データファイル
├── package.json                  # プロジェクト設定
├── next.config.ts                # Next.js設定
├── tsconfig.json                 # TypeScript設定
├── tailwind.config.ts            # Tailwind CSS設定
├── tsup.config.ts                # tsupビルド設定
└── eslint.config.mjs             # ESLint設定
```

---

## 主要コンポーネント

### 1. フロントエンド

#### `src/app/page.tsx`
メインページコンポーネント。アプリケーションのエントリーポイント。

**主な機能:**
- マシン一覧の表示
- マシンの追加・削除
- Wake-on-LANパケット送信
- ローディング状態の管理
- トースト通知

**状態管理:**
```typescript
const [machines, setMachines] = useState<Machine[]>([]);
const [loading, setLoading] = useState(true);
```

#### `src/components/machine-card.tsx`
個別のマシンを表示するカードコンポーネント。

**機能:**
- マシン名とMACアドレスの表示
- 起動ボタン（Wake-on-LAN送信）
- 削除ボタン
- ローディング状態の表示

#### `src/components/add-machine-modal.tsx`
新しいマシンを追加するためのモーダルダイアログ。

**機能:**
- マシン名の入力
- MACアドレスの入力
- バリデーション（必須チェック）
- エラーメッセージ表示

### 2. API層

#### `src/lib/api-client.ts`
フロントエンドとバックエンドの通信を抽象化するクライアント。

**デュアルモード対応:**
```typescript
if (window.electron) {
  // Electronモード: IPC通信
  return window.electron.getMachines();
} else {
  // Webモード: REST API
  return fetch('/api/machines');
}
```

**提供メソッド:**
- `getMachines()`: マシン一覧取得
- `addMachine(name, mac)`: マシン追加
- `deleteMachine(id)`: マシン削除
- `wake(mac)`: Wake-on-LANパケット送信

### 3. バックエンドAPI

#### `src/app/api/wake/route.ts`
Wake-on-LANマジックパケットを送信するAPI。

**エンドポイント:** `POST /api/wake`

**リクエスト:**
```json
{
  "mac": "00:11:22:33:44:55"
}
```

**ロジック:**
```typescript
import wol from 'wake_on_lan';
const wake = util.promisify(wol.wake);
await wake(mac);
```

#### `src/app/api/machines/route.ts`
マシンの一覧取得と追加を行うAPI。

**エンドポイント:**
- `GET /api/machines`: マシン一覧取得
- `POST /api/machines`: マシン追加

**MACアドレスバリデーション:**
```typescript
const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
```

#### `src/app/api/machines/[id]/route.ts`
特定のマシンを削除するAPI。

**エンドポイント:** `DELETE /api/machines/{id}`

### 4. データ永続化

#### `src/lib/storage.ts`
マシン情報の保存・読み込みを管理するライブラリ。

**インターフェース:**
```typescript
interface Machine {
  id: string;      // UUID v4
  name: string;    // マシン名
  mac: string;     // MACアドレス
}
```

**主な関数:**
- `getMachines()`: JSONファイルからマシン一覧を読み込み
- `saveMachines(machines)`: マシン一覧をJSONファイルに保存
- `addMachine(machine)`: 新しいマシンを追加
- `deleteMachine(id)`: 指定IDのマシンを削除

**ファイルパスの決定:**
```typescript
function getDataFile() {
  return path.join(
    process.cwd(), 
    process.env.WOL_DATA_FILE || 'machines.json'
  );
}
```

### 5. Electronアプリケーション

#### `electron/main.ts`
Electronのメインプロセス。アプリケーションウィンドウの管理とIPCハンドラーを提供。

**ウィンドウ設定:**
```typescript
const mainWindow = new BrowserWindow({
  width: 1000,
  height: 800,
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    nodeIntegration: false,
    contextIsolation: true,
  },
  titleBarStyle: 'hiddenInset', // Mac風のタイトルバー
});
```

**IPCハンドラー:**
- `get-machines`: マシン一覧取得
- `add-machine`: マシン追加
- `delete-machine`: マシン削除
- `wake`: Wake-on-LANパケット送信

**開発・本番モード切り替え:**
```typescript
if (isDev) {
  mainWindow.loadURL('http://localhost:3000');
} else {
  mainWindow.loadFile(path.join(__dirname, '../out/index.html'));
}
```

#### `electron/preload.ts`
レンダラープロセスとメインプロセス間の安全な通信を確立するプリロードスクリプト。

contextBridge経由でwindow.electronオブジェクトを公開。

---

## データフロー

### マシン一覧の取得

```
┌─────────────┐
│ page.tsx    │
│ (Frontend)  │
└──────┬──────┘
       │ fetchMachines()
       ↓
┌─────────────────┐
│ api-client.ts   │
└────┬─────┬──────┘
     │     │
Electron  Web
     │     │
     ↓     ↓
┌─────┐ ┌──────────────┐
│main │ │ GET /api/    │
│ .ts │ │ machines     │
└──┬──┘ └──────┬───────┘
   │           │
   └───────┬───┘
           ↓
    ┌─────────────┐
    │ storage.ts  │
    │ getMachines │
    └──────┬──────┘
           ↓
    ┌─────────────┐
    │machines.json│
    └─────────────┘
```

### Wake-on-LAN送信

```
┌─────────────┐
│machine-card │
│  (WakeBtn)  │
└──────┬──────┘
       │ handleWake()
       ↓
┌─────────────┐
│  page.tsx   │
└──────┬──────┘
       │ apiClient.wake()
       ↓
┌─────────────────┐
│ api-client.ts   │
└────┬─────┬──────┘
     │     │
Electron  Web
     │     │
     ↓     ↓
┌─────┐ ┌──────────┐
│main │ │POST /api/│
│ .ts │ │  wake    │
└──┬──┘ └────┬─────┘
   │         │
   └────┬────┘
        ↓
  ┌───────────┐
  │wake_on_lan│
  │ package   │
  └─────┬─────┘
        ↓
  ┌─────────────┐
  │ Magic Packet│
  │  → Network  │
  └─────────────┘
```

### マシンの追加

```
┌──────────────────┐
│add-machine-modal │
│   (Add Button)   │
└────────┬─────────┘
         │ handleSubmit()
         ↓
┌────────────────┐
│   page.tsx     │
│   handleAdd()  │
└────────┬───────┘
         │
         ↓
┌─────────────────┐
│ api-client.ts   │
│  addMachine()   │
└────┬─────┬──────┘
     │     │
Electron  Web
     │     │
     ↓     ↓
┌─────┐ ┌───────────────┐
│main │ │POST /api/     │
│ .ts │ │  machines     │
└──┬──┘ └──────┬────────┘
   │           │
   │  UUID生成 │
   │  バリデー │
   │  ション   │
   └─────┬─────┘
         ↓
  ┌─────────────┐
  │ storage.ts  │
  │ addMachine  │
  └──────┬──────┘
         ↓
  ┌─────────────┐
  │machines.json│
  │  (保存)     │
  └─────────────┘
```

---

## セットアップと使い方

### 前提条件

- Node.js 20以上
- Bun（推奨）またはnpm/yarn/pnpm

### インストール

```bash
# リポジトリのクローン
git clone <repository-url>
cd wakeonlan

# 依存関係のインストール
bun install
# または
npm install
```

### Webモードで実行

```bash
# 開発サーバーの起動
bun run dev

# ブラウザで開く
# http://localhost:3000
```

### Electronモードで実行

```bash
# Electronアプリケーションを開発モードで起動
bun run electron-dev
```

このコマンドは以下を同時実行します：
1. Next.js開発サーバー（localhost:3000）
2. TypeScriptのコンパイル（tsup --watch）
3. Electronアプリケーション

### 使用方法

1. **マシンの追加**
    - 右上の「マシン追加」ボタンをクリック
    - マシン名を入力（例: "My Desktop"）
    - MACアドレスを入力（例: "00:11:22:33:44:55"）
    - 「追加」ボタンをクリック

2. **マシンの起動**
    - 起動したいマシンのカードの「起動 (Wake)」ボタンをクリック
    - マジックパケットがネットワークに送信されます
    - 成功メッセージがトーストで表示されます

3. **マシンの削除**
    - 削除したいマシンのカードの「削除」ボタンをクリック
    - マシンが一覧から削除されます

---

## 開発方法

### プロジェクト構造の理解

新しい機能を追加する際は、以下の点に注意してください：

1. **デュアルモード対応**: WebモードとElectronモードの両方で動作すること
2. **API抽象化**: `api-client.ts`を通じて通信を行うこと
3. **型安全性**: TypeScriptの型を適切に定義すること

### 新しいAPIエンドポイントの追加

1. **Next.js API Route作成** (`src/app/api/your-endpoint/route.ts`)
   ```typescript
   import { NextResponse } from 'next/server';
   
   export async function GET() {
     // ロジック実装
     return NextResponse.json({ data: 'result' });
   }
   ```

2. **Electron IPCハンドラー追加** (`electron/main.ts`)
   ```typescript
   ipcMain.handle('your-handler', async (_, args) => {
     // ロジック実装
     return result;
   });
   ```

3. **Preloadスクリプト更新** (`electron/preload.ts`)
   ```typescript
   contextBridge.exposeInMainWorld('electron', {
     yourMethod: (args) => ipcRenderer.invoke('your-handler', args),
   });
   ```

4. **APIクライアント更新** (`src/lib/api-client.ts`)
   ```typescript
   yourMethod: async (args) => {
     if (window.electron) {
       return window.electron.yourMethod(args);
     }
     const res = await fetch('/api/your-endpoint');
     return res.json();
   }
   ```

### テストの実行

```bash
# ストレージライブラリのテスト
bun test src/lib/storage.test.ts
```

### リントとコード品質チェック

```bash
# ESLintの実行
bun run lint
```

---

## ビルドとデプロイ

### Webアプリケーションのビルド

```bash
# プロダクションビルド
bun run build

# ビルドしたアプリケーションの起動
bun run start
```

### Electronアプリケーションのビルド

```bash
# Electronアプリケーションのビルド
bun run electron-build
```

このコマンドは以下を実行します：
1. API routesを一時的に無効化（`_api_disabled`にリネーム）
2. Next.jsの静的エクスポート（`out/`ディレクトリ）
3. API routesを復元
4. Electronメインプロセスのコンパイル（tsup）
5. electron-builderによるパッケージング

**出力先:** `release/`ディレクトリ

**ビルド設定** (`package.json`の`build`セクション):
```json
{
  "appId": "com.example.wakeonlan",
  "productName": "WakeOnLan",
  "mac": {
    "category": "public.app-category.utilities"
  }
}
```

### 配布可能なアプリケーション

ビルド後、`release/`ディレクトリに以下が生成されます：
- **macOS**: `.dmg`ファイル
- **Windows**: `.exe`インストーラー（設定次第）
- **Linux**: `.AppImage`または`.deb`（設定次第）

---

## トラブルシューティング

### Wake-on-LANが動作しない場合

1. **ターゲットマシンの設定確認**
    - BIOSでWake-on-LANが有効になっているか
    - OSのネットワーク設定でWoLが有効になっているか

2. **ネットワーク環境**
    - 同じローカルネットワーク内にいるか
    - ファイアウォールがマジックパケットをブロックしていないか

3. **MACアドレスの確認**
    - 正しいMACアドレスを入力しているか
    - フォーマット: `00:11:22:33:44:55`または`00-11-22-33-44-55`

### machines.jsonが見つからない場合

環境変数で保存場所をカスタマイズできます：

```bash
# 例: カスタムパスを指定
export WOL_DATA_FILE="/path/to/your/machines.json"
```

### Electronアプリが起動しない場合

1. `dist/`ディレクトリが存在するか確認
2. `out/`ディレクトリにNext.jsのビルド出力があるか確認
3. 再ビルドを試す：
   ```bash
   bun run compile-electron
   bun run build
   ```

---

## 今後の拡張可能性

### 機能追加のアイデア

1. **マシングループ管理**
    - 複数のマシンをグループ化
    - グループ単位での一括起動

2. **スケジュール機能**
    - 指定時刻に自動起動
    - 定期的なWake送信

3. **マシンステータス確認**
    - pingによる稼働状態の確認
    - ステータスアイコンの表示

4. **設定画面**
    - ブロードキャストアドレスのカスタマイズ
    - ポート番号の設定（デフォルト: 9）

5. **履歴機能**
    - Wake-on-LAN送信履歴の記録
    - 統計情報の表示

6. **マルチプラットフォーム対応強化**
    - モバイルアプリ版（React Native）
    - CLIツール版

---

## ライセンスと謝辞

### 使用しているOSS

- Next.js - MIT License
- React - MIT License
- Electron - MIT License
- wake_on_lan - MIT License
- @heroui/react - MIT License
- その他の依存関係については`package.json`を参照

---

## まとめ

このドキュメントでは、WakeOnLanプロジェクトの全体像を解説しました：

- **プロジェクト概要**: Wake-on-LAN機能を提供するデュアルモードアプリケーション
- **技術スタック**: Next.js、React、Electron、TypeScript
- **アーキテクチャ**: WebモードとElectronモードの両対応設計
- **主要コンポーネント**: フロントエンド、API、データ永続化、Electron統合
- **開発・ビルド方法**: セットアップから配布まで

プロジェクトの理解と今後の開発の参考にしてください。
