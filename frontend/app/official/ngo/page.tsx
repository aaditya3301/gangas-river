'use client';

import { useState } from 'react';
import {
  Award,
  Trophy,
  Download,
  Upload,
  FileText,
  CheckCircle2,
  Star,
  TrendingUp,
  Users,
  Calendar,
  MapPin,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const leaderboardData = [
  {
    rank: 1,
    name: 'Red Cross Hapur',
    points: 2850,
    reports: 47,
    lastActive: '2 hours ago',
    award: '🏆',
    verified: true,
  },
  {
    rank: 2,
    name: 'Green Earth Foundation',
    points: 2640,
    reports: 42,
    lastActive: '5 hours ago',
    award: '🥈',
    verified: true,
  },
  {
    rank: 3,
    name: 'River Care Initiative',
    points: 2360,
    reports: 38,
    lastActive: '1 day ago',
    award: '🥉',
    verified: true,
  },
  {
    rank: 4,
    name: 'Community First',
    points: 2180,
    reports: 35,
    lastActive: '1 day ago',
    award: '',
    verified: true,
  },
  {
    rank: 5,
    name: 'Hope Foundation',
    points: 1920,
    reports: 31,
    lastActive: '2 days ago',
    award: '',
    verified: false,
  },
];

export default function NGOPage() {
  const [formData, setFormData] = useState({
    ngoName: '',
    contactPerson: '',
    location: '',
    peopleHelped: '',
    resourcesProvided: '',
    activitiesDescription: '',
  });

  const handleDownloadGuidelines = () => {
    window.open('/Hapur_Community_Based_Flood_Adaptation_Guidelines_2026.pdf', '_blank');
    toast.success('Opening NGO Guidelines Documentation...');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.ngoName || !formData.contactPerson || !formData.activitiesDescription) {
      toast.error('Please fill in all required fields');
      return;
    }

    toast.success('Report submitted successfully!', {
      description: 'Your submission will be reviewed and points will be awarded.',
    });

    // Reset form
    setFormData({
      ngoName: '',
      contactPerson: '',
      location: '',
      peopleHelped: '',
      resourcesProvided: '',
      activitiesDescription: '',
    });
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-14 md:top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Award className="h-6 w-6 text-violet-600" />
                NGO Portal
              </h1>
              <p className="text-sm text-slate-500 mt-1">Track performance and submit activity reports</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">
        
        {/* NGO Leaderboard */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-violet-50 to-purple-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-bold text-slate-900">NGO Leaderboard</h2>
              </div>
              <div className="text-xs text-slate-500">Updated in real-time</div>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">NGO Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Points</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Reports</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaderboardData.map((ngo) => (
                  <tr key={ngo.rank} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{ngo.award}</span>
                        <span className="font-bold text-slate-900 text-lg">#{ngo.rank}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">{ngo.name}</span>
                        {ngo.verified && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-amber-500" />
                        <span className="font-bold text-slate-900">{ngo.points.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{ngo.reports} reports</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-500">{ngo.lastActive}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Guidelines Section */}
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-violet-600" />
              <h3 className="font-bold text-slate-900">NGO Guidelines</h3>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>Registration & verification process</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>Reporting requirements & deadlines</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>Safety protocols to follow</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>Points system explained</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>Resource allocation guidelines</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>Code of conduct & ethics</span>
              </div>
            </div>

            <Button 
              onClick={handleDownloadGuidelines}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Full Documentation
            </Button>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> All NGOs must follow these guidelines to maintain their verification status.
              </p>
            </div>
          </div>

          {/* Report Submission Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl border shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <Upload className="h-5 w-5 text-violet-600" />
              <h3 className="font-bold text-slate-900">Submit Activity Report</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    NGO Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.ngoName}
                    onChange={(e) => setFormData({ ...formData, ngoName: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="Enter your NGO name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Contact Person <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="Your name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="Area/ward where activity was done"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Users className="h-4 w-4 inline mr-1" />
                    People Helped
                  </label>
                  <input
                    type="number"
                    value={formData.peopleHelped}
                    onChange={(e) => setFormData({ ...formData, peopleHelped: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="Number of people"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Heart className="h-4 w-4 inline mr-1" />
                  Resources Provided
                </label>
                <input
                  type="text"
                  value={formData.resourcesProvided}
                  onChange={(e) => setFormData({ ...formData, resourcesProvided: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="e.g., Food packets, Blankets, Medical supplies"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Activity Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.activitiesDescription}
                  onChange={(e) => setFormData({ ...formData, activitiesDescription: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-32"
                  placeholder="Describe what activities your NGO performed, impact created, and any challenges faced..."
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white h-11"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Submit Report
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormData({
                    ngoName: '',
                    contactPerson: '',
                    location: '',
                    peopleHelped: '',
                    resourcesProvided: '',
                    activitiesDescription: '',
                  })}
                  className="px-6 h-11"
                >
                  Clear
                </Button>
              </div>
            </form>

            <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800">
                <strong>Tip:</strong> Include specific numbers, locations, and timestamps for faster verification and higher points!
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
