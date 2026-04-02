import React, { createContext, useContext, useState, useEffect } from 'react';

const RoleContext = createContext(undefined);

export function RoleProvider({ children }) {
  const [role, setRoleState] = useState(() => {
    // Initialize from local storage if available
    if (typeof window !== 'undefined') {
      return localStorage.getItem('user_role') || null;
    }
    return null;
  });

  const setRole = (newRole) => {
    setRoleState(newRole);
    if (newRole) {
      localStorage.setItem('user_role', newRole);
    } else {
      localStorage.removeItem('user_role');
    }
  };

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
