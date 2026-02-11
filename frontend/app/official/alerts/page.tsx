'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
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
  PhoneCall
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { emergencyAPI } from '@/lib/api';

// Mock alert history
const mockAlertHistory = [
  {
    id: 1,
    title: 'Flash Flood Warning - Varanasi',
    message: 'Heavy rainfall expected. Move to higher ground immediately.',
    severity: 'critical',
    zone: 'Varanasi Ghats',
    sentAt: '2025-01-15T14:30:00Z',
    recipients: 15420,
    channels: ['sms', 'push', 'sirens'],
    status: 'delivered',
  },
  {
    id: 2,
    title: 'Evacuation Advisory - Allahabad',
    message: 'Water levels rising. Prepare for possible evacuation.',
    severity: 'warning',
    zone: 'Sangam Area',
    sentAt: '2025-01-15T10:15:00Z',
    recipients: 8930,
    channels: ['sms', 'push'],
    status: 'delivered',
  },
  {
    id: 3,
    title: 'All Clear - Patna',
    message: 'Flood threat has passed. Safe to return to low-lying areas.',
    severity: 'info',
    zone: 'Patna Riverside',
    sentAt: '2025-01-14T18:00:00Z',
    recipients: 22100,
    channels: ['push'],
    status: 'delivered',
  },
];

const zones = [
  { value: 'all', label: 'All Zones' },
  { value: 'varanasi-ghats', label: 'Varanasi Ghats' },
  { value: 'varanasi-city', label: 'Varanasi City' },
  { value: 'allahabad-sangam', label: 'Allahabad Sangam' },
  { value: 'patna-riverside', label: 'Patna Riverside' },
];

