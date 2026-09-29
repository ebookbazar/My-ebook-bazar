import React, { createContext, useContext, useEffect, useState } from 'react';
import { db, ref, onValue, set } from '../firebase';
import { AdsterraConfig, DEFAULT_ADSTERRA_CONFIG } from '../types';

interface AdsterraContextType {
  config: AdsterraConfig;
  isMobile: boolean;
  saveConfig: (newConfig: AdsterraConfig) => Promise<void>;
  loading: boolean;
}

const AdsterraContext = createContext<AdsterraContextType>({
  config: DEFAULT_ADSTERRA_CONFIG,
  isMobile: false,
  saveConfig: async () => {},
  loading: true
});

export const AdsterraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<AdsterraConfig>(DEFAULT_ADSTERRA_CONFIG);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  // Track responsive screen size
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen to Realtime Database Adsterra configuration (isolated path)
  useEffect(() => {
    // Read from ebooks/_adsterra which is publicly readable and admin-writable
    const adsterraRef = ref(db, 'ebooks/_adsterra');
    const unsub = onValue(
      adsterraRef,
      (snap) => {
        if (snap.exists()) {
          const val = snap.val() as Partial<AdsterraConfig>;
          setConfig((prev) => ({
            ...prev,
            ...val
          }));
        } else {
          // If not configured yet in Firebase, try reading settings/adsterra
          const settingsRef = ref(db, 'settings/adsterra');
          onValue(
            settingsRef,
            (sSnap) => {
              if (sSnap.exists()) {
                const sVal = sSnap.val() as Partial<AdsterraConfig>;
                setConfig((prev) => ({
                  ...prev,
                  ...sVal
                }));
              }
              setLoading(false);
            },
            () => setLoading(false)
          );
        }
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  // Admin save configuration
  const saveConfig = async (newConfig: AdsterraConfig) => {
    const payload = {
      ...newConfig,
      updatedAt: Date.now()
    };

    // Save to both ebooks/_adsterra (for instantaneous public distribution) and settings/adsterra (isolated settings path)
    await Promise.all([
      set(ref(db, 'ebooks/_adsterra'), payload),
      set(ref(db, 'settings/adsterra'), payload).catch(() => {})
    ]);

    setConfig(payload);
  };

  return (
    <AdsterraContext.Provider value={{ config, isMobile, saveConfig, loading }}>
      {children}
    </AdsterraContext.Provider>
  );
};

export const useAdsterra = () => useContext(AdsterraContext);
