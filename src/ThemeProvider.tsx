import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type DarkModeType = {
  darkMode: boolean;
  toggleDarkMode: (v: boolean) => void;
};
const ThemeContext = createContext<DarkModeType | null>(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context == null) {
    throw new Error("ThemeProvider is Needed");
  } else {
    return context;
  }
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("DarkMode") === "true";
  });
  const toggleDarkModes = (v: boolean) => {
    setDarkMode(v);
  };
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("DarkMode", String(darkMode));
  }, [darkMode]);
  return (
    <ThemeContext.Provider
      value={{ darkMode, toggleDarkMode: toggleDarkModes }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
