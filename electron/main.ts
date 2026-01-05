import { app, BrowserWindow, ipcMain, protocol, dialog } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import wol from 'wake_on_lan';
import util from 'util';
import { v4 as uuidv4 } from 'uuid';
import { getMachines, addMachine, deleteMachine, Machine, setDataFilePath } from '../src/lib/storage';

// Promisify wake function
const wake = util.promisify(wol.wake);

const isDev = !app.isPackaged;

// Register custom protocol as privileged
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
    },
  },
]);

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: 'hiddenInset', // Mac-like title bar
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load using custom protocol
    mainWindow.loadURL('app://./index.html');
  }
}

app.whenReady().then(async () => {
  // 起動時にデータファイルパスを解決し、必要に応じて移行してからストレージに注入
  const cfg = await loadConfig();
  const resolvedFile = resolveDataFilePath(cfg);
  // 本番では旧既定（cwd/machines.json）から userData へ移行を試行
  if (!isDev) {
    const oldDefault = path.join(process.cwd(), 'machines.json');
    await migrateIfNeeded(oldDefault, resolvedFile);
  }
  setDataFilePath(resolvedFile);

  // Register custom protocol to serve local files
  protocol.registerFileProtocol('app', (request, callback) => {
    let url = request.url.substr(6); // Remove 'app://' prefix

    // Remove leading './' if present
    if (url.startsWith('./')) {
      url = url.substr(2);
    }

    // Remove leading '/' if present (for absolute paths like /_next/static/...)
    if (url.startsWith('/')) {
      url = url.substr(1);
    }

    const filePath = path.normalize(path.join(__dirname, '../out', url));

    // Minimal content-type mapping to avoid CSS being treated as text/plain
    const ext = path.extname(filePath).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      '.html': 'text/html; charset=utf-8',
      '.htm': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.mjs': 'text/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.ico': 'image/x-icon',
      '.webp': 'image/webp',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf',
      '.otf': 'font/otf',
      '.map': 'application/json; charset=utf-8',
    };
    const headers: Record<string, string> = {};
    const ct = contentTypeMap[ext];
    if (ct) headers['Content-Type'] = ct;

    callback({ path: filePath, headers });
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Helpers for settings/config
function getUserConfigPath() {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'config.json');
}

async function loadConfig(): Promise<{ dataDir?: string }> {
  try {
    const p = getUserConfigPath();
    const json = await fs.readFile(p, 'utf-8');
    return JSON.parse(json);
  } catch {
    return {};
  }
}

async function saveConfig(cfg: { dataDir?: string }) {
  const p = getUserConfigPath();
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(cfg, null, 2), 'utf-8');
}

function resolveDataFileSource(cfg: { dataDir?: string }) {
  if (cfg.dataDir) return 'config' as const;
  return 'default' as const;
}

function resolveDataFilePath(cfg: { dataDir?: string }) {
  const src = resolveDataFileSource(cfg);
  if (src === 'config' && cfg.dataDir) {
    return path.join(cfg.dataDir, 'machines.json');
  }
  // default
  if (!isDev) {
    const userDataPath = app.getPath('userData');
    return path.join(userDataPath, 'machines.json');
  }
  return path.join(process.cwd(), 'machines.json');
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

async function migrateIfNeeded(oldFile: string, newFile: string) {
  if (oldFile === newFile) return;
  try {
    const oldStat = await fs.stat(oldFile).catch(() => null);
    const newStat = await fs.stat(newFile).catch(() => null);
    if (oldStat && !newStat) {
      await ensureDir(path.dirname(newFile));
      await fs.rename(oldFile, newFile);
    }
  } catch (e) {
    console.error('Migration failed:', e);
  }
}

// IPC Handlers
ipcMain.handle('get-machines', async () => {
  return await getMachines();
});

ipcMain.handle('add-machine', async (_, { name, mac }) => {
  const newMachine: Machine = {
    id: uuidv4(),
    name,
    mac,
  };
  await addMachine(newMachine);
  return newMachine;
});

ipcMain.handle('delete-machine', async (_, id) => {
  await deleteMachine(id);
});

ipcMain.handle('wake', async (_, mac) => {
  console.log(`Sending magic packet to ${mac}`);
  await wake(mac);
});

// Settings related IPC
ipcMain.handle('get-settings', async () => {
  const cfg = await loadConfig();
  const resolvedFile = resolveDataFilePath(cfg);
  const source = resolveDataFileSource(cfg);
  return { dataDir: cfg.dataDir || null, resolvedDataFile: resolvedFile, source };
});

ipcMain.handle('set-data-dir', async (_, dir: string) => {
  if (!dir) throw new Error('ディレクトリが選択されていません');
  // Normalize and ensure directory
  const targetDir = path.resolve(dir);
  await ensureDir(targetDir);

  const cfg = await loadConfig();
  const oldFile = resolveDataFilePath(cfg);
  const newFile = path.join(targetDir, 'machines.json');

  await migrateIfNeeded(oldFile, newFile);

  // Save and update storage path for current session
  await saveConfig({ dataDir: targetDir });
  setDataFilePath(newFile);

  return { ok: true, resolvedDataFile: newFile };
});

ipcMain.handle('choose-data-dir', async () => {
  const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
  const res = await dialog.showOpenDialog(win, {
    title: '保存先ディレクトリを選択',
    properties: ['openDirectory', 'createDirectory'],
  });
  if (res.canceled || res.filePaths.length === 0) return { canceled: true };
  const dir = res.filePaths[0];
  const reply = await (ipcMain as any).invoke?.('set-data-dir', dir).catch(async () => {
    // Fallback: directly set using shared function
    const cfg = await loadConfig();
    const oldFile = resolveDataFilePath(cfg);
    const newFile = path.join(dir, 'machines.json');
    await ensureDir(dir);
    await migrateIfNeeded(oldFile, newFile);
    await saveConfig({ dataDir: dir });
    setDataFilePath(newFile);
    return { ok: true, resolvedDataFile: newFile };
  });
  return reply || { canceled: false };
});
