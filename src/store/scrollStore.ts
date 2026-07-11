import { create } from "zustand";

interface ScrollState {
  /** 0 = assembled pipeline, 1 = fully exploded. Written from ScrollTrigger's onUpdate. */
  explodeFactor: number;
  activeIndex: number;
  setExplodeFactor: (value: number) => void;
  setActiveIndex: (index: number) => void;
}

export const useScrollStore = create<ScrollState>((set, get) => ({
  explodeFactor: 0,
  activeIndex: 0,
  setExplodeFactor: (value) => set({ explodeFactor: value }),
  setActiveIndex: (index) => {
    if (get().activeIndex !== index) set({ activeIndex: index });
  },
}));
