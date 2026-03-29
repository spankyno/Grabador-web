import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Video, Monitor, Zap, Shield, ArrowRight, Play } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Video className="text-black w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">Grabador web</span>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link to="/recorder" className="hover:text-orange-500 transition-colors">Grabar ahora</Link>
          <Link to="/login" className="hover:text-orange-500 transition-colors">Entrar</Link>
          <Link to="/signup" className="bg-white text-black px-4 py-2 rounded-full hover:bg-orange-500 hover:text-white transition-all">
            Empezar gratis
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="px-6 pt-24 pb-32 max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold tracking-widest uppercase bg-orange-500/10 text-orange-500 rounded-full border border-orange-500/20">
              100% Web & Open Source
            </span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
              GRABA TU PANTALLA <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500">
                SIN INSTALAR NADA.
              </span>
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
              La herramienta de grabación más rápida y potente directamente en tu navegador. 
              Estilo Loom, pero libre y para todos.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/recorder" className="group flex items-center gap-2 bg-orange-500 text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-400 transition-all transform hover:scale-105">
                Empezar a grabar <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-all">
                <Play className="w-5 h-5 fill-current" /> Ver demo
              </button>
            </div>
          </motion.div>

          {/* Fake Demo Preview */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mt-24 relative rounded-3xl overflow-hidden border border-white/10 bg-white/5 p-4 aspect-video shadow-2xl shadow-orange-500/10"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 pointer-events-none" />
            <img 
              src="https://picsum.photos/seed/recorder/1200/800" 
              alt="Grabador web interface" 
              className="w-full h-full object-cover rounded-2xl opacity-50 grayscale"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center animate-pulse">
                <Video className="text-black w-10 h-10" />
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features */}
        <section className="px-6 py-32 bg-white/5 border-y border-white/10">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center mb-6">
                <Monitor className="text-orange-500 w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold">Captura Total</h3>
              <p className="text-white/60 font-light">
                Graba tu pantalla completa, una ventana específica o solo una pestaña. Tú eliges qué compartir.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="text-orange-500 w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold">Velocidad Pura</h3>
              <p className="text-white/60 font-light">
                Sin descargas, sin extensiones. Abre la web, dale a grabar y listo. El vídeo es tuyo al instante.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="text-orange-500 w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold">Privacidad Primero</h3>
              <p className="text-white/60 font-light">
                Tus grabaciones se procesan localmente. Tú decides si quieres subirlas a nuestra nube segura.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Fake */}
        <section className="px-6 py-32 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">PLANES SENCILLOS</h2>
            <p className="text-white/60">Elige el que mejor se adapte a tus necesidades.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="p-8 rounded-3xl border border-white/10 bg-white/5 space-y-6">
              <h4 className="text-xl font-bold">Gratis (Invitado)</h4>
              <div className="text-4xl font-black">0€ <span className="text-sm text-white/40 font-normal">/ siempre</span></div>
              <ul className="space-y-3 text-white/60 text-sm">
                <li className="flex items-center gap-2">✓ Grabaciones de hasta 10 min</li>
                <li className="flex items-center gap-2">✓ Descarga local inmediata</li>
                <li className="flex items-center gap-2">✓ Sin registro necesario</li>
                <li className="flex items-center gap-2 text-white/20">✗ Almacenamiento en la nube</li>
              </ul>
              <Link to="/recorder" className="block w-full py-3 text-center bg-white/10 rounded-xl font-bold hover:bg-white/20 transition-all">
                Probar ahora
              </Link>
            </div>
            <div className="p-8 rounded-3xl border-2 border-orange-500 bg-orange-500/5 space-y-6 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-orange-500 text-black text-[10px] font-black px-2 py-1 rounded uppercase">Recomendado</div>
              <h4 className="text-xl font-bold">Pro (Registrado)</h4>
              <div className="text-4xl font-black">0€ <span className="text-sm text-white/40 font-normal">/ por ahora</span></div>
              <ul className="space-y-3 text-white/60 text-sm">
                <li className="flex items-center gap-2">✓ Grabaciones ilimitadas</li>
                <li className="flex items-center gap-2">✓ Almacenamiento en la nube (30 días)</li>
                <li className="flex items-center gap-2">✓ Dashboard personal</li>
                <li className="flex items-center gap-2">✓ Calidad hasta 4K</li>
              </ul>
              <Link to="/signup" className="block w-full py-3 text-center bg-orange-500 text-black rounded-xl font-bold hover:bg-orange-400 transition-all">
                Registrarse gratis
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-6 py-24 border-t border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Video className="text-black w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight">Grabador web</span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-sm">
              Aitor Sánchez Gutiérrez © 2026 - Reservados todos los derechos
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/20">Autor y Contacto</h4>
            <ul className="text-sm space-y-3 text-white/60">
              <li>Autor: Aitor Sánchez Gutiérrez</li>
              <li>Contacto: <a href="mailto:blog.cottage627@passinbox.com" className="hover:text-orange-500 transition-colors">blog.cottage627@passinbox.com</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/20">Recursos</h4>
            <ul className="text-sm space-y-3 text-white/60">
              <li>Blog: <a href="https://aitorblog.infinityfreeapp.com" target="_blank" rel="noreferrer" className="hover:text-orange-500 transition-colors">aitorblog.infinityfreeapp.com</a></li>
              <li>Más apps: <a href="https://aitorhub.vercel.app/" target="_blank" rel="noreferrer" className="hover:text-orange-500 transition-colors">aitorhub.vercel.app</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
