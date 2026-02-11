'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Shield, Users, BarChart3, ArrowRight, Waves, Zap, Globe, Activity,
  Droplets, MapPin, Satellite, AlertTriangle, Database, Eye, Radio,
  ChevronRight, Sparkles, CheckCircle2, Smartphone, Microscope, Heart,
  ShoppingCart, Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ─── portal data ─── */
const portals = [
  {
    id: 0,
    href: '/citizen',
    icon: Shield,
    heroIcon: Droplets,
    title: 'Citizens',
    subtitle: 'Safety First',
    gradient: 'from-blue-400 to-cyan-300',
    glow: 'rgba(34,211,238,0.35)',
    iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    cardBg: 'from-sky-100 to-blue-50',
    cardBorder: 'border-blue-200',
    illustration: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=400&fit=crop',
  },
  {
    id: 1,
    href: '/official',
    icon: Users,
    heroIcon: Waves,
    title: 'Officials',
    subtitle: 'Command Center',
    gradient: 'from-violet-400 to-fuchsia-300',
    glow: 'rgba(168,85,247,0.35)',
    iconBg: 'bg-gradient-to-br from-violet-500 to-fuchsia-500',
    cardBg: 'from-violet-100 to-fuchsia-50',
    cardBorder: 'border-violet-200',
    illustration: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=400&fit=crop',
  },
  {
    id: 2,
    href: '/researcher',
    icon: BarChart3,
    heroIcon: Activity,
    title: 'Researchers',
    subtitle: 'Data Lab',
    gradient: 'from-emerald-400 to-teal-300',
    glow: 'rgba(52,211,153,0.35)',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-500',
    cardBg: 'from-emerald-100 to-teal-50',
    cardBorder: 'border-emerald-200',
    illustration: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=400&fit=crop',
  },
];

/** Returns [left, centre, right] portals with the active one in centre */
function getOrbOrder(activeId: number) {
  const others = portals.filter((p) => p.id !== activeId);
  return [others[0], portals[activeId], others[1]];
}

