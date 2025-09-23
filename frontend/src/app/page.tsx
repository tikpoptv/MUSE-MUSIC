export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-800 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/10 to-pink-900/20"></div>
        
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-r from-pink-500/10 to-red-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              animation: `twinkle ${0.8 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 4}s`,
              opacity: Math.random() * 0.8 + 0.2,
              boxShadow: '0 0 6px rgba(255,255,255,0.8)'
            }}
          ></div>
        ))}
      </div>

      <div className="text-center relative z-10">
        <h1 className="text-7xl md:text-9xl font-thin text-white mb-3 tracking-widest drop-shadow-2xl">
          MUSE
        </h1>
        <h2 className="text-3xl md:text-4xl font-light text-gray-200 mb-10 tracking-wider drop-shadow-lg">
          Music
        </h2>
        <div className="inline-flex items-center px-6 py-3 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></div>
          <p className="text-gray-300 text-lg tracking-wide">
            Coming Soon
          </p>
        </div>
      </div>
    </div>
  );
}
