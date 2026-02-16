import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const MAX_DEPTH = 3;

type TreeUser = {
  id: number;
  nickname: string;
  activeTables: number;
  totalEarned: number;
  referralsCount: number;
};

type TreeNode = {
  user: TreeUser;
  children: TreeNode[];
};

function num(val: unknown): number {
  if (val == null) return 0;
  const n = typeof val === 'string' ? parseFloat(val) : Number(val);
  return Number.isNaN(n) ? 0 : n;
}

async function getUserNode(uid: number): Promise<TreeUser | null> {
  const { data: user } = await supabase
    .from('User')
    .select('id, nickname, totalEarned')
    .eq('id', uid)
    .single();
  if (!user) return null;

  const { count: matrixCount } = await supabase
    .from('MatrixTable')
    .select('id', { count: 'exact', head: true })
    .eq('userId', uid);
  const activeTables = matrixCount ?? 0;

  const { count: refCount } = await supabase
    .from('User')
    .select('id', { count: 'exact', head: true })
    .eq('referrerId', uid);
  const referralsCount = refCount ?? 0;

  return {
    id: (user as any).id,
    nickname: (user as any).nickname ?? `User ${uid}`,
    activeTables,
    totalEarned: num((user as any).totalEarned),
    referralsCount,
  };
}

async function buildTree(uid: number, depth: number, isMaster: boolean): Promise<TreeNode | null> {
  const userData = await getUserNode(uid);
  if (!userData) return null;

  const maxDepth = isMaster ? 999 : MAX_DEPTH;
  if (depth >= maxDepth) {
    return { user: userData, children: [] };
  }

  const { data: directRefs } = await supabase
    .from('User')
    .select('id')
    .eq('referrerId', uid);
  const childIds = (directRefs ?? []).map((r: any) => r.id);

  const children: TreeNode[] = [];
  for (const cid of childIds) {
    const childNode = await buildTree(cid, depth + 1, isMaster);
    if (childNode) children.push(childNode);
  }

  return { user: userData, children };
}

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }
  const id = parseInt(userId, 10);
  if (Number.isNaN(id) || id < 1) {
    return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
  }

  try {
    const isMaster = id === 1;
    const tree = await buildTree(id, 0, isMaster);
    if (!tree) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(tree);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to build referral tree';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