export default function HomePage() {
  const [active, setActive] = useState(0);
  const current = portals[active];

  return (
    <div className="landing-scene">

      {/* ───────── NAV (Layer 5 — top UI) ───────── */}
      <nav className="fixed top-0 inset-x-0 z-50">
        <div className="mx-auto max-w-7xl px-8 pt-6 flex items-center justify-center">
          {/* logo */}
          <Link href="/" className="absolute left-8 flex items-center gap-2 group">
            <Waves className="h-6 w-6 text-white/80 group-hover:text-white transition-colors" />
            <span className="text-white/90 font-semibold text-sm tracking-wide">AquaGuardians</span>
          </Link>

          {/* center nav pills */}
          <div className="flex items-center gap-1 bg-white/[0.08] backdrop-blur-xl rounded-xl px-1.5 py-1.5 border border-white/[0.08]">
            {portals.map((p) => (
              <button
                key={p.id}
                onClick={() => setActive(p.id)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                  active === p.id
                    ? 'bg-white/[0.15] text-white shadow-sm'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                {p.title}
              </button>
            ))}
          </div>

          {/* right action */}
          <Link href={current.href} className="absolute right-8">
            <div className="h-10 w-10 rounded-xl bg-white/[0.08] backdrop-blur-xl border border-white/[0.08] grid place-items-center hover:bg-white/[0.15] transition-all cursor-pointer">
              <ArrowRight className="h-4 w-4 text-white/70" />
            </div>
          </Link>
        </div>
      </nav>

      {/* ───────── FULL SCENE (single viewport) ───────── */}
      <div className="relative w-full h-[100dvh] overflow-hidden flex flex-col items-center justify-end">

        {/* ── Layer 1: Background ── */}
        <div className="absolute inset-0 landing-bg" />

        {/* ambient glow behind hero */}
        <div
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[120px] transition-all duration-700"
          style={{
            top: '12%',
            background: `radial-gradient(circle, ${current.glow} 0%, transparent 70%)`,
          }}
        />

        {/* ── THREE ORBS: left · active centre · right ── */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[24%] md:top-[22%] z-20 flex flex-col items-center">

          {/* Orb row */}
          <div className="flex items-center gap-8 md:gap-14">
            {getOrbOrder(active).map((portal, idx) => {
              const isCenter = idx === 1;
              return (
                <button
                  key={portal.id}
                  onClick={() => setActive(portal.id)}
                  className={`relative group cursor-pointer transition-all duration-700 ease-[cubic-bezier(.4,0,.2,1)] ${
                    isCenter ? 'z-10' : 'z-0 hover:scale-110'
                  }`}
                >
                  {/* glow behind orb */}
                  <div
                    className={`absolute rounded-full blur-2xl transition-all duration-700 ${
                      isCenter ? '-inset-8 opacity-100' : '-inset-4 opacity-50 group-hover:opacity-80'
                    }`}
                    style={{ background: `radial-gradient(circle, ${portal.glow} 0%, transparent 70%)` }}
                  />

                  {/* orb body */}
                  <div className={`relative rounded-full bg-gradient-to-b ${portal.gradient} grid place-items-center shadow-2xl transition-all duration-700 ${
                    isCenter
                      ? 'w-48 h-48 md:w-64 md:h-64 landing-float ring-2 ring-white/20'
                      : 'w-36 h-36 md:w-48 md:h-48 opacity-80 group-hover:opacity-100'
                  }`}>
                    <img 
                      src={portal.illustration} 
                      alt={portal.title}
                      className={`rounded-full object-cover drop-shadow-2xl transition-all duration-500 ${
                        isCenter ? 'w-48 h-48 md:w-64 md:h-64' : 'w-36 h-36 md:w-48 md:h-48'
                      }`}
                    />
                    {/* glass shine */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/25 via-transparent to-transparent" />
                  </div>

                  {/* label below orb */}
                  <p className={`mt-3 text-center font-bold uppercase tracking-widest transition-all duration-500 ${
                    isCenter
                      ? 'text-[11px] md:text-xs text-white/80'
                      : 'text-[9px] md:text-[10px] text-white/40 group-hover:text-white/60'
                  }`}>
                    {portal.title}
                  </p>
                </button>
              );
            })}
          </div>

        </div>

        {/* ── Layer 2: TERRAIN (mountain/wave) ── */}
        <div className="absolute bottom-0 inset-x-0 z-30 pointer-events-none">
          {/* main terrain shape */}
          <svg viewBox="0 0 1440 520" className="w-full h-auto" preserveAspectRatio="none">
            <defs>
              <linearGradient id="tGrad1" x1="0.5" y1="0" x2="0.5" y2="1">
                <stop offset="0%" stopColor="#1a3a5c" stopOpacity="0.9"/>
                <stop offset="40%" stopColor="#0f2744" stopOpacity="0.95"/>
                <stop offset="100%" stopColor="#080c18" stopOpacity="1"/>
              </linearGradient>
              <linearGradient id="tGrad2" x1="0.5" y1="0" x2="0.5" y2="1">
                <stop offset="0%" stopColor="#163552" stopOpacity="0.7"/>
                <stop offset="100%" stopColor="#080c18" stopOpacity="1"/>
              </linearGradient>
              {/* noise filter for texture */}
              <filter id="terrainNoise">
                <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
                <feColorMatrix type="saturate" values="0"/>
                <feBlend in="SourceGraphic" mode="multiply"/>
              </filter>
            </defs>
            {/* back ridge */}
            <path fill="url(#tGrad2)" d="M0,380 C200,300 350,260 500,280 C650,300 720,200 900,220 C1080,240 1200,300 1440,280 L1440,520 L0,520 Z"/>
            {/* main mountain */}
            <path fill="url(#tGrad1)" d="M0,420 C180,380 320,320 520,300 C620,290 680,240 720,200 C760,240 820,290 920,300 C1120,320 1260,380 1440,420 L1440,520 L0,520 Z"/>
            {/* front ridge */}
            <path fill="#080c18" fillOpacity="0.6" d="M0,460 C200,440 400,420 600,430 C800,440 1000,425 1200,440 C1340,450 1400,460 1440,460 L1440,520 L0,520 Z"/>
          </svg>
          {/* glow line on ridge top */}
          <div className="absolute bottom-[140px] md:bottom-[200px] inset-x-[20%] h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
        </div>

        {/* ── Layer 5: BOTTOM DISPLAY TEXT ── */}
        <div className="relative z-40 pb-10 md:pb-14 text-center px-6">
          <Link href={current.href} className="group cursor-pointer inline-block">
            <h1 className="landing-heading group-hover:scale-105 transition-transform duration-300">
              Choose your portal
            </h1>
          </Link>
          <p className="mt-3 text-white/50 text-sm md:text-base max-w-lg mx-auto font-medium">
            AI-powered flood monitoring &amp; LiDAR terrain analysis for the Ganga River
          </p>
        </div>
      </div>

      {/* ───────── BELOW-FOLD: Stats & Features ───────── */}
      <section className="relative bg-[#0d1117] py-24">
        <div className="mx-auto max-w-7xl px-6">
          {/* stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-28">
            {[
              { value: '1.7 GB', label: 'LiDAR Data' },
              { value: '99.2%', label: 'AI Accuracy' },
              { value: '<30 s', label: 'Alert Time' },
              { value: '24/7', label: 'Monitoring' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 text-center hover:border-white/[0.1] transition-colors duration-200">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">{s.value}</div>
                <div className="text-[10px] uppercase tracking-wide text-white/30 font-medium">{s.label}</div>
              </div>
            ))}
          </div>

          {/* portal detail cards */}
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="px-4 py-1.5 rounded-lg bg-white/[0.08] border border-white/[0.08] text-[11px] uppercase tracking-widest text-white/60 font-bold">Three Pathways</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black tracking-tight text-white mb-5">
              <span className="landing-gradient-text">One Mission</span>, Three Portals
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
              Purpose-built experiences for every stakeholder in the flood management ecosystem
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {portals.map((p, idx) => (
              <Link key={p.id} href={p.href} className="group">
                <div className="relative rounded-[2rem] border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm overflow-hidden hover:border-white/20 transition-all duration-500 h-full hover:scale-[1.02] hover:shadow-2xl">
                  {/* Image header */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={p.illustration} 
                      alt={p.title}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-700"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-b ${p.gradient} opacity-40 mix-blend-overlay`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080c18] via-[#080c18]/50 to-transparent" />
                    
                    {/* Floating icon */}
                    <div className={`absolute top-6 right-6 h-12 w-12 rounded-xl ${p.iconBg} grid place-items-center shadow-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
                      <p.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-2xl font-black text-white">{p.title}</h3>
                      <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">{p.subtitle}</p>
                    <p className="text-sm text-white/50 leading-relaxed mb-6">
                      {p.id === 0 && 'GPS-based safety checker, AI-verified community reports, smart farming advisory, and real-time flood alerts.'}
                      {p.id === 1 && '3D flood simulation, policy zoning engine, evacuation route optimizer, and emergency voice-call broadcasting.'}
                      {p.id === 2 && 'Download 1.7 GB LiDAR data, train flood-prediction models, interactive API docs, and research insights.'}
                    </p>
                    <div className="flex items-center gap-2 text-sm font-bold text-white/80 group-hover:text-white group-hover:gap-3 transition-all">
                      Explore Portal 
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── CTA ───────── */}
      <section className="relative py-40 bg-[#080c18] overflow-hidden">
        {/* Dramatic background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-cyan-500/[0.08] via-blue-500/[0.08] to-violet-500/[0.08] blur-[140px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#080c18]" />
        </div>
        
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <div className="inline-block mb-6">
            <span className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-xs uppercase tracking-widest text-cyan-300 font-bold backdrop-blur-sm">
              <Sparkles className="inline h-3 w-3 mr-1.5" />
              Join the Movement
            </span>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-8 leading-tight">
            Protect Lives.<br/>
            <span className="landing-gradient-text">Save Communities.</span>
          </h2>
          
          <p className="text-white/50 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
            Real-time flood monitoring, AI-powered predictions, and life-saving alerts for the Ganga River basin.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/citizen">
              <Button size="lg" className="h-14 px-8 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 border-0 transition-all hover:scale-105">
                <Shield className="mr-2 h-5 w-5" /> Get Started Free
              </Button>
            </Link>
            <Link href="/researcher">
              <Button size="lg" variant="outline" className="h-14 px-8 rounded-xl border-2 border-white/20 bg-white/[0.05] backdrop-blur-sm text-white font-bold hover:bg-white/[0.1] hover:border-white/30 transition-all hover:scale-105">
                <Database className="mr-2 h-5 w-5" /> Explore Data
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center justify-center gap-12 text-white/30 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Free Forever</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Open Source</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>NMCG Certified</span>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── FOOTER ───────── */}
      <footer className="bg-[#0a0f1a] border-t border-white/[0.08]">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-2 group mb-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 grid place-items-center shadow-lg">
                  <Waves className="h-5 w-5 text-white" />
                </div>
                <span className="text-white font-bold text-lg">AquaGuardians</span>
              </Link>
              <p className="text-white/40 text-sm leading-relaxed mb-4">
                AI-powered flood management for the Ganga River ecosystem.
              </p>
              <div className="flex items-center gap-3">
                <a href="#" className="h-9 w-9 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] grid place-items-center transition-all">
                  <Globe className="h-4 w-4 text-white/60" />
                </a>
                <a href="#" className="h-9 w-9 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] grid place-items-center transition-all">
                  <Activity className="h-4 w-4 text-white/60" />
                </a>
              </div>
            </div>

            {/* Portals */}
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Portals</h4>
              <div className="space-y-3">
                {portals.map((p) => (
                  <Link key={p.id} href={p.href} className="block text-white/50 hover:text-white text-sm transition-colors">
                    {p.title}
                  </Link>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Resources</h4>
              <div className="space-y-3">
                <Link href="/researcher" className="block text-white/50 hover:text-white text-sm transition-colors">API Documentation</Link>
                <Link href="/researcher" className="block text-white/50 hover:text-white text-sm transition-colors">LiDAR Dataset</Link>
                <Link href="#" className="block text-white/50 hover:text-white text-sm transition-colors">Research Papers</Link>
                <Link href="#" className="block text-white/50 hover:text-white text-sm transition-colors">GitHub</Link>
              </div>
            </div>

            {/* About */}
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Project</h4>
              <div className="space-y-3">
                <a href="#" className="block text-white/50 hover:text-white text-sm transition-colors">Riverathon 1.0</a>
                <a href="#" className="block text-white/50 hover:text-white text-sm transition-colors">NMCG Partnership</a>
                <a href="#" className="block text-white/50 hover:text-white text-sm transition-colors">Open Source</a>
                <a href="#" className="block text-white/50 hover:text-white text-sm transition-colors">Contact</a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/30 text-xs">
              © 2026 AquaGuardians. Built for Riverathon 1.0 · Powered by NMCG LiDAR Data
            </p>
            <div className="flex items-center gap-6 text-white/30 text-xs">
              <a href="#" className="hover:text-white/60 transition-colors">Privacy</a>
              <a href="#" className="hover:text-white/60 transition-colors">Terms</a>
              <a href="#" className="hover:text-white/60 transition-colors">License</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
