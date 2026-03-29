import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Video, Monitor, Camera, Mic, MicOff, Settings, 
  Play, Pause, Square, Download, CloudUpload, X,
  ChevronDown, Info, Clock
} from 'lucide-react';
import { useRecorder, RecordingQuality } from '../lib/hooks/useRecorder';
import { useAuth } from '../lib/hooks/useAuth';
import { formatDuration, getExpirationDate } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export default function RecorderPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    isRecording, isPaused, duration, recordedBlob, stream,
    quality, setQuality, recordingLimit, setRecordingLimit,
    isAudioActive, startRecording, stopRecording,
    pauseRecording, resumeRecording, setRecordedBlob, setDuration
  } = useRecorder();

  const [mode, setMode] = useState<'screen' | 'webcam'>('screen');
  const [isUploading, setIsUploading] = useState(false);
  const [limitHours, setLimitHours] = useState(0);
  const [limitMinutes, setLimitMinutes] = useState(0);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const totalSeconds = (limitHours * 3600) + (limitMinutes * 60);
    // Max 3 hours = 10800 seconds
    const cappedSeconds = Math.min(totalSeconds, 10800);
    setRecordingLimit(cappedSeconds > 0 ? cappedSeconds : null);
  }, [limitHours, limitMinutes, setRecordingLimit]);

  useEffect(() => {
    if (videoPreviewRef.current && stream) {
      videoPreviewRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleDownload = () => {
    if (!recordedBlob) return;
    const url = URL.createObjectURL(recordedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grabacion-${new Date().getTime()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Descarga iniciada');
  };

  const handleUpload = async () => {
    if (!recordedBlob || !user) return;
    
    setIsUploading(true);
    const filename = `recording-${user.id}-${Date.now()}.webm`;
    
    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('recordings')
        .upload(filename, recordedBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('recordings')
        .getPublicUrl(filename);

      const { error: dbError } = await supabase
        .from('recordings')
        .insert({
          user_id: user.id,
          filename: filename,
          duration: duration,
          url: publicUrl,
          expires_at: getExpirationDate(30).toISOString()
        });

      if (dbError) throw dbError;

      toast.success('Vídeo guardado en tu dashboard');
      navigate('/dashboard');
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Error al subir el vídeo');
    } finally {
      setIsUploading(false);
    }
  };

  const GUEST_LIMIT = 600; // 10 minutes

  return (
    <div className="min-h-screen flex flex-col bg-black overflow-hidden">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-white/10 bg-black/50 backdrop-blur-xl z-20">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Video className="text-black w-5 h-5" />
          </div>
          <span className="font-bold text-lg hidden sm:inline">Grabador web</span>
        </Link>

        {isRecording && (
          <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`} />
            <div className="flex flex-col items-center">
              <span className="font-mono text-xl tabular-nums leading-none">{formatDuration(duration)}</span>
              <span className="text-[8px] uppercase tracking-widest font-bold opacity-40">
                {isPaused ? 'En pausa' : 'Grabando'}
              </span>
            </div>
            <div className="h-4 w-[1px] bg-white/10" />
            <span className="text-[10px] text-white/40 font-mono">/ {formatDuration(recordingLimit || 10800)}</span>
            {!user && duration > GUEST_LIMIT - 60 && (
              <span className="text-xs text-orange-500 animate-bounce">Límite pronto</span>
            )}
          </div>
        )}

        <div className="flex items-center gap-4">
          {user ? (
            <Link to="/dashboard" className="text-sm font-medium hover:text-orange-500 transition-colors">Mi Dashboard</Link>
          ) : (
            <div className="flex items-center gap-2 text-xs text-white/40 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <Clock className="w-3 h-3" />
              <span>Modo Invitado (10 min máx)</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-6 relative">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />

        <AnimatePresence mode="wait">
          {!recordedBlob ? (
            <motion.div 
              key="setup"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-4xl aspect-video bg-white/5 rounded-3xl border border-white/10 overflow-hidden relative group"
            >
              {stream ? (
                <div className="relative w-full h-full">
                  <video 
                    ref={videoPreviewRef} 
                    autoPlay 
                    muted 
                    className="w-full h-full object-cover"
                  />
                  {/* Audio Indicator */}
                  <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                    {isAudioActive ? (
                      <Mic className="w-4 h-4 text-green-500" />
                    ) : (
                      <MicOff className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      {isAudioActive ? 'Audio Activo' : 'Sin Audio'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20">
                  <Monitor className="w-24 h-24 mb-4 opacity-20" />
                  <p className="text-lg font-light">Listo para capturar</p>
                </div>
              )}

              {/* Controls Overlay */}
              {!isRecording && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center p-8">
                  <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-8">
                    <button 
                      onClick={() => setMode('screen')}
                      className={`p-6 rounded-2xl border transition-all flex flex-col items-center gap-3 ${mode === 'screen' ? 'bg-orange-500 border-orange-500 text-black shadow-lg shadow-orange-500/20' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                    >
                      <Monitor className="w-8 h-8" />
                      <span className="font-bold">Pantalla</span>
                    </button>
                    <button 
                      onClick={() => setMode('webcam')}
                      className={`p-6 rounded-2xl border transition-all flex flex-col items-center gap-3 ${mode === 'webcam' ? 'bg-orange-500 border-orange-500 text-black shadow-lg shadow-orange-500/20' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                    >
                      <Camera className="w-8 h-8" />
                      <span className="font-bold">Webcam</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-6 mb-8">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Calidad</span>
                      <select 
                        value={quality}
                        onChange={(e) => setQuality(e.target.value as RecordingQuality)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500"
                      >
                        <option value="low">720p (Baja)</option>
                        <option value="medium">1080p (Media)</option>
                        <option value="high">4K (Alta)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Límite (Máx 3h)</span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max="3"
                            value={limitHours}
                            onChange={(e) => setLimitHours(Math.min(3, Math.max(0, parseInt(e.target.value) || 0)))}
                            className="w-14 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-orange-500 font-mono"
                          />
                          <span className="text-[10px] font-mono opacity-50">h</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max="59"
                            value={limitMinutes}
                            onChange={(e) => {
                              let val = parseInt(e.target.value) || 0;
                              if (limitHours === 3) val = 0;
                              setLimitMinutes(Math.min(59, Math.max(0, val)));
                            }}
                            className="w-14 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-orange-500 font-mono"
                          />
                          <span className="text-[10px] font-mono opacity-50">m</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => startRecording(mode)}
                    className="group relative flex items-center justify-center w-24 h-24 bg-red-500 rounded-full hover:scale-110 transition-transform active:scale-95"
                  >
                    <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20" />
                    <div className="w-8 h-8 bg-white rounded-full group-hover:rounded-lg transition-all" />
                  </button>
                  <p className="mt-4 font-bold text-sm tracking-widest uppercase">Click para empezar</p>
                </div>
              )}

              {isRecording && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/80 backdrop-blur-xl border border-white/10 p-2 rounded-full shadow-2xl">
                  {isPaused ? (
                    <button onClick={resumeRecording} className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                      <Play className="w-5 h-5 fill-current" />
                    </button>
                  ) : (
                    <button onClick={pauseRecording} className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                      <Pause className="w-5 h-5 fill-current" />
                    </button>
                  )}
                  <button 
                    onClick={stopRecording}
                    className="w-16 h-16 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                  >
                    <Square className="w-6 h-6 fill-current" />
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-4xl space-y-8"
            >
              <div className="aspect-video bg-white/5 rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                <video 
                  src={URL.createObjectURL(recordedBlob)} 
                  controls 
                  className="w-full h-full"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-white/5 border border-white/10 p-8 rounded-3xl">
                <div>
                  <h2 className="text-2xl font-bold mb-2">¡Grabación lista!</h2>
                  <p className="text-white/40 text-sm">Duración: {formatDuration(duration)} • WebM Format</p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <button 
                    onClick={() => {
                      setRecordedBlob(null);
                      setDuration(0);
                    }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5" /> Descartar
                  </button>
                  <button 
                    onClick={handleDownload}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-orange-500 hover:text-white transition-all"
                  >
                    <Download className="w-5 h-5" /> Descargar
                  </button>
                  {user && (
                    <button 
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-black rounded-xl font-bold hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {isUploading ? (
                        <>Subiendo...</>
                      ) : (
                        <><CloudUpload className="w-5 h-5" /> Guardar en Nube</>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {!user && (
                <div className="p-6 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center gap-4">
                  <Info className="text-orange-500 w-6 h-6 shrink-0" />
                  <p className="text-sm text-orange-500/80">
                    Estás en modo invitado. Para guardar tus vídeos en la nube y acceder a ellos desde cualquier lugar, 
                    <Link to="/signup" className="font-bold underline ml-1">crea una cuenta gratis</Link>.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Info */}
      <footer className="px-6 py-12 border-t border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
                <Video className="text-black w-4 h-4" />
              </div>
              <span className="font-bold text-sm">Grabador web</span>
            </div>
            <p className="text-xs text-white/40 leading-relaxed max-w-xs">
              Aitor Sánchez Gutiérrez © 2026 - Reservados todos los derechos
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/20">Autor y Contacto</h4>
              <ul className="text-xs space-y-2 text-white/60">
                <li>Autor: Aitor Sánchez Gutiérrez</li>
                <li>Contacto: blog.cottage627@passinbox.com</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/20">Recursos</h4>
              <ul className="text-xs space-y-2 text-white/60">
                <li>Blog: <a href="https://aitorblog.infinityfreeapp.com" target="_blank" rel="noreferrer" className="hover:text-orange-500 transition-colors">aitorblog.infinityfreeapp.com</a></li>
                <li>Más apps: <a href="https://aitorhub.vercel.app/" target="_blank" rel="noreferrer" className="hover:text-orange-500 transition-colors">aitorhub.vercel.app</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
