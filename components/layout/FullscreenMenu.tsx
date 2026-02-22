'use client';
import { Home, Users, BarChart3, Settings, LogOut, Wallet, TrendingUp, Table as TableIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
interface FullscreenMenuProps {
  isOpen: boolean;
  onClose: () => void;
  stats: {
    totalEarned: number;
    activeTables: number;
    totalReferrals: number;
    totalCycles: number;
  };
}
export function FullscreenMenu({ isOpen, onClose, stats }: FullscreenMenuProps) {
  if (!isOpen) return null;
  const menuItems = [
    { icon: Home, label: 'Tables', href: '/tables' },
    { icon: Users, label: 'Network', href: '/referrals' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];
  return (
    <div className="fixed inset-0 z-40 bg-slate-900 overflow-y-auto">
      <div className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-8">Menu</h2>
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-0 bg-gradient-to-br from-cyan-600/20 to-blue-600/20 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 bg-cyan-500/20 rounded-xl">
                      <Wallet className="h-6 w-6 text-cyan-400" />
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400 mb-1">Total Received</div>
                      <div className="text-3xl font-bold text-white">{stats.totalEarned}</div>
                      <div className="text-sm text-cyan-400 font-medium">TON</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                      <TableIcon className="h-6 w-6 text-purple-400" />
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400 mb-1">Active Tables</div>
                      <div className="text-3xl font-bold text-white">{stats.activeTables}</div>
                      <div className="text-sm text-purple-400 font-medium">of 12</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 bg-gradient-to-br from-pink-600/20 to-red-600/20 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 bg-pink-500/20 rounded-xl">
                      <Users className="h-6 w-6 text-pink-400" />
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400 mb-1">Network members</div>
                      <div className="text-3xl font-bold text-white">{stats.totalReferrals}</div>
                      <div className="text-sm text-pink-400 font-medium">members</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 bg-gradient-to-br from-indigo-600/20 to-cyan-600/20 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 bg-indigo-500/20 rounded-xl">
                      <TrendingUp className="h-6 w-6 text-indigo-400" />
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400 mb-1">Total Cycles</div>
                      <div className="text-3xl font-bold text-white">{stats.totalCycles}</div>
                      <div className="text-sm text-indigo-400 font-medium">completed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Navigation</h3>
            <nav className="space-y-3">
              {menuItems.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <a key={item.label} href={item.href} className="group flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-300">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 group-hover:from-cyan-500/40 group-hover:to-purple-500/40 transition-all duration-300">
                      <ItemIcon className="w-6 h-6 text-gray-300" />
                    </div>
                    <span className="text-lg font-medium text-gray-300 group-hover:text-white transition-colors">{item.label}</span>
                  </a>
                );
              })}
            </nav>
          </div>
          <button onClick={onClose} className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-300">
            Close Menu
          </button>
        </div>
      </div>
    </div>
  );
}
