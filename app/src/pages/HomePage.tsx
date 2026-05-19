import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import ParticleField from '@/sections/ParticleField';


export default function HomePage() {
  const navigate = useNavigate();
  const [navVisible, setNavVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setNavVisible(window.scrollY > window.innerHeight * 0.5);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-[#f0f0f0]">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
          navVisible ? 'opacity-100 translate-y-0 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/[0.06]' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
        style={{ height: 52 }}
      >
        <div className="flex items-center justify-between h-full px-6 lg:px-10">
          <span className="text-[#f0f0f0] text-base font-normal tracking-tight">
            Voltix <span className="text-[11px] uppercase tracking-wider text-[#0073e6] ml-0.5">3D</span>
          </span>
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => setMobileMenuOpen(false)} className="text-[#e1e1e1] text-sm font-light tracking-tight hover:text-[#0073e6] transition-colors">
              InÃ­cio
            </button>
          </div>
          <button onClick={() => navigate('/login')} className="hidden md:block bg-[#0073e6] text-[#0a0a0a] text-sm px-6 py-2 rounded-full hover:bg-[#005bb5] transition-colors">
            Iniciar Laboratorio
          </button>
          <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-white">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-[#0a0a0a] flex flex-col items-center justify-center gap-8">
          <button onClick={() => setMobileMenuOpen(false)} className="absolute top-4 right-4 text-white">
            <X className="w-6 h-6" />
          </button>
          <button onClick={() => setMobileMenuOpen(false)} className="text-2xl text-[#e1e1e1]">InÃ­cio</button>
          <button onClick={() => navigate('/login')} className="bg-[#0073e6] text-[#0a0a0a] text-lg px-8 py-3 rounded-full mt-4">Iniciar Laboratorio</button>
        </div>
      )}

      {/* Hero Section */}
      <section ref={heroRef} className="relative w-full h-screen overflow-hidden">
        <ParticleField />

        {/* Terminal Status Panel */}
        <div className="absolute bottom-10 left-10 z-20 hidden lg:block bg-[#0a0a0a]/70 border border-white/[0.06] rounded p-4 w-[200px]">
          <div className="font-mono-data text-xs space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
              <span className="text-[#00ff88]">STATUS: ONLINE</span>
            </div>
            <div className="text-white/50">SIMULATION: READY</div>
            <div className="text-white/50">PARTICLES: 800</div>
            <div className="text-white/50">FPS: 60</div>
          </div>
          <div className="absolute top-0 left-0 right-0 h-px bg-[#00d4ff]/20 animate-pulse" />
        </div>

        {/* Hero Content */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
          <h1
            className="text-5xl sm:text-7xl lg:text-[96px] font-normal text-[#f0f0f0] text-center leading-none tracking-tight"
            style={{ letterSpacing: '-3.84px', mixBlendMode: 'difference' }}
          >
            Crie. Simule.
            <br />
            <span className="text-[#0073e6]">Conecte.</span>
          </h1>
          <p className="mt-8 text-base sm:text-lg text-white/50 max-w-[480px] text-center font-light leading-relaxed px-4">
            Laboratorio virtual para IoT, Arduino e ESP32. Monte circuitos, visualize em 3D e simule em tempo real.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 pointer-events-auto">
            <button onClick={() => navigate('/register')} className="bg-[#0073e6] text-[#0a0a0a] text-sm px-8 py-3 rounded-full hover:bg-[#005bb5] transition-colors font-normal">
              Comecar Agora
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="w-px h-10 bg-white/30 animate-bounce" />
        </div>
      </section>


      {/* Spacer before footer */}
      <div className="h-20 bg-[#0a0a0a]" />

      {/* Footer */}
      <footer className="bg-[#0a0a0a] border-t border-white/[0.06] py-8 px-6 lg:px-10">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-start justify-between gap-8">
          <div>
            <h3 className="text-[#f0f0f0] text-lg font-normal mb-1">Voltix <span className="text-[#0073e6] text-xs uppercase tracking-wider">3D</span></h3>
            <p className="text-xs text-white/50 font-light">Laboratorio virtual para IoT e automacao.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full lg:w-auto">
            <div>
              <p className="text-sm text-white/40 mb-2">Beatriz</p>
              <a href="https://www.instagram.com/beabreuz?igsh=b3J4NTNmdjIwM3dx" target="_blank" rel="noreferrer" className="block text-sm text-white/70 hover:text-[#0073e6]">Instagram</a>
              <a href="https://www.linkedin.com/in/beatriz-de-abreu-4a1450232?trk=people-also-viewed_member-name" target="_blank" rel="noreferrer" className="block text-sm text-white/70 hover:text-[#0073e6]">LinkedIn</a>
              <a href="https://github.com/Biabreuz" target="_blank" rel="noreferrer" className="block text-sm text-white/70 hover:text-[#0073e6]">GitHub</a>
            </div>
            <div>
              <p className="text-sm text-white/40 mb-2">Cauê</p>
              <a href="https://www.instagram.com/cauekonce?igsh=ZHJqMHg0bnNobG84&utm_source=qr" target="_blank" rel="noreferrer" className="block text-sm text-white/70 hover:text-[#0073e6]">Instagram</a>
              <a href="https://br.linkedin.com/in/cau%C3%AA-valverde-3480a42a5" target="_blank" rel="noreferrer" className="block text-sm text-white/70 hover:text-[#0073e6]">LinkedIn</a>
              <a href="https://github.com/CaueKonceRamos" target="_blank" rel="noreferrer" className="block text-sm text-white/70 hover:text-[#0073e6]">GitHub</a>
            </div>
            <div>
              <p className="text-sm text-white/40 mb-2">Gustavo</p>
              <a href="https://www.instagram.com/guszlk71?igsh=d3N2dHVzMnN3Z2F4" target="_blank" rel="noreferrer" className="block text-sm text-white/70 hover:text-[#0073e6]">Instagram</a>
              <a href="https://br.linkedin.com/in/gustavo-de-jesus-d-800595297?utm_source=share&utm_medium=member_mweb&utm_campaign=share_via&utm_content=profile" target="_blank" rel="noreferrer" className="block text-sm text-white/70 hover:text-[#0073e6]">LinkedIn</a>
              <p className="text-sm text-white/70">GitHub em breve</p>
            </div>
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto mt-8 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-white/50">2026 Voltix 3D</p>
        </div>
      </footer>
    </div>
  );
}


