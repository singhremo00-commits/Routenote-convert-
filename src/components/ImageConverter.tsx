import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Download, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ImageConverter: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResultUrl(null);
      setError(null);
    }
  };

  const processImage = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = objectUrl;
      });

      const canvas = document.createElement('canvas');
      canvas.width = 3000;
      canvas.height = 3000;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Could not get canvas context');

      // Fill with white background (important for JPEG conversion if original has transparency)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 3000, 3000);

      // High quality resize
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, 3000, 3000);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.95);
      });

      if (!blob) throw new Error('Failed to create image blob');

      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error(err);
      setError('Failed to process image. Please ensure the file is a valid image format.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
        <h2 className="text-xl font-semibold text-zinc-900 mb-2 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-purple-600" />
          Cover Art (3000x3000px)
        </h2>
        <p className="text-sm text-zinc-500 mb-6">
          Resizes and converts your artwork to the exact specifications for digital stores.
        </p>

        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer text-center relative overflow-hidden
            ${file ? 'border-purple-200 bg-purple-50/30' : 'border-zinc-200 hover:border-purple-400 hover:bg-zinc-50'}
          `}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          
          {previewUrl ? (
            <div className="flex flex-col items-center">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-32 h-32 object-cover rounded-lg shadow-md mb-3"
                referrerPolicy="no-referrer"
              />
              <p className="font-medium text-zinc-900 truncate max-w-xs">{file?.name}</p>
              <p className="text-xs text-zinc-500 mt-1">Click to change image</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-3">
                <Upload className="w-6 h-6 text-zinc-400" />
              </div>
              <p className="font-medium text-zinc-900">Click to upload cover art</p>
              <p className="text-xs text-zinc-500 mt-1">JPG, PNG, TIFF</p>
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
              onClick={processImage}
              className={`
                w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all
                ${!file || isProcessing 
                  ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed' 
                  : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-200'}
              `}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Resizing Image...
                </>
              ) : (
                'Resize to 3000x3000px'
              )}
            </button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <div>
                  <p className="font-semibold text-emerald-900">Artwork Ready!</p>
                  <p className="text-xs text-emerald-700">3000x3000px RGB JPEG (High Quality)</p>
                </div>
              </div>
              <a
                href={resultUrl}
                download="CoverArt_3000x3000.jpg"
                className="w-full py-3 bg-zinc-900 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all"
              >
                <Download className="w-5 h-5" />
                Download Cover Art
              </a>
              <button 
                onClick={() => {
                  setFile(null);
                  setPreviewUrl(null);
                  setResultUrl(null);
                }}
                className="w-full text-zinc-500 text-sm hover:text-zinc-700 transition-colors"
              >
                Resize another image
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
