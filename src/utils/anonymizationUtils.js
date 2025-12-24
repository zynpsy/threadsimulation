// List of gender-neutral anonymous names
const ANONYMOUS_NAMES = [
  'Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley',
  'Avery', 'Quinn', 'Sage', 'River', 'Skyler', 'Rowan',
  'Charlie', 'Dakota', 'Eden', 'Finley', 'Harper', 'Hayden',
  'Kai', 'Logan', 'Marley', 'Parker', 'Reese', 'Sam',
  'Sawyer', 'Spencer', 'Phoenix', 'Elliot', 'Emerson', 'Jules',
  'Cameron', 'Blake', 'Peyton', 'Drew', 'Ashton', 'Kendall',
  'Rory', 'Bailey', 'Ellis', 'Frankie', 'Jamie', 'Jesse',
  'Jules', 'Kerry', 'Lee', 'Max', 'Nico', 'Pat',
  'Robin', 'Sky', 'Stevie', 'Terry', 'Val', 'Winter'
];

/**
 * Hash function to consistently map strings to numbers
 * @param {string} str - The string to hash
 * @returns {number} - Hash value
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
 * Get an anonymous name for a given user handle
 * The same user handle will always return the same anonymous name
 * @param {string} userHandle - The original user handle
 * @param {boolean} withHandle - If true, returns @name.bsky.social format, otherwise just the name
 * @returns {string} - Anonymous name
 */
export function getAnonymousName(userHandle, withHandle = false) {
  if (!userHandle) return withHandle ? '@anonymous.bsky.social' : 'Anonymous';

  const hash = hashCode(userHandle);
  const index = hash % ANONYMOUS_NAMES.length;
  const name = ANONYMOUS_NAMES[index];

  if (withHandle) {
    return `@${name.toLowerCase()}.bsky.social`;
  }

  return name;
}
