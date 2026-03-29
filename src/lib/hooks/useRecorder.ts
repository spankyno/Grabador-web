import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';

export type RecordingQuality = 'low' | 'medium' | 'high';

interface QualitySettings {
  width: number;
  height: number;
  bitrate: number;
}

const QUALITY_MAP: Record<RecordingQuality, QualitySettings> = {
  low: { width: 1280, height: 720, bitrate: 1500000 },
  medium: { width: 1920, height: 1080, bitrate: 3500000 },
  high: { width: 2560, height: 1440, bitrate: 8000000 },
};

export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [quality, setQuality] = useState<RecordingQuality>('medium');
  const [recordingLimit, setRecordingLimit] = useState<number | null>(null);
  const [isAudioActive, setIsAudioActive] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const durationRef = useRef(0);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      toast.info('Grabación finalizada');
    }
  }, []);

  const startRecording = useCallback(async (mode: 'screen' | 'webcam') => {
    try {
      const settings = QUALITY_MAP[quality];
      let mediaStream: MediaStream;

      if (mode === 'screen') {
        mediaStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: settings.width,
            height: settings.height,
            frameRate: 30,
          },
          audio: true,
        });

        // If we want to mix microphone, we need to get it separately
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const tracks = [...mediaStream.getTracks(), ...micStream.getAudioTracks()];
          mediaStream = new MediaStream(tracks);
        } catch (e) {
          console.warn('Microphone access denied, recording screen audio only.');
        }
      } else {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: settings.width,
            height: settings.height,
          },
          audio: true,
        });
      }

      setStream(mediaStream);
      setIsAudioActive(mediaStream.getAudioTracks().length > 0);
      chunksRef.current = [];

      const options = {
        mimeType: 'video/webm;codecs=vp9,opus',
        videoBitsPerSecond: settings.bitrate,
      };

      // Fallback for browsers that don't support VP9
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm;codecs=vp8,opus';
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm';
      }

      const recorder = new MediaRecorder(mediaStream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        setIsRecording(false);
        setIsPaused(false);
        if (timerRef.current) clearInterval(timerRef.current);
        
        // Stop all tracks
        mediaStream.getTracks().forEach(track => track.stop());
        setStream(null);
        setIsAudioActive(false);
      };

      recorder.start(1000); // Collect data every second
      setIsRecording(true);
      setDuration(0);
      durationRef.current = 0;

      const MAX_LIMIT = 10800; // 3 hours
      const effectiveLimit = recordingLimit ? Math.min(recordingLimit, MAX_LIMIT) : MAX_LIMIT;

      timerRef.current = setInterval(() => {
        durationRef.current += 1;
        setDuration(durationRef.current);
        
        if (durationRef.current >= effectiveLimit) {
          stopRecording();
          toast.info('Límite de tiempo alcanzado');
        }
      }, 1000);

      toast.success('Grabación iniciada');
    } catch (err) {
      console.error('Error starting recording:', err);
      toast.error('No se pudo iniciar la grabación. Verifica los permisos.');
    }
  }, [quality, recordingLimit, stopRecording]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
      toast.info('Grabación pausada');
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      const MAX_LIMIT = 10800; // 3 hours
      const effectiveLimit = recordingLimit ? Math.min(recordingLimit, MAX_LIMIT) : MAX_LIMIT;

      timerRef.current = setInterval(() => {
        durationRef.current += 1;
        setDuration(durationRef.current);
        
        if (durationRef.current >= effectiveLimit) {
          stopRecording();
          toast.info('Límite de tiempo alcanzado');
        }
      }, 1000);
      toast.info('Grabación reanudada');
    }
  }, [recordingLimit, stopRecording]);

  return {
    isRecording,
    isPaused,
    duration,
    recordedBlob,
    stream,
    quality,
    setQuality,
    recordingLimit,
    setRecordingLimit,
    isAudioActive,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    setRecordedBlob,
    setDuration
  };
}
