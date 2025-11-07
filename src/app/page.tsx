
'use client';

import { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import AudioPlayer from './components/AudioPlayer'; 

export default function Home() {
  const [scriptText, setScriptText] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(15);
  const [selectedVoice, setSelectedVoice] = useState('21m00Tcm4TlvDq8ikWAM'); // Rachel (Female)
  const audioBlobRef = useRef<Blob | null>(null);

  const VOICES = [
    { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel (Female)' },
    { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni (Male)' },
  ];

  useEffect(() => {
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    const onLoaded = () => setAudioDuration(audio.duration);
    audio.addEventListener('loadedmetadata', onLoaded);
    return () => audio.removeEventListener('loadedmetadata', onLoaded);
  }, [audioUrl]);

  const words = scriptText.trim().split(/\s+/).filter(w => w.length > 0);
  const wordDuration = words.length > 0 ? audioDuration / words.length : 1;
  const currentWordIndex = words.length > 0
    ? Math.min(Math.floor(currentTime / wordDuration), words.length - 1)
    : -1;

  const renderHighlightedScript = () => {
    return words.map((word, i) => (
      <span
        key={i}
        className={`inline-block mx-1 px-1 py-0.5 rounded ${
          i === currentWordIndex
            ? 'bg-blue-200 text-blue-800 font-medium'
            : 'text-gray-800 opacity-90'
        }`}
      >
        {word}
      </span>
    ));
  };

  const handleGenerate = async () => {
    const cleanText = scriptText.trim();
    if (!cleanText) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText,
          voice_id: selectedVoice, 
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('API Error:', errorText);
        alert(`Generation failed: ${errorText}`);
        return;
      }

      const blob = await res.blob();
      audioBlobRef.current = blob;
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setCurrentTime(0);
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('Unexpected error during generation.');
    } finally {
      setIsGenerating(false);
    }
  };
  const exportAsWav = async () => {
    if (!audioBlobRef.current) {
      alert('No audio to export. Please generate first.');
      return;
    }
  
    const filename = prompt('Enter filename (without extension):', 'podcast') || 'podcast';
    setIsConverting(true);
  
    try {
      const ffmpeg = new FFmpeg();
      await ffmpeg.load();
      await ffmpeg.writeFile('input.mp3', await fetchFile(audioBlobRef.current));
      await ffmpeg.exec(['-i', 'input.mp3', 'output.wav']);
  
      const wavData = await ffmpeg.readFile('output.wav');
  
      let arrayBuffer: ArrayBuffer;

      if (typeof wavData === 'string') {
        throw new Error('FFmpeg returned text instead of binary data');
      } else if (wavData instanceof Uint8Array) {
        arrayBuffer = new Uint8Array(wavData).buffer;
      } else {
        arrayBuffer = wavData;
      }
  
      const wavBlob = new Blob([arrayBuffer], { type: 'audio/wav' });
  
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('WAV export failed:', error);
      alert('WAV export failed. Try a shorter script or use MP3.');
    } finally {
      setIsConverting(false);
    }
  };
  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat p-4 relative"
      style={{ backgroundImage: 'url(/Get.jpg)' }}
    >
      <div className="absolute inset-0 bg-black/50"></div>

      <div className="relative max-w-3xl mx-auto mt-6 md:mt-10">
        <div className="text-center mb-8 pt-6">
          <h1 className="text-5xl font-bold text-white drop-shadow-md">🎙️ Podcast Builder</h1>
          <p className="text-gray-200 mt-2 drop-shadow-sm">Write. Generate. Export. Share.</p>
        </div>

        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-6 md:p-8">
          <textarea
            value={scriptText}
            onChange={(e) => setScriptText(e.target.value)}
            placeholder="Write your podcast script here..."
            className="w-full h-48 p-4 text-gray-800 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none mb-4"
          />

          {}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Voice
            </label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md bg-white"
            >
              {VOICES.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !scriptText.trim()}
     className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-xl shadow-md transition disabled:opacity-50"
>
              {isGenerating ? 'Generating...' : 'Generate Audio'}
            </button>
          </div>

          {audioUrl && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="mb-4 p-3 bg-gray-50 rounded-lg min-h-[60px] text-gray-800">
                {words.length > 0 ? renderHighlightedScript() : 'No words to highlight'}
              </div>

              <AudioPlayer 
                audioUrl={audioUrl} 
                onTimeUpdate={setCurrentTime} 
              />
              
              <button
                onClick={exportAsWav}
                disabled={isConverting}
                className="mt-4 w-full sm:w-auto bg-[#234B06] hover:bg-[#1a3a05] text-white font-medium py-2.5 px-6 rounded-xl shadow-md transition disabled:opacity-50"
              >
                {isConverting ? 'Converting...' : 'Export as WAV'}
              </button>
            </div>
          )}
        </div>

        <footer className="text-center text-gray-300 text-sm mt-8">
  Brought to life by{' '}
  <a
    href="https://www.linkedin.com/in/kisanet-shshay"
    target="_blank"
    rel="noopener noreferrer"
    className="text-indigo-300 hover:text-white font-medium transition"
  >
    Kisanet Shshay
  </a>
  {' '} turning words into voice, one podcast at a time.
</footer>
      </div>
    </div>
  );
}