import React, { useState } from 'react';
import { Music, Image as ImageIcon, Headphones, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AudioConverter } from './components/AudioConverter';
import { ImageConverter } from './components/ImageConverter';

export default function App() {
  const [activeTab, setActiveTab] = useState<'audio' | 'image'>('audio');

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-zinc-900 font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-lg tracking-tight">RouteNote Converter</h1>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">
            <span>Independent Artist Tools</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-zinc-900 sm:text-4xl mb-3">
            Music Distribution Converter
          </h2>
          <p className="text-zinc-600 max-w-xl mx-auto">
            Prepare your files for official distribution. Meets WAV 16-bit/44.1kHz and RGB 3000px standards.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-zinc-100 rounded-xl mb-8">
          <button
            onClick={() => setActiveTab('audio')}
            className={`
              flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all
              ${activeTab === 'audio' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-700'}
            `}
          >
            <Music className="w-4 h-4" />
            Audio Converter
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`
              flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all
              ${activeTab === 'image' 
                ? 'bg-white text-purple-600 shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-700'}
            `}
          >
            <ImageIcon className="w-4 h-4" />
            Cover Art Resizer
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'audio' ? <AudioConverter /> : <ImageConverter />}
          </motion.div>
        </AnimatePresence>

        {/* Footer Info */}
        <footer className="mt-16 pt-8 border-t border-zinc-200 text-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left mb-8">
            <div className="bg-white p-5 rounded-xl border border-zinc-100">
              <h3 className="font-bold text-zinc-900 mb-2 flex items-center gap-2">
                <Layout className="w-4 h-4 text-blue-500" />
                Audio Standards
              </h3>
              <ul className="text-sm text-zinc-600 space-y-1">
                <li>• Format: WAV (Uncompressed)</li>
                <li>• Sample Rate: 44.1kHz</li>
                <li>• Bit Depth: 16-bit</li>
                <li>• Channels: Stereo</li>
              </ul>
            </div>
            <div className="bg-white p-5 rounded-xl border border-zinc-100">
              <h3 className="font-bold text-zinc-900 mb-2 flex items-center gap-2">
                <Layout className="w-4 h-4 text-purple-500" />
                Artwork Standards
              </h3>
              <ul className="text-sm text-zinc-600 space-y-1">
                <li>• Dimensions: 3000 x 3000 px</li>
                <li>• Format: JPEG</li>
                <li>• Color Mode: RGB</li>
                <li>• Resolution: 72, 96, or 300 DPI</li>
              </ul>
            </div>
          </div>
          <p className="text-zinc-400 text-xs">
            Developed for Independent Artists. All processing happens locally in your browser.
          </p>
        </footer>
      </main>
    </div>
  );
}
