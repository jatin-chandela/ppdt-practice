import React, { useRef, useState } from 'react';
import { useAuth } from '../lib/auth.jsx';
import { addAttempt } from '../lib/storage.js';

export default function UploadStory({ session, onSaved }) {
  const { user } = useAuth();
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const onPick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setSaved(false);
    setError(null);
  };

  const save = async () => {
    if (!file || !user) return;
    setSaving(true);
    setError(null);
    try {
      await addAttempt({
        userId: user.id,
        sceneId: session.scene.id,
        sceneUrl: session.scene.url,
        file,
        note,
      });
      setSaved(true);
      onSaved?.();
    } catch (e) {
      setError(e.message || 'Upload failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-md p-4 rounded-xl bg-slate-900 border border-slate-800">
      <div className="font-semibold mb-2">Upload photo of your handwritten story</div>
      <p className="text-xs text-slate-400 mb-3">
        Snap your paper — stored in your account so you can review it anytime, on any device.
      </p>

      <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onPick} className="hidden" />

      {preview ? (
        <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-black mb-3">
          <img src={preview} alt="preview" className="w-full max-h-80 object-contain" />
          <button
            onClick={() => { setPreview(null); setFile(null); setSaved(false); }}
            className="absolute top-2 right-2 px-2 py-1 rounded bg-black/70 text-xs"
          >
            Replace
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full p-6 rounded-lg border-2 border-dashed border-slate-700 hover:border-emerald-500 text-slate-400 hover:text-emerald-300 text-sm"
        >
          📷 Take / choose photo
        </button>
      )}

      {preview && (
        <>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note (e.g. timing issue, OLQs to improve)"
            className="w-full mt-2 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm focus:border-emerald-500 focus:outline-none"
          />
          <button
            onClick={save}
            disabled={saving || saved}
            className="w-full mt-3 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold text-sm"
          >
            {saved ? 'Saved ✓' : saving ? 'Uploading…' : 'Save to My Attempts'}
          </button>
        </>
      )}

      {error && <div className="mt-2 p-2 rounded-lg bg-red-950/50 border border-red-900 text-xs text-red-300">{error}</div>}
    </div>
  );
}
