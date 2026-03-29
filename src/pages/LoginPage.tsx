import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Video, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('¡Bienvenido de nuevo!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-500/10 via-transparent to-transparent pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center text-center mb-10">
          <Link to="/" className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-6">
            <Video className="text-black w-7 h-7" />
          </Link>
          <h1 className="text-3xl font-black tracking-tight mb-2">HOLA DE NUEVO</h1>
          <p className="text-white/40 text-sm">Entra para gestionar tus grabaciones.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 outline-none focus:border-orange-500 transition-all"
                placeholder="tu@email.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 outline-none focus:border-orange-500 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-black py-4 rounded-2xl font-bold hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center gap-2 group"
          >
            {loading ? 'Entrando...' : (
              <>Entrar <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
            )}
          </button>
        </form>

        <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-2xl flex gap-3 items-start">
          <ShieldCheck className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-orange-500">Seguridad garantizada por Supabase</p>
            <p className="text-[10px] text-white/40 leading-relaxed">
              Tus credenciales y tus archivos están protegidas mediante cifrado de grado empresarial y protocolos de autenticación segura.
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-white/40">
          ¿No tienes cuenta? <Link to="/signup" className="text-white font-bold hover:text-orange-500 transition-colors">Regístrate gratis</Link>
        </p>
      </motion.div>
    </div>
  );
}
