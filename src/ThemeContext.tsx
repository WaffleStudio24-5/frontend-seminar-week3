import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type ThemeContextType = {
  isDark: boolean;
  toggleDark: () => void;
  resetDark: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(() => {
    const savedMode = localStorage.getItem("mode");

    if (savedMode) {
      return JSON.parse(savedMode);
    }
    return false;
  });

  const toggleDark = () => {
    setIsDark(!isDark);
  };

  const resetDark = () => {
    setIsDark(false);
  };

  useEffect(() => {
    localStorage.setItem("mode", JSON.stringify(isDark));
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleDark, resetDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (context === null) {
    throw new Error("useTheme은 ThemeProvider 안에서 사용해야 합니다.");
  }

  return context;
};
