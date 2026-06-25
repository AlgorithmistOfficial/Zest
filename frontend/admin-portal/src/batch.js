import React from 'react';

const ADMIN_BATCH_KEY = 'zestAdminActiveBatch';
const ADMIN_BATCH_EVENT = 'zest-admin-batch-change';

export const getActiveAdminBatch = () => {
  try {
    const raw = localStorage.getItem(ADMIN_BATCH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setActiveAdminBatch = (batch) => {
  if (!batch) {
    localStorage.removeItem(ADMIN_BATCH_KEY);
    window.dispatchEvent(new Event(ADMIN_BATCH_EVENT));
    return;
  }
  localStorage.setItem(ADMIN_BATCH_KEY, JSON.stringify(batch));
  window.dispatchEvent(new Event(ADMIN_BATCH_EVENT));
};

export const clearActiveAdminBatch = () => {
  localStorage.removeItem(ADMIN_BATCH_KEY);
  window.dispatchEvent(new Event(ADMIN_BATCH_EVENT));
};

export const useActiveAdminBatch = () => {
  const [batch, setBatch] = React.useState(() => getActiveAdminBatch());

  React.useEffect(() => {
    const syncBatch = () => setBatch(getActiveAdminBatch());
    window.addEventListener('storage', syncBatch);
    window.addEventListener(ADMIN_BATCH_EVENT, syncBatch);
    return () => {
      window.removeEventListener('storage', syncBatch);
      window.removeEventListener(ADMIN_BATCH_EVENT, syncBatch);
    };
  }, []);

  return batch;
};
