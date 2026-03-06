import React, { useState, useRef } from 'react';
import { Upload, Music, Download, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { audioBufferToWav } from '../utils/audioUtils';

export const AudioConverter: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResultUrl(null);
      setError(null);
    }
  };

  const processAudio = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await file.arrayBuffer();
      const decodedBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // RouteNote Requirements: 44.1kHz, 16-bit, Stereo
      const targetSampleRate = 44100;
      const targetChannels = 2;

      // Use OfflineAudioContext for resampling and channel mixing
      const offlineCtx = new OfflineAudioContext(
        targetChannels,
        Math.ceil(decodedBuffer.duration * targetSampleRate),
        targetSampleRate
      );

      const source = offlineCtx.createBufferSource();
      source.buffer = decodedBuffer;
      source.connect(offlineCtx.destination);
      source.start();

      const renderedBuffer = await offlineCtx.startRendering();
      const wavBlob = audioBufferToWav(renderedBuffer);
      const url = URL.createObjectURL(wavBlob);
      
      setResultUrl(url);
    } catch (err) {
      console.error(err);
      setError('Failed to process audio. Please ensure the file is a valid audio format.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
        <h2 className="text-xl font-semibold text-zinc-900 mb-2 flex items-center gap-2">
          <Music className="w-5 h-5 text-blue-600" />
          Audio To WAV (16-bit/44.1kHz)
        </h2>
        <p className="text-sm text-zinc-500 mb-6">
          Converts any audio format to the industry standard required for distribution.
        </p>

        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer text-center
            ${file ? 'border-blue-200 bg-blue-50/30' : 'border-zinc-200 hover:border-blue-400 hover:bg-zinc-50'}
          `}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="audio/*"
            className="hidden"
          />
          
          {file ? (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <Music className="w-6 h-6 text-blue-600" />
              </div>
              <p className="font-medium text-zinc-900 truncate max-w-xs">{file.name}</p>
              <p className="text-xs text-zinc-500 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-3">
                <Upload className="w-6 h-6 text-zinc-400" />
              </div>
              <p className="font-medium text-zinc-900">Click to upload audio</p>
              <p className="text-xs text-zinc-500 mt-1">MP3, FLAC, WAV, OGG, M4A</p>
            </div>
          )}
        </div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-sm"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6">
          {!resultUrl ? (
            <button
              disabled={!file || isProcessing}
              onClick={processAudio}
              className={`
                w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all
                ${!file || isProcessing 
                  ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'}
              `}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing Audio...
                </>
              ) : (
                'Convert & Optimize Audio'
              )}
            </button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <div>
                  <p className="font-semibold text-emerald-900">Audio Ready!</p>
                  <p className="text-xs text-emerald-700">Optimized to 16-bit/44.1kHz WAV Stereo</p>
                </div>
              </div>
              <a
                href={resultUrl}
                download={`${file?.name.split('.')[0]}_RouteNote.wav`}
                className="w-full py-3 bg-zinc-900 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all"
              >
                <Download className="w-5 h-5" />
                Download WAV
              </a>
              <button 
                onClick={() => {
                  setFile(null);
                  setResultUrl(null);
                }}
                className="w-full text-zinc-500 text-sm hover:text-zinc-700 transition-colors"
              >
                Convert another file
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
