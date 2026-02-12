/**
 * Validates Telegram WebApp initData (HMAC-SHA256).
 * Requires TELEGRAM_BOT_TOKEN in environment (add to Vercel env vars for production).
 */
import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('telegram-init called, initData length:', body?.initData?.length ?? 0, 'first 100 chars:', body?.initData?.substring(0, 100) ?? 'empty');
    const { initData } = body;

    if (!initData || typeof initData !== 'string') {
      return NextResponse.json({ valid: false, error: 'No initData' }, { status: 400 });
    }

    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) {
      return NextResponse.json({ valid: false, error: 'Invalid signature' }, { status: 400 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN is not set');
      return NextResponse.json({ valid: false, error: 'Invalid signature' }, { status: 500 });
    }

    params.delete('hash');
    const sortedKeys = Array.from(params.keys()).sort();
    const dataCheckString = sortedKeys.map((key) => `${key}=${params.get(key)}`).join('\n');

    const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
    const signature = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    if (signature !== hash) {
      return NextResponse.json({ valid: false, error: 'Invalid signature' }, { status: 400 });
    }

    const userStr = params.get('user');
    if (!userStr) {
      return NextResponse.json({ valid: true, user: null });
    }

    let userObj: Record<string, unknown>;
    try {
      userObj = JSON.parse(userStr);
    } catch {
      return NextResponse.json({ valid: true, user: null });
    }

    const user = {
      id: userObj.id,
      username: userObj.username,
      first_name: userObj.first_name,
      is_premium: userObj.is_premium,
    };

    return NextResponse.json({ valid: true, user });
  } catch (error) {
    console.error('telegram-init error:', error);
    return NextResponse.json({ valid: false, error: 'Invalid signature' }, { status: 500 });
  }
}
