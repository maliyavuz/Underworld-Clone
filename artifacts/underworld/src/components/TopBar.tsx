import { useGetPlayer } from "@workspace/api-client-react";
import { Bell, Clock, Star, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { data: player, isLoading } = useGetPlayer();
  const [time, setTime] = useState(new Date().toISOString().substring(11, 19));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toISOString().substring(11, 19));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="h-14 md:h-16 bg-card border-b border-border flex items-center px-4 justify-between shrink-0">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  if (!player) return null;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div
      className="h-14 md:h-16 bg-card border-b border-border flex items-center px-3 md:px-6 gap-3 shrink-0 sticky top-0 z-20"
      data-testid="topbar"
    >
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors shrink-0"
        data-testid="button-open-menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Stat bars — hidden on smallest screens, compact on sm */}
      <div className="hidden sm:flex items-center gap-3 md:gap-6 flex-1 min-w-0">
        <StatBar label="HP" value={player.hp} max={player.maxHp} color="bg-red-500" textColor="text-red-500" />
        <StatBar label="ENERGY" value={player.energy} max={player.maxEnergy} color="bg-yellow-500" textColor="text-yellow-500" />
        <StatBar label="NERVE" value={player.nerve} max={player.maxNerve} color="bg-blue-500" textColor="text-blue-500" />
      </div>

      {/* Mobile mini-stats (very compact) */}
      <div className="sm:hidden flex items-center gap-2 flex-1 min-w-0 text-xs">
        <span className="text-red-500 font-bold">{player.hp}</span>
        <span className="text-muted-foreground">/</span>
        <span className="text-yellow-500 font-bold">{player.energy}</span>
        <span className="text-muted-foreground">/</span>
        <span className="text-blue-500 font-bold">{player.nerve}</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 md:gap-4 shrink-0 ml-auto">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-xs text-muted-foreground font-bold">CASH</span>
          <span className="font-mono text-primary font-bold text-sm">{formatCurrency(player.cash)}</span>
        </div>

        <div className="hidden sm:flex flex-col items-end">
          <span className="text-xs text-muted-foreground font-bold">RESPECT</span>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-primary fill-primary" />
            <span className="font-mono font-bold text-sm">{player.respect.toLocaleString()}</span>
          </div>
        </div>

        <div className="hidden lg:flex w-px h-8 bg-border" />

        <div className="hidden lg:flex items-center gap-1.5 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className="font-mono text-xs">{time} UTC</span>
        </div>

        <button
          className="relative p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          data-testid="button-notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
        </button>

        <Avatar className="w-8 h-8 md:w-9 md:h-9 border-2 border-primary/20 cursor-pointer hover:border-primary transition-colors">
          <AvatarImage
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${player.username}&backgroundColor=1a1a1a`}
          />
          <AvatarFallback>{player.username.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}

function StatBar({
  label,
  value,
  max,
  color,
  textColor,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  textColor: string;
}) {
  return (
    <div className="flex flex-col w-24 md:w-32 gap-1 shrink-0">
      <div className="flex justify-between text-xs font-bold">
        <span className={textColor}>{label}</span>
        <span className="text-foreground">{value}/{max}</span>
      </div>
      <div className="h-1.5 md:h-2 bg-black rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  );
}
