import { NextResponse } from 'next/server';
import { deleteMachine } from '@/lib/storage';

// Electron build: API routes are not used, but we need to satisfy the build
export const dynamic = 'force-static';

// Add generateStaticParams for static export compatibility
export function generateStaticParams() {
  return [];
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
