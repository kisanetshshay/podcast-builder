'use client';

import { useState, useRef } from 'react';

export default function Home() {
  const [scriptText, setScriptText] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleGenerate = async () => {
    if (!scriptText.trim()) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: scriptText }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate audio');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (error) {
      console.error('Error generating audio:', error);
      alert('Failed to generate audio. Check console for details.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6">🎙️ Podcast Builder</h1>

      {/* Text Area */}
      <textarea
        value={scriptText}
        onChange={(e) => setScriptText(e.target.value)}
        placeholder="Write your podcast script here..."
        className="w-full h-40 p-4 border rounded-md mb-4"
      />

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !scriptText.trim()}
        className="bg-blue-600 text-white px-6 py-2 rounded-md disabled:opacity-50"
      >
        {isGenerating ? 'Generating...' : 'Generate Audio'}
      </button>

      {/* Audio Player */}
      {audioUrl && (
        <div className="mt-6">
          <audio
            ref={audioRef}
            src={audioUrl}
            controls
            className="w-full"
          />
        </div>
      )}

      {/* Export Button */}
      {audioUrl && (
        <button
          onClick={() => {
            const link = document.createElement('a');
            link.href = audioUrl;
            link.download = 'podcast.mp3';
            link.click();
          }}
          className="mt-4 bg-green-600 text-white px-6 py-2 rounded-md"
        >
          Export as MP3
        </button>
      )}
    </div>
  );
}