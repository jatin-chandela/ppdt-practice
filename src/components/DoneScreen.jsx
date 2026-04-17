import React, { useState } from 'react';
import UploadStory from './UploadStory.jsx';
import AIReview from './AIReview.jsx';

export default function DoneScreen({ session, onAgain, onHome, onViewAttempts }) {
  const [tab, setTab] = useState('save');

  return (
    <div className="min-h-screen flex flex-col items-center py-16 px-4 gap-8 animate-fade-up">
      <div className="text-center space-y-3">
        <div className="text-[11px] uppercase tracking-widest text-gold-300">Session complete</div>
        <h1 className="font-display text-5xl md:text-6xl italic text-bone-50">Well done.</h1>
        <p className="text-bone-400 text-sm max-w-sm mx-auto">
          PPDT Set #{session.scene.id}. Save your story, request AI feedback, or move on.
        </p>
      </div>

      <div className="w-36 aspect-[4/3] rounded-md overflow-hidden border border-white/5 bg-black">
        <img src={session.scene.url} alt="" className="w-full h-full object-cover" />
      </div>

      <div className="flex rounded-md border border-white/10 p-0.5 text-xs uppercase tracking-widest">
        <button
          onClick={() => setTab('save')}
          className={`px-5 py-2 rounded transition ${tab === 'save' ? 'bg-white/5 text-bone-100' : 'text-bone-500 hover:text-bone-300'}`}
        >
          Save photo
        </button>
        <button
          onClick={() => setTab('review')}
          className={`px-5 py-2 rounded transition ${tab === 'review' ? 'bg-white/5 text-bone-100' : 'text-bone-500 hover:text-bone-300'}`}
        >
          AI review
        </button>
      </div>

      {tab === 'save' ? <UploadStory session={session} /> : <AIReview />}

      <div className="flex flex-wrap justify-center gap-3 mt-4">
        <button
          onClick={onViewAttempts}
          className="px-5 py-2.5 rounded-md border border-white/10 hover:border-white/20 text-sm text-bone-300 hover:text-bone-100 transition"
        >
          My attempts
        </button>
        <button
          onClick={onHome}
          className="px-5 py-2.5 rounded-md border border-white/10 hover:border-white/20 text-sm text-bone-300 hover:text-bone-100 transition"
        >
          Home
        </button>
        <button
          onClick={onAgain}
          className="px-6 py-2.5 rounded-md bg-gold-400 hover:bg-gold-300 text-ink-950 font-medium text-sm transition"
        >
          Another picture →
        </button>
      </div>
    </div>
  );
}
