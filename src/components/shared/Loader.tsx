const SPOKES = Array.from({ length: 24 }, (_, i) => i * 15);

export default function Loader() {
  return (
    <div className="fixed inset-0 z-[100] bg-[#F0F9FF] flex flex-col items-center justify-center">
      {/* Tricolor bar */}
      <div className="fixed top-0 left-0 w-full h-1.5 flex z-50">
        <div className="h-full flex-1 bg-saffron" />
        <div className="h-full flex-1 bg-white" />
        <div className="h-full flex-1 bg-india-green" />
      </div>

      {/* Loader animation */}
      <div className="relative w-64 h-64 flex items-center justify-center mb-12">
        {/* Outer conic ring */}
        <div
          className="absolute w-56 h-56 rounded-full animate-spin-reverse-slow"
          style={{
            background:
              'conic-gradient(from 0deg, #FF9933 0%, transparent 25%, transparent 50%, #138808 75%, transparent 100%)',
            padding: '2px',
          }}
        >
          <div className="w-full h-full bg-[#F0F9FF] rounded-full" />
        </div>

        {/* Orbiting sparkles */}
        <div className="absolute w-[180px] h-[180px] animate-spin-slow">
          {[
            { color: '#FF9933', top: '10%', left: '50%', delay: '0s' },
            { color: '#FF9933', top: '20%', left: '80%', delay: '0.2s' },
            { color: '#FF9933', top: '40%', left: '95%', delay: '0.4s' },
            { color: '#FF9933', top: '20%', left: '20%', delay: '0.6s' },
            { color: '#138808', bottom: '10%', left: '50%', delay: '0.1s' },
            { color: '#138808', bottom: '20%', left: '80%', delay: '0.3s' },
            { color: '#138808', bottom: '40%', left: '95%', delay: '0.5s' },
            { color: '#138808', bottom: '20%', left: '20%', delay: '0.7s' },
          ].map((s, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full animate-pulse-orbit"
              style={{
                backgroundColor: s.color,
                boxShadow: `0 0 8px ${s.color}`,
                top: s.top,
                bottom: (s as Record<string, string | undefined>).bottom,
                left: s.left,
                animationDelay: s.delay,
                filter: 'blur(1px)',
              }}
            />
          ))}
        </div>

        {/* Ashoka Chakra */}
        <div className="relative w-[100px] h-[100px] rounded-full border-4 border-india-navy flex items-center justify-center animate-spin-chakra">
          <div className="absolute w-4 h-4 bg-india-navy rounded-full z-10" />
          {SPOKES.map((deg) => (
            <div
              key={deg}
              className="absolute w-[2px] h-[50px] bg-india-navy"
              style={{
                left: '50%',
                bottom: '50%',
                transformOrigin: 'bottom center',
                transform: `translateX(-50%) rotate(${deg}deg)`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Brand */}
      <div className="space-y-1 mb-8 text-center">
        <h1 className="text-xl font-bold text-primary tracking-tight font-headline">DhanSathi</h1>
        <p className="text-sm text-outline font-medium tracking-wide">धनसाथी</p>
      </div>

      {/* Bouncing dots */}
      <div className="flex items-center justify-center space-x-3 mb-6">
        {['bg-saffron', 'bg-india-navy', 'bg-india-green'].map((bg, i) => (
          <div
            key={bg}
            className={`w-3 h-3 rounded-full ${bg} animate-bounce-custom`}
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>

      <p className="text-sm font-medium text-outline animate-pulse">Loading your dashboard...</p>

      {/* Footer */}
      <footer className="fixed bottom-12 w-full text-center">
        <div className="inline-flex items-center space-x-2 text-outline text-xs">
          <span className="material-symbols-outlined text-sm">verified_user</span>
          <span>Secured by DhanSathi Intelligence Systems</span>
        </div>
      </footer>
    </div>
  );
}
