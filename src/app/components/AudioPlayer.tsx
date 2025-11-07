

'use client';

import { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

export default function AudioPlayer({
  audioUrl,
  onTimeUpdate,
}: {
  audioUrl: string;
  onTimeUpdate?: (time: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }

    if (!audioUrl || !containerRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#ccc',
      progressColor: '#3b82f6',
      url: audioUrl,
      barWidth: 2,
      barGap: 1,
      height: 60,
    });

    wavesurferRef.current = ws;

    let animationFrameId: number;
    const update = () => {
      if (onTimeUpdate && ws) {
        onTimeUpdate(ws.getCurrentTime());
      }
      animationFrameId = requestAnimationFrame(update);
    };
    animationFrameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationFrameId);
      ws.destroy();
    };
  }, [audioUrl, onTimeUpdate]);

  const playPause = () => {
    wavesurferRef.current?.playPause();
  };

  const skip = (seconds: number) => {
    if (wavesurferRef.current) {
      const time = wavesurferRef.current.getCurrentTime() + seconds;
      wavesurferRef.current.setTime(Math.max(0, time));
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <div
        ref={containerRef}
        className="w-full bg-gray-50 rounded-md border"
        style={{ height: '60px' }}
      />
      <div className="flex gap-2 mt-3">
        <button
          onClick={playPause}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {wavesurferRef.current?.isPlaying() ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={() => skip(-5)}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          ⏪ 5s
        </button>
        <button
          onClick={() => skip(5)}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          ⏩ 5s
        </button>
      </div>
    </div>
  );
}