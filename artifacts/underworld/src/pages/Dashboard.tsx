import { Layout } from "@/components/Layout";
import { useGetPlayer, useGetDailyReward, useClaimDailyReward, useGetActivityFeed, useGetRecentActivity, getGetDailyRewardQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Gift, Clock, Star, TrendingUp, ChevronRight, Crosshair, Car, Lock, Plane } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function Dashboard() {
  const { data: player, isLoading: playerLoading } = useGetPlayer();
  const { data: dailyReward, isLoading: rewardLoading } = useGetDailyReward();
  const claimReward = useClaimDailyReward();
  const { data: feed } = useGetActivityFeed();
  const { data: recent } = useGetRecentActivity();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleClaim = () => {
    claimReward.mutate(undefined, {
      onSuccess: (res) => {
        toast({
          title: "Reward Claimed!",
          description: `You received $${res.amount.toLocaleString()}.`,
        });
        queryClient.invalidateQueries({ queryKey: getGetDailyRewardQueryKey() });
      }
    });
  };

  const formatCash = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  if (playerLoading) return <Layout><div className="flex h-full items-center justify-center"><Skeleton className="h-64 w-full" /></div></Layout>;
  if (!player) return null;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HERO */}
        <div className="relative h-72 rounded-xl overflow-hidden shadow-2xl border border-border">
          <img src="/images/hero.png" alt="City Skyline" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          
          <div className="absolute inset-0 p-6 flex flex-col justify-between">
            <div className="flex justify-end">
              {/* Daily Reward Card */}
              {rewardLoading ? <Skeleton className="w-64 h-32" /> : dailyReward && (
                <Card className="bg-card/90 backdrop-blur border-primary/20 w-72">
                  <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Gift className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold tracking-wider">DAILY REWARD</h3>
                      {dailyReward.canClaim ? (
                        <p className="text-sm text-muted-foreground">Ready to claim!</p>
                      ) : (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1 justify-center">
                          <Clock className="w-4 h-4" />
                          <span>{Math.floor(dailyReward.nextClaimInSeconds / 3600)}h {Math.floor((dailyReward.nextClaimInSeconds % 3600) / 60)}m</span>
                        </div>
                      )}
                    </div>
                    <Button 
                      className="w-full font-bold tracking-widest" 
                      disabled={!dailyReward.canClaim || claimReward.isPending}
                      onClick={handleClaim}
                    >
                      {dailyReward.canClaim ? "CLAIM REWARD" : "COME BACK LATER"}
                    </Button>
                    <p className="text-xs text-primary/80 font-mono">STREAK: {dailyReward.streakDays} DAYS</p>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="flex items-end gap-6">
              <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${player.username}&backgroundColor=1a1a1a`} />
                <AvatarFallback>{player.username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="pb-2">
                <p className="text-sm text-primary font-bold tracking-widest mb-1">WELCOME BACK,</p>
                <h1 className="text-4xl font-black tracking-wider uppercase drop-shadow-lg">{player.username}</h1>
                <div className="flex items-center gap-4 mt-2">
                  <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-sm tracking-widest">
                    {player.rank}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Rank Progress:</span>
                    <div className="w-32 h-2 bg-black rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${player.rankProgress}%` }} />
                    </div>
                    <span className="font-mono">{player.rankProgress}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STATS STRIP */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex flex-col gap-1">
              <span className="text-xs text-muted-foreground font-bold tracking-wider">CASH</span>
              <span className="text-xl font-mono text-primary font-bold">{formatCash(player.cash)}</span>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex flex-col gap-1">
              <span className="text-xs text-muted-foreground font-bold tracking-wider">RESPECT</span>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-primary fill-primary" />
                <span className="text-xl font-mono font-bold">{player.respect.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex flex-col gap-1">
              <span className="text-xs text-muted-foreground font-bold tracking-wider">RANK</span>
              <span className="text-xl font-bold uppercase truncate">{player.rank}</span>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex flex-col justify-center gap-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-yellow-500">ENERGY</span>
                <span>{player.energy}/{player.maxEnergy}</span>
              </div>
              <div className="h-2 bg-black rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500" style={{ width: `${(player.energy / player.maxEnergy) * 100}%` }} />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex flex-col justify-center gap-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-blue-500">NERVE</span>
                <span>{player.nerve}/{player.maxNerve}</span>
              </div>
              <div className="h-2 bg-black rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${(player.nerve / player.maxNerve) * 100}%` }} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: ACTIONS */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-widest text-primary">AVAILABLE ACTIONS</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/crimes">
                <Card className="group cursor-pointer border-border hover:border-primary transition-colors overflow-hidden relative h-48">
                  <img src="/images/crimes.png" alt="Crimes" className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-background/20" />
                  <CardContent className="absolute inset-0 p-6 flex flex-col justify-end">
                    <div className="flex items-center gap-2 mb-2">
                      <Crosshair className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-bold tracking-widest text-white">COMMIT CRIMES</h3>
                    </div>
                    <p className="text-sm text-gray-300 mb-4 line-clamp-2">Earn cash, respect, and build your reputation on the streets.</p>
                    <Button variant="outline" className="w-full bg-background/50 border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-all">ENTER STREETS</Button>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/car-theft">
                <Card className="group cursor-pointer border-border hover:border-primary transition-colors overflow-hidden relative h-48">
                  <img src="/images/car-theft.png" alt="Car Theft" className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-background/20" />
                  <CardContent className="absolute inset-0 p-6 flex flex-col justify-end">
                    <div className="flex items-center gap-2 mb-2">
                      <Car className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-bold tracking-widest text-white">GRAND THEFT AUTO</h3>
                    </div>
                    <p className="text-sm text-gray-300 mb-4 line-clamp-2">Steal luxury vehicles to sell on the black market or keep in your garage.</p>
                    <Button variant="outline" className="w-full bg-background/50 border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-all">FIND TARGETS</Button>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/heist">
                <Card className="group cursor-pointer border-border hover:border-primary transition-colors overflow-hidden relative h-48">
                  <img src="/images/heist.png" alt="Heist" className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-background/20" />
                  <CardContent className="absolute inset-0 p-6 flex flex-col justify-end">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-bold tracking-widest text-white">ORGANIZE HEIST</h3>
                    </div>
                    <p className="text-sm text-gray-300 mb-4 line-clamp-2">Plan and execute massive operations for massive payouts.</p>
                    <Button variant="outline" className="w-full bg-background/50 border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-all">PLAN HEIST</Button>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/travel">
                <Card className="group cursor-pointer border-border hover:border-primary transition-colors overflow-hidden relative h-48">
                  <img src="/images/travel.png" alt="Travel" className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-background/20" />
                  <CardContent className="absolute inset-0 p-6 flex flex-col justify-end">
                    <div className="flex items-center gap-2 mb-2">
                      <Plane className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-bold tracking-widest text-white">TRAVEL</h3>
                    </div>
                    <p className="text-sm text-gray-300 mb-4 line-clamp-2">Leave town, smuggle goods, and expand your empire globally.</p>
                    <Button variant="outline" className="w-full bg-background/50 border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-all">BOOK FLIGHT</Button>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* RECENT ACTIVITY */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold tracking-widest text-muted-foreground">RECENT ACTIVITY</h2>
              <Card className="border-border">
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {recent?.map((item, idx) => (
                      <div key={item.id} className="p-4 flex items-center justify-between hover:bg-sidebar-accent transition-colors">
                        <div className="flex items-center gap-4">
                          <span className="text-muted-foreground font-mono text-sm w-6">{idx + 1}.</span>
                          <div>
                            <p className="font-medium">
                              {item.description} {item.target && <span className="text-primary">{item.target}</span>}
                            </p>
                            <p className="text-xs text-muted-foreground">{item.timeAgo}</p>
                          </div>
                        </div>
                        <span className="text-primary font-mono font-bold">+{formatCash(item.amount)}</span>
                      </div>
                    ))}
                    {!recent?.length && (
                      <div className="p-8 text-center text-muted-foreground">No recent activity. Get to work.</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* RIGHT: ACTIVITY FEED */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-widest text-primary">ACTIVITY FEED</h2>
              <Link href="/activity" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center">
                VIEW ALL <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <Card className="border-border h-[600px] flex flex-col">
              <CardContent className="p-0 flex-1 overflow-y-auto">
                <div className="divide-y divide-border">
                  {feed?.map((item) => (
                    <div key={item.id} className="p-4 flex gap-3 hover:bg-sidebar-accent transition-colors">
                      <Avatar className="w-10 h-10 border border-border">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.username}&backgroundColor=${item.avatarColor.replace('#', '')}`} />
                        <AvatarFallback>{item.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-sm">{item.username}</span>
                          <span className="text-xs text-muted-foreground">{item.timeAgo}</span>
                        </div>
                        <p className="text-sm mt-1">
                          <span className="text-muted-foreground">{item.action} </span>
                          <span className="font-medium text-foreground">{item.detail}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                  {!feed?.length && (
                    <div className="p-8 text-center text-muted-foreground">The city is quiet...</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </Layout>
  );
}
