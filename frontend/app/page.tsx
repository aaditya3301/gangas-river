import Link from 'next/link';
import { Shield, Users, BarChart3, ArrowRight, Waves, Zap, Globe, Activity, ChevronRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

const portals = [
  {
    href: '/citizen',
    icon: Shield,
    title: 'Citizens',
    description: 'Check safety status, report issues, and receive alerts.',
    color: 'bg-blue-600',
  },
  {
    href: '/official',
    icon: Users,
    title: 'Officials',
    description: 'Manage alerts, evacuations, and monitor flood zones.',
    color: 'bg-violet-600',
  },
  {
    href: '/researcher',
    icon: BarChart3,
    title: 'Researchers',
    description: 'Access datasets, train models, and analyze patterns.',
    color: 'bg-emerald-600',
  },
];

const stats = [
  { value: '1.7GB', label: 'LiDAR Data', icon: Globe },
  { value: '99.2%', label: 'Accuracy', icon: Activity },
  { value: '<30s', label: 'Alert Time', icon: Zap },
  { value: '24/7', label: 'Monitoring', icon: Waves },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-blue-500 flex items-center justify-center">
              <Waves className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">AquaGuardians</span>
          </Link>
          <div className="flex items-center gap-8">
            <Link href="/" className="hidden md:block text-sm text-white hover:text-blue-300 transition-colors">
              Home
            </Link>
            <Link href="/citizen" className="hidden md:block text-sm text-white hover:text-blue-300 transition-colors">
              Solutions
            </Link>
            <Link href="/researcher" className="hidden md:block text-sm text-white hover:text-blue-300 transition-colors">
              About Us
            </Link>
            <Link href="/official" className="hidden md:block text-sm text-white hover:text-blue-300 transition-colors">
              Customers
            </Link>
            <Link href="/citizen">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white border-0">
                Get In Touch
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Background Image */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=2070')",
          }}
        >
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/85 to-slate-900/90" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 py-32">
          <div className="max-w-4xl">
            <p className="text-blue-300 text-sm font-medium mb-4 uppercase tracking-wider">
              AI-Powered River Protection
            </p>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Focused<br />
              advocacy for<br />
              your legal<br />
              <span className="text-blue-400">success</span>
            </h1>
            
            <p className="text-slate-300 text-lg max-w-2xl mb-8 leading-relaxed">
              Expert legal guidance protecting your rights and delivering
              justice with dedication and integrity
            </p>
            
            {/* Stats Circle and CTA */}
            <div className="flex flex-wrap items-center gap-8">
              {/* Play Button Circle */}
              <button className="relative group">
                <div className="absolute inset-0 border-2 border-blue-400/50 rounded-full animate-ping" />
                <div className="relative h-24 w-24 rounded-full border-2 border-blue-400 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm group-hover:bg-blue-500 transition-all">
                  <Play className="h-8 w-8 text-white fill-white ml-1" />
                </div>
              </button>
              
              {/* Success Years Badge */}
              <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-bold text-blue-400">12</span>
                  <div className="text-white">
                    <div className="text-sm font-medium">Years of success in</div>
                    <div className="text-sm font-medium">legal advocacy</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Tagline */}
        <div className="absolute bottom-8 right-8 max-w-md text-right">
          <p className="text-white text-sm leading-relaxed">
            Expert legal guidance protecting your rights and delivering<br />
            justice with dedication and integrity
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">{stat.value}</div>
                <div className="text-sm text-slate-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portals Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Choose Your Portal</h2>
            <p className="text-slate-600 text-lg">Three specialized interfaces for different stakeholders</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {portals.map((portal) => (
              <Link key={portal.href} href={portal.href} className="group">
                <div className="h-full p-8 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${portal.color} mb-6`}>
                    <portal.icon className="h-7 w-7 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                    {portal.title}
                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </h3>
                  
                  <p className="text-slate-600 leading-relaxed">{portal.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-blue-700">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to protect your community?
          </h2>
          <p className="text-blue-100 mb-10 max-w-2xl mx-auto text-lg">
            Start using AquaGuardians today for better river management and flood prediction
          </p>
          <Link href="/citizen">
            <Button size="lg" className="h-14 px-8 bg-white text-blue-600 hover:bg-slate-50 text-lg font-semibold">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center">
                <Waves className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="font-bold text-white text-lg block">AquaGuardians</span>
                <span className="text-slate-400 text-xs">Protecting communities</span>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <Link href="/citizen" className="text-slate-400 hover:text-white text-sm transition-colors">
                Citizens
              </Link>
              <Link href="/official" className="text-slate-400 hover:text-white text-sm transition-colors">
                Officials
              </Link>
              <Link href="/researcher" className="text-slate-400 hover:text-white text-sm transition-colors">
                Researchers
              </Link>
            </div>
            <p className="text-slate-500 text-sm">
              Built for Riverathon 1.0 • NMCG LiDAR Data • © 2026
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
