'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  User,
  Camera,
  Eye,
  Shield,
  AlertTriangle,
  Loader2,
  Filter,
  Search,
  ThumbsUp,
  ThumbsDown,
  Bot
} from 'lucide-react';
import { toast } from 'sonner';

// Mock reports data
const mockReports = [
  {
    id: 1,
    type: 'flood',
    description: 'Water rising rapidly near Dashashwamedh Ghat. Already at knee level.',
    latitude: 25.3109,
    longitude: 83.0107,
    location_name: 'Dashashwamedh Ghat, Varanasi',
    photo_url: '/images/flood-report-1.jpg',
    ai_verification_score: 0.92,
    status: 'pending',
    submitted_at: '2025-01-15T14:45:00Z',
    user: { name: 'Ramesh Kumar', phone: '+91 98765xxxxx' },
  },
  {
    id: 2,
    type: 'blocked_drain',
    description: 'Large drain blocked with debris near market. Causing waterlogging.',
    latitude: 25.3021,
    longitude: 83.0156,
    location_name: 'Godowlia Market, Varanasi',
    photo_url: '/images/drain-report-1.jpg',
    ai_verification_score: 0.78,
    status: 'verified',
    verified_at: '2025-01-15T12:30:00Z',
    submitted_at: '2025-01-15T11:20:00Z',
    user: { name: 'Priya Singh', phone: '+91 87654xxxxx' },
  },
  {
    id: 3,
    type: 'road_damage',
    description: 'Road washed away near bridge. Vehicles cannot pass.',
    latitude: 25.2890,
    longitude: 83.0023,
    location_name: 'Ramnagar Bridge, Varanasi',
    photo_url: null,
    ai_verification_score: 0.65,
    status: 'pending',
    submitted_at: '2025-01-15T10:05:00Z',
    user: { name: 'Suresh Yadav', phone: '+91 76543xxxxx' },
  },
];

type ReportStatus = 'all' | 'pending' | 'verified' | 'rejected';

export default function ReportsPage() {
  const [statusFilter, setStatusFilter] = useState<ReportStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<number | null>(null);

  const verifyMutation = useMutation({
    mutationFn: async ({ id, action }: { id: number; action: 'verify' | 'reject' }) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return { success: true };
    },
    onSuccess: (_, { action }) => {
      toast.success(`Report ${action === 'verify' ? 'verified' : 'rejected'} successfully`);
      setSelectedReport(null);
    },
    onError: (error: Error) => {
      toast.error('Action failed: ' + error.message);
    },
  });

  const filteredReports = mockReports.filter((report) => {
    if (statusFilter !== 'all' && report.status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        report.description.toLowerCase().includes(query) ||
        report.location_name.toLowerCase().includes(query) ||
        report.type.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2 py-1 rounded bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-100 uppercase tracking-wide"><Clock className="h-3 w-3 mr-1" />Pending</span>;
      case 'verified':
        return <span className="inline-flex items-center px-2 py-1 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100 uppercase tracking-wide"><CheckCircle className="h-3 w-3 mr-1" />Verified</span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2 py-1 rounded bg-red-50 text-red-700 text-[10px] font-bold border border-red-100 uppercase tracking-wide"><XCircle className="h-3 w-3 mr-1" />Rejected</span>;
      default:
        return null;
    }
  };

  const pendingCount = mockReports.filter((r) => r.status === 'pending').length;
  const verifiedCount = mockReports.filter((r) => r.status === 'verified').length;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 font-sans">

      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-200 sticky top-[57px] z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Report Validation</h1>
            <p className="text-slate-500 text-xs font-medium mt-1">Review and verify incoming citizen reports</p>
          </div>
          <div className="flex gap-2">
            <div className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-100 text-xs font-bold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {pendingCount} Pending Reviews
            </div>
            <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100 text-xs font-bold flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              {verifiedCount} Verified Today
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* ── Filters ── */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="flex gap-2 p-1 bg-white rounded-xl border border-slate-200 h-11 items-center">
            {['all', 'pending', 'verified', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as ReportStatus)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${statusFilter === status
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* ── Reports List ── */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 border-dashed">
              <p className="text-slate-400 font-medium">No reports matching your criteria</p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div
                key={report.id}
                className={`group bg-white rounded-2xl border p-6 transition-all ${selectedReport === report.id ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-slate-100 shadow-sm hover:border-slate-300'}`}
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-4xl shrink-0">
                        {report.type === 'flood' ? '🌊' : report.type === 'blocked_drain' ? '🚧' : '📍'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-slate-900 capitalize">{report.type.replace('_', ' ')}</h3>
                          {getStatusBadge(report.status)}
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed mb-4">{report.description}</p>

                        <div className="flex flex-wrap gap-4 text-xs text-slate-500 font-medium font-mono">
                          <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50">
                            <MapPin className="h-3 w-3" /> {report.location_name}
                          </span>
                          <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50">
                            <User className="h-3 w-3" /> {report.user.name}
                          </span>
                          <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50">
                            <Clock className="h-3 w-3" /> {new Date(report.submitted_at).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* AI Score */}
                    <div className="ml-16 flex items-center gap-3">
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold ${report.ai_verification_score > 0.8
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                        <Bot className="h-3.5 w-3.5" />
                        AI Score: {(report.ai_verification_score * 100).toFixed(0)}%
                      </div>
                      {report.photo_url && (
                        <span className="text-xs font-bold text-blue-600 flex items-center gap-1 cursor-pointer hover:underline">
                          <Camera className="h-3.5 w-3.5" /> View Photo
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 lg:w-48 lg:border-l lg:border-slate-50 lg:pl-6 justify-center">
                    {report.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => verifyMutation.mutate({ id: report.id, action: 'verify' })}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                        >
                          {verifyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4" />}
                          Verify
                        </button>
                        <button
                          onClick={() => verifyMutation.mutate({ id: report.id, action: 'reject' })}
                          className="w-full py-2.5 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-600 text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                          {verifyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsDown className="h-4 w-4" />}
                          Reject
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setSelectedReport(selectedReport === report.id ? null : report.id)}
                        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
