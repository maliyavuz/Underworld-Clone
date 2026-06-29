import { useGetPlayer, getGetPlayerQueryKey } from "@workspace/api-client-react";
import { Bell, Clock, Star, Menu, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLocation } from "wouter";

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { data: player, isLoading } = useGetPlayer();
  const [time, setTime] = useState(new Date().toISOString().substring(11, 19));
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  // Clock tick every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toISOString().substring(11, 19));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-refresh player stats every 30 seconds (picks up regen)
  useEffect(() => {
    const refresh = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: getGetPlayerQueryKey() });
    }, 30_000);
    return () => clearInterval(refresh);
  }, [queryClient]);

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

  const inJail = !!(player.jailUntil && new Date(player.jailUntil).getTime() > Date.now());

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

      {/* Stat bars — hidden on smallest screens */}
      <div className="hidden sm:flex items-center gap-3 md:gap-6 flex-1 min-w-0">
        <StatBar
          label="HP"
          value={player.hp}
          max={player.maxHp}
          color="bg-red-500"
          textColor="text-red-500"
          regenTip="Regenerates 1 HP every 10 min"
          warning={player.hp < player.maxHp * 0.25}
        />
        <StatBar
          label="ENERGY"
          value={player.energy}
          max={player.maxEnergy}
          color="bg-yellow-500"
          textColor="text-yellow-500"
          regenTip="Regenerates 1 Energy every 4 min"
        />
        <StatBar
          label="NERVE"
          value={player.nerve}
          max={player.maxNerve}
          color="bg-blue-500"
          textColor="text-blue-500"
          regenTip="Regenerates 1 Nerve every 5 min"
        />
      </div>

      {/* Mobile mini-stats (very compact) */}
      <div className="sm:hidden flex items-center gap-2 flex-1 min-w-0 text-xs">
        <span className={`font-bold ${player.hp < player.maxHp * 0.25 ? "text-red-400 animate-pulse" : "text-red-500"}`}>
          {player.hp}
        </span>
        <span className="text-muted-foreground">/</span>
        <span className="text-yellow-500 font-bold">{player.energy}</span>
        <span className="text-muted-foreground">/</span>
        <span className="text-blue-500 font-bold">{player.nerve}</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 md:gap-4 shrink-0 ml-auto">
        {/* Jail indicator */}
        {inJail && (
          <button
            onClick={() => navigate("/jail")}
            className="hidden sm:flex items-center gap-1.5 bg-red-950/60 border border-red-500/40 text-red-400 text-xs font-bold px-2 py-1 rounded animate-pulse hover:bg-red-950 transition-colors"
          >
            <span>IN JAIL</span>
          </button>
        )}

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

        {/* Rank + progress */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="hidden lg:flex flex-col items-end cursor-default">
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{player.rank}</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-16 h-1 bg-black rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${player.rankProgress}%` }}
                  />
                </div>
                <TrendingUp className="w-3 h-3 text-primary" />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            <p className="font-bold">{player.rank}</p>
            <p className="text-muted-foreground">{player.rankProgress}% to next rank</p>
          </TooltipContent>
        </Tooltip>

        <div className="hidden lg:flex w-px h-8 bg-border" />

        <div className="hidden lg:flex items-center gap-1.5 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className="font-mono text-xs">{time} UTC</span>
        </div>

        <button
          className="relative p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          data-testid="button-notifications"
          onClick={() => navigate("/notifications")}
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
        </button>

        <Avatar
          className="w-8 h-8 md:w-9 md:h-9 border-2 border-primary/20 cursor-pointer hover:border-primary transition-colors"
          onClick={() => navigate("/account")}
        >
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
  regenTip,
  warning,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  textColor: string;
  regenTip: string;
  warning?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex flex-col w-24 md:w-32 gap-1 shrink-0 cursor-default">
          <div className="flex justify-between text-xs font-bold">
            <span className={`${textColor} ${warning ? "animate-pulse" : ""}`}>{label}</span>
            <span className={`${warning ? "text-red-400" : "text-foreground"}`}>{value}/{max}</span>
          </div>
          <div className="h-1.5 md:h-2 bg-black rounded-full overflow-hidden">
            <div
              className={`h-full ${warning ? "bg-red-400" : color} rounded-full transition-all duration-1000`}
              style={{ width: `${(value / max) * 100}%` }}
            />
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        <p className="font-bold">{label}: {value}/{max}</p>
        <p className="text-muted-foreground">{regenTip}</p>
      </TooltipContent>
    </Tooltip>
  );
}
