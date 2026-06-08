// Simple global logout handler registry to avoid coupling axios with React Navigation
let logoutHandler = null;

export const setLogoutHandler = handler => {
  logoutHandler = typeof handler === 'function' ? handler : null;
};

export const triggerLogout = reason => {
  try {
    if (logoutHandler) {
      logoutHandler(reason);
    }
  } catch (e) {
    // Silently ignore to avoid crashing network layer
  }
};


