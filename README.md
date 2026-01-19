# WakeOnLan

English | [日本語](./README_ja.md)

A Wake-on-LAN (WoL) application for remotely powering on computers over the network. Works as both a web application and an Electron desktop app.

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📋 Table of Contents

- [Features](#-features)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Usage](#-usage)
  - [Development Mode](#development-mode)
  - [Production Build (Web)](#production-build-web)
  - [Electron Desktop App](#electron-desktop-app)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

## ✨ Features

- 🖥️ **Machine Management**: Register and manage machines with names and MAC addresses
- 🚀 **Wake-on-LAN**: Send magic packets to remotely power on machines
- 💾 **Data Persistence**: Store machine information in JSON files
- 🌐 **Dual Mode Support**:
  - Web Application (Next.js)
  - Desktop Application (Electron)
- 🎨 **Modern UI**: Beautiful interface using Tailwind CSS and HeroUI
- ⚡ **Fast**: Powered by Next.js 15 App Router
- 🔔 **Notifications**: Toast notifications using Sonner

## 📸 Screenshots

*(Add screenshots here)*

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.1.6** - React framework
- **React 19** - UI library
- **@heroui/react** - UI components
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Sonner** - Toast notifications

### Backend
- **Next.js API Routes** - REST API (Web version)
- **Electron IPC** - Inter-process communication (Desktop version)
- **wake_on_lan** - Wake-on-LAN packet transmission

### Desktop
- **Electron 39** - Desktop app framework
- **electron-builder** - Application builder

### Development Tools
- **TypeScript** - Type-safe development
- **ESLint** - Code quality
- **tsup** - TypeScript build tool
- **Bun** - Package manager

## 📦 Prerequisites

- Node.js 20 or higher
- Bun (recommended) or npm/yarn/pnpm
- WoL functionality enabled on target machines

## 🚀 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd wakeonlan
```

2. Install dependencies:
```bash
bun install
# or
npm install
```

## 💻 Usage

### Development Mode

Start the development server as a web application:

```bash
bun run dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build (Web)

```bash
bun run build
bun run start
```

### Electron Desktop App

#### Development Mode
```bash
bun run electron-dev
# or
npm run electron-dev
```

#### Build (Create Distribution Package)
```bash
bun run electron-build
# or
npm run electron-build
```

The built application will be created in the `release` directory.

## 📁 Project Structure

```
wakeonlan/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API Routes (Web version)
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Main page
│   ├── components/       # React components
│   └── lib/              # Utilities and helpers
├── electron/
│   └── main.ts           # Electron main process
├── public/               # Static files
├── machines.json         # Machine data (auto-generated)
└── package.json          # Project configuration
```

## ⚙️ Configuration

### Data File Location

By default, machine information is stored in `machines.json`. You can change this with an environment variable:

```bash
export WOL_DATA_FILE=/path/to/custom/machines.json
```

### machines.json Format

```json
[
  {
    "id": "uuid-v4-string",
    "name": "My PC",
    "mac": "00:11:22:33:44:55"
  }
]
```

## 🔧 Troubleshooting

### Wake-on-LAN Not Working

1. Verify that WoL is enabled in the target machine's BIOS/UEFI
2. Check that WoL is enabled in the network adapter settings
3. Ensure the machine is on the same local network
4. Verify the MAC address is correct (colon-separated format: `00:11:22:33:44:55`)

### Electron App Build Fails

```bash
# Reinstall dependencies
rm -rf node_modules bun.lockb
bun install

# Rebuild Electron
bun run compile-electron
```

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

### Third-Party Licenses

This software uses numerous open-source libraries:

- **Main Libraries**: React, Next.js, Electron, Tailwind CSS, etc.
- **Total Dependencies**: 533 packages
- **License Types**: MIT (435), ISC (47), Apache-2.0 (15), BSD, etc.

For detailed information, please refer to:
- [THIRD-PARTY-LICENSES.md](./THIRD-PARTY-LICENSES.md) - Attribution notices for main dependencies
- [LICENSE-REPORT.md](./LICENSE-REPORT.md) - Comprehensive license inspection report for all dependencies

All dependencies use licenses that permit commercial use, modification, and redistribution.

---

## 🤝 Contributing

This is a private project.

## 📧 Contact

If you have any issues or questions, please create an Issue.

---

Made with ❤️ using Next.js and Electron