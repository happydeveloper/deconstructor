"use client";

import { Moon, Sun, Eye } from "lucide-react";
import { useState, useEffect } from "react";

type Theme = "dark" | "light" | "bluelight";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("bluelight");

  const toggleTheme = () => {
    const nextTheme = {
      dark: "light",
      light: "bluelight",
      bluelight: "dark"
    }[theme] as Theme;
    
    setTheme(nextTheme);
    document.documentElement.className = nextTheme;
  };

  useEffect(() => {
    document.documentElement.className = "bluelight";
  }, []);

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-800 text-gray-200 hover:bg-gray-700 transition-colors"
      title="테마 변경"
    >
      {theme === "dark" ? <Sun size={20} /> : theme === "light" ? <Eye size={20} /> : <Moon size={20} />}
    </button>
  );
} 