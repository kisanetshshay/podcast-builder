
// 'use client';

// import { useState, useRef } from 'react';
// import { FFmpeg } from '@ffmpeg/ffmpeg';
// import { fetchFile } from '@ffmpeg/util';
// import AudioPlayer from './components/AudioPlayer'; 

// export default function Home() {
//   const [scriptText, setScriptText] = useState('');
//   const [audioUrl, setAudioUrl] = useState<string | null>(null);
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [isConverting, setIsConverting] = useState(false);
//   const audioBlobRef = useRef<Blob | null>(null);

//   const handleGenerate = async () => {
//     const cleanText = scriptText.trim();
//     if (!cleanText) return;

//     setIsGenerating(true);
//     try {
//       const res = await fetch('/api/generate', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ text: cleanText }),
//       });

//       if (!res.ok) {
//         const errorText = await res.text();
//         console.error('API Error:', errorText);
//         alert(`Generation failed: ${errorText}`);
//         return;
//       }

//       const blob = await res.blob();
//       audioBlobRef.current = blob;
//       const url = URL.createObjectURL(blob);
//       setAudioUrl(url);
//     } catch (error) {
//       console.error('Unexpected error:', error);
//       alert('Unexpected error during generation.');
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   const exportAsWav = async () => {
//     if (!audioBlobRef.current) {
//       alert('No audio to export. Please generate first.');
//       return;
//     }
  
//     const filename = prompt('Enter filename (without extension):', 'podcast') || 'podcast';
//     setIsConverting(true);
  
//     try {
//       const ffmpeg = new FFmpeg();
//       await ffmpeg.load();
  
//       await ffmpeg.writeFile('input.mp3', await fetchFile(audioBlobRef.current));
//       await ffmpeg.exec(['-i', 'input.mp3', 'output.wav']);
  
//       const wavData = await ffmpeg.readFile('output.wav');
  
//       // ✅ Type-safe conversion to Blob-compatible Uint8Array
//       const wavArray = wavData instanceof Uint8Array 
//       ? wavData 
//       : new Uint8Array(wavData);
//       const wavBlob = new Blob([wavArray], { type: 'audio/wav' });
  
//       const url = URL.createObjectURL(wavBlob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `${filename}.wav`;
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       URL.revokeObjectURL(url);
//     } catch (error) {
//       console.error('WAV export failed:', error);
//       alert('WAV export failed. Try again or check console.');
//     } finally {
//       setIsConverting(false);
//     }
//   };

//   return (
//     <div 
//       className="min-h-screen bg-cover bg-center bg-no-repeat p-4 relative"
//       style={{ backgroundImage: 'url(/Get.jpg)' }}
//     >
//       {/* Dark semi-transparent overlay for readability */}
//       <div className="absolute inset-0 bg-black/50"></div>

// <div className="relative max-w-3xl mx-auto mt-6 md:mt-10">
//         <div className="text-center mb-8 pt-6">
//           <h1 className="text-5xl font-bold text-white drop-shadow-md">🎙️ Podcast Builder</h1>
//           <p className="text-gray-200 mt-2 drop-shadow-sm">Write. Generate. Export. Share.</p>
//         </div>

//         <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-6 md:p-8">
//           <textarea
//             value={scriptText}
//             onChange={(e) => setScriptText(e.target.value)}
//             placeholder="Write your podcast script here..."
//             className="w-full h-48 p-4 text-gray-800 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none mb-4"
//           />

//           <div className="flex flex-col sm:flex-row gap-3">
//             <button
//               onClick={handleGenerate}
//               disabled={isGenerating || !scriptText.trim()}
//               className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-xl shadow-md transition disabled:opacity-50"
//             >
//               {isGenerating ? 'Generating...' : 'Generate Audio'}
//             </button>
//           </div>

//           {audioUrl && (
//             <div className="mt-8 pt-6 border-t border-gray-200">
//               <AudioPlayer audioUrl={audioUrl} />
//               <button
//                 onClick={exportAsWav}
//                 disabled={isConverting}
//                 className="mt-4 w-full sm:w-auto bg-[#234B06] hover:bg-[#1a3a05] text-white font-medium py-2.5 px-6 rounded-xl shadow-md transition disabled:opacity-50"
//                 >
//                 {isConverting ? 'Converting...' : 'Export as WAV'}
//               </button>
//             </div>
//           )}
//         </div>

//         <footer className="text-center text-gray-300 text-sm mt-8">
//           Powered by ElevenLabs • Next.js • Tailwind CSS
//         </footer>
//       </div>
//     </div>
//   );
// }


'use client';

import { useState, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import AudioPlayer from './components/AudioPlayer'; 

export default function Home() {
  const [scriptText, setScriptText] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const audioBlobRef = useRef<Blob | null>(null);

  const handleGenerate = async () => {
    const cleanText = scriptText.trim();
    if (!cleanText) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText }),
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
      // ✅ Defensive slice to get real ArrayBuffer for Blob
      const sliced = wavData.slice();
      const wavBlob = new Blob([sliced], { type: 'audio/wav' });
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
      alert('WAV export failed. Try again or check console.');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat p-4 relative"
      style={{ backgroundImage: 'url(/Get.jpg)' }}
    >
      {/* Dark semi-transparent overlay for readability */}
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
              <AudioPlayer audioUrl={audioUrl} />
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
          Powered by ElevenLabs • Next.js • Tailwind CSS
        </footer>
      </div>
    </div>
  );
}