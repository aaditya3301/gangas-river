'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { FileText, MapPin, Camera, Send, Loader2, Navigation, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useLocationStore } from '@/lib/store';
import { reportsAPI } from '@/lib/api';
import { toast } from 'sonner';

const categories = [
  { value: 'flood', label: 'Flood / Water Logging', icon: '🌊' },
  { value: 'pollution', label: 'Water Pollution', icon: '🏭' },
  { value: 'infrastructure', label: 'Infrastructure Damage', icon: '🏗️' },
  { value: 'erosion', label: 'Bank Erosion', icon: '⚠️' },
  { value: 'other', label: 'Other Issue', icon: '📋' },
];

interface SubmitResult {
  id: number;
  category: string;
  status: string;
  verification_score: number;
  verification_notes: string;
}

export default function ReportPage() {
  const { latitude, longitude, altitude, isLoading: locationLoading, error: locationError, requestLocation } = useLocationStore();
  const [category, setCategory] = useState<string>('');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);

  const submitMutation = useMutation({
    mutationFn: reportsAPI.submit,
    onSuccess: (data) => {
      setSubmitResult(data);
      toast.success('Report submitted successfully!');
      // Reset form
      setCategory('');
      setDescription('');
      setPhotoUrl('');
    },
    onError: (error: Error) => {
      toast.error('Failed to submit report: ' + error.message);
    },
  });

  const handleSubmit = () => {
    if (!latitude || !longitude) {
      toast.error('Please enable location first');
      return;
    }
    if (!category) {
      toast.error('Please select a category');
      return;
    }
    if (!description.trim()) {
      toast.error('Please add a description');
      return;
    }

    submitMutation.mutate({
      latitude,
      longitude,
      altitude: altitude ?? undefined,
      category,
      description: description.trim(),
      photo_url: photoUrl || undefined,
    });
  };

  const hasLocation = latitude !== null && longitude !== null;
  const isSubmitting = submitMutation.isPending;
  const canSubmit = hasLocation && category && description.trim();

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-200 mb-2">
          <FileText className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Report an Issue</h1>
        <p className="text-slate-600">
          Help your community by reporting flood-related issues
        </p>
      </div>

      {/* Success Result */}
      {submitResult && (
        <Card className="border-0 bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-200">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-white/20 backdrop-blur">
                <CheckCircle className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-lg">Report Submitted!</h3>
              <p className="text-sm text-emerald-100">Report ID: #{submitResult.id}</p>
              
              {/* Verification Info */}
              <div className="bg-white rounded-xl p-4 mt-4 text-left space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Status</span>
                  <Badge variant={submitResult.status === 'verified' ? 'default' : 'secondary'} className="rounded-lg">
                    {submitResult.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">AI Verification</span>
                  <span className="font-bold text-sm text-slate-900">
                    {(submitResult.verification_score * 100).toFixed(0)}%
                  </span>
                </div>
                {submitResult.verification_notes && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-500 block mb-1">Verification Notes:</span>
                    <p className="text-sm text-slate-700">{submitResult.verification_notes}</p>
                  </div>
                )}
              </div>
              
              <Button
                variant="outline"
                onClick={() => setSubmitResult(null)}
                className="mt-4 bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                Submit Another Report
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report Form */}
      {!submitResult && (
        <>
          {/* Location Card */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                Location
              </CardTitle>
              <CardDescription>
                Your GPS coordinates will be attached to the report
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasLocation ? (
                <div className="flex items-center justify-between bg-green-50 rounded-lg p-3">
                  <div>
                    <span className="text-sm font-medium text-green-800">Location captured</span>
                    <p className="text-xs text-green-600 font-mono">
                      {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
                    </p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={requestLocation}
                  disabled={locationLoading}
                >
                  {locationLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Navigation className="h-4 w-4 mr-2" />
                  )}
                  Enable Location
                </Button>
              )}

              {locationError && (
                <Alert variant="destructive" className="mt-3">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{locationError}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Category Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Issue Category</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <span className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Description</CardTitle>
              <CardDescription>
                Describe what you observed (minimum 20 characters)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="E.g., Water has flooded the main road near the market. Approximately 1 foot deep..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {description.length} characters
              </p>
            </CardContent>
          </Card>

          {/* Photo URL (optional) */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Photo (Optional)
              </CardTitle>
              <CardDescription>
                Add a URL to a photo of the issue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                type="url"
                placeholder="https://example.com/photo.jpg"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Send className="h-5 w-5 mr-2" />
            )}
            Submit Report
          </Button>

          {/* AI Verification Info */}
          <div className="bg-blue-50 rounded-xl p-4 space-y-2">
            <h4 className="font-semibold text-blue-900 text-sm">AI-Powered Verification</h4>
            <p className="text-xs text-blue-700">
              Your report will be automatically verified using:
            </p>
            <ul className="text-xs text-blue-600 space-y-1 ml-4">
              <li>• GPS altitude vs LiDAR elevation cross-check</li>
              <li>• Category plausibility analysis</li>
              <li>• Location validity within Ganga corridor</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
