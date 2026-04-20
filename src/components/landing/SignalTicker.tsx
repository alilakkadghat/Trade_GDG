const SIGNALS = [
    "MV NORDIC STAR · Mumbai → Dubai · ETA 14h",
    "Container surge +12% · Singapore",
    "Nhava Sheva throughput · 4,210 TEU/hr",
    "Hamburg ↔ New York lane · on-time 96%",
    "Chennai port · 38 vessels at anchor",
    "Red Sea reroute · +6 days avg.",
    "Kolkata export volume · ▲ 3.4% WoW",
    "Shanghai → Rotterdam · live 142 ships",
    "Bunker fuel index · 612 USD/MT",
    "Dubai Jebel Ali · cleared 1,820 boxes",
];

const SignalTicker = () => {
    const items = [...SIGNALS, ...SIGNALS];
    return (
        <div className="landing-ticker-mask w-full overflow-hidden border-t border-[hsl(155_30%_15%/0.4)] bg-[hsl(160_45%_5%/0.4)] backdrop-blur-md">
            <div className="flex landing-animate-ticker whitespace-nowrap py-3">
                {items.map((s, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-3 px-8 font-mono text-xs text-[hsl(150_15%_60%)]"
                    >
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[hsl(150_75%_45%)] landing-shadow-glow" />
                        <span className="tracking-wide">{s}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SignalTicker;
