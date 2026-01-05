
export const getHistory = async (userId) => {
  const response = await fetch(`/api/history?userId=${userId}`);
  if (!response.ok) throw new Error('Failed to fetch history');
  return response.json();
};

export const saveHistory = async (entry) => {
  const response = await fetch('/api/history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
  if (!response.ok) throw new Error('Failed to save history');
};
