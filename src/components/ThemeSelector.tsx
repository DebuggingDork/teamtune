
import React from 'react';
import { Palette, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

export const ThemeSelector = () => {
    const { theme, setTheme, availableThemes } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                    <Palette className="h-4 w-4" />
                    <span className="sr-only">Change theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {availableThemes.map((t) => (
                    <DropdownMenuItem
                        key={t.name}
                        onClick={() => setTheme(t.name)}
                        className="flex items-center justify-between gap-2"
                    >
                        <span className={cn(t.name === theme && "font-bold")}>
                            {t.label}
                        </span>
                        {t.name === theme && <Check className="h-4 w-4 ml-2" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
