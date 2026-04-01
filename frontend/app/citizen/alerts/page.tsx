'use client';

import { Bell, MessageSquare, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

type AlertItem = {
  id: number;
  type: 'critical' | 'info';
  title: string;
  time: string;
  description: string;
  icon: 'warning' | 'success' | 'bell';
  accent: string;
  faded?: boolean;
};

const DEMO_ALERTS: AlertItem[] = [
  {
    id: 1,
    type: 'critical',
    title: 'Flood Warning: Zone B',
    time: '2h ago',
    description: 'Water level rising above danger mark at Ravidas Ghat. Please avoid the area.',
    icon: 'warning',
    accent: 'border-l-amber-500',
  },
  {
    id: 2,
    type: 'info',
    title: 'Report Verified',
    time: 'Yesterday',
    description: 'Your report regarding "Blocked Drain" in Sector 4 has been verified and forwarded to municipal authorities.',
    icon: 'success',
    accent: 'border-l-emerald-500',
  },
  {
    id: 3,
    type: 'info',
    title: 'Weekly Forecast',
    time: '2 days ago',
    description: 'Expect light to moderate rainfall over the weekend. No flooding is anticipated.',
    icon: 'bell',
    accent: 'border-l-blue-500',
    faded: true,
  },
  {
    id: 4,
    type: 'critical',
    title: 'Evacuation Advisory Update',
    time: '10m ago',
    description: 'Residents near the low-lying riverbank corridor are advised to move to designated shelters.',
    icon: 'warning',
    accent: 'border-l-rose-500',
  },
];

export default function AlertsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [smsEnabled, setSmsEnabled] = useState(true);

  const filteredAlerts = DEMO_ALERTS.filter((item) => {
    if (activeTab === 'all') return true;
    return item.type === activeTab;
  });

  const renderIcon = (icon: AlertItem['icon']) => {
    if (icon === 'warning') return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    if (icon === 'success') return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
    return <Bell className="h-5 w-5 text-blue-500" />;
  };

  return (
    <div className="bg-slate-50 pb-20 md:pb-8">

      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center">
          <h1 className="text-lg md:text-xl font-bold text-slate-900">Notifications</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-4 md:py-6">

        {/* Settings Toggle */}
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-[#006DC4]">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">SMS Alerts</h4>
              <p className="text-xs text-slate-500">
                {smsEnabled ? 'Receive critical updates on your phone' : 'SMS notifications are currently paused'}
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Toggle SMS alerts"
            aria-pressed={smsEnabled}
            onClick={() => setSmsEnabled((prev) => !prev)}
            className={`h-6 w-10 rounded-full relative cursor-pointer transition-colors ${smsEnabled ? 'bg-[#006DC4]' : 'bg-slate-300'}`}
          >
            <span className={`absolute top-1 h-4 w-4 bg-white rounded-full shadow-sm transition-all ${smsEnabled ? 'right-1' : 'left-1'}`} />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4 md:mb-6 overflow-x-auto">
          {['all', 'critical', 'info'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 h-10 rounded-full text-xs font-bold capitalize transition-colors whitespace-nowrap ${activeTab === tab
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-4">
          {filteredAlerts.map((item) => (
            <div
              key={item.id}
              className={`bg-white p-4 rounded-xl border border-l-4 border-slate-100 ${item.accent} shadow-sm flex gap-4 ${item.faded ? 'opacity-75' : ''}`}
            >
              <div className="mt-1">{renderIcon(item.icon)}</div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                  <span className="text-[10px] text-slate-400">{item.time}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
