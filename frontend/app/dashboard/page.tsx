'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardData } from '@/lib/types';
import { Wallet, Users, TrendingUp, Table as TableIcon } from 'lucide-react';
import { RegistrationScreen } from '@/components/layout/RegistrationScreen';

export default function DashboardPage() {
  const router = useRouter();
  const [isRegistered, setIsRegistered] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('matrix_ton_registered') === 'true';
    }
    return false;
  });
  const [isChecking, setIsChecking] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isRegistered) {
      router.push('/tables');
    } else {
      setIsChecking(false);
    }
  }, [isRegistered, router]);

  useEffect(() => {
    // TODO: Получить данные из API
    // const telegramId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
    // apiClient.getDashboard(telegramId).then(setData);
    
    // Моковые данные для разработки
    setData({
      user: {
        id: 1,
        telegramId: '123456789',
        nickname: 'CryptoKing',
        tonWallet: 'UQx...abc',
        role: 'user',
        referrerId: null,
        referralCode: 'REF123',
        registeredAt: new Date().toISOString()
      },
      stats: {
        userId: 1,
        activeTables: 3,
        totalEarned: 156.8,
        totalReferrals: 47,
        table1Cycles: 2,
        table2Cycles: 1,
        table3Cycles: 0,
        table4Cycles: 0,
        table5Cycles: 0,
        table6Cycles: 0,
        table7Cycles: 0,
        table8Cycles: 0,
        table9Cycles: 0,
        table10Cycles: 0,
        table11Cycles: 0,
        table12Cycles: 0
      },
      tables: [],
      recentTransactions: [],
      pendingPayouts: []
    });
    setLoading(false);
  }, []);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isRegistered) {
    return <RegistrationScreen onComplete={() => {
      setIsRegistered(true);
      localStorage.setItem('matrix_ton_registered', 'true');
      router.push('/tables');
    }} />;
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Matrix TON</h1>
            <p className="text-muted-foreground">Welcome, {data.user.nickname}!</p>
          </div>
          <Badge variant="outline" className="text-sm">
            {data.user.role.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalEarned} TON</div>
            <p className="text-xs text-muted-foreground">+20% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tables</CardTitle>
            <TableIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.activeTables}/12</div>
            <p className="text-xs text-muted-foreground">Tables purchased</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalReferrals}</div>
            <p className="text-xs text-muted-foreground">Active partners</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cycles</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.stats.table1Cycles + data.stats.table2Cycles + data.stats.table3Cycles}
            </div>
            <p className="text-xs text-muted-foreground">Completed cycles</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="payouts">Pending Payouts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Referral Code</span>
                  <Badge variant="secondary">{data.user.referralCode}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Wallet</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {data.user.tonWallet.slice(0, 8)}...{data.user.tonWallet.slice(-6)}
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Member Since</span>
                  <span className="text-sm">
                    {new Date(data.user.registeredAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No recent transactions</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts">
          <Card>
            <CardHeader>
              <CardTitle>Pending Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No pending payouts</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
