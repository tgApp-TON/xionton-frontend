import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ 
      valid: false, 
      error: 'No code provided' 
    }, { status: 400 });
  }

  try {
    // TODO: После создания Supabase заменить на реальную проверку
    // const referrer = await prisma.user.findUnique({
    //   where: { referralCode: code },
    //   select: { id: true, nickname: true, telegramUsername: true }
    // });

    // Временная заглушка для MVP тестирования
    if (code === 'TEST123' || code === 'MASTER') {
      return NextResponse.json({
        valid: true,
        referrer: {
          id: 1,
          nickname: 'MASTER',
          username: 'matrixton_official'
        }
      });
    }

    return NextResponse.json({ 
      valid: false, 
      error: 'Invalid code' 
    });

  } catch (error) {
    console.error('Referral validation error:', error);
    return NextResponse.json({ 
      valid: false, 
      error: 'Server error' 
    }, { status: 500 });
  }
}
