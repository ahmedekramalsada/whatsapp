"use client";

import { useEffect, useState } from 'react';
import { 
  Card, 
  AreaChart, 
  DonutChart, 
  Title, 
  Text, 
  Flex, 
  Badge, 
  Grid,
  Metric
} from '@tremor/react';
import { TrendingUp, Send, Smartphone, Activity, Users } from 'lucide-react';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/analytics`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch analytics:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-10 animate-pulse space-y-8 h-full bg-zinc-50 dark:bg-black">
        <div className="h-10 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
        <Grid numItemsLg={3} className="gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />)}
        </Grid>
        <div className="h-96 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
      </div>
    );
  }

  const kpis = [
    { title: 'Total Messages', metric: (data?.totalSent || 0) + (data?.totalReceived || 0), icon: MessageCircle, color: 'indigo' },
    { title: 'Sent', metric: data?.totalSent || 0, icon: Send, color: 'emerald' },
    { title: 'Received', metric: data?.totalReceived || 0, icon: Smartphone, color: 'amber' },
  ];

  return (
    <div className="p-8 h-full bg-zinc-50 dark:bg-black overflow-y-auto">
      <header className="mb-10">
         <Flex justifyContent="start" className="gap-2 items-center mb-1">
            <TrendingUp className="w-6 h-6 text-indigo-500" />
            <Title className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Performance Analytics</Title>
         </Flex>
         <Text className="text-zinc-500">Real-time metrics from your WhatsApp Business Account</Text>
      </header>

      <Grid numItemsLg={3} className="gap-6 mb-8">
        {kpis.map((item) => (
          <Card key={item.title} decoration="top" decorationColor={item.color as any} className="dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all">
            <Flex justifyContent="start" className="gap-4">
               <div className={`p-3 rounded-xl bg-${item.color}-500/10`}>
                  <item.icon className={`w-6 h-6 text-${item.color}-500`} />
               </div>
               <div>
                  <Text className="font-bold text-zinc-400 uppercase text-[10px] tracking-widest">{item.title}</Text>
                  <Metric className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{item.metric}</Metric>
               </div>
            </Flex>
          </Card>
        ))}
      </Grid>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Volume Chart */}
        <Card className="lg:col-span-2 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
          <Title className="text-lg font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" /> Messaging Volume (Last 7 Days)
          </Title>
          <AreaChart
            className="h-72 mt-4"
            data={data?.dailyVolume || []}
            index="date"
            categories={["count"]}
            colors={["indigo"]}
            showLegend={false}
            showYAxis={false}
            startEndOnly={true}
          />
        </Card>

        {/* Status Distribution */}
        <Card className="dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
          <Title className="text-lg font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" /> Status Distribution
          </Title>
          <DonutChart
            className="h-64 mt-4"
            data={data?.statusDistribution || []}
            index="status"
            category="count"
            colors={["emerald", "indigo", "amber", "rose", "zinc"]}
          />
          <div className="mt-6 space-y-2">
            {data?.statusDistribution?.map((s: any) => (
               <Flex key={s.status} className="text-xs">
                  <Text className="font-medium text-zinc-500">{s.status}</Text>
                  <Badge size="xs" color="zinc">{s.count}</Badge>
               </Flex>
            ))}
          </div>
        </Card>
      </div>

      <footer className="mt-10 border-t border-zinc-200 dark:border-zinc-800 pt-6">
         <Flex>
            <Text className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">System Status: <span className="text-emerald-500">Operational</span></Text>
            <Text className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">Last Updated: {new Date().toLocaleTimeString()}</Text>
         </Flex>
      </footer>
    </div>
  );
}

// Helper icons that were missing
import { MessageCircle, CheckCircle } from 'lucide-react';
