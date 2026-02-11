'use client';

import { useState } from 'react';
import {
  Code,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Key,
  Lock,
  Zap,
  Database,
  MapPin,
  AlertTriangle,
  Route,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const endpoints = [
  {
    id: 'safety-check',
    method: 'GET',
    path: '/api/safety/check',
    description: 'Check flood risk at a specific GPS location',
    category: 'Safety',
    icon: MapPin,
    params: [
      { name: 'lat', type: 'number', required: true, description: 'Latitude coordinate' },
      { name: 'lng', type: 'number', required: true, description: 'Longitude coordinate' },
    ],
    response: `{
  "is_safe": true,
  "risk_level": "low",
  "zone": "C",
  "elevation": 78.5,
  "nearest_shelter": {
    "name": "Community Center",
    "distance_km": 2.3
  }
}`,
    example: 'GET /api/safety/check?lat=25.3176&lng=83.0065',
  },
  {
    id: 'zones-classify',
    method: 'POST',
    path: '/api/zones/classify',
    description: 'Classify a location into flood zones (A/B/C) based on elevation',
    category: 'Zones',
    icon: Database,
    params: [
      { name: 'latitude', type: 'number', required: true, description: 'Latitude coordinate' },
      { name: 'longitude', type: 'number', required: true, description: 'Longitude coordinate' },
    ],
    response: `{
  "zone": "B",
  "elevation": 72.3,
  "flood_depths": {
    "1m_rise": 0,
    "3m_rise": 0.7,
    "5m_rise": 2.7
  },
  "restrictions": [
    "No permanent structures below 75m"
  ]
}`,
    example: `POST /api/zones/classify
{
  "latitude": 25.3176,
  "longitude": 83.0065
}`,
  },
  {
    id: 'predict-flood',
    method: 'POST',
    path: '/api/predict/flood',
    description: 'AI-powered flood risk prediction for next 72 hours',
    category: 'Prediction',
    icon: Zap,
    params: [
      { name: 'latitude', type: 'number', required: true, description: 'Latitude coordinate' },
      { name: 'longitude', type: 'number', required: true, description: 'Longitude coordinate' },
      { name: 'hours', type: 'number', required: false, description: 'Prediction horizon (default: 72)' },
    ],
    response: `{
  "predictions": [
    { "hour": 24, "risk": 0.15, "water_level": 68.2 },
    { "hour": 48, "risk": 0.45, "water_level": 71.5 },
    { "hour": 72, "risk": 0.72, "water_level": 74.8 }
  ],
  "peak_risk_hour": 72,
  "recommended_action": "prepare_evacuation"
}`,
    example: `POST /api/predict/flood
{
  "latitude": 25.3176,
  "longitude": 83.0065,
  "hours": 72
}`,
  },
  {
    id: 'reports-submit',
    method: 'POST',
    path: '/api/reports/submit',
    description: 'Submit a community flood report with optional photo',
    category: 'Reports',
    icon: FileText,
    params: [
      { name: 'type', type: 'string', required: true, description: 'Report type: flood, blocked_drain, road_damage' },
      { name: 'description', type: 'string', required: true, description: 'Detailed description' },
      { name: 'latitude', type: 'number', required: true, description: 'Location latitude' },
      { name: 'longitude', type: 'number', required: true, description: 'Location longitude' },
      { name: 'photo_base64', type: 'string', required: false, description: 'Base64 encoded photo' },
    ],
    response: `{
  "id": 123,
  "status": "pending",
  "ai_verification_score": 0.87,
  "created_at": "2025-01-15T14:30:00Z"
}`,
    example: `POST /api/reports/submit
{
  "type": "flood",
  "description": "Water rising near ghat",
  "latitude": 25.3109,
  "longitude": 83.0107
}`,
  },
  {
    id: 'evacuation-route',
    method: 'GET',
    path: '/api/evacuation/route',
    description: 'Calculate safest evacuation route to nearest shelter',
    category: 'Evacuation',
    icon: Route,
    params: [
      { name: 'start_lat', type: 'number', required: true, description: 'Starting latitude' },
      { name: 'start_lng', type: 'number', required: true, description: 'Starting longitude' },
      { name: 'preference', type: 'string', required: false, description: 'Route type: safest, fastest, shortest' },
    ],
    response: `{
  "distance_km": 3.2,
  "estimated_time_min": 15,
  "safety_score": 85,
  "shelter": {
    "name": "Community Center",
    "capacity": 500,
    "occupancy": 120
  },
  "waypoints": [...]
}`,
    example: 'GET /api/evacuation/route?start_lat=25.31&start_lng=83.01&preference=safest',
  },
  {
    id: 'alerts-active',
    method: 'GET',
    path: '/api/alerts/active',
    description: 'Get all currently active flood alerts',
    category: 'Alerts',
    icon: AlertTriangle,
    params: [
      { name: 'zone', type: 'string', required: false, description: 'Filter by zone name' },
      { name: 'severity', type: 'string', required: false, description: 'Filter by severity: info, warning, critical' },
    ],
    response: `{
  "alerts": [
    {
      "id": 1,
      "title": "Flash Flood Warning",
      "severity": "critical",
      "zone": "Varanasi Ghats",
      "message": "Move to higher ground",
      "created_at": "2025-01-15T14:30:00Z"
    }
  ],
  "total": 1
}`,
    example: 'GET /api/alerts/active?severity=critical',
  },
];

const codeExamples = {
  python: `import requests

API_KEY = "your-api-key"
BASE_URL = "https://api.aquaguardians.in"

headers = {"Authorization": f"Bearer {API_KEY}"}

# Check flood safety
response = requests.get(
    f"{BASE_URL}/api/safety/check",
    params={"lat": 25.3176, "lng": 83.0065},
    headers=headers
)
print(response.json())`,
  javascript: `const API_KEY = 'your-api-key';
const BASE_URL = 'https://api.aquaguardians.in';

// Check flood safety
const response = await fetch(
  \`\${BASE_URL}/api/safety/check?lat=25.3176&lng=83.0065\`,
  {
    headers: {
      'Authorization': \`Bearer \${API_KEY}\`
    }
  }
);
const data = await response.json();
console.log(data);`,
  curl: `curl -X GET "https://api.aquaguardians.in/api/safety/check?lat=25.3176&lng=83.0065" \\
  -H "Authorization: Bearer your-api-key" \\
  -H "Content-Type: application/json"`,
};

export default function ApiDocsPage() {
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<'python' | 'javascript' | 'curl'>('python');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-green-100 text-green-800';
      case 'POST':
        return 'bg-blue-100 text-blue-800';
      case 'PUT':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Documentation</h1>
          <p className="text-gray-500">REST API reference for flood prediction and monitoring</p>
        </div>
        <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer">
          <Button variant="outline">
            <ExternalLink className="h-4 w-4 mr-2" />
            OpenAPI Spec
          </Button>
        </a>
      </div>

      {/* Auth Section */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <Key className="h-5 w-5" />
            Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-amber-800">
            All API requests require a Bearer token in the Authorization header.
          </p>
          <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm overflow-x-auto">
            Authorization: Bearer your-api-key
          </div>
          <div className="flex items-center gap-2 text-xs text-amber-700">
            <Lock className="h-4 w-4" />
            Rate limit: 1000 requests/hour per API key
          </div>
        </CardContent>
      </Card>

      {/* Quick Start */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
          <CardDescription>Get started with a simple API call</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            {(['python', 'javascript', 'curl'] as const).map((lang) => (
              <Button
                key={lang}
                variant={selectedLang === lang ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedLang(lang)}
              >
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </Button>
            ))}
          </div>
          <div className="relative">
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              {codeExamples[selectedLang]}
            </pre>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
              onClick={() => copyToClipboard(codeExamples[selectedLang], 'quickstart')}
            >
              {copiedId === 'quickstart' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Endpoints */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Endpoints</h2>
        
        {endpoints.map((endpoint) => (
          <Card key={endpoint.id} className="overflow-hidden">
            <button
              className="w-full text-left"
              onClick={() => setExpandedEndpoint(expandedEndpoint === endpoint.id ? null : endpoint.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  {expandedEndpoint === endpoint.id ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                  <Badge className={`text-xs font-mono ${getMethodColor(endpoint.method)}`}>
                    {endpoint.method}
                  </Badge>
                  <code className="font-mono text-sm text-gray-900">{endpoint.path}</code>
                  <Badge variant="outline" className="text-xs ml-auto">
                    {endpoint.category}
                  </Badge>
                </div>
                <CardDescription className="ml-7 mt-1">{endpoint.description}</CardDescription>
              </CardHeader>
            </button>

            {expandedEndpoint === endpoint.id && (
              <CardContent className="border-t bg-gray-50 space-y-4">
                {/* Parameters */}
                <div>
                  <h4 className="font-medium text-sm text-gray-900 mb-2">Parameters</h4>
                  <div className="bg-white rounded-lg border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="text-left px-3 py-2 font-medium">Name</th>
                          <th className="text-left px-3 py-2 font-medium">Type</th>
                          <th className="text-left px-3 py-2 font-medium">Required</th>
                          <th className="text-left px-3 py-2 font-medium">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {endpoint.params.map((param) => (
                          <tr key={param.name} className="border-t">
                            <td className="px-3 py-2 font-mono text-purple-600">{param.name}</td>
                            <td className="px-3 py-2 text-gray-600">{param.type}</td>
                            <td className="px-3 py-2">
                              {param.required ? (
                                <Badge variant="destructive" className="text-xs">Required</Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">Optional</Badge>
                              )}
                            </td>
                            <td className="px-3 py-2 text-gray-600">{param.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Example Request */}
                <div>
                  <h4 className="font-medium text-sm text-gray-900 mb-2">Example Request</h4>
                  <div className="relative">
                    <pre className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-xs overflow-x-auto">
                      {endpoint.example}
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-1 right-1 text-gray-400 hover:text-white h-6 w-6 p-0"
                      onClick={() => copyToClipboard(endpoint.example, `example-${endpoint.id}`)}
                    >
                      {copiedId === `example-${endpoint.id}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>

                {/* Response */}
                <div>
                  <h4 className="font-medium text-sm text-gray-900 mb-2">Response</h4>
                  <div className="relative">
                    <pre className="bg-gray-900 text-blue-400 p-3 rounded-lg font-mono text-xs overflow-x-auto">
                      {endpoint.response}
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-1 right-1 text-gray-400 hover:text-white h-6 w-6 p-0"
                      onClick={() => copyToClipboard(endpoint.response, `response-${endpoint.id}`)}
                    >
                      {copiedId === `response-${endpoint.id}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
