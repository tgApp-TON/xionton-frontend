import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

// CRITICAL: Store this password hash in environment variables
// Generate hash: echo -n "your-secret-password" | openssl sha256
const MASTER_PASSWORD_HASH = process.env.MASTER_PASSWORD_HASH || 
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'; // empty string hash

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, newMasterTelegramId, newMasterNickname } = body;

    // Validate password
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    
    if (passwordHash !== MASTER_PASSWORD_HASH) {
      return NextResponse.json({ 
        error: 'Invalid password. MASTER cannot be changed without correct password.' 
      }, { status: 403 });
    }

    // Get current MASTER
    const { data: currentMaster, error: fetchError } = await supabase
      .from('User')
      .select('*')
      .eq('id', 1)
      .single();

    if (fetchError || !currentMaster) {
      return NextResponse.json({ error: 'MASTER user not found' }, { status: 404 });
    }

    // Update MASTER
    const { data: updatedMaster, error: updateError } = await supabase
      .from('User')
      .update({
        telegramId: newMasterTelegramId,
        nickname: newMasterNickname,
        telegramUsername: `@${newMasterNickname}`,
        referralCode: newMasterNickname.toUpperCase().slice(0, 10)
      })
      .eq('id', 1)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'MASTER updated successfully',
      previousMaster: {
        telegramId: currentMaster.telegramId,
        nickname: currentMaster.nickname
      },
      newMaster: {
        telegramId: updatedMaster.telegramId,
        nickname: updatedMaster.nickname
      }
    });

  } catch (error) {
    console.error('Change MASTER error:', error);
    return NextResponse.json({ error: 'Failed to change MASTER' }, { status: 500 });
  }
}

// DELETE endpoint - ALWAYS BLOCKED
export async function DELETE(request: NextRequest) {
  return NextResponse.json({ 
    error: 'MASTER user cannot be deleted. This operation is permanently disabled.' 
  }, { status: 403 });
}
