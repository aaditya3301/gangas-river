'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Bell,
  AlertOctagon,
  Send,
  Clock,
  Users,
  Radio,
  Megaphone,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Smartphone,
  Mail,
  Siren,
  PhoneCall,
  History
} from 'lucide-react';
import { toast } from 'sonner';
import { emergencyAPI } from '@/lib/api';

// Mock alert history
const mockAlertHistory = [
  {
    id: 1,
    title: 'Flash Flood Warning - Hapur',
    message: 'Heavy rainfall expected. Move to higher ground immediately.',
    severity: 'critical',
    zone: 'Garh Road Area',
    sentAt: '2025-01-15T14:30:00Z',
    recipients: 15420,
    channels: ['sms', 'push', 'sirens'],
    status: 'delivered',
  },
  {
    id: 2,
    title: 'Evacuation Advisory - Hapur',
    message: 'Water levels rising. Prepare for possible evacuation.',
    severity: 'warning',
    zone: 'Mandi Area',
    sentAt: '2025-01-15T10:15:00Z',
    recipients: 8930,
    channels: ['sms', 'push'],
    status: 'delivered',
  },
  {
    id: 3,
    title: 'All Clear - Hapur',
    message: 'Flood threat has passed. Safe to return to low-lying areas.',
    severity: 'info',
    zone: 'Delhi Road',
    sentAt: '2025-01-14T18:00:00Z',
    recipients: 22100,
    channels: ['push'],
    status: 'delivered',
  },
];

const zones = [
  { value: 'all', label: 'All Zones' },
  { value: 'garh-road', label: 'Garh Road Area' },
  { value: 'mandi-area', label: 'Mandi Area' },
  { value: 'delhi-road', label: 'Delhi Road' },
  { value: 'civil-lines', label: 'Civil Lines' },
  { value: 'railway-area', label: 'Railway Area' },
];

export default function AlertsPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<string>('warning');
  const [targetZone, setTargetZone] = useState<string>('all');
  const [channels, setChannels] = useState<string[]>(['sms', 'push']);
  const [showConfirm, setShowConfirm] = useState(false);

  const sendAlertMutation = useMutation({
    mutationFn: async (data: { title: string; message: string; severity: string; zone: string; channels: string[] }) => {
      // Format message with title since backend takes a single message string
      const formattedMessage = `*${data.title.toUpperCase()}*\n\n${data.message}`;
      return await emergencyAPI.activate({
        message: formattedMessage,
        severity: data.severity
      });
    },
    onSuccess: (data: any) => {
      toast.success(`Broadcast Initiated`, {
        description: `Sent to ${data.successful} / ${data.total} emergency contacts.`
      });
      setTitle('');
      setMessage('');
      setShowConfirm(false);
    },
    onError: (error: any) => {
      toast.error('Broadcast Failed', {
        description: error.message || 'Check connection details'
      });
    },
  });

  const handleSend = () => {
    if (!title || !message) {
      toast.error('Please fill in all fields');
      return;
    }
    setShowConfirm(true);
  };

  const confirmSend = () => {
    sendAlertMutation.mutate({ title, message, severity, zone: targetZone, channels });
  };

  const toggleChannel = (channel: string) => {
    if (channels.includes(channel)) {
      setChannels(channels.filter(c => c !== channel));
    } else {
      setChannels([...channels, channel]);
    }
  };

  return (
    <div className="pb-6 md:pb-10 font-sans">

      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-200 sticky top-14 md:top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Broadcast Alerts</h1>
            <p className="text-slate-500 text-xs font-medium mt-1">Send emergency notifications to citizens</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <Radio className="h-3.5 w-3.5 text-red-500 animate-pulse" />
            SYSTEM ONLINE
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">

        {/* ── Send Alert Form ── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg md:rounded-2xl border border-slate-100 shadow-sm p-4 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600">
                <Megaphone className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Compose Alert</h2>
                <p className="text-sm text-slate-500">Select target zone and severity level</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Target Zone</label>
                  <select
                    value={targetZone}
                    onChange={(e) => setTargetZone(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  >
                    {zones.map(z => <option key={z.value} value={z.value}>{z.label}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Severity Level</label>
                  <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
                    {['info', 'warning', 'critical'].map((sev) => (
                      <button
                        key={sev}
                        onClick={() => setSeverity(sev)}
                        className={`flex-1 h-10 rounded-lg text-xs font-bold capitalize transition-all ${severity === sev
                          ? sev === 'critical' ? 'bg-red-500 text-white shadow-md' :
                            sev === 'warning' ? 'bg-amber-500 text-white shadow-md' : 'bg-blue-500 text-white shadow-md'
                          : 'text-slate-500 hover:bg-slate-200'
                          }`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Alert Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Flash Flood Warning"
                  className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Message Content</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe the emergency and required actions..."
                  className="w-full h-32 rounded-xl border border-slate-200 bg-white p-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all resize-none"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase">Delivery Channels</label>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => toggleChannel('sms')} className={`flex items-center gap-2 px-4 h-10 rounded-lg text-sm font-bold border transition-all ${channels.includes('sms') ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200'}`}>
                    <Smartphone className="h-4 w-4" /> SMS
                  </button>
                  <button onClick={() => toggleChannel('push')} className={`flex items-center gap-2 px-4 h-10 rounded-lg text-sm font-bold border transition-all ${channels.includes('push') ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-500 border-slate-200'}`}>
                    <Bell className="h-4 w-4" /> Push Notif
                  </button>
                  <button onClick={() => toggleChannel('sirens')} className={`flex items-center gap-2 px-4 h-10 rounded-lg text-sm font-bold border transition-all ${channels.includes('sirens') ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-500 border-slate-200'}`}>
                    <Siren className="h-4 w-4" /> Public Sirens
                  </button>
                </div>
              </div>

              {!showConfirm ? (
                <button
                  onClick={handleSend}
                  className="w-full h-11 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-lg shadow-violet-600/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Review & Broadcast
                </button>
              ) : (
                <div className="bg-red-50 rounded-xl p-4 border border-red-100 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-red-800">Confirm Broadcast?</p>
                      <p className="text-xs text-red-600 mt-0.5">This will immediately notify ~12,500 citizens in the selected zone.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={confirmSend}
                      disabled={sendAlertMutation.isPending}
                      className="flex-1 h-10 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                    >
                      {sendAlertMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radio className="h-4 w-4" />}
                      CONFIRM SEND
                    </button>
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="px-4 h-10 bg-white border border-red-200 text-red-700 font-bold rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Side Panel: History ── */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full max-h-[600px]">
            <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <History className="h-4 w-4 text-slate-400" />
                Recent Alerts
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {mockAlertHistory.map((alert) => (
                <div key={alert.id} className="p-4 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors shadow-sm group">
                  <div className="flex items-start justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${alert.severity === 'critical' ? 'bg-red-100 text-red-700' :
                      alert.severity === 'warning' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                      {alert.severity}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      {new Date(alert.sentAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1 line-clamp-1">{alert.title}</h4>
                  <p className="text-xs text-slate-500 mb-3 line-clamp-2">{alert.message}</p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                      <Users className="h-3 w-3" />
                      {alert.recipients.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                      <CheckCircle className="h-3 w-3" />
                      {alert.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
