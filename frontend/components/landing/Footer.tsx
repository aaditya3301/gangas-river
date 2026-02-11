import Link from 'next/link';

const columns = [
    {
        title: 'Platform',
        links: [
            { label: 'Citizen Portal', href: '/citizen' },
            { label: 'Official Portal', href: '/official' },
            { label: 'Researcher Portal', href: '/researcher' },
            { label: 'Dashboard', href: '/citizen' },
        ],
    },
    {
        title: 'Technology',
        links: [
            { label: 'AI Engine', href: '#' },
            { label: 'LiDAR Processing', href: '#' },
            { label: 'Flood Prediction', href: '#' },
            { label: 'Smart Zoning', href: '#' },
        ],
    },
    {
        title: 'Research',
        links: [
            { label: 'API Documentation', href: '/researcher/api' },
            { label: 'LiDAR Dataset', href: '/researcher' },
            { label: 'Publications', href: '#' },
            { label: 'GitHub', href: '#' },
        ],
    },
    {
        title: 'Legal',
        links: [
            { label: 'Privacy Policy', href: '#' },
            { label: 'Terms of Service', href: '#' },
            { label: 'Data License', href: '#' },
            { label: 'Contact', href: '#' },
        ],
    },
];

export default function Footer() {
    return (
        <footer className="bg-[#0a0f1a] pt-[180px] lg:pt-[200px] pb-12">
            <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
                <div className="grid md:grid-cols-6 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="md:col-span-2">
                        <Link href="/" className="flex items-center gap-2.5 group mb-5">
                            <div className="h-10 w-10 rounded-xl bg-[#006DC4] grid place-items-center shadow-lg">
                                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M2 12c2-4 6-8 10-8s8 4 10 8c-2 4-6 8-10 8s-8-4-10-8z" />
                                    <path d="M6 12c1-2 3-4 6-4s5 2 6 4c-1 2-3 4-6 4s-5-2-6-4z" />
                                </svg>
                            </div>
                            <span className="text-white font-bold text-lg">AquaGuardians</span>
                        </Link>
                        <p className="text-white/40 text-sm leading-relaxed mb-6 max-w-xs">
                            AI-powered flood management and LiDAR terrain intelligence for the Ganga River ecosystem.
                        </p>
                        <div className="flex items-center gap-3">
                            {['GitHub', 'Twitter', 'Research'].map((label, i) => (
                                <a
                                    key={label}
                                    href="#"
                                    className="h-10 w-10 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] grid place-items-center transition-all"
                                    aria-label={label}
                                >
                                    <span className="text-[10px] font-bold text-white/50">{label[0]}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link Columns */}
                    {columns.map((col) => (
                        <div key={col.title}>
                            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">{col.title}</h4>
                            <div className="space-y-3">
                                {col.links.map((link) => (
                                    <Link
                                        key={link.label}
                                        href={link.href}
                                        className="block text-white/40 hover:text-white text-sm transition-colors duration-200"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-white/30 text-xs text-center md:text-left">
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
    );
}
