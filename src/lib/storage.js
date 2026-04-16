import { supabase } from './supabase.js';

// ─── Supabase-backed storage ───

export async function addAttempt({ userId, sceneId, sceneUrl, file, note = '' }) {
  if (!supabase) throw new Error('Supabase not configured');

  // Upload photo to Supabase Storage
  const ext = file.type?.includes('png') ? 'png' : 'jpg';
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error: uploadErr } = await supabase.storage
    .from('story-photos')
    .upload(path, file, { contentType: file.type || 'image/jpeg', upsert: false });
  if (uploadErr) throw uploadErr;

  const { data: { publicUrl } } = supabase.storage
    .from('story-photos')
    .getPublicUrl(path);

  // Insert DB record
  const { data, error } = await supabase.from('attempts').insert({
    user_id: userId,
    scene_id: sceneId,
    scene_url: sceneUrl,
    photo_url: publicUrl,
    photo_path: path,
    note,
  }).select().single();

  if (error) throw error;
  return data;
}

export async function saveReview({ attemptId, feedbackJson }) {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase.from('attempts')
    .update({
      ai_score: feedbackJson.overall_score,
      ai_feedback: feedbackJson,
    })
    .eq('id', attemptId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listAttempts(userId) {
  if (!supabase) return [];

  const { data, error } = await supabase.from('attempts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function deleteAttempt(id, photoPath) {
  if (!supabase) return;

  // Delete photo from storage
  if (photoPath) {
    await supabase.storage.from('story-photos').remove([photoPath]);
  }

  // Delete DB record
  const { error } = await supabase.from('attempts').delete().eq('id', id);
  if (error) throw error;
}

export async function getStats(userId) {
  if (!supabase) return null;

  const { data, error } = await supabase.from('attempts')
    .select('ai_score, ai_feedback, created_at')
    .eq('user_id', userId)
    .not('ai_score', 'is', null)
    .order('created_at', { ascending: true });

  if (error) return null;
  if (!data || data.length === 0) return null;

  const scores = data.map((d) => d.ai_score);
  const avg = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  const latest = scores.slice(-5);

  // Aggregate OLQ frequency
  const olqHits = {};
  const olqMisses = {};
  for (const row of data) {
    const fb = row.ai_feedback;
    if (!fb) continue;
    for (const o of fb.olqs_demonstrated || []) olqHits[o] = (olqHits[o] || 0) + 1;
    for (const o of fb.olqs_missing || []) olqMisses[o] = (olqMisses[o] || 0) + 1;
  }

  return { total: data.length, avg, latest, olqHits, olqMisses };
}
