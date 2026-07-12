import { createContext, useContext, useState, useCallback } from 'react';

const DatasetContext = createContext(null);

export function DatasetProvider({ children }) {
  const [sessionId, setSessionId] = useState(() => localStorage.getItem('dc_session') || null);
  const [datasetInfo, setDatasetInfo] = useState(() => {
    const stored = localStorage.getItem('dc_dataset_info');
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoaded, setIsLoaded] = useState(() => !!localStorage.getItem('dc_session'));
  const [loading, setLoading] = useState(false);
  const [cleaningHistory, setCleaningHistory] = useState([]);

  const setSession = useCallback((newSessionId, info) => {
    setSessionId(newSessionId);
    setDatasetInfo(info);
    setIsLoaded(true);
    setLoading(false);
    localStorage.setItem('dc_session', newSessionId);
    localStorage.setItem('dc_dataset_info', JSON.stringify(info));
  }, []);

  const clearSession = useCallback(() => {
    setSessionId(null);
    setDatasetInfo(null);
    setIsLoaded(false);
    setCleaningHistory([]);
    localStorage.removeItem('dc_session');
    localStorage.removeItem('dc_dataset_info');
  }, []);

  const updateInfo = useCallback((newInfo) => {
    setDatasetInfo((prev) => {
      const updated = { ...prev, ...newInfo };
      localStorage.setItem('dc_dataset_info', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addCleaningAction = useCallback((action) => {
    setCleaningHistory((prev) => [...prev, { ...action, timestamp: new Date().toISOString() }]);
  }, []);

  return (
    <DatasetContext.Provider
      value={{
        sessionId,
        datasetInfo,
        isLoaded,
        loading,
        setLoading,
        cleaningHistory,
        setSession,
        clearSession,
        updateInfo,
        addCleaningAction,
      }}
    >
      {children}
    </DatasetContext.Provider>
  );
}

export function useDataset() {
  const ctx = useContext(DatasetContext);
  if (!ctx) throw new Error('useDataset must be used within a DatasetProvider');
  return ctx;
}