export default function AlertsPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<string>('warning');
  const [targetZone, setTargetZone] = useState<string>('all');
  const [channels, setChannels] = useState<string[]>(['sms', 'push']);
  const [phoneNumbers, setPhoneNumbers] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const sendAlertMutation = useMutation({
    mutationFn: async (data: { title: string; message: string; severity: string; zone: string; channels: string[] }) => {
      // In production, this would call the API
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return { success: true, recipients: Math.floor(Math.random() * 20000) + 5000 };
    },
    onSuccess: (data) => {
      toast.success(`Alert sent to ${data.recipients.toLocaleString()} recipients!`);
      setTitle('');
      setMessage('');
      setShowConfirm(false);
    },
    onError: (error: Error) => {
      toast.error('Failed to send alert: ' + error.message);
    },
  });

  const handleSend = () => {
    if (!title || !message) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (channels.length === 0) {
      toast.error('Please select at least one channel');
      return;
    }
    setShowConfirm(true);
  };

  const emergencyCallMutation = useMutation({
    mutationFn: emergencyAPI.activate,
    onSuccess: (data: any) => {
      toast.success(`Voice calls initiated! ${data.successful}/${data.total_calls} calls successful.`);
      setShowConfirm(false);
      setPhoneNumbers('');
    },
    onError: (error: any) => {
      const detail = error?.response?.data?.detail || error.message || 'Unknown error';
      toast.error(`Voice call failed: ${detail}`);
    },
  });

  const confirmSend = () => {
    // If voice call channel is selected, also trigger Twilio calls
    if (channels.includes('voice')) {
      const numbers = phoneNumbers.split(',').map(n => n.trim()).filter(n => n.length > 0);
      if (numbers.length === 0) {
        toast.error('Please enter phone numbers for voice call channel');
        return;
      }
      emergencyCallMutation.mutate({
        title,
        message,
        severity,
        phone_numbers: numbers,
      });
    }

    // Also send the regular alert (SMS, push, etc.)
    sendAlertMutation.mutate({
      title,
      message,
      severity,
      zone: targetZone,
      channels,
    });
  };

  const toggleChannel = (channel: string) => {
    if (channels.includes(channel)) {
      setChannels(channels.filter((c) => c !== channel));
    } else {
      setChannels([...channels, channel]);
    }
  };

  const getSeverityStyles = (sev: string) => {
    switch (sev) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (sev: string) => {
    switch (sev) {
      case 'critical':
        return <AlertOctagon className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'info':
        return <Bell className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const totalReached = mockAlertHistory.reduce((sum, a) => sum + a.recipients, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-200">
          <Siren className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Emergency Alerts</h1>
          <p className="text-slate-500">Broadcast critical notifications to citizens</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Alerts Sent Today</p>
                <p className="text-3xl font-bold text-slate-900">3</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <Megaphone className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">People Reached</p>
                <p className="text-3xl font-bold text-slate-900">{totalReached.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Delivery Rate</p>
                <p className="text-3xl font-bold text-slate-900">98.5%</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                <CheckCircle className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* New Alert Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Siren className="h-5 w-5 text-red-500" />
              Broadcast New Alert
            </CardTitle>
            <CardDescription>Send emergency notifications to affected zones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Alert Title *
              </label>
              <Input
                placeholder="e.g., Flash Flood Warning - Varanasi"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Message *
              </label>
              <Textarea
                placeholder="Enter the alert message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-gray-400 mt-1">{message.length}/160 characters (SMS limit)</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Severity Level
                </label>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info (Blue)</SelectItem>
                    <SelectItem value="warning">Warning (Yellow)</SelectItem>
                    <SelectItem value="critical">Critical (Red)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Target Zone
                </label>
                <Select value={targetZone} onValueChange={setTargetZone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map((zone) => (
                      <SelectItem key={zone.value} value={zone.value}>
                        {zone.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Notification Channels
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={channels.includes('sms') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleChannel('sms')}
                >
                  <Smartphone className="h-4 w-4 mr-1" />
                  SMS
                </Button>
                <Button
                  type="button"
                  variant={channels.includes('push') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleChannel('push')}
                >
                  <Bell className="h-4 w-4 mr-1" />
                  Push
                </Button>
                <Button
                  type="button"
                  variant={channels.includes('email') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleChannel('email')}
                >
                  <Mail className="h-4 w-4 mr-1" />
                  Email
                </Button>
                <Button
                  type="button"
                  variant={channels.includes('sirens') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleChannel('sirens')}
                >
                  <Radio className="h-4 w-4 mr-1" />
                  Sirens
                </Button>
                <Button
                  type="button"
                  variant={channels.includes('voice') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleChannel('voice')}
                >
                  <PhoneCall className="h-4 w-4 mr-1" />
                  Voice Call
                </Button>
              </div>
            </div>

            {channels.includes('voice') && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Voice Call Phone Numbers *
                </label>
                <Textarea
                  placeholder="Enter phone numbers separated by commas&#10;e.g. +919876543210, +919876543211"
                  value={phoneNumbers}
                  onChange={(e) => setPhoneNumbers(e.target.value)}
                  rows={2}
                />
                <p className="text-xs text-gray-400 mt-1">
                  E.164 format required. Twilio trial accounts can only call verified numbers.
                </p>
              </div>
            )}

            {showConfirm ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg space-y-3">
                <p className="text-sm font-medium text-yellow-800">
                  ⚠️ Confirm Emergency Alert Broadcast
                </p>
                <p className="text-xs text-yellow-700">
                  This will send a {severity.toUpperCase()} alert to {targetZone === 'all' ? 'ALL zones' : targetZone} via {channels.join(', ').toUpperCase()}.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={confirmSend}
                    disabled={sendAlertMutation.isPending || emergencyCallMutation.isPending}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {sendAlertMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Confirm & Send
                  </Button>
                  <Button variant="outline" onClick={() => setShowConfirm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={handleSend} className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Review & Send Alert
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Alert History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>Last 24 hours of emergency broadcasts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockAlertHistory.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${getSeverityStyles(alert.severity)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(alert.severity)}
                    <span className="font-medium text-sm">{alert.title}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                    {alert.status}
                  </Badge>
                </div>

                <p className="text-sm opacity-80 mb-3">{alert.message}</p>

                <div className="flex flex-wrap gap-3 text-xs opacity-70">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(alert.sentAt).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {alert.recipients.toLocaleString()} reached
                  </span>
                  <span>
                    Channels: {alert.channels.join(', ').toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
