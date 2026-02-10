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
        {[1, 2, 3, 4].map((slot) => {
          const position = positions.find((p) => p.position === slot);
          const isFilled = !!position;
          
          return (
            <div
              key={slot}
              className={`aspect-square rounded-lg border-2 ${
                isFilled 
                  ? 'border-cyan-400 bg-cyan-400/10' 
                  : 'border-purple-500/30 bg-purple-500/5'
              } flex items-center justify-center transition-all duration-300`}
              style={{
                boxShadow: isFilled 
                  ? '0 0 15px rgba(34, 211, 238, 0.3)' 
                  : '0 0 10px rgba(168, 85, 247, 0.1)'
              }}
            >
              <div className="text-center">
                <div className={`text-2xl font-bold ${isFilled ? 'text-cyan-400' : 'text-gray-500'}`}>
                  {slot}
                </div>
                {isFilled && (
                  <div className="text-xs text-cyan-300 mt-1">Filled</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Инфо блок */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Price:</span>
          <span className="text-white font-bold text-lg">{price} TON</span>
        </div>
        
        {cycles > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Cycles:</span>
            <span className="text-purple-400 font-semibold">{cycles}</span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Filled:</span>
          <span className="text-cyan-400 font-semibold">{positions.length}/4</span>
        </div>
      </div>

      {/* Кнопка */}
      {isActive ? (
        <button 
          className="mt-4 w-full py-2 px-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
          style={{ boxShadow: '0 0 20px rgba(168, 85, 247, 0.5)' }}
        >
          View Details
        </button>
      ) : (
        <button 
          className="mt-4 w-full py-2 px-4 rounded-lg bg-gray-700 text-gray-400 font-semibold cursor-not-allowed"
          disabled
        >
          Locked
        </button>
      )}
    </div>
  );
}
