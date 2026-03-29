import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Video, LayoutDashboard, Settings, LogOut, 
  Play, Download, Trash2, Clock, Calendar,
  ExternalLink, Search, Filter
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/hooks/useAuth';
import { formatDuration } from '../lib/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Recording {
  id: string;
  filename: string;
  duration: number;
  url: string;
  created_at: string;
  expires_at: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchRecordings = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('recordings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecordings(data || []);
    } catch (err) {
      console.error('Error fetching recordings:', err);
      toast.error('No se pudieron cargar tus grabaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecordings();
  }, [user]);

  const handleDelete = async (id: string, filename: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta grabación?')) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('recordings')
        .remove([filename]);

      if (storageError) throw storageError;

      // Delete from DB
      const { error: dbError } = await supabase
        .from('recordings')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      setRecordings(prev => prev.filter(r => r.id !== id));
      toast.success('Grabación eliminada');
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Error al eliminar la grabación');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.info('Sesión cerrada');
  };

  const filteredRecordings = recordings.filter(r => 
    r.filename.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex bg-black">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 flex flex-col hidden md:flex">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Video className="text-black w-5 h-5" />
            </div>
            <span className="font-bold text-lg">Grabador web</span>
          </Link>
        </div>

        <nav className="flex-grow p-4 space-y-2">
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-orange-500 text-black rounded-xl font-bold">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </Link>
          <Link to="/recorder" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-colors text-white/60 hover:text-white">
            <Video className="w-5 h-5" /> Nueva grabación
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-colors text-white/60 hover:text-white">
            <Settings className="w-5 h-5" /> Ajustes
          </button>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-3 mb-4">
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-xs font-bold">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className="flex-grow overflow-hidden">
              <p className="text-xs font-bold truncate">{user?.email}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">Plan Pro</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-colors text-white/40"
          >
            <LogOut className="w-5 h-5" /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col">
        <header className="px-8 py-6 flex items-center justify-between border-b border-white/10">
          <h1 className="text-2xl font-black tracking-tight">MIS GRABACIONES</h1>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input 
                type="text" 
                placeholder="Buscar vídeos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm outline-none focus:border-orange-500 transition-all w-64"
              />
            </div>
            <Link to="/recorder" className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-orange-500 hover:text-white transition-all">
              Nueva grabación
            </Link>
          </div>
        </header>

        <div className="p-8 flex-grow overflow-y-auto">
          {loading ? (
            <div className="h-full flex items-center justify-center text-white/20">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredRecordings.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredRecordings.map((recording) => (
                <motion.div 
                  key={recording.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-orange-500/50 transition-all"
                >
                  <div className="aspect-video relative bg-black">
                    <video 
                      src={recording.url} 
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                      <a 
                        href={recording.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                      >
                        <Play className="w-5 h-5 fill-current" />
                      </a>
                    </div>
                    <div className="absolute bottom-3 right-3 bg-black/80 px-2 py-1 rounded text-[10px] font-mono font-bold">
                      {formatDuration(recording.duration)}
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="overflow-hidden">
                        <h3 className="font-bold truncate text-sm mb-1">{recording.filename}</h3>
                        <div className="flex items-center gap-3 text-[10px] text-white/40 uppercase tracking-widest font-bold">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(new Date(recording.created_at), 'dd MMM yyyy', { locale: es })}</span>
                          <span className="flex items-center gap-1 text-orange-500/60"><Clock className="w-3 h-3" /> Expira en 30 días</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <a 
                          href={recording.url} 
                          download 
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
                          title="Descargar"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button 
                          onClick={() => handleDelete(recording.id, recording.filename)}
                          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-white/60 hover:text-red-500"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <a 
                        href={recording.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] font-bold uppercase tracking-widest hover:text-orange-500 transition-colors flex items-center gap-1"
                      >
                        Abrir <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto">
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10">
                <Video className="w-10 h-10 text-white/20" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">No hay grabaciones</h3>
                <p className="text-white/40 text-sm font-light">
                  Aún no has guardado ningún vídeo. ¡Empieza a grabar tu pantalla ahora mismo!
                </p>
              </div>
              <Link to="/recorder" className="bg-orange-500 text-black px-8 py-3 rounded-full font-bold hover:bg-orange-400 transition-all">
                Crear mi primera grabación
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
