import { NextResponse } from 'next/server';
import { deleteMachine } from '@/lib/storage';

const isElectron = process.env.BUILD_TARGET === 'electron';
export const dynamic = isElectron ? 'force-static' : 'auto';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (isElectron) {
    // Export ではミューテーション不可: 405 を返す
    return NextResponse.json({ error: 'Not available in export build' }, { status: 405 });
  }
  try {
    const { id } = await params;
    await deleteMachine(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting machine:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
