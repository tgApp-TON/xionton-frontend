import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const nickname = searchParams.get('nickname');

  if (!nickname) {
    return NextResponse.json({ error: 'Nickname is required' }, { status: 400 });
  }

  // TODO: Check database for existing nickname
  // For now, mock response - always available except 'test'
  const takenNicknames = ['test', 'admin', 'support'];
  const isTaken = takenNicknames.includes(nickname.toLowerCase());

  return NextResponse.json({ 
    taken: isTaken,
    available: !isTaken 
  });
}
