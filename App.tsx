
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, Points, PointMaterial, MeshDistortMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { ArrowRight, Zap, Target, Layers, Command, Plus, Hexagon, Code, Mic, Send } from 'lucide-react';

// --- Theme Config ---
const COLORS = {
  ink: '#0A0E27',
  cream: '#FAF8F3',
  lime: '#C3FF00',
};

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
      <section className="py-40 bg-cream relative px-8 border-b border-ink/10">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-12 gap-20 items-center">
          <div className="lg:col-span-7">
             <motion.h2 
               initial={{ opacity: 0, x: -50 }}
               whileInView={{ opacity: 1, x: 0 }}
               className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.9] mb-16"
             >
               Aš nekuriu <br/> <span className="text-lime bg-ink px-4 italic font-accent">Turinio</span>
             </motion.h2>
             <div className="space-y-12">
               <p className="text-3xl font-light italic opacity-70 leading-tight">
                 "Dauguma verslų Lietuvoje skęsta informacinėje migloje. Jie sako daug, bet nepasako nieko."
               </p>
               <div className="grid grid-cols-2 gap-8 border-t border-ink/10 pt-12">
                  <div>
                    <h4 className="text-[10px] font-black uppercase mb-4 text-ink/40">Problema</h4>
                    <p className="text-lg font-bold">Inertiška, bedvasė komunikacija, kuri kainuoja milijonus prarastų galimybių.</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase mb-4 text-ink/40">Sprendimas</h4>
                    <p className="text-lg font-bold">Preciziškas lingvistinis dizainas, kuris pataiko tiesiai į vartotojo poreikį.</p>
                  </div>
               </div>
             </div>
          </div>
          <div className="lg:col-span-5 relative">
             <div className="aspect-[4/5] bg-ink overflow-hidden border-4 border-ink relative group">
                <div className="absolute inset-0 bg-lime/20 group-hover:bg-lime/10 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center p-12">
                   <div className="text-[30vw] font-black text-lime opacity-5">S</div>
                   <div className="absolute bottom-12 left-12 text-cream font-black text-2xl uppercase tracking-tighter italic">
                      Sraute <br/> Architektūra
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* The Matrix: Core Systems */}
      <section id="matrix" className="bg-ink text-cream py-32 border-b border-cream/10">
        <div className="max-w-[1800px] mx-auto">
          <div className="px-8 mb-24 flex flex-col md:flex-row justify-between items-end gap-12">
            <div>
              <span className="text-lime text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Operacinė Sistema</span>
              <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter font-accent italic">Galimybių Matrica</h2>
            </div>
            <p className="max-w-md text-sm opacity-50 uppercase tracking-widest leading-loose">
              Mūsų darbas nėra linijinis. Tai daugiadimensė sistema, jungianti psichologiją, duomenis ir estetinį tikslumą.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 border-b border-r border-cream/10">
            <MatrixBox idx={0} icon={Target} title="Dėmesio Valdymas" desc="Paverčiame 8 sekundžių langą į negrįžtamą lojalumą per vizualinį ir tekstinį ritmą." />
            <MatrixBox idx={1} icon={Layers} title="Struktūrinis Gylis" desc="Sukuriame turinio hierarchiją, kuri organiškai veda klientą nuo smalsumo iki pirkimo." />
            <MatrixBox idx={2} icon={Hexagon} title="Kultūrinis Kodas" desc="Integruojame prekės ženklą į Lietuvos kultūrinį kontekstą taip, kad jis jaustųsi savas." />
            <MatrixBox idx={3} icon={Code} title="Konversijos Kalba" desc="Kiekvienas žodis turi komercinę vertę. Optimizuojame ROI per lingvistinį tikslumą." />
          </div>
        </div>
      </section>

      {/* Process: The Blueprint */}
      <section id="arch" className="py-40 bg-cream px-8 overflow-hidden">
        <div className="max-w-4xl mx-auto relative">
          <div className="mb-40 text-center">
            <h2 className="text-7xl md:text-9xl font-black uppercase tracking-tighter italic font-accent">Projektavimas</h2>
          </div>
          
          <div className="space-y-40 relative">
            {/* Connection Line */}
            <div className="absolute left-[20px] top-0 bottom-0 w-px bg-ink/10 hidden md:block" />
            
            {[
              { num: "01", label: "Auditas", title: "Triukšmo Analizė", desc: "Nustatome, kur jūsų balsas pradingsta konkurentų fone ir kur slypi neišnaudotas potencialas." },
              { num: "02", label: "Sistemos", title: "Balso Architektūra", desc: "Konstruojame unikalų komunikacijos karkasą, kuris tarnaus jūsų verslui metus, ne dienas." },
              { num: "03", label: "Gamyba", title: "Pilnas Išpildymas", desc: "Nuo manifesto iki kasdienių interakcijų – kiekviena detalė suderinama su pagrindine strategija." }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row gap-12 relative"
              >
                <div className="w-12 h-12 bg-ink text-lime flex items-center justify-center font-black shrink-0 z-10">
                   {step.num}
                </div>
                <div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-ink/30 mb-2 block">{step.label}</span>
                   <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8">{step.title}</h3>
                   <p className="text-xl opacity-60 leading-relaxed italic border-l-2 border-lime pl-8">
                     "{step.desc}"
                   </p>
                </div>
              </motion.div>
            ))}
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

      {/* Footer: Minimalist Ledger */}
      <footer className="py-12 bg-ink text-cream/30 px-8 border-t border-cream/5">
        <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8 font-mono text-[8px] uppercase tracking-widest">
           <div>© 2024 SRAUTE ARCHITECTURAL SERVICES</div>
           <div className="flex gap-12">
              <a href="#" className="hover:text-lime transition-colors">Instagram</a>
              <a href="#" className="hover:text-lime transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-lime transition-colors">Legal</a>
           </div>
           <div>BUILD_VERSION: 2.0.4_ACID</div>
        </div>
      </footer>
    </div>
  );
}
