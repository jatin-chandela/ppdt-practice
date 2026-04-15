import manifest from './scenes.json';

const BASE = import.meta.env.BASE_URL + 'ppdt/';

export const scenes = manifest.map((r) => ({
  id: r.id,
  file: r.file,
  category: r.category,
  url: `${BASE}${r.file}`,
}));

export const categories = [
  { id: 'all',      label: 'All pictures',    emoji: '🎲' },
  { id: 'rural',    label: 'Rural / Village', emoji: '🌾' },
  { id: 'urban',    label: 'Urban / City',    emoji: '🏙️' },
  { id: 'military', label: 'Military',        emoji: '🎖️' },
  { id: 'nature',   label: 'Nature / Adv.',   emoji: '⛰️' },
  { id: 'group',    label: 'Group / Social',  emoji: '👥' },
  { id: 'solo',     label: 'Solo / Crisis',   emoji: '🚶' },
];

export function countsByCategory() {
  const c = { all: scenes.length };
  for (const s of scenes) c[s.category] = (c[s.category] || 0) + 1;
  return c;
}

export function pool(categoryId) {
  if (!categoryId || categoryId === 'all') return scenes;
  return scenes.filter((s) => s.category === categoryId);
}

export function randomScene(categoryId = 'all', excludeIds = []) {
  const p = pool(categoryId).filter((s) => !excludeIds.includes(s.id));
  const src = p.length ? p : pool(categoryId);
  return src[Math.floor(Math.random() * src.length)];
}

export function sceneById(id) {
  return scenes.find((s) => s.id === id) || scenes[0];
}

export const genericTips = [
  {
    title: 'Outcome-positive hero',
    body: 'Give the central character a name, an age, and a definite plan. Keep the outcome positive, realistic, and tied to a concrete action — not a wish.',
  },
  {
    title: 'Past → Present → Future',
    body: 'Anchor the story in time. One line on what led here, two lines on the action happening now, and one line on the achievement or resolution ahead.',
  },
  {
    title: 'Reflect OLQs naturally',
    body: 'Let Officer-Like Qualities show through behaviour: initiative, responsibility, reasoning, courage. Don\u2019t label them \u2014 show them.',
  },
];
