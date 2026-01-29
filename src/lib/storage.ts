import fs from 'node:fs/promises';
import path from 'path';

// デフォルトは開発/Nextでも動作するように cwd 配下
let dataFilePath = path.join(process.cwd(), 'machines.json');

export function setDataFilePath(p: string) {
  dataFilePath = p;
}

function getDataFile() {
  return dataFilePath;
}

export interface Machine {
  id: string;
  name: string;
  mac: string;
}

export async function getMachines(): Promise<Machine[]> {
  try {
    const data = await fs.readFile(getDataFile(), 'utf-8');
    const machines = JSON.parse(data);

    // 簡易的な型チェック
    if (!Array.isArray(machines)) {
      console.error('Invalid data format in machines file');
      return [];
    }

    return machines;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') {
      // ファイルが存在しない場合は空配列を返す（正常）
      return [];
    }
    // その他のエラーはログに記録
    console.error('Error reading machines file:', error);
    return [];
  }
}

export async function saveMachines(machines: Machine[]): Promise<void> {
  const file = getDataFile();
  const dir = path.dirname(file);
  // 親ディレクトリが無ければ作成（ユーザーが任意ディレクトリを選ぶケースに対応）
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(file, JSON.stringify(machines, null, 2), 'utf-8');
}

export async function addMachine(machine: Machine): Promise<void> {
  const machines = await getMachines();
  machines.push(machine);
  await saveMachines(machines);
}

export async function deleteMachine(id: string): Promise<void> {
  let machines = await getMachines();
  machines = machines.filter(m => m.id !== id);
  await saveMachines(machines);
}
