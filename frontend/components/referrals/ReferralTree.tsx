'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, ArrowUp } from 'lucide-react';

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

type TreeResponse = {
  upline: UplineNode[];
  tree: TreeNode;
};

const AVATAR_SIZE: Record<number, number> = {
  0: 40,
  1: 36,
  2: 28,
  3: 22,
};

export function ReferralTree({ userId }: { userId: string }) {
  const [data, setData] = useState<TreeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/user/referral-tree?userId=${encodeURIComponent(userId)}`)
      .then((r) => r.json())
      .then((res) => {
        if (cancelled) return;
        if (res.error) {
          setError(res.error);
          setData(null);
          return;
        }
        setData({ upline: res.upline ?? [], tree: res.tree });
      })
      .catch((e) => {
        if (!cancelled) {
          setError('Failed to load tree');
          setData(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
        <div
          style={{
            width: 32,
            height: 32,
            border: '3px solid rgba(168,85,247,0.3)',
            borderTopColor: '#a855f7',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !data) {
    return (
      <p style={{ color: '#888', fontSize: '0.9rem', padding: '16px 0' }}>
        {error ?? 'No tree data'}
      </p>
    );
  }

  const uplineReversed = [...(data.upline || [])].reverse();

  return (
    <div style={{ paddingBottom: 16 }}>
      {uplineReversed.length > 0 && (
        <>
          <p style={{ color: 'rgba(0,212,255,0.9)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
            Your Upline
          </p>
          <div style={{ borderLeft: '1px dashed rgba(0,212,255,0.2)', marginLeft: 20, paddingLeft: 12, marginBottom: 16 }}>
            {uplineReversed.map((u) => (
              <div
                key={u.id}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 12,
                  padding: 10,
                  marginBottom: 8,
                  alignItems: 'center',
                  border: '1px solid rgba(0,212,255,0.5)',
                  borderRadius: 12,
                  background: 'rgba(0,0,0,0.3)',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: '#0d0d0d',
                    border: '2px solid rgba(0,212,255,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: 'rgba(0,212,255,0.9)',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                  }}
                >
                  {u.nickname.charAt(0).toUpperCase() || '?'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>
                      {u.nickname.length > 10 ? u.nickname.slice(0, 10) + '…' : u.nickname}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'rgba(0,212,255,0.8)' }}>
                      Level +{u.level}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 12px', marginTop: 4, fontSize: '0.8rem' }}>
                    <span style={{ color: u.activeTables > 0 ? '#22c55e' : '#888' }}>Tables: {u.activeTables}</span>
                    <span style={{ color: '#a855f7' }}>Earned: {u.totalEarned.toFixed(2)} TON</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#666', marginTop: 2 }}>Refs: {u.referralsCount}</div>
                </div>
                <ArrowUp size={18} style={{ color: 'rgba(0,212,255,0.6)', flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </>
      )}
      <TreeNodeRow node={data.tree} level={0} isRoot defaultExpanded={true} />
    </div>
  );
}

function TreeNodeRow({
  node,
  level,
  isRoot,
  defaultExpanded = false,
}: {
  node: TreeNode;
  level: number;
  isRoot?: boolean;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasChildren = node.children.length > 0;
  const avatarSize = AVATAR_SIZE[Math.min(level, 3)] ?? 22;
  const isWorker = node.user.activeTables > 0;
  const borderColor = isRoot ? 'rgba(168,85,247,0.6)' : isWorker ? '#22c55e' : '#ef4444';
  const bgColor = isWorker ? '#22c55e' : '#ef4444';
  const nickname = node.user.nickname.length > 10 ? node.user.nickname.slice(0, 10) + '…' : node.user.nickname;

  return (
    <div style={{ marginLeft: level > 0 ? 20 : 0 }}>
      {level > 0 && (
        <div
          style={{
            width: 1,
            minHeight: 8,
            background: 'rgba(168,85,247,0.3)',
            marginLeft: avatarSize / 2,
          }}
        />
      )}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 12,
          padding: 10,
          marginBottom: 8,
          alignItems: 'center',
          borderLeft: level > 0 ? '1px solid rgba(168,85,247,0.3)' : 'none',
          marginLeft: level > 0 ? 8 : 0,
          paddingLeft: level > 0 ? 12 : 10,
        }}
      >
        <div
          style={{
            width: avatarSize,
            height: avatarSize,
            borderRadius: '50%',
            background: isRoot ? '#0d0d0d' : bgColor,
            border: `2px solid ${borderColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: isRoot ? '#a855f7' : '#fff',
            fontSize: level === 0 ? '1rem' : level === 1 ? '0.9rem' : '0.75rem',
            fontWeight: 700,
          }}
        >
          {node.user.nickname.charAt(0).toUpperCase() || '?'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span
              style={{
                color: '#fff',
                fontWeight: level === 1 ? 700 : 400,
                fontSize: level === 0 ? '1rem' : '0.9rem',
              }}
            >
              {isRoot ? node.user.nickname : nickname}
            </span>
            {isRoot && (
              <span style={{ fontSize: '0.75rem', color: '#a855f7', fontWeight: 600 }}>You</span>
            )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 12px', marginTop: 4, fontSize: '0.8rem' }}>
            <span style={{ color: node.user.activeTables > 0 ? '#22c55e' : '#888' }}>
              Tables: {node.user.activeTables}
            </span>
            <span style={{ color: '#a855f7' }}>Earned: {node.user.totalEarned.toFixed(2)} TON</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#666', marginTop: 2 }}>
            Refs: {node.user.referralsCount}
          </div>
        </div>
        {hasChildren && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>
        )}
      </div>
      {hasChildren && expanded && (
        <div>
          {node.children.map((child) => (
            <TreeNodeRow
              key={child.user.id}
              node={child}
              level={level + 1}
              defaultExpanded={level + 1 === 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
