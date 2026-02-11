import { Leaf, Droplets, Sun, CloudRain } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function FarmingPage() {
  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 mb-2">
          <Leaf className="h-8 w-8 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Farming Advisory</h1>
        <p className="text-gray-600">
          AI-powered crop recommendations based on satellite data
        </p>
      </div>

      {/* Coming Soon */}
      <Card className="border-2 border-amber-200 bg-amber-50">
        <CardContent className="pt-6 text-center">
          <Badge className="bg-amber-500 mb-4">Coming Soon</Badge>
          <h3 className="font-semibold text-amber-800 mb-2">
            Satellite-Based Smart Farming
          </h3>
          <p className="text-sm text-amber-700">
            This feature will integrate with Sentinel Hub to provide:
          </p>
        </CardContent>
      </Card>

      {/* Features Preview */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center mb-2">
              <Leaf className="h-5 w-5 text-green-600" />
            </div>
            <CardTitle className="text-sm">NDVI Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-xs">
              Vegetation health index from satellite imagery
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mb-2">
              <Droplets className="h-5 w-5 text-blue-600" />
            </div>
            <CardTitle className="text-sm">Soil Moisture</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-xs">
              Real-time soil moisture index mapping
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center mb-2">
              <Sun className="h-5 w-5 text-amber-600" />
            </div>
            <CardTitle className="text-sm">Crop Advisory</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-xs">
              AI recommendations for your specific plot
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center mb-2">
              <CloudRain className="h-5 w-5 text-purple-600" />
            </div>
            <CardTitle className="text-sm">Irrigation Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-xs">
              When and how much to irrigate
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-xs text-gray-500">
        <p>Powered by Sentinel Hub API & Groundwater Data</p>
      </div>
    </div>
  );
}
