
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, Points, PointMaterial, MeshDistortMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { ArrowRight, Zap, Target, Layers, Command, Plus, Hexagon, Code, Mic, Send } from 'lucide-react';

// --- Theme Config ---
const COLORS = {
  ink: '#0A0E27',
  cream: '#F9F8F3',
  lime: '#C3FF00',
  red: '#FF1E1E',
};

const GridBackground = () => (
  <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
       style={{ backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
);

// --- Custom Components ---

// 1. Blueprint Cursor (Measurement Tool)
const BlueprintCursor: React.FC = () => {
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const [hoverType, setHoverType] = useState<'none' | 'link' | 'text'>('none');

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const style = window.getComputedStyle(target);
      if (style.cursor === 'pointer' || target.tagName === 'A' || target.tagName === 'BUTTON') {
        setHoverType('link');
      } else if (target.innerText && target.innerText.length > 10) {
        setHoverType('text');
      } else {
        setHoverType('none');
      }
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseover', handleOver);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseover', handleOver);
    };
  }, []);

  return (
    <>
      {/* Horizontal Axis */}
      <motion.div 
        className="fixed top-0 left-0 w-full h-px bg-ink/10 pointer-events-none z-[9999]"
        style={{ top: mouseY }}
      />
      {/* Vertical Axis */}
      <motion.div 
        className="fixed top-0 left-0 w-px h-full bg-ink/10 pointer-events-none z-[9999]"
        style={{ left: mouseX }}
      />
      {/* Crosshair Tool */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        style={{ x: mouseX, y: mouseY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          scale: hoverType === 'link' ? 1.5 : 1,
          rotate: hoverType === 'link' ? 45 : 0,
        }}
      >
        <div className="relative">
          <div className="w-6 h-6 border border-lime flex items-center justify-center">
            <div className="w-1 h-1 bg-lime" />
          </div>
          {hoverType === 'link' && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="absolute top-8 left-8 text-[8px] font-black uppercase text-lime whitespace-nowrap tracking-widest"
            >
              EXECUTE_CMD
            </motion.div>
          )}
        </div>
      </motion.div>
    </>
  );
};

// 2. Houdini Point Cloud Scene
const HoudiniCloud = () => {
  const points = useMemo(() => {
    const p = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      p[i * 3] = (Math.random() - 0.5) * 10;
      p[i * 3 + 1] = (Math.random() - 0.5) * 10;
      p[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return p;
  }, []);

  const ref = useRef<THREE.Points>(null!);
  useFrame((state) => {
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    ref.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.1;
  });

  return (
    <Points ref={ref} positions={points} stride={3}>
      <PointMaterial
        transparent
        color={COLORS.lime}
        size={0.03}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.4}
      />
    </Points>
  );
};

