import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Github, ArrowRight, Instagram, Linkedin } from 'lucide-react';
import ParticleField from '@/sections/ParticleField';

const projects = [
  {
    title: 'Casa Inteligente',
    desc: 'Automacao residencial com lampada inteligente, sensor de presenca PIR e ventilador automatico. LED acende ao detectar movimento com logica condicional.',
    tags: ['Arduino', 'Sensor PIR', 'Rele'],
    image: '/showcase-casa.jpg',
  },
  {
    title: 'Estacao Meteorologica IoT',
    desc: 'Monitoramento climatico em tempo real com ESP32, sensor DHT11 e display OLED. Leitura de temperatura, umidade, graficos ao vivo e alertas.',
    tags: ['ESP32', 'DHT11', 'MQTT', 'OLED'],
    image: '/showcase-estacao.jpg',
  },
  {
    title: 'Irrigacao Inteligente',
    desc: 'Sistema agricola automatizado com sensor de umidade do solo, bomba d\'agua e ESP32. Irrigacao automatica baseada em dados.',
    tags: ['ESP32', 'Sensor Solo', 'Bomba', 'Agricultura'],
    image: '/showcase-irrigacao.jpg',
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [navVisible, setNavVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const showcaseRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setNavVisible(window.scrollY > window.innerHeight * 0.5);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const showcase = showcaseRef.current;
    const scroll = scrollRef.current;
    if (!showcase || !scroll) return;

    let ticking = false;
    const handleShowcaseScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const rect = showcase.getBoundingClientRect();
        const showcaseTop = rect.top;
        const showcaseHeight = rect.height;
        const vh = window.innerHeight;

        if (showcaseTop <= 0 && showcaseTop > -showcaseHeight + vh) {
          const progress = Math.abs(showcaseTop) / (showcaseHeight - vh);
          const maxScroll = scroll.scrollWidth - showcase.offsetWidth;
          scroll.style.transform = `translateX(-${progress * maxScroll}px)`;
        }
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleShowcaseScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleShowcaseScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

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
            IoT Vision <span className="text-[11px] uppercase tracking-wider text-[#0073e6] ml-0.5">3D</span>
          </span>
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollTo('showcase')} className="text-[#e1e1e1] text-sm font-light tracking-tight hover:text-[#0073e6] transition-colors">
              Projetos Prontos
            </button>
            <button onClick={() => scrollTo('video')} className="text-[#e1e1e1] text-sm font-light tracking-tight hover:text-[#0073e6] transition-colors">
              Como Funciona
            </button>
            <button className="text-[#e1e1e1] text-sm font-light tracking-tight hover:text-[#0073e6] transition-colors">
              Documentacao
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
          <button onClick={() => scrollTo('showcase')} className="text-2xl text-[#e1e1e1]">Projetos Prontos</button>
          <button onClick={() => scrollTo('video')} className="text-2xl text-[#e1e1e1]">Como Funciona</button>
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
            <button onClick={() => scrollTo('showcase')} className="text-[#f0f0f0] text-sm px-8 py-3 rounded-full border border-white/20 hover:border-white/40 transition-colors">
              Ver Projetos
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="w-px h-10 bg-white/30 animate-bounce" />
        </div>
      </section>

      {/* Showcase Section - Horizontal Scroll */}
      <section id="showcase" className="relative bg-[#0a0a0a]" style={{ height: '300vh' }}>
        <div className="sticky top-0 h-screen overflow-hidden">
          <div className="absolute top-10 left-10 z-20">
            <p className="label-text mb-2">Projetos Prontos</p>
            <p className="text-[#e1e1e1] text-sm max-w-[400px] font-light">
              Explore projetos IoT completos para aprender e ensinar
            </p>
          </div>

          <div ref={showcaseRef} className="h-full flex items-center">
            <div
              ref={scrollRef}
              className="flex gap-16 pl-10 pr-10 items-center h-full will-change-transform"
              style={{ paddingTop: 80 }}
            >
              {projects.map((project, i) => (
                <div
                  key={i}
                  className="glass-card rounded-2xl overflow-hidden flex-shrink-0"
                  style={{ width: '80vw', maxWidth: 1100, height: '60vh' }}
                >
                  <div className="flex flex-col lg:flex-row h-full">
                    <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center">
                      <h3 className="text-2xl lg:text-[40px] font-normal text-[#f0f0f0] tracking-tight mb-4" style={{ letterSpacing: '-1.2px' }}>
                        {project.title}
                      </h3>
                      <p className="text-sm lg:text-base text-[#e1e1e1] font-light leading-relaxed mb-6">
                        {project.desc}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {project.tags.map((tag) => (
                          <span key={tag} className="label-text border border-white/[0.08] px-3 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-[#0073e6] text-sm hover:gap-3 transition-all"
                      >
                        Explorar Projeto <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="lg:w-[45%] h-48 lg:h-full relative">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-8 left-10 right-10 h-[2px] bg-white/[0.06]">
            <div className="h-full bg-[#0073e6] transition-all duration-100" style={{ width: '0%' }} id="showcase-progress" />
          </div>
        </div>
      </section>

      {/* Video Showcase Section */}
      <section id="video" className="bg-[#0a0a0a] py-20 lg:py-32">
        <div className="text-center mb-16 lg:mb-20 px-4">
          <h2 className="text-3xl lg:text-6xl font-normal text-[#f0f0f0] tracking-tight" style={{ letterSpacing: '-1.92px' }}>
            Veja o IoT Vision em acao
          </h2>
        </div>
        <div className="px-4 lg:px-10">
          <div className="glass-card rounded-2xl overflow-hidden max-w-[1200px] mx-auto relative aspect-video">
            <img
              src="/showcase-casa.jpg"
              alt="IoT Vision Workspace Demo"
              className="w-full h-full object-cover"
            />
            <div className="scanline-overlay absolute inset-0" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/10 transition-colors group cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-[#0073e6]/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <polygon points="8,5 20,12 8,19" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spacer before footer */}
      <div className="h-20 bg-[#0a0a0a]" />

      {/* Footer */}
      <footer className="bg-[#0a0a0a] border-t border-white/[0.06] pt-16 lg:pt-20 pb-8 px-6 lg:px-10">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          <div>
            <h3 className="text-[#f0f0f0] text-lg font-normal mb-1">IoT Vision <span className="text-[#0073e6] text-xs uppercase tracking-wider">3D</span></h3>
            <p className="text-xs text-white/50 font-light">Plataforma educacional para IoT</p>
            <p className="text-xs text-white/50 font-light mt-3">Desenvolvido por Beatriz de Abreu, Cauê Valverde e Gustavo de Jesus</p>
          </div>
          <div>
            <p className="label-text mb-4">Plataforma</p>
            <div className="space-y-2">
              {['Recursos', 'Precos', 'Escolas', 'Empresas'].map((item) => (
                <p key={item} className="text-sm text-[#e1e1e1] font-light hover:text-[#0073e6] transition-colors cursor-pointer">{item}</p>
              ))}
            </div>
          </div>
          <div>
            <p className="label-text mb-4">Comunidade</p>
            <div className="space-y-2">
              {['Documentacao', 'Forum', 'GitHub', 'Blog'].map((item) => (
                <p key={item} className="text-sm text-[#e1e1e1] font-light hover:text-[#0073e6] transition-colors cursor-pointer">{item}</p>
              ))}
            </div>
          </div>
          <div>
            <p className="label-text mb-4">Empresa</p>
            <div className="space-y-2">
              {['Sobre', 'Contato', 'Termos', 'Privacidade'].map((item) => (
                <p key={item} className="text-sm text-[#e1e1e1] font-light hover:text-[#0073e6] transition-colors cursor-pointer">{item}</p>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
          <div>
            <div className="flex items-center gap-2 mb-4 text-white/80">
              <Instagram className="w-4 h-4" />
              <p className="label-text">Instagram</p>
            </div>
            <div className="space-y-2 text-sm text-[#e1e1e1] font-light">
              <a href="https://www.instagram.com/beabreuz?igsh=b3J4NTNmdjIwM3dx" target="_blank" rel="noreferrer" className="block hover:text-[#0073e6] transition-colors">Beatriz de Abreu</a>
              <a href="https://www.instagram.com/cauekonce?igsh=ZHJqMHg0bnNobG84&utm_source=qr" target="_blank" rel="noreferrer" className="block hover:text-[#0073e6] transition-colors">Cauê Valverde</a>
              <a href="https://www.instagram.com/guszlk71?igsh=d3N2dHVzMnN3Z2F4" target="_blank" rel="noreferrer" className="block hover:text-[#0073e6] transition-colors">Gustavo de Jesus</a>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-4 text-white/80">
              <Github className="w-4 h-4" />
              <p className="label-text">GitHub</p>
            </div>
            <div className="space-y-2 text-sm text-[#e1e1e1] font-light">
              <a href="https://github.com/Biabreuz" target="_blank" rel="noreferrer" className="block hover:text-[#0073e6] transition-colors">Beatriz de Abreu</a>
              <a href="https://github.com/CaueKonceRamos" target="_blank" rel="noreferrer" className="block hover:text-[#0073e6] transition-colors">Cauê Valverde</a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="block hover:text-[#0073e6] transition-colors">Gustavo de Jesus</a>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-4 text-white/80">
              <Linkedin className="w-4 h-4" />
              <p className="label-text">LinkedIn</p>
            </div>
            <div className="space-y-2 text-sm text-[#e1e1e1] font-light">
              <a href="https://www.linkedin.com/in/beatriz-de-abreu-4a1450232?trk=people-also-viewed_member-name" target="_blank" rel="noreferrer" className="block hover:text-[#0073e6] transition-colors">Beatriz de Abreu</a>
              <a href="https://br.linkedin.com/in/cau%C3%AA-valverde-3480a42a5" target="_blank" rel="noreferrer" className="block hover:text-[#0073e6] transition-colors">Cauê Valverde</a>
              <a href="https://br.linkedin.com/in/gustavo-de-jesus-d-800595297?utm_source=share&utm_medium=member_mweb&utm_campaign=share_via&utm_content=profile" target="_blank" rel="noreferrer" className="block hover:text-[#0073e6] transition-colors">Gustavo de Jesus</a>
            </div>
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto mt-12 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-white/50">2026 IoT Vision 3D</p>
          <div className="flex items-center gap-4">
            <Github className="w-[18px] h-[18px] text-white/50 hover:text-[#0073e6] transition-colors cursor-pointer" />
          </div>
        </div>
      </footer>
    </div>
  );
}
