
export const fetchAllUsers = async () => {
  const response = await fetch('/api/admin/users');
  if (!response.ok) throw new Error('Unauthorized');
  return response.json();
};

export const updateMemberStatus = async (userId, updates) => {
  const response = await fetch('/api/admin/user-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, ...updates })
  });
  return response.json();
};

export const fetchSystemSettings = async () => {
  const response = await fetch('/api/admin/settings');
  if (!response.ok) throw new Error('Failed to fetch settings');
  return response.json();
};

export const saveSystemSettings = async (settings) => {
  const response = await fetch('/api/admin/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  });
  return response.json();
};
