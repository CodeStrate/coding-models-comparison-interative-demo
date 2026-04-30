// the theme hook

import { useEffect, useState } from "react";

type Theme = 'light' | 'dark' | 'system';
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

function resolveTheme(theme: Theme): 'light' | 'dark' {
    if (theme !== 'system') return theme;
    return mediaQuery.matches ? 'dark' : 'light'
}

// public hook
export function useTheme() {
    // store theme value in state
    const [theme, setTheme] = useState<Theme>(
        () => (localStorage.getItem('theme') as Theme) || 'system'
    )

    //effect to set it in localstorage
    useEffect(() => {
        const resolvedTheme = resolveTheme(theme)
        document.documentElement.dataset.theme = resolvedTheme;
        localStorage.setItem('theme', theme)
    }, [theme])

    // re-apply if system theme changes i.e. 'system' case
    useEffect(() => {
        if (theme !== 'system') return
        const handler = () => {
            document.documentElement.dataset.theme = resolveTheme('system')
        }
        mediaQuery.addEventListener('change', handler)

        //clean up
        return () => mediaQuery.removeEventListener('change', handler)
    }, [theme])

    return {theme, setTheme}
}