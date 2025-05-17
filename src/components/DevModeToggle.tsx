import React, { createContext, useContext, useState } from "react";

interface DevModeContextType {
  devMode: boolean;
  setDevMode: (value: boolean) => void;
}

const DevModeContext = createContext<DevModeContextType | undefined>(undefined);

export const DevModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [devMode, setDevMode] = useState(false);

  return (
    <DevModeContext.Provider value={{ devMode, setDevMode }}>
      {children}
      <div className="fixed top-4 right-4 z-50">
        <label className="flex items-center space-x-2 bg-black/70 p-2 rounded-xl shadow-lg select-none">
          <input
            type="checkbox"
            checked={devMode}
            onChange={e => setDevMode(e.target.checked)}
            className="accent-sol w-4 h-4"
          />
          <span className="text-xs text-white">Dev Mode 🛠️</span>
        </label>
      </div>
    </DevModeContext.Provider>
  );
};

export const useDevMode = () => {
  const ctx = useContext(DevModeContext);
  if (!ctx) throw new Error("useDevMode must be used within DevModeProvider");
  return ctx;
};
