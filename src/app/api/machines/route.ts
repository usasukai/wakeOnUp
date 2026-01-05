import { NextResponse } from 'next/server';
import { getMachines, addMachine, Machine } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';

const isElectron = process.env.BUILD_TARGET === 'electron';
export const dynamic = isElectron ? 'force-static' : 'auto';

export async function GET() {
  if (isElectron) {
    // Electron(export) 向けの静的スタブ: 空配列
    return NextResponse.json([]);
  }
  const machines = await getMachines();
  return NextResponse.json(machines);
}

export async function POST(request: Request) {
  if (isElectron) {
    // Export ではミューテーション不可: 405 を返す
    return NextResponse.json({ error: 'Not available in export build' }, { status: 405 });
  }
  try {
    const body = await request.json();
    
    if (!body.name || !body.mac) {
      return NextResponse.json(
        { error: 'Name and MAC address are required' },
        { status: 400 }
      );
    }

    // 名前の長さ制限
    if (body.name.length > 100) {
      return NextResponse.json(
        { error: 'Name is too long (max 100 characters)' },
        { status: 400 }
      );
    }

    // Basic MAC address validation
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    if (!macRegex.test(body.mac)) {
       return NextResponse.json(
        { error: 'Invalid MAC address format' },
        { status: 400 }
      );
    }

    const newMachine: Machine = {
      id: uuidv4(),
      name: body.name.trim(),
      mac: body.mac,
    };

    await addMachine(newMachine);

    return NextResponse.json(newMachine, { status: 201 });
  } catch (error) {
    console.error('Error adding machine:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
