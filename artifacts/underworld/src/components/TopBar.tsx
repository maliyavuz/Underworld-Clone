import { useGetPlayer } from "@workspace/api-client-react";
import { Bell, Clock, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

export function TopBar() {
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
      <div className="h-16 bg-card border-b border-border flex items-center px-6 justify-between shrink-0">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-8 w-1/4" />
      </div>
    );
  }

  if (!player) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="h-16 bg-card border-b border-border flex items-center px-6 justify-between shrink-0 sticky top-0 z-40">
      
      {/* Bars */}
      <div className="flex items-center gap-6 flex-1">
        <div className="flex flex-col w-32 gap-1">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-red-500">HP</span>
            <span>{player.hp}/{player.maxHp}</span>
          </div>
          <div className="h-2 bg-black rounded-full overflow-hidden">
            <div className="h-full bg-red-500" style={{ width: `${(player.hp / player.maxHp) * 100}%` }} />
          </div>
        </div>
        
        <div className="flex flex-col w-32 gap-1">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-yellow-500">ENERGY</span>
            <span>{player.energy}/{player.maxEnergy}</span>
          </div>
          <div className="h-2 bg-black rounded-full overflow-hidden">
            <div className="h-full bg-yellow-500" style={{ width: `${(player.energy / player.maxEnergy) * 100}%` }} />
          </div>
        </div>

        <div className="flex flex-col w-32 gap-1">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-blue-500">NERVE</span>
            <span>{player.nerve}/{player.maxNerve}</span>
          </div>
          <div className="h-2 bg-black rounded-full overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: `${(player.nerve / player.maxNerve) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Right side stats */}
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
          <span className="text-xs text-muted-foreground font-bold">CASH</span>
          <span className="font-mono text-primary font-bold">{formatCurrency(player.cash)}</span>
        </div>
        
        <div className="flex flex-col items-end">
          <span className="text-xs text-muted-foreground font-bold">RESPECT</span>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-primary fill-primary" />
            <span className="font-mono font-bold">{player.respect.toLocaleString()}</span>
          </div>
        </div>

        <div className="w-px h-8 bg-border" />

        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className="font-mono text-sm">{time} UTC</span>
        </div>

        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
        </button>

        <Avatar className="border-2 border-primary/20 cursor-pointer hover:border-primary transition-colors">
          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${player.username}&backgroundColor=1a1a1a`} />
          <AvatarFallback>{player.username.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
