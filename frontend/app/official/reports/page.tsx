'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { reportsAPI } from '@/lib/api';
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
  {
    id: 4,
    type: 'flood',
    description: 'False flood report - actually just normal puddle',
    latitude: 25.3200,
    longitude: 83.0250,
    location_name: 'Cantt Area, Varanasi',
    photo_url: '/images/false-report.jpg',
    ai_verification_score: 0.23,
    status: 'rejected',
    rejected_at: '2025-01-14T16:00:00Z',
    submitted_at: '2025-01-14T15:30:00Z',
    rejection_reason: 'AI and manual verification confirmed false report',
    user: { name: 'Anonymous', phone: null },
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
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'verified':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return null;
    }
  };

  const getAIScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'flood':
        return '🌊';
      case 'blocked_drain':
        return '🚰';
      case 'road_damage':
        return '🚧';
      default:
        return '📍';
    }
  };

  const pendingCount = mockReports.filter((r) => r.status === 'pending').length;
  const verifiedCount = mockReports.filter((r) => r.status === 'verified').length;
  const rejectedCount = mockReports.filter((r) => r.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Community Reports</h1>
        <p className="text-gray-500">Review and verify citizen flood reports</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Reports</p>
                <p className="text-2xl font-bold">{mockReports.length}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Verified</p>
                <p className="text-2xl font-bold text-green-600">{verifiedCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ReportStatus)}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              No reports found matching your filters
            </CardContent>
          </Card>
        ) : (
          filteredReports.map((report) => (
            <Card key={report.id} className={`transition-all ${selectedReport === report.id ? 'ring-2 ring-blue-500' : ''}`}>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4 lg:flex-row">
                  {/* Left: Report Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-2xl">{getTypeIcon(report.type)}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-gray-900 capitalize">
                            {report.type.replace('_', ' ')}
                          </span>
                          {getStatusBadge(report.status)}
                        </div>
                        <p className="text-sm text-gray-600">{report.description}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {report.location_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(report.submitted_at).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {report.user.name}
                      </span>
                    </div>

                    {/* AI Score */}
                    <div className="flex items-center gap-2">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${getAIScoreColor(report.ai_verification_score)}`}>
                        <Bot className="h-4 w-4" />
                        AI Score: {(report.ai_verification_score * 100).toFixed(0)}%
                      </div>
                      {report.ai_verification_score >= 0.8 && (
                        <span className="text-xs text-green-600">High confidence</span>
                      )}
                      {report.ai_verification_score < 0.5 && (
                        <span className="text-xs text-red-600">Low confidence - needs manual review</span>
                      )}
                    </div>

                    {report.status === 'rejected' && report.rejection_reason && (
                      <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        Rejection reason: {report.rejection_reason}
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col gap-2 lg:w-40">
                    {report.photo_url && (
                      <Button variant="outline" size="sm">
                        <Camera className="h-4 w-4 mr-2" />
                        View Photo
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedReport(selectedReport === report.id ? null : report.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {selectedReport === report.id ? 'Close' : 'Details'}
                    </Button>

                    {report.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => verifyMutation.mutate({ id: report.id, action: 'verify' })}
                          disabled={verifyMutation.isPending}
                        >
                          {verifyMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <ThumbsUp className="h-4 w-4 mr-2" />
                          )}
                          Verify
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => verifyMutation.mutate({ id: report.id, action: 'reject' })}
                          disabled={verifyMutation.isPending}
                        >
                          {verifyMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <ThumbsDown className="h-4 w-4 mr-2" />
                          )}
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedReport === report.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <h4 className="font-medium text-sm text-gray-900 mb-2">Location Details</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>Coordinates: {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}</p>
                          <p>Address: {report.location_name}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-gray-900 mb-2">Reporter Info</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>Name: {report.user.name}</p>
                          <p>Phone: {report.user.phone || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
