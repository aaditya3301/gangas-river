export default function TrustLogos() {
    const partners = [
        'NMCG',
        'Riverathon',
        'Environmental Research Institute',
        'State Disaster Authority',
        'Climate Intelligence Lab',
    ];

    return (
        <section className="relative bg-[#F8FAFC] pt-[240px] sm:pt-[280px] lg:pt-[300px] pb-20">
            <div className="mx-auto max-w-[1280px] px-6 lg:px-8 text-center">
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-10">
                    Trusted by Climate Researchers &amp; Government Bodies
                </p>
                <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
                    {partners.map((name) => (
                        <div
                            key={name}
                            className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="h-8 w-8 rounded-lg bg-gray-100 grid place-items-center">
                                <span className="text-[10px] font-black text-gray-400">
                                    {name.split(' ').map(w => w[0]).join('')}
                                </span>
                            </div>
                            <span className="text-sm font-semibold text-gray-400">{name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
