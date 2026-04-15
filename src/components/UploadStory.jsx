import React, { useRef, useState } from 'react';
import { addAttempt } from '../lib/storage.js';

async function compress(file, maxDim = 1600, quality = 0.82) {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  const scale = Math.min(1, maxDim / Math.max(width, height));
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
}

export default function UploadStory({ session, onSaved }) {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const onPick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setSaved(false);
  };

  const save = async () => {
    if (!file) return;
    setSaving(true);
    try {
      const blob = await compress(file);
      await addAttempt({
        sceneId: session.scene.id,
        sceneUrl: session.scene.url,
        blob,
        note,
      });
      setSaved(true);
      onSaved?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-md p-4 rounded-xl bg-slate-900 border border-slate-800">
      <div className="font-semibold mb-2">Upload photo of your handwritten story</div>
      <p className="text-xs text-slate-400 mb-3">
        Snap your paper with your phone or webcam. Image is stored locally in your browser only.
      </p>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onPick}
        className="hidden"
      />

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
            {saved ? 'Saved ✓' : saving ? 'Saving…' : 'Save to My Attempts'}
          </button>
        </>
      )}
    </div>
  );
}
