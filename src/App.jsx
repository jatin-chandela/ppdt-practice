import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './lib/auth.jsx';
import usePhase, { PHASES } from './hooks/usePhase.js';

const SESSION_KEY = 'ssb:session';
const LAST_SCENE_KEY = 'ssb:lastSceneId';

function loadSession() {
  try {
    const v = localStorage.getItem(SESSION_KEY);
    return v ? JSON.parse(v) : null;
  } catch { return null; }
}

function loadLastSceneId() {
  try { return localStorage.getItem(LAST_SCENE_KEY) || null; } catch { return null; }
}
import LoginModal from './components/LoginModal.jsx';
import CategorySelect from './components/CategorySelect.jsx';
import PicturePhase from './components/PicturePhase.jsx';
import TimerPhase from './components/TimerPhase.jsx';
import DoneScreen from './components/DoneScreen.jsx';
import MyAttempts from './components/MyAttempts.jsx';
import ProgressBar from './components/ProgressBar.jsx';

function AppInner() {
  const { user, loading, isAnonymous, signOut } = useAuth();
  const { phase, goTo, reset: resetPhase } = usePhase();
  const [session, setSession] = useState(loadSession);
  const [lastSceneId, setLastSceneId] = useState(loadLastSceneId);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    try {
      if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      else localStorage.removeItem(SESSION_KEY);
    } catch {}
  }, [session]);

  useEffect(() => {
    try {
      if (lastSceneId) localStorage.setItem(LAST_SCENE_KEY, lastSceneId);
      else localStorage.removeItem(LAST_SCENE_KEY);
    } catch {}
  }, [lastSceneId]);

  const reset = () => {
    setSession(null);
    resetPhase();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-ink-500 animate-pulse text-sm">Loading…</div>
      </div>
    );
  }

  const start = (s) => {
    setSession(s);
    setLastSceneId(s.scene.id);
    goTo(PHASES.PICTURE);
  };

  const requireSignIn = () => setLoginOpen(true);

  const showProgress = [PHASES.PICTURE, PHASES.CHARACTER, PHASES.STORY].includes(phase);

  return (
    <div className="min-h-screen">
      {phase === PHASES.IDLE && (
        <div className="max-w-6xl mx-auto px-6 pt-3 flex items-center justify-end gap-3 text-xs text-ink-500">
          {isAnonymous ? (
            <button
              onClick={requireSignIn}
              className="px-3 py-1.5 rounded-lg bg-olive-600 hover:bg-olive-700 text-sand-50 font-semibold"
            >
              Sign in to save progress
            </button>
          ) : (
            <>
              <span>{user?.email}</span>
              <button onClick={signOut} className="hover:text-ink-900 font-medium">Sign out</button>
            </>
          )}
        </div>
      )}

      {showProgress && <ProgressBar phase={phase} />}

      {phase === PHASES.IDLE && (
        <CategorySelect
          onStart={start}
          lastSceneId={lastSceneId}
          onOpenAttempts={() => (isAnonymous ? requireSignIn() : goTo(PHASES.ATTEMPTS))}
        />
      )}

      {phase === PHASES.ATTEMPTS && (
        <MyAttempts onBack={reset} />
      )}

      {phase === PHASES.PICTURE && session && (
        <PicturePhase session={session} onDone={() => goTo(PHASES.CHARACTER)} onCancel={reset} />
      )}

      {phase === PHASES.CHARACTER && session && (
        <TimerPhase
          subtitle="Step 2 of 3"
          title="Note the characters"
          duration={60}
          instructions={[
            'On paper, note: number of characters, age, sex, mood.',
            'Write down the central action / what is happening.',
            'Jot the setting — where and when.',
          ]}
          onDone={() => goTo(PHASES.STORY)}
          onCancel={reset}
          allowFinishEarly
        />
      )}

      {phase === PHASES.STORY && session && (
        <TimerPhase
          subtitle="Step 3 of 3"
          title="Write your story"
          duration={240}
          instructions={[
            'Name + age of the hero.',
            'Past — what led to this moment.',
            'Present — the action being taken.',
            'Future — a positive, concrete outcome.',
            'Target ~80–100 words.',
          ]}
          onDone={() => goTo(PHASES.DONE)}
          onCancel={reset}
          allowFinishEarly
        />
      )}

      {phase === PHASES.DONE && session && (
        <DoneScreen
          session={session}
          onAgain={reset}
          onHome={reset}
          onViewAttempts={() => (isAnonymous ? requireSignIn() : goTo(PHASES.ATTEMPTS))}
          onRequireSignIn={requireSignIn}
        />
      )}

      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
