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
];

const codeExamples = {
  python: `import requests

API_KEY = "ag_live_sk_3f8a9b2c1d4e5f6a7b8c9d0e1f2a3b4c"
BASE_URL = "https://api.aquaguardians.in"

headers = {"Authorization": f"Bearer {API_KEY}"}

# Check flood safety
response = requests.get(
    f"{BASE_URL}/api/safety/check",
    params={"lat": 25.3176, "lng": 83.0065},
    headers=headers
)
print(response.json())`,
  javascript: `const API_KEY = 'ag_live_sk_3f8a9b2c1d4e5f6a7b8c9d0e1f2a3b4c';
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
      case 'GET': return 'bg-emerald-100 text-emerald-700';
      case 'POST': return 'bg-blue-100 text-blue-700';
      case 'PUT': return 'bg-amber-100 text-amber-700';
      case 'DELETE': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-6 md:pb-10 font-sans">

      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-200 sticky top-14 lg:top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">API Reference</h1>
            <p className="text-slate-500 text-xs font-medium mt-1">Integrate flood intelligence into your apps</p>
          </div>
          <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors">
            <ExternalLink className="h-4 w-4" />
            Swagger UI
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8 space-y-4 md:space-y-8">

        {/* ── Auth Card ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 bg-amber-50/50 flex items-center justify-between">
            <h3 className="font-bold text-amber-900 flex items-center gap-2">
              <Key className="h-4 w-4 text-amber-500" />
              Authentication
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-slate-600">All requests must include your API key in the header.</p>
            <div className="bg-slate-900 rounded-xl p-4 font-mono text-sm text-emerald-400 border border-slate-800 flex items-center justify-between">
              <span>Authorization: Bearer ag_live_sk_3f8a9b2c1d4e5f6a7b8c9d0e1f2a3b4c</span>
              <Lock className="h-4 w-4 text-slate-500" />
            </div>
          </div>
        </div>

        {/* ── Quick Start ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-500" />
              Quick Start
            </h3>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              {['python', 'javascript', 'curl'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLang(lang as any)}
                  className={`px-3 py-1 rounded-md text-xs font-bold capitalize transition-all ${selectedLang === lang ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
          <div className="p-0">
            <div className="relative group">
              <pre className="p-6 bg-[#0B1120] text-slate-300 font-mono text-sm overflow-x-auto">
                {codeExamples[selectedLang]}
              </pre>
              <button
                onClick={() => copyToClipboard(codeExamples[selectedLang], 'quickstart')}
                className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              >
                {copiedId === 'quickstart' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Endpoints ── */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 px-2">Available Endpoints</h3>
          {endpoints.map((endpoint) => (
            <div key={endpoint.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden transition-all hover:border-slate-300">
              <button
                onClick={() => setExpandedEndpoint(expandedEndpoint === endpoint.id ? null : endpoint.id)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono tracking-wide ${getMethodColor(endpoint.method)}`}>
                    {endpoint.method}
                  </span>
                  <code className="text-sm font-bold text-slate-700">{endpoint.path}</code>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">{endpoint.category}</span>
                  {expandedEndpoint === endpoint.id ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                </div>
              </button>

              {expandedEndpoint === endpoint.id && (
                <div className="border-t border-slate-100 bg-slate-50 p-6 space-y-6 animate-in slide-in-from-top-2">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Parameters</h4>
                      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-bold text-slate-500">Name</th>
                              <th className="px-4 py-2 text-left text-xs font-bold text-slate-500">Type</th>
                              <th className="px-4 py-2 text-left text-xs font-bold text-slate-500">Required</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {endpoint.params.map(p => (
                              <tr key={p.name}>
                                <td className="px-4 py-2.5 font-mono text-blue-600">{p.name}</td>
                                <td className="px-4 py-2.5 text-slate-500">{p.type}</td>
                                <td className="px-4 py-2.5">
                                  {p.required ? <span className="text-red-500 text-xs font-bold">Yes</span> : <span className="text-slate-400 text-xs">No</span>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Example Response</h4>
                      <div className="bg-[#0B1120] rounded-xl p-4 overflow-hidden relative group">
                        <pre className="text-emerald-400 font-mono text-xs overflow-x-auto">
                          {endpoint.response}
                        </pre>
                        <button
                          onClick={() => copyToClipboard(endpoint.response, `resp-${endpoint.id}`)}
                          className="absolute top-2 right-2 p-1.5 bg-slate-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {copiedId === `resp-${endpoint.id}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
