import { NextResponse } from 'next/server';
import wol from 'wake_on_lan';
import util from 'node:util';

// Electron build: API routes are not used, but we need to satisfy the build
export const dynamic = 'force-static';

const wake = util.promisify(wol.wake);

export async function POST(request: Request) {
  try {
    const { mac } = await request.json();

    if (!mac) {
      return NextResponse.json(
        { error: 'MAC address is required' },
        { status: 400 }
      );
    }

    // MACアドレスの形式検証
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    if (!macRegex.test(mac)) {
      return NextResponse.json(
        { error: 'Invalid MAC address format' },
        { status: 400 }
      );
    }

    // wake_on_lan wake function
    await wake(mac);

    return NextResponse.json({ success: true, message: `Magic packet sent to ${mac}` });
  } catch (error) {
    console.error('WoL Error:', error);
    return NextResponse.json(
      { error: 'Failed to send magic packet' },
      { status: 500 }
    );
  }
}
