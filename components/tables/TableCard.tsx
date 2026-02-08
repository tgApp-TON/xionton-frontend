'use client';

import { Table } from '@/lib/types';
import { Diamond, Lock } from 'lucide-react';

interface TableCardProps {
  tableNumber: number;
  price: number;
  table?: Table;
  isActive: boolean;
}

export function TableCard({ tableNumber, price, table, isActive }: TableCardProps) {
  const positions = table?.positions || [];
  const cycles = table?.cycleNumber || 0;

  return (
    <div className={`neon-card ${isActive ? 'pulse-glow' : 'opacity-40'}`}>
      {/* Header с алмазом */}
      <div className="flex items-center gap-2 mb-4">
        <Diamond className="w-6 h-6 text-cyan-400" style={{ filter: 'drop-shadow(0 0 5px #22d3ee)' }} />
        <h3 className="text-xl font-bold text-white" style={{ textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>
          Table {tableNumber}
        </h3>
        {!isActive && (
          <Lock className="w-5 h-5 text-gray-500 ml-auto" />
        )}
      </div>

      {/* 4 Слота в сетке 2x2 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[1, 2, 3, 4].map((slotNum) => {
          const position = positions.find(p => p.position === slotNum);
          return (
            <div
              key={slotNum}
              className={`slot ${position ? 'filled' : ''} h-20 flex items-center justify-center`}
            >
              {position ? (
                <span className="text-sm font-semibold text-white truncate px-2">
                  {position.partnerNickname}
                </span>
              ) : (
                <span className="text-xs text-gray-500">Empty</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Цена */}
      <div className="price-badge py-4 text-center mb-3">
        <div className="text-4xl font-black text-white" style={{ textShadow: '0 0 15px rgba(255,255,255,0.8)' }}>
          {price} TON
        </div>
      </div>

      {/* Cycles */}
      <div className="text-center">
        <p className="text-sm text-gray-300">
          Cycles closed: <span className="font-bold text-white">{cycles}</span>
        </p>
      </div>
    </div>
  );
}
