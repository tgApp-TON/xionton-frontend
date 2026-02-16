import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const MAX_DEPTH = 3;
const MAX_UPLINE = 5;

const isMaster = (id: number) => id === 1;

type TreeUser = {
  id: number;
  nickname: string;
  activeTables: number;
  totalEarned: number;
  referralsCount: number;
};

type UplineNode = TreeUser & { level: number };

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

async function buildUpline(userId: number): Promise<UplineNode[]> {
  const upline: UplineNode[] = [];
  let currentId: number | null = userId;

  for (let level = 1; level <= MAX_UPLINE; level++) {
    const { data: user } = await supabase
      .from('User')
      .select('id, referrerId, nickname, totalEarned')
      .eq('id', currentId)
      .single();
    if (!user) break;
    const referrerId = (user as any).referrerId ?? null;
    if (referrerId == null || isMaster(referrerId)) break;

    const nodeData = await getUserNode(referrerId);
    if (!nodeData) break;

    upline.push({ ...nodeData, level });
    currentId = referrerId;
  }

  return upline;
}

async function buildTree(uid: number, depth: number, isMasterUser: boolean): Promise<TreeNode | null> {
  const userData = await getUserNode(uid);
  if (!userData) return null;

  const maxDepth = isMasterUser ? 999 : MAX_DEPTH;
  if (depth >= maxDepth) {
    return { user: userData, children: [] };
  }

  const { data: directRefs } = await supabase
    .from('User')
    .select('id')
    .eq('referrerId', uid);
  const childIds = (directRefs ?? []).map((r: any) => r.id).filter((cid: number) => !isMaster(cid));

  const children: TreeNode[] = [];
  for (const cid of childIds) {
    const childNode = await buildTree(cid, depth + 1, isMasterUser);
    if (childNode) children.push(childNode);
  }

  return { user: userData, children };
}

export async function GET(request: NextRequest) {
  const userIdParam = request.nextUrl.searchParams.get('userId');
  console.log('[referral-tree] userId param:', userIdParam);

  if (!userIdParam) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }
  const id = parseInt(userIdParam, 10);
  if (Number.isNaN(id) || id < 1) {
    return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
  }

  const { data: user, error: userError } = await supabase
    .from('User')
    .select('id, nickname, totalEarned, referrerId')
    .eq('id', id)
    .single();
  console.log('[referral-tree] user fetch result:', user, userError);

  try {
    const isMasterUser = id === 1;
    const [upline, tree] = await Promise.all([buildUpline(id), buildTree(id, 0, isMasterUser)]);

    if (!tree) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      upline,
      tree,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to build referral tree';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
