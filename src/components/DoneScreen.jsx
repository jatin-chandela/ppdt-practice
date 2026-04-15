import React, { useState } from 'react';
import UploadStory from './UploadStory.jsx';
import AIReview from './AIReview.jsx';

export default function DoneScreen({ session, onAgain, onHome, onViewAttempts }) {
  const [tab, setTab] = useState('save'); // save | review

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4 gap-6">
      <div className="text-5xl">✅</div>
      <h1 className="text-3xl font-bold">Session complete</h1>
      <p className="text-slate-400 text-center max-w-sm">
        PPDT Set #{session.scene.id}. Save your story, get AI feedback, or move on.
      </p>

      <div className="w-40 aspect-[4/3] rounded-lg overflow-hidden border border-slate-800 bg-black">
        <img src={session.scene.url} alt="" className="w-full h-full object-cover" />
      </div>

      <div className="flex rounded-lg bg-slate-900 border border-slate-800 p-1 text-sm">
        <button
          onClick={() => setTab('save')}
          className={`px-4 py-1.5 rounded-md transition ${tab === 'save' ? 'bg-slate-800 text-slate-100' : 'text-slate-400'}`}
        >
          📸 Save photo
        </button>
        <button
          onClick={() => setTab('review')}
          className={`px-4 py-1.5 rounded-md transition ${tab === 'review' ? 'bg-slate-800 text-slate-100' : 'text-slate-400'}`}
        >
          ✨ AI review
        </button>
      </div>

      {tab === 'save' ? <UploadStory session={session} /> : <AIReview />}

      <div className="flex flex-wrap justify-center gap-3 mt-2">
        <button
          onClick={onViewAttempts}
          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm"
        >
          My Attempts
        </button>
        <button
          onClick={onHome}
          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm"
        >
          Home
        </button>
        <button
          onClick={onAgain}
          className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm"
        >
          Another picture →
        </button>
      </div>
    </div>
  );
}
