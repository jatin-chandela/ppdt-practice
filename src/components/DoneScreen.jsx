import React, { useState } from 'react';
import { useAuth } from '../lib/auth.jsx';
import UploadStory from './UploadStory.jsx';
import AIReview from './AIReview.jsx';

export default function DoneScreen({ session, onAgain, onHome, onViewAttempts, onRequireSignIn }) {
  const { isAnonymous } = useAuth();
  const [tab, setTab] = useState('review');

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

      {isAnonymous ? (
        <div className="w-full max-w-md p-5 rounded-xl bg-white border border-sand-200 text-center space-y-3">
          <div className="text-xs uppercase tracking-widest text-olive-700 font-semibold">Sign in to continue</div>
          <h2 className="text-lg font-bold text-ink-900">Save your story + get AI feedback</h2>
          <p className="text-sm text-ink-500">
            Create a free account to upload a photo of your handwritten story, get Gemini AI to score it against OLQs,
            and track your progress over time.
          </p>
          <button
            onClick={onRequireSignIn}
            className="w-full px-4 py-2.5 rounded-lg bg-olive-600 hover:bg-olive-700 text-sand-50 font-semibold text-sm"
          >
            Create free account →
          </button>
          <div className="text-xs text-ink-300">Takes 10 seconds. No card, no spam.</div>
        </div>
      ) : (
        <>
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
        </>
      )}

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
