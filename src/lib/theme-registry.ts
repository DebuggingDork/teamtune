
export interface ThemeColors {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    border: string;
    input: string;
    ring: string;
    radius: string;
    sidebarBackground: string;
    sidebarForeground: string;
    sidebarPrimary: string;
    sidebarPrimaryForeground: string;
    sidebarAccent: string;
    sidebarAccentForeground: string;
    sidebarBorder: string;
    sidebarRing: string;
}

export interface Theme {
    name: string;
    label: string;
    type: 'light' | 'dark';
    colors: ThemeColors;
}

export const defaultTheme: Theme = {
    name: 'light',
    label: 'Light',
    type: 'light',
    colors: {
        background: '0 0% 100%',
        foreground: '222.2 84% 4.9%',
        card: '0 0% 100%',
        cardForeground: '222.2 84% 4.9%',
        popover: '0 0% 100%',
        popoverForeground: '222.2 84% 4.9%',
        primary: '222.2 47.4% 11.2%',
        primaryForeground: '210 40% 98%',
        secondary: '210 40% 96.1%',
        secondaryForeground: '222.2 47.4% 11.2%',
        muted: '210 40% 96.1%',
        mutedForeground: '215.4 16.3% 46.9%',
        accent: '210 40% 96.1%',
        accentForeground: '222.2 47.4% 11.2%',
        destructive: '0 84.2% 60.2%',
        destructiveForeground: '210 40% 98%',
        border: '214.3 31.8% 91.4%',
        input: '214.3 31.8% 91.4%',
        ring: '222.2 84% 4.9%',
        radius: '0.5rem',
        sidebarBackground: '0 0% 98%',
        sidebarForeground: '240 5.3% 26.1%',
        sidebarPrimary: '240 5.9% 10%',
        sidebarPrimaryForeground: '0 0% 98%',
        sidebarAccent: '240 4.8% 95.9%',
        sidebarAccentForeground: '240 5.9% 10%',
        sidebarBorder: '220 13% 91%',
        sidebarRing: '217.2 91.2% 59.8%',
    },
};

export const darkTheme: Theme = {
    name: 'dark',
    label: 'Dark',
    type: 'dark',
    colors: {
        background: '222.2 84% 4.9%',
        foreground: '210 40% 98%',
        card: '222.2 84% 4.9%',
        cardForeground: '210 40% 98%',
        popover: '222.2 84% 4.9%',
        popoverForeground: '210 40% 98%',
        primary: '210 40% 98%',
        primaryForeground: '222.2 47.4% 11.2%',
        secondary: '217.2 32.6% 17.5%',
        secondaryForeground: '210 40% 98%',
        muted: '217.2 32.6% 17.5%',
        mutedForeground: '215 20.2% 65.1%',
        accent: '217.2 32.6% 17.5%',
        accentForeground: '210 40% 98%',
        destructive: '0 62.8% 30.6%',
        destructiveForeground: '210 40% 98%',
        border: '217.2 32.6% 17.5%',
        input: '217.2 32.6% 17.5%',
        ring: '212.7 26.8% 83.9%',
        radius: '0.5rem',
        sidebarBackground: '240 5.9% 10%',
        sidebarForeground: '240 4.8% 95.9%',
        sidebarPrimary: '224.3 76.3% 48%',
        sidebarPrimaryForeground: '0 0% 100%',
        sidebarAccent: '240 3.7% 15.9%',
        sidebarAccentForeground: '240 4.8% 95.9%',
        sidebarBorder: '240 3.7% 15.9%',
        sidebarRing: '217.2 91.2% 59.8%',
    },
};

