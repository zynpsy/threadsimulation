// Avatar emoji pool - diverse set of emojis representing different personas
const AVATAR_EMOJIS = [
  '👨', '👩', '🧑', '👴', '👵',
  '🧔', '👨‍💼', '👩‍💼', '🧑‍💻', '👨‍🎓',
  '👩‍🎓', '🧑‍🔬', '👨‍🏫', '👩‍⚕️', '🧑‍🎨',
  '👨‍🍳', '👩‍🚀', '🧑‍✈️', '👨‍🎤', '👩‍🎨',
  '🧑‍💼', '👨‍🔬', '👩‍💻', '🧑‍🏫', '👨‍⚕️',
  '🧙‍♂️', '🧙‍♀️', '🧝‍♂️', '🧝‍♀️', '🧛‍♂️',
  '🧛‍♀️', '🧜‍♂️', '🧜‍♀️', '🧚‍♂️', '🧚‍♀️',
  '🦸‍♂️', '🦸‍♀️', '🦹‍♂️', '🦹‍♀️', '🧞‍♂️'
];

/**
 * Simple string hash function
 * @param {string} str - String to hash
 * @returns {number} Hash value
 */
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Get a consistent emoji avatar for a user handle
 * @param {string} userHandle - User handle (e.g., "username.bsky.social")
 * @returns {string} Emoji character
 */
export function getAvatarEmoji(userHandle) {
  const hash = hashCode(userHandle);
  const index = hash % AVATAR_EMOJIS.length;
  return AVATAR_EMOJIS[index];
}

/**
 * Get a consistent color based on user handle
 * @param {string} userHandle - User handle
 * @returns {string} HSL color string
 */
export function getAvatarColor(userHandle) {
  const hash = hashCode(userHandle);
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 60%)`;
}
