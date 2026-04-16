const MODEL = 'gemini-2.5-flash';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    transcribed_text: { type: 'string' },
    overall_score: { type: 'integer', minimum: 0, maximum: 10 },
    word_count: { type: 'integer' },
    structural_check: {
      type: 'object',
      properties: {
        has_named_hero: { type: 'boolean' },
        has_past: { type: 'boolean' },
        has_present_action: { type: 'boolean' },
        has_positive_future: { type: 'boolean' },
        characters_defined: { type: 'boolean' },
      },
      required: ['has_named_hero', 'has_past', 'has_present_action', 'has_positive_future', 'characters_defined'],
    },
    strengths: { type: 'array', items: { type: 'string' }, maxItems: 4 },
    weaknesses: { type: 'array', items: { type: 'string' }, maxItems: 4 },
    olqs_demonstrated: { type: 'array', items: { type: 'string' } },
    olqs_missing: { type: 'array', items: { type: 'string' } },
    suggested_rewrite: { type: 'string' },
    verdict: { type: 'string' },
  },
  required: [
    'transcribed_text', 'overall_score', 'word_count', 'structural_check',
    'strengths', 'weaknesses', 'olqs_demonstrated', 'olqs_missing',
    'suggested_rewrite', 'verdict',
  ],
};

const SYSTEM_PROMPT = `You are an experienced SSB (Services Selection Board) GTO/psychologist assessor evaluating a candidate's PPDT story.

STEP 1: If an image is provided, carefully read ALL the handwritten text in the image. Transcribe it faithfully into transcribed_text — preserve the candidate's exact words, fix only unreadable characters. If text is provided directly instead of an image, use that as transcribed_text.

STEP 2: Evaluate the transcribed story against SSB standards:
- Ideal length: 80–110 words. Too short (<60) or too long (>130) is a weakness.
- Must name the hero with a specific age.
- Must have Past → Present → Future structure.
- Outcome must be positive, realistic, and driven by the hero's concrete actions (not luck or wishes).
- Must demonstrate Officer Like Qualities (OLQs) through behaviour — never label them directly.
- Characters in the scene should be defined (number, rough age, activity).

The 15 OLQs: Effective Intelligence, Reasoning Ability, Organizing Ability, Power of Expression, Social Adaptability, Cooperation, Sense of Responsibility, Initiative, Self Confidence, Speed of Decision, Ability to Influence the Group, Liveliness, Determination, Courage, Stamina.

Give a tough but fair overall_score from 0–10 where:
- 0–3 = reject-worthy (unclear, negative outcome, no hero, grammar collapse)
- 4–5 = weak, needs major rework
- 6–7 = competent, would likely screen-in
- 8–9 = strong, clear officer potential
- 10 = exceptional, reserved for rare stories

For strengths and weaknesses, be specific and quote from the story where useful.
For suggested_rewrite, produce a 90-word improved version that fixes the weaknesses while preserving the candidate's core idea.
For verdict, give one punchy sentence on whether this would likely screen-in or screen-out.`;

const IMAGE_PROMPT = 'Read the handwritten story in this image and evaluate it as an SSB PPDT story.';
const TEXT_PROMPT = (story) => `Evaluate this PPDT story:\n\n"""\n${story}\n"""`;

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'GEMINI_API_KEY not configured on server.' }, { status: 500 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const hasImage = body.image && body.mimeType;
  const hasText = (body.story || '').trim().length >= 20;

  if (!hasImage && !hasText) {
    return Response.json({ error: 'Provide an image (base64) or story text (min 20 chars).' }, { status: 400 });
  }

  // Build the user content parts
  const parts = [];
  if (hasImage) {
    parts.push({ inline_data: { mime_type: body.mimeType, data: body.image } });
    parts.push({ text: IMAGE_PROMPT });
  } else {
    parts.push({ text: TEXT_PROMPT(body.story.trim()) });
  }

  const payload = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ role: 'user', parts }],
    generationConfig: {
      temperature: 0.3,
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
    },
  };

  const res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    return Response.json({ error: `Gemini API error: ${res.status}`, detail: text.slice(0, 500) }, { status: 502 });
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    return Response.json({ error: 'Empty response from Gemini.', raw: data }, { status: 502 });
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return Response.json({ error: 'Gemini returned non-JSON.', raw: text.slice(0, 500) }, { status: 502 });
  }

  return Response.json(parsed);
};

export const config = { path: '/api/review' };
