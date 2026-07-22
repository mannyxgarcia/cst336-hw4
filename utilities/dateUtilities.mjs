export function formatArchiveDate(timestamp) {
  if (!timestamp || timestamp.length < 8) {
    return 'Unknown date';
  }

  const year = timestamp.slice(0, 4);
  const month = timestamp.slice(4, 6);
  const day = timestamp.slice(6, 8);

  const date = new Date(`${year}-${month}-${day}T00:00:00`);

  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
