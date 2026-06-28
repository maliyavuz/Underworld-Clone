import { Layout } from "@/components/Layout";
import {
  useGetPlayer,
  useGetDailyReward,
  useClaimDailyReward,
  useGetActivityFeed,
  useGetRecentActivity,
  getGetDailyRewardQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Gift,
  Clock,
  Star,
  ChevronRight,
  Crosshair,
  Car,
  Lock,
  Plane,
} from "lucide-react";
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
      },
    });
  };

  const formatCash = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);

  if (playerLoading)
    return (
      <Layout>
        <div className="space-y-4">
          <Skeleton className="h-48 md:h-72 w-full rounded-xl" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </div>
      </Layout>
    );
  if (!player) return null;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">

        {/* HERO */}
        <div className="relative rounded-xl overflow-hidden shadow-2xl border border-border">
          <img
            src="/images/hero.png"
            alt="City Skyline"
            className="w-full h-48 sm:h-60 md:h-72 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

          {/* Daily reward — top right on md+, hidden inside hero on mobile (shown below) */}
          <div className="absolute top-3 right-3 hidden sm:block">
            {rewardLoading ? (
              <Skeleton className="w-56 h-36" />
            ) : (
              dailyReward && (
                <Card className="bg-card/90 backdrop-blur border-primary/20 w-60">
                  <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Gift className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-bold tracking-wider text-sm">DAILY REWARD</h3>
                    {dailyReward.canClaim ? (
                      <p className="text-xs text-muted-foreground">Ready to claim!</p>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground justify-center">
                        <Clock className="w-3 h-3" />
                        <span>
                          {Math.floor(dailyReward.nextClaimInSeconds / 3600)}h{" "}
                          {Math.floor((dailyReward.nextClaimInSeconds % 3600) / 60)}m
                        </span>
                      </div>
                    )}
                    <Button
                      className="w-full font-bold tracking-widest text-xs h-8"
                      disabled={!dailyReward.canClaim || claimReward.isPending}
                      onClick={handleClaim}
                      data-testid="button-claim-reward"
                    >
                      {dailyReward.canClaim ? "CLAIM REWARD" : "COME BACK LATER"}
                    </Button>
                    <p className="text-xs text-primary/80 font-mono">
                      STREAK: {dailyReward.streakDays} DAYS
                    </p>
                  </CardContent>
                </Card>
              )
            )}
          </div>

          {/* Player info — bottom left */}
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 flex items-end gap-3 md:gap-5">
            <Avatar className="w-14 h-14 md:w-20 md:h-20 border-4 border-background shadow-xl shrink-0">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${player.username}&backgroundColor=1a1a1a`}
              />
              <AvatarFallback>{player.username.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="pb-1 min-w-0">
              <p className="text-xs text-primary font-bold tracking-widest mb-0.5">WELCOME BACK,</p>
              <h1 className="text-xl sm:text-2xl md:text-4xl font-black tracking-wider uppercase drop-shadow-lg truncate">
                {player.username}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded-sm tracking-widest">
                  {player.rank}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-20 md:w-32 h-1.5 bg-black rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${player.rankProgress}%` }}
                    />
                  </div>
                  <span className="font-mono">{player.rankProgress}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE Daily Reward (shown below hero on small screens) */}
        {!rewardLoading && dailyReward && (
          <Card className="sm:hidden border-primary/20 bg-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Gift className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold tracking-wider text-sm">DAILY REWARD</h3>
                {dailyReward.canClaim ? (
                  <p className="text-xs text-green-400 font-medium">Ready to claim!</p>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>
                      {Math.floor(dailyReward.nextClaimInSeconds / 3600)}h{" "}
                      {Math.floor((dailyReward.nextClaimInSeconds % 3600) / 60)}m — STREAK:{" "}
                      {dailyReward.streakDays} DAYS
                    </span>
                  </div>
                )}
              </div>
              <Button
                className="font-bold tracking-widest text-xs h-8 shrink-0"
                disabled={!dailyReward.canClaim || claimReward.isPending}
                onClick={handleClaim}
                data-testid="button-claim-reward-mobile"
              >
                {dailyReward.canClaim ? "CLAIM" : "LATER"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* STATS STRIP */}
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-4">
          <StatCard label="CASH" value={formatCash(player.cash)} className="col-span-3 sm:col-span-1" />
          <StatCard
            label="RESPECT"
            value={
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-primary fill-primary" />
                <span>{player.respect.toLocaleString()}</span>
              </div>
            }
          />
          <StatCard label="RANK" value={player.rank} />
          <StatCard
            label="ENERGY"
            value={
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-yellow-500">ENERGY</span>
                  <span>{player.energy}/{player.maxEnergy}</span>
                </div>
                <div className="h-1.5 bg-black rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 rounded-full"
                    style={{ width: `${(player.energy / player.maxEnergy) * 100}%` }}
                  />
                </div>
              </div>
            }
            noLabel
          />
          <StatCard
            label="NERVE"
            value={
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-blue-500">NERVE</span>
                  <span>{player.nerve}/{player.maxNerve}</span>
                </div>
                <div className="h-1.5 bg-black rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(player.nerve / player.maxNerve) * 100}%` }}
                  />
                </div>
              </div>
            }
            noLabel
          />
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

          {/* LEFT: ACTIONS + RECENT ACTIVITY */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <h2 className="text-base md:text-xl font-bold tracking-widest text-primary">
              AVAILABLE ACTIONS
            </h2>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <ActionCard
                href="/crimes"
                image="/images/crimes.png"
                icon={<Crosshair className="w-4 h-4 text-primary" />}
                title="COMMIT CRIMES"
                desc="Earn cash, respect, and build your rep."
                cta="ENTER STREETS"
              />
              <ActionCard
                href="/car-theft"
                image="/images/car-theft.png"
                icon={<Car className="w-4 h-4 text-primary" />}
                title="GRAND THEFT"
                desc="Steal luxury vehicles for quick cash."
                cta="FIND TARGETS"
              />
              <ActionCard
                href="/heist"
                image="/images/heist.png"
                icon={<Lock className="w-4 h-4 text-primary" />}
                title="ORGANIZE HEIST"
                desc="Plan massive operations for big payouts."
                cta="PLAN HEIST"
              />
              <ActionCard
                href="/travel"
                image="/images/travel.png"
                icon={<Plane className="w-4 h-4 text-primary" />}
                title="TRAVEL"
                desc="Expand your empire to new cities."
                cta="BOOK FLIGHT"
              />
            </div>

            {/* RECENT ACTIVITY */}
            <div className="space-y-3">
              <h2 className="text-sm md:text-lg font-bold tracking-widest text-muted-foreground">
                RECENT ACTIVITY
              </h2>
              <Card className="border-border">
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {recent?.map((item, idx) => (
                      <div
                        key={item.id}
                        className="p-3 md:p-4 flex items-center justify-between gap-3 hover:bg-sidebar-accent transition-colors"
                        data-testid={`row-activity-${item.id}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-muted-foreground font-mono text-xs shrink-0">{idx + 1}.</span>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">
                              {item.description}{" "}
                              {item.target && (
                                <span className="text-primary">{item.target}</span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">{item.timeAgo}</p>
                          </div>
                        </div>
                        <span className="text-primary font-mono font-bold text-sm shrink-0">
                          +{formatCash(item.amount)}
                        </span>
                      </div>
                    ))}
                    {!recent?.length && (
                      <div className="p-8 text-center text-muted-foreground text-sm">
                        No recent activity. Get to work.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* RIGHT: ACTIVITY FEED */}
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base md:text-xl font-bold tracking-widest text-primary">
                ACTIVITY FEED
              </h2>
              <Link
                href="/activity"
                className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-0.5"
              >
                VIEW ALL <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <Card className="border-border max-h-[400px] lg:max-h-[600px] flex flex-col">
              <CardContent className="p-0 flex-1 overflow-y-auto">
                <div className="divide-y divide-border">
                  {feed?.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 md:p-4 flex gap-3 hover:bg-sidebar-accent transition-colors"
                      data-testid={`feed-entry-${item.id}`}
                    >
                      <Avatar className="w-9 h-9 border border-border shrink-0">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.username}&backgroundColor=${item.avatarColor.replace("#", "")}`}
                        />
                        <AvatarFallback>{item.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="font-bold text-sm">{item.username}</span>
                          <span className="text-xs text-muted-foreground">{item.timeAgo}</span>
                        </div>
                        <p className="text-xs md:text-sm mt-0.5">
                          <span className="text-muted-foreground">{item.action} </span>
                          <span className="font-medium text-foreground">{item.detail}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                  {!feed?.length && (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      The city is quiet...
                    </div>
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

function StatCard({
  label,
  value,
  className = "",
  noLabel = false,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
  noLabel?: boolean;
}) {
  return (
    <Card className={`bg-card border-border ${className}`}>
      <CardContent className="p-3 md:p-4 flex flex-col gap-1 justify-center">
        {!noLabel && (
          <span className="text-xs text-muted-foreground font-bold tracking-wider">{label}</span>
        )}
        <div className="text-base md:text-xl font-mono font-bold text-primary truncate">{value}</div>
      </CardContent>
    </Card>
  );
}

function ActionCard({
  href,
  image,
  icon,
  title,
  desc,
  cta,
}: {
  href: string;
  image: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  cta: string;
}) {
  return (
    <Link href={href}>
      <Card className="group cursor-pointer border-border hover:border-primary transition-colors overflow-hidden relative h-40 md:h-52">
        <img
          src={image}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 to-background/20" />
        <CardContent className="absolute inset-0 p-3 md:p-5 flex flex-col justify-end">
          <div className="flex items-center gap-1.5 mb-1">
            {icon}
            <h3 className="text-xs md:text-base font-bold tracking-wider text-white leading-tight">
              {title}
            </h3>
          </div>
          <p className="text-xs text-gray-300 mb-2 line-clamp-2 hidden sm:block">{desc}</p>
          <Button
            variant="outline"
            size="sm"
            className="w-full bg-background/50 border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-all text-xs font-bold tracking-wide"
          >
            {cta}
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