// 3. Matrix Feature Box
const MatrixBox = ({ icon: Icon, title, desc, idx }: any) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ delay: idx * 0.05 }}
      className="relative p-12 border-l border-t border-ink/10 group bg-cream/50 hover:bg-white transition-colors cursor-default"
    >
      <div className="absolute top-4 right-4 text-[10px] font-mono opacity-20 group-hover:opacity-100 transition-opacity">
        SEC_{idx+1}.0
      </div>
      <div className="w-10 h-10 mb-10 flex items-center justify-center text-ink group-hover:text-lime transition-colors">
        <Icon size={32} strokeWidth={1} />
      </div>
      <h3 className="text-2xl font-black uppercase tracking-tighter mb-6">{title}</h3>
      <p className="text-sm font-medium opacity-50 leading-relaxed uppercase tracking-wide">
        {desc}
      </p>
      <div className="mt-12 overflow-hidden h-px bg-ink/10 relative">
        <motion.div 
          className="absolute inset-y-0 left-0 bg-lime w-1/4"
          animate={{ x: ["-100%", "400%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </motion.div>
  );
};

// --- Main App ---
export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const { scrollYProgress } = useScroll();
  const springScroll = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });
  
  const heroScale = useTransform(springScroll, [0, 0.2], [1, 1.2]);
  const heroOpacity = useTransform(springScroll, [0, 0.15], [1, 0]);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="relative min-h-screen">
      <BlueprintCursor />
      
      {/* Header: Architectural Navigation */}
      <nav className="fixed top-0 left-0 w-full z-[100] border-b border-ink/10 backdrop-blur-md bg-cream/80">
        <div className="max-w-[1800px] mx-auto grid grid-cols-4 md:grid-cols-12 h-20 items-center px-8">
          <div className="col-span-2 md:col-span-3 font-black text-xl tracking-tighter uppercase flex items-center gap-3">
            <Command className="text-lime" /> Deimantė
          </div>
          <div className="hidden md:flex col-span-6 justify-center gap-16 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
            <a href="#matrix" className="hover:opacity-100 transition-opacity">Sistema</a>
            <a href="#arch" className="hover:opacity-100 transition-opacity">Architektūra</a>
            <a href="#proof" className="hover:opacity-100 transition-opacity">Rezultatai</a>
          </div>
          <div className="col-span-2 md:col-span-3 flex justify-end">
            <button className="bg-ink text-cream px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-lime hover:text-ink transition-all flex items-center gap-3">
              Pradėti Projektą <Plus size={12} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero: High-Impact Clarity */}
      <section className="h-screen relative flex items-center justify-center overflow-hidden bg-ink text-cream px-8">
        <div className="absolute inset-0 z-0">
          <Canvas>
            <PerspectiveCamera makeDefault position={[0, 0, 5]} />
            <HoudiniCloud />
            <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
              <Sphere args={[2, 64, 64]} position={[0, 0, -5]}>
                <MeshDistortMaterial color={COLORS.lime} speed={2} distort={0.3} opacity={0.1} transparent />
              </Sphere>
            </Float>
          </Canvas>
        </div>
        
        <motion.div 
          style={{ scale: heroScale, opacity: heroOpacity }}
          className="relative z-10 text-center"
        >
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-8 flex items-center justify-center gap-4"
          >
            <div className="h-px w-12 bg-lime/30" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-lime">Balso Inžinerija</span>
            <div className="h-px w-12 bg-lime/30" />
          </motion.div>
          
          <h1 className="text-[14vw] md:text-[10vw] leading-[0.8] font-black uppercase tracking-tighter italic font-accent mb-12">
            Aiškumas <br/> <span className="text-lime not-italic underline decoration-1 underline-offset-8">Galia</span>
          </h1>
          
          <div className="max-w-xl mx-auto space-y-8">
            <p className="text-sm md:text-xl font-light opacity-60 uppercase tracking-widest leading-relaxed">
              Architektūrinis priėjimas prie prekės ženklo komunikacijos. Paverčiame triukšmą į aukšto konversijos lygio strategiją.
            </p>
            <div className="flex justify-center gap-4">
               <button className="w-16 h-16 rounded-full border border-lime/30 flex items-center justify-center text-lime hover:bg-lime hover:text-ink transition-all">
                  <ArrowRight className="rotate-90" />
               </button>
            </div>
          </div>
        </motion.div>

        {/* HUD Elements */}
        <div className="absolute bottom-12 left-12 hidden md:block text-[8px] font-mono opacity-30 space-y-1">
          <p>STATUS: OPTIMIZED</p>
          <p>COORD: 54.6872° N, 25.2797° E</p>
          <p>VAL: HIGH_CONVERSION_ENV</p>
        </div>
      </section>

      {/* Philosophy: The Architect's View */}
      <section className="py-32 bg-cream relative px-8 border-b border-ink/10 overflow-hidden">
        <GridBackground />
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-12 gap-20 items-center relative z-10">
          <div className="lg:col-span-7">
             <motion.h2 
               initial={{ opacity: 0, x: -50 }}
               whileInView={{ opacity: 1, x: 0 }}
               className="text-7xl md:text-[9vw] font-black uppercase tracking-tighter leading-[0.8] mb-16 text-ink"
             >
               Aš nekuriu <br/> <span className="text-red italic font-accent underline decoration-lime underline-offset-[12px]">Turinio</span>
             </motion.h2>
             <div className="space-y-12">
               <p className="text-2xl md:text-4xl font-light italic opacity-70 leading-tight text-ink max-w-2xl">
                 "Dauguma verslų Lietuvoje skęsta informacinėje migloje. Jie sako daug, bet <span className="text-ink font-black not-italic">nepasako nieko</span>."
               </p>
               <div className="grid grid-cols-2 gap-12 border-t-2 border-ink/5 pt-12">
                  <div>
                    <h4 className="text-[10px] font-black uppercase mb-4 text-red tracking-widest">Problema</h4>
                    <p className="text-lg font-bold text-ink/80 leading-snug">Inertiška komunikacija, kuri kainuoja milijonus galimybių.</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase mb-4 text-lime tracking-widest text-shadow-sm">Sprendimas</h4>
                    <p className="text-lg font-bold text-ink/80 leading-snug">Preciziškas lingvistinis dizainas tiesiai į vartotoją.</p>
                  </div>
               </div>
             </div>
          </div>
          <div className="lg:col-span-5 relative">
             <div className="aspect-[4/5] bg-ink overflow-hidden relative group shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-red/20 via-transparent to-lime/20 group-hover:opacity-50 transition-opacity duration-700" />
                <div className="absolute inset-0 flex items-center justify-center p-12">
                   <div className="text-[35vw] font-black text-lime opacity-[0.03] absolute -right-20 -bottom-20 rotate-12 group-hover:rotate-0 transition-transform duration-1000">S</div>
                   <div className="text-center relative z-10">
                      <Command size={64} className="text-red mb-8 mx-auto" strokeWidth={1} />
                      <div className="text-cream font-black text-3xl uppercase tracking-tighter italic leading-none">
                         Sraute <br/> <span className="text-lime">Architektūra</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* The Matrix: Core Systems */}
      <section id="matrix" className="bg-cream py-32 relative overflow-hidden px-8 border-b border-ink/5">
        <GridBackground />
        <div className="max-w-[1800px] mx-auto relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-end mb-32">
            <div className="lg:col-span-8">
              <h2 className="text-7xl md:text-[10vw] font-black uppercase tracking-tighter leading-[0.8] text-ink">
                Sistemos <br/> Logika
              </h2>
            </div>
            <div className="lg:col-span-4">
              <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] leading-relaxed text-ink/60">
                KIEKVIENAS PROJEKTAS YRA UNIKALI <br/> ARCHITEKTŪRINĖ KONSTELIACIJA. KONSTRUOJAME <br/> <span className="text-ink">PELNĄ</span> PER PRECIZINĮ ŽODŽIO DIZAINĄ.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 md:gap-8">
            {[
              { title: "Dėmesio Valdymas", icon: Target, num: "01", color: COLORS.red, desc: "Valdome vartotojo dėmesį per vizualinį ir tekstinį ritmą." },
              { title: "Konversijos Kodas", icon: Code, num: "02", color: COLORS.lime, desc: "Kiekvienas simbolis turi savo ROI. Optimizuojame tekstus pelnui." },
              { title: "Identiteto Svoris", icon: Hexagon, num: "03", color: COLORS.red, desc: "Suteikiame prekės ženklui identitetą, kuris tampa rinkos standartu." },
              { title: "Srautinis Gylis", icon: Layers, num: "04", color: COLORS.lime, desc: "Organiškas kliento vedimas per piltuvėlį be jokio pasipriešinimo." }
            ].map((item, i) => (
              <div key={i} className="flex flex-col">
                <div className="flex justify-between items-center mb-12">
                  <div className="w-10 h-10 flex items-center justify-center border border-ink/10 rounded-full relative">
                    <div className="absolute inset-0 scale-75 blur-md opacity-20 rounded-full" style={{ backgroundColor: item.color }} />
                    <item.icon size={18} style={{ color: item.color }} strokeWidth={1.5} />
                  </div>
                  <span className="text-[8px] font-mono text-ink/20 font-black tracking-widest">{item.num}</span>
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-ink mb-4 leading-tight">{item.title}</h3>
                <p className="text-[10px] text-ink/40 uppercase tracking-[0.1em] leading-relaxed font-bold">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process: The Blueprint */}
      <section id="arch" className="py-32 bg-cream px-8 overflow-hidden relative border-b border-ink/5">
        <GridBackground />
        <div className="max-w-[1800px] mx-auto relative z-10">
          <div className="mb-32">
            <h2 className="text-[12vw] font-black uppercase tracking-tighter italic font-accent text-ink leading-none">Procesas</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-px md:bg-ink/5 relative">
            {[
              { num: "01", label: "Auditas", title: "Defektų Paieška", desc: "Nustatome, kur jūsų balsas pradingsta konkurentų fone ir kur slypi neišnaudotas potencialas.", color: COLORS.red },
              { num: "02", label: "Sistemos", title: "Srauto Dizainas", desc: "Konstruojame unikalų komunikacijos karkasą, kuris tarnaus jūsų verslui metus, ne dienas.", color: COLORS.lime },
              { num: "03", label: "Gamyba", title: "Išpildymas", desc: "Nuo manifesto iki kasdienių interakcijų – kiekviena detalė suderinama su pagrindine strategija.", color: COLORS.red }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="bg-cream p-12 flex flex-col justify-between group relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center gap-4 mb-12">
                    <span className="text-xl font-black text-ink" style={{ color: step.color }}>{step.num}</span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/40">{step.label}</span>
                  </div>
                  <h3 className="text-4xl font-black uppercase tracking-tighter text-ink mb-8 leading-none group-hover:italic transition-all duration-500">{step.title}</h3>
                  <p className="text-xs text-ink/50 uppercase tracking-widest leading-relaxed font-bold max-w-[280px]">
                    {step.desc}
                  </p>
                </div>
                {/* Accent line at bottom */}
                <div className="mt-20 h-px w-full bg-ink/10 relative overflow-hidden">
                  <motion.div 
                    className="absolute inset-0"
                    style={{ backgroundColor: step.color }}
                    initial={{ scaleX: 0, originX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 1, delay: i * 0.2 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lithuanian Market Pain Points */}
      <section className="py-32 bg-cream relative px-8 overflow-hidden border-b border-ink/5 text-ink">
        <GridBackground />
        <div className="max-w-[1800px] mx-auto relative z-10">
          <div className="mb-32">
            <h2 className="text-7xl md:text-[10vw] font-black uppercase tracking-tighter leading-[0.8]">
              Rinkos <br/> Defektai
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-ink/5">
            {[
              { title: "Generinė Kalba", desc: "90% verslų Lietuvoje skamba identiškai. Identiteto mirtis." },
              { title: "Žema Konversija", desc: "Srautas yra, bet pardavimų nėra. Prarandate tūkstančius." },
              { title: "Kainų Karas", desc: "Konkuruojate kaina, nes nesugebate paaiškinti vertės." },
              { title: "Branding Chaos", desc: "Kiekvienas kanalas kalba skirtingai. Klientai nepasitiki." }
            ].map((p, i) => (
              <div key={i} className="bg-cream p-12 flex flex-col justify-between aspect-square group hover:bg-red/[0.02] transition-colors">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 border border-ink/10 flex items-center justify-center text-red font-black text-xl">✕</div>
                  <span className="text-[8px] font-mono text-ink/20 font-black tracking-widest uppercase">ERR_0{i+1}</span>
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-ink mb-4 leading-none">{p.title}</h3>
                  <p className="text-[10px] text-ink/40 uppercase tracking-[0.1em] leading-relaxed font-bold">
                    {p.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-32 p-16 bg-ink flex flex-col md:flex-row items-center justify-between gap-12 group overflow-hidden relative">
            <div className="absolute inset-0 bg-red opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10">
              <h3 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-cream leading-none group-hover:text-ink transition-colors duration-500">
                Mes <span className="italic font-accent">Sutvarkome</span> <br/> Jūsų Balsą.
              </h3>
            </div>
            <button className="relative z-10 px-16 py-8 bg-lime text-ink font-black text-xl uppercase tracking-tighter hover:bg-cream transition-all group-hover:bg-ink group-hover:text-cream">
              Gauti Sprendimą
            </button>
          </div>
        </div>
      </section>

      {/* Proof: High-Value Testimonials */}
      <section id="proof" className="bg-ink py-40 text-cream px-8 border-y border-cream/10">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
             <div className="space-y-12">
                <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter italic font-accent leading-none">
                  Įrodytas <br/> <span className="text-lime not-italic">Svoris</span>
                </h2>
                <div className="w-20 h-px bg-lime" />
                <p className="text-xl opacity-50 uppercase tracking-widest">
                  Mes nedirbame su kiekvienu. Mes dirbame su tais, kurie nori dominuoti savo rinkos segmente.
                </p>
             </div>
             <div className="space-y-4">
               {[
                 { q: "„Ji pakeitė mūsų supratimą apie tai, kaip verslas turėtų kalbėti su rinka. Rezultatas: +40% konversija per 3 mėnesius.“", n: "Tech Hub CEO" },
                 { q: "„Tai nebuvo tik konsultacija. Tai buvo pilna komunikacijos operacinės sistemos perinstaliacija.“", n: "Fintech įkūrėjas" }
               ].map((t, i) => (
                 <div key={i} className="p-12 border border-cream/10 bg-cream/5 group hover:bg-lime hover:text-ink transition-all">
                    <p className="text-2xl font-accent italic mb-8">"{t.q}"</p>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100">— {t.n}</p>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </section>

      {/* Call to Action: The Invitation */}
      <section className="h-screen flex flex-col items-center justify-center bg-cream px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
           <Canvas><HoudiniCloud /></Canvas>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center max-w-5xl"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-ink/30 mb-12 block">Ribotas Prieinamumas</span>
          <h2 className="text-6xl md:text-[11vw] font-black uppercase tracking-tighter leading-none mb-16 italic font-accent">
            Pradėkime <br/> <span className="bg-ink text-cream px-6 not-italic">Analizę</span>
          </h2>
          <p className="text-xl md:text-3xl font-light opacity-60 mb-20 max-w-3xl mx-auto leading-relaxed italic">
            Mes ieškome partnerių, kurie pasiruošę transformuoti savo balsą. Pirmas žingsnis – 30 minučių strateginis auditas.
          </p>
          
          <button className="group relative inline-flex items-center gap-8 bg-ink text-cream px-12 py-8 text-xl md:text-3xl font-black uppercase tracking-tighter hover:bg-lime hover:text-ink transition-all shadow-[12px_12px_0px_rgba(195,255,0,0.5)] active:shadow-none active:translate-x-2 active:translate-y-2">
            Rezervuoti Auditą <Send className="group-hover:translate-x-4 transition-transform" />
          </button>
          
          <div className="mt-20 flex justify-center gap-12 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
             <span>Kaunas / Vilnius</span>
             <span>•</span>
             <span>Globalūs Projektai</span>
          </div>
        </motion.div>
      </section>

      {/* Footer: Premium Massive */}
      <footer className="bg-ink text-cream relative pt-32 pb-12 px-8 overflow-hidden">
        <div className="max-w-[1800px] mx-auto relative z-10">
          <div className="grid lg:grid-cols-12 gap-20 mb-32">
            <div className="lg:col-span-8">
              <h2 className="text-[18vw] font-black uppercase tracking-tighter leading-[0.7] mb-16 text-red">
                Sraute <span className="text-white/5">.lt</span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                <div>
                  <h4 className="text-lime font-black text-[10px] uppercase tracking-widest mb-6">Navigacija</h4>
                  <ul className="text-[10px] uppercase tracking-[0.2em] space-y-3 font-bold opacity-40">
                    <li><a href="#matrix" className="hover:text-red hover:opacity-100 transition-all">Sistema</a></li>
                    <li><a href="#arch" className="hover:text-lime hover:opacity-100 transition-all">Architektūra</a></li>
                    <li><a href="#proof" className="hover:text-red hover:opacity-100 transition-all">Rezultatai</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-red font-black text-[10px] uppercase tracking-widest mb-6">Miestai</h4>
                  <ul className="text-[10px] uppercase tracking-[0.2em] space-y-3 font-bold opacity-40">
                    <li>Vilnius</li>
                    <li>Kaunas</li>
                    <li>Klaipėda</li>
                  </ul>
                </div>
                <div className="col-span-2">
                  <h4 className="text-white font-black text-[10px] uppercase tracking-widest mb-6">Vizija</h4>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-40 leading-relaxed max-w-xs">
                    ARCHITEKTŪRINIS PRIĖJIMAS PRIE PREKĖS ŽENKLO KOMUNIKACIJOS. KONSTRUOJAME AUTORITETĄ.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-4 flex flex-col justify-end">
              <div className="mb-12">
                <h4 className="text-white/20 font-black text-[10px] uppercase tracking-widest mb-4">Projektams</h4>
                <a href="mailto:hi@sraute.lt" className="text-4xl md:text-5xl font-black text-lime hover:text-red transition-colors duration-500 break-all">
                  hi@sraute.lt
                </a>
              </div>
              <div className="flex gap-4">
                {['Instagram', 'LinkedIn'].map(s => (
                  <a key={s} href="#" className="flex-1 py-5 border border-white/10 text-center text-[10px] font-black uppercase tracking-widest hover:bg-cream hover:text-ink transition-all">
                    {s}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[9px] font-mono uppercase tracking-[0.5em] opacity-20">
            <p>© 2025 SRAUTE — BALSO ARCHITEKTŪRA</p>
            <p className="text-red">BY DEIMANTĖ DAUGINTYTĖ</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