export const midnightTheme: Theme = {
    name: 'midnight',
    label: 'Midnight',
    type: 'dark',
    colors: {
        background: '224 71% 4%',
        foreground: '213 31% 91%',
        card: '224 71% 4%',
        cardForeground: '213 31% 91%',
        popover: '224 71% 4%',
        popoverForeground: '213 31% 91%',
        primary: '263 70% 50%', // Purple
        primaryForeground: '210 40% 98%',
        secondary: '222 47% 11%',
        secondaryForeground: '213 31% 91%',
        muted: '223 47% 11%',
        mutedForeground: '215 20.2% 65.1%',
        accent: '216 34% 17%',
        accentForeground: '210 40% 98%',
        destructive: '0 63% 31%',
        destructiveForeground: '210 40% 98%',
        border: '216 34% 17%',
        input: '216 34% 17%',
        ring: '263 70% 50%',
        radius: '0.5rem',
        sidebarBackground: '224 71% 4%',
        sidebarForeground: '213 31% 91%',
        sidebarPrimary: '263 70% 50%',
        sidebarPrimaryForeground: '0 0% 100%',
        sidebarAccent: '216 34% 17%',
        sidebarAccentForeground: '213 31% 91%',
        sidebarBorder: '216 34% 17%',
        sidebarRing: '263 70% 50%',
    },
};

export const oceanTheme: Theme = {
    name: 'ocean',
    label: 'Ocean',
    type: 'light',
    colors: {
        background: '200 50% 98%',
        foreground: '200 50% 10%',
        card: '0 0% 100%',
        cardForeground: '200 50% 10%',
        popover: '0 0% 100%',
        popoverForeground: '200 50% 10%',
        primary: '200 90% 40%', // Deep Blue
        primaryForeground: '0 0% 100%',
        secondary: '180 30% 96%',
        secondaryForeground: '200 90% 40%',
        muted: '180 30% 96%',
        mutedForeground: '200 20% 50%',
        accent: '180 30% 94%',
        accentForeground: '200 90% 40%',
        destructive: '0 84.2% 60.2%',
        destructiveForeground: '210 40% 98%',
        border: '200 20% 90%',
        input: '200 20% 90%',
        ring: '200 90% 40%',
        radius: '0.5rem',
        sidebarBackground: '200 50% 96%',
        sidebarForeground: '200 50% 20%',
        sidebarPrimary: '200 90% 40%',
        sidebarPrimaryForeground: '0 0% 100%',
        sidebarAccent: '180 30% 90%',
        sidebarAccentForeground: '200 90% 40%',
        sidebarBorder: '200 20% 85%',
        sidebarRing: '200 90% 40%',
    },
};

export const themes: Record<string, Theme> = {
    light: defaultTheme,
    dark: darkTheme,
    midnight: midnightTheme,
    ocean: oceanTheme,
};


export const mapThemeToCSSVariables = (theme: Theme): Record<string, string> => {
    return {
        '--background': theme.colors.background,
        '--foreground': theme.colors.foreground,
        '--card': theme.colors.card,
        '--card-foreground': theme.colors.cardForeground,
        '--popover': theme.colors.popover,
        '--popover-foreground': theme.colors.popoverForeground,
        '--primary': theme.colors.primary,
        '--primary-foreground': theme.colors.primaryForeground,
        '--secondary': theme.colors.secondary,
        '--secondary-foreground': theme.colors.secondaryForeground,
        '--muted': theme.colors.muted,
        '--muted-foreground': theme.colors.mutedForeground,
        '--accent': theme.colors.accent,
        '--accent-foreground': theme.colors.accentForeground,
        '--destructive': theme.colors.destructive,
        '--destructive-foreground': theme.colors.destructiveForeground,
        '--border': theme.colors.border,
        '--input': theme.colors.input,
        '--ring': theme.colors.ring,
        '--radius': theme.colors.radius,
        '--sidebar-background': theme.colors.sidebarBackground,
        '--sidebar-foreground': theme.colors.sidebarForeground,
        '--sidebar-primary': theme.colors.sidebarPrimary,
        '--sidebar-primary-foreground': theme.colors.sidebarPrimaryForeground,
        '--sidebar-accent': theme.colors.sidebarAccent,
        '--sidebar-accent-foreground': theme.colors.sidebarAccentForeground,
        '--sidebar-border': theme.colors.sidebarBorder,
        '--sidebar-ring': theme.colors.sidebarRing,
    };
};
