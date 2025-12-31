import { Palette, Check } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const ThemeSelector = ({ className }: { className?: string }) => {
    const { theme, setTheme, availableThemes } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn("gap-2 text-muted-foreground hover:text-foreground", className)}
                >
                    <Palette className="h-4 w-4" />
                    <span className="hidden sm:inline">Change Theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                {availableThemes.map((t) => (
                    <DropdownMenuItem
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className="flex items-center justify-between cursor-pointer"
                    >
                        <div className="flex items-center gap-2">
                            <div
                                className="w-4 h-4 rounded-full border border-border"
                                style={{ backgroundColor: `hsl(${t.colors.primary})` }}
                            />
                            <span>{t.name}</span>
                        </div>
                        {theme === t.id && <Check className="h-4 w-4 text-primary" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
