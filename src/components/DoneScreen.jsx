import React, { useState } from 'react';
import UploadStory from './UploadStory.jsx';
import AIReview from './AIReview.jsx';

export default function DoneScreen({ session, onAgain, onHome, onViewAttempts }) {
  const [tab, setTab] = useState('save');

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4 gap-5">
      <div className="text-center">
        <div className="text-xs uppercase tracking-widest text-olive-700 font-semibold">Session complete</div>
        <h1 className="text-3xl font-bold mt-1 text-ink-900">Well done.</h1>
        <p className="text-ink-500 text-sm mt-1 max-w-sm">PPDT Set #{session.scene.id}.</p>
      </div>

      <div className="w-32 aspect-[4/3] rounded-lg overflow-hidden border border-sand-200 bg-sand-100">
        <img src={session.scene.url} alt="" className="w-full h-full object-cover" />
      </div>

      <div className="flex rounded-lg bg-white border border-sand-200 p-1 text-sm">
        <button
          onClick={() => setTab('save')}
          className={`px-4 py-1.5 rounded-md ${tab === 'save' ? 'bg-olive-600 text-sand-50' : 'text-ink-500 hover:text-ink-900'}`}
        >
          Save photo
        </button>
        <button
          onClick={() => setTab('review')}
          className={`px-4 py-1.5 rounded-md ${tab === 'review' ? 'bg-olive-600 text-sand-50' : 'text-ink-500 hover:text-ink-900'}`}
        >
          AI review
        </button>
      </div>

      {tab === 'save' ? <UploadStory session={session} /> : <AIReview />}

      <div className="flex flex-wrap justify-center gap-3 mt-2">
        <button onClick={onViewAttempts} className="px-4 py-2 rounded-lg bg-white border border-sand-300 hover:bg-sand-100 text-sm text-ink-700">
          My attempts
        </button>
        <button onClick={onHome} className="px-4 py-2 rounded-lg bg-white border border-sand-300 hover:bg-sand-100 text-sm text-ink-700">
          Home
        </button>
        <button onClick={onAgain} className="px-5 py-2 rounded-lg bg-olive-600 hover:bg-olive-700 text-sand-50 font-semibold text-sm">
          Another picture →
        </button>
      </div>
    </div>
  );
}
