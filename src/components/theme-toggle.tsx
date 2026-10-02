"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="secondary"
        size="icon"
        className="w-8 h-8 opacity-50 border border-hairline"
        aria-label="Toggle theme"
      >
        <Sun className="h-4 w-4 text-ink-muted" />
      </Button>
    );
  }

  const isDark = (theme === "system" ? resolvedTheme : theme) === "dark";

  return (
    <Button
      variant="secondary"
      size="icon"
      id="theme-toggle-btn"
      data-testid="theme-toggle-btn"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="w-8 h-8 relative rounded-md border border-hairline bg-surface-1 hover:bg-surface-2 text-ink-muted hover:text-ink transition-colors cursor-pointer"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-ink transition-all rotate-0 scale-100" />
      ) : (
        <Moon className="h-4 w-4 text-ink transition-all rotate-0 scale-100" />
      )}
    </Button>
  );
}
