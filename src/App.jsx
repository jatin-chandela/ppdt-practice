import React, { useState } from 'react';
import usePhase, { PHASES } from './hooks/usePhase.js';
import CategorySelect from './components/CategorySelect.jsx';
import PicturePhase from './components/PicturePhase.jsx';
import TimerPhase from './components/TimerPhase.jsx';
import DoneScreen from './components/DoneScreen.jsx';
import MyAttempts from './components/MyAttempts.jsx';
import ProgressBar from './components/ProgressBar.jsx';

export default function App() {
  const { phase, goTo, reset } = usePhase();
  const [session, setSession] = useState(null);
  const [lastSceneId, setLastSceneId] = useState(null);

  const start = (s) => {
    setSession(s);
    setLastSceneId(s.scene.id);
    goTo(PHASES.PICTURE);
  };

  const showProgress = [PHASES.PICTURE, PHASES.CHARACTER, PHASES.STORY].includes(phase);

  return (
    <div className="min-h-screen">
      {showProgress && <ProgressBar phase={phase} />}

      {phase === PHASES.IDLE && (
        <CategorySelect
          onStart={start}
          lastSceneId={lastSceneId}
          onOpenAttempts={() => goTo(PHASES.ATTEMPTS)}
        />
      )}

      {phase === PHASES.ATTEMPTS && (
        <MyAttempts onBack={reset} />
      )}

      {phase === PHASES.PICTURE && session && (
        <PicturePhase
          session={session}
          onDone={() => goTo(PHASES.CHARACTER)}
          onCancel={reset}
        />
      )}

      {phase === PHASES.CHARACTER && session && (
        <TimerPhase
          subtitle="Step 2 of 3"
          title="Note the characters"
          duration={60}
          thumbUrl={session.scene.url}
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
          thumbUrl={session.scene.url}
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
          onViewAttempts={() => goTo(PHASES.ATTEMPTS)}
        />
      )}
    </div>
  );
}
