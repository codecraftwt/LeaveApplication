import React, { createContext, useContext, useRef } from 'react';

// Stores the slide direction ('left' | 'right') as a mutable ref
// so updates are synchronous and don't cause extra re-renders.
const TabAnimationContext = createContext({
  directionRef: { current: 'right' },
  prevIndexRef: { current: 0 },
});

export const TabAnimationProvider = ({ children }) => {
  const directionRef = useRef('right');
  const prevIndexRef = useRef(0);

  return (
    <TabAnimationContext.Provider value={{ directionRef, prevIndexRef }}>
      {children}
    </TabAnimationContext.Provider>
  );
};

export const useTabAnimation = () => useContext(TabAnimationContext);
