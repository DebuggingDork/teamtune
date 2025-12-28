import { cn } from "@/lib/utils";

interface TeamTuneLogoProps {
  className?: string;
  showText?: boolean;
}

const TeamTuneLogo = ({ className, showText = true }: TeamTuneLogoProps) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg viewBox="0 0 70 100" xmlns="http://www.w3.org/2000/svg" className="h-8 w-6">
        <g id="symbol">
          <rect x="10" y="15" width="12" height="70" rx="6" className="fill-primary" />
          <rect x="28" y="30" width="12" height="55" rx="6" className="fill-muted-foreground" />
          <rect x="46" y="42" width="12" height="43" rx="6" className="fill-primary" />
          <path d="M 16 85 Q 34 78, 52 85" className="stroke-muted-foreground" strokeWidth="1.5" fill="none" opacity="0.4"/>
        </g>
      </svg>
      {showText && (
        <span className="text-xl font-medium tracking-tight">
          <span className="text-foreground">Team</span>
          <span className="text-muted-foreground">Tune</span>
        </span>
      )}
    </div>
  );
};

export default TeamTuneLogo;
