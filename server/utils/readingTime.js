export function calculateReadingTime(html = '') {
  const plain = String(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!plain) return 1;
  const words = plain.split(' ').length;
  return Math.max(1, Math.ceil(words / 225));
}
