import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type TextSize = 'normal' | 'large' | 'xlarge';

export interface A11yPreferences {
  textSize: TextSize;
  reduceMotion: boolean;
  dyslexiaFriendly: boolean;
  underlineLinks: boolean;
  grayscaleMedia: boolean;
}

const DEFAULT_PREFS: A11yPreferences = {
  textSize: 'normal',
  reduceMotion: false,
  dyslexiaFriendly: false,
  underlineLinks: false,
  grayscaleMedia: false,
};

interface A11yContextType {
  prefs: A11yPreferences;
  setPrefs: (next: Partial<A11yPreferences>) => void;
  reset: () => void;
}

const A11yContext = createContext<A11yContextType | undefined>(undefined);

export const useA11y = (): A11yContextType => {
  const ctx = useContext(A11yContext);
  if (!ctx) throw new Error('useA11y must be used within A11yProvider');
  return ctx;
};

const STORAGE_KEY = 'a11y_prefs_v1';

function applyClasses(prefs: A11yPreferences) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // Font size
  root.classList.remove('a11y-font-lg', 'a11y-font-xl');
  if (prefs.textSize === 'large') root.classList.add('a11y-font-lg');
  if (prefs.textSize === 'xlarge') root.classList.add('a11y-font-xl');

  // Underline links
  root.classList.toggle('a11y-underline-links', !!prefs.underlineLinks);

  // Grayscale media
  root.classList.toggle('a11y-grayscale', !!prefs.grayscaleMedia);

  // Reduce motion
  root.classList.toggle('a11y-reduce-motion', !!prefs.reduceMotion);

  // Dyslexia-friendly
  root.classList.toggle('a11y-dyslexia', !!prefs.dyslexiaFriendly);
}

export const A11yProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [prefs, setPrefsState] = useState<A11yPreferences>(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } as A11yPreferences : DEFAULT_PREFS;
    } catch {
      return DEFAULT_PREFS;
    }
  });

  // Apply classes
  useEffect(() => {
    applyClasses(prefs);
  }, [prefs]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // ignore
    }
  }, [prefs]);

  const setPrefs = useCallback((next: Partial<A11yPreferences>) => {
    setPrefsState((prev) => ({ ...prev, ...next }));
  }, []);

  const reset = useCallback(() => setPrefsState(DEFAULT_PREFS), []);

  const value = useMemo(() => ({ prefs, setPrefs, reset }), [prefs, setPrefs, reset]);

  return <A11yContext.Provider value={value}>{children}</A11yContext.Provider>;
};


