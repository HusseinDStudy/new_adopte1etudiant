import { useReducedMotion } from 'framer-motion';

export const MOTION = {
  durations: {
    fast: 0.15,
    normal: 0.3,
    slow: 0.5,
  },
  easing: {
    standard: [0.4, 0, 0.2, 1] as [number, number, number, number],
    overshoot: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
  },
};

export function useMotionPreference() {
  const shouldReduce = useReducedMotion();
  return {
    shouldReduce,
    getDuration: (key: keyof typeof MOTION.durations) => (shouldReduce ? 0 : MOTION.durations[key]),
    getEasing: (key: keyof typeof MOTION.easing) => MOTION.easing[key],
  };
}



