import { useGetPlayer } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { Star, Shield, Zap, Heart, TrendingUp, DollarSign, Activity, Award } from "lucide-react";
import { RANKS } from "@/lib/ranks";

export default function Profile() {
  const { data: player, isLoading } = useGetPlayer();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>
      </Layout>
    );
  }

  if (!player) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64 text-muted-foreground">Player not found</div>
      </Layout>
    );
  }

  const rankIndex = RANKS.findIndex(r => r.name === player.rank);
  const nextRank = RANKS[rankIndex + 1] ?? null;
  const currentRankMin = RANKS[rankIndex]?.minRespect ?? 0;
  const respectToNext = nextRank ? Math.max(0, nextRank.minRespect - player.respect) : 0;

  return (
    <Layout>
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-primary uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-6 h-6" />
          Profile
        </h1>

        {/* Identity Card */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-primary/20 to-primary/5 relative">
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)"
              }}
            />
          </div>
          <div className="px-6 pb-6 -mt-10">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 rounded-full border-4 border-primary/40 overflow-hidden bg-card">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${player.username}&backgroundColor=1a1a1a`}
                  alt={player.username}
                  className="w-full h-full"
                />
              </div>
              <div className="mb-1">
                <h2 className="text-2xl font-bold tracking-wider">{player.username}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold bg-primary/20 text-primary px-2 py-0.5 rounded uppercase tracking-wider border border-primary/30">
                    {player.rank}
                  </span>
                  <span className="text-muted-foreground text-sm">{player.city}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rank Progress */}
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Rank Progression
            </h3>
            {nextRank && (
              <span className="text-xs text-muted-foreground">
                {respectToNext.toLocaleString()} respect to {nextRank.name}
              </span>
            )}
          </div>

          {/* Rank ladder */}
          <div className="space-y-2 mb-4">
            {RANKS.map((rank, i) => {
              const isCurrentOrPast = i <= rankIndex;
              const isCurrent = i === rankIndex;
              return (
                <div key={rank.name} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full border-2 transition-colors ${
                    isCurrent ? "border-primary bg-primary" :
                    isCurrentOrPast ? "border-primary/40 bg-primary/20" :
                    "border-border bg-transparent"
                  }`} />
                  <span className={`text-sm font-bold ${
                    isCurrent ? "text-primary" :
                    isCurrentOrPast ? "text-foreground/60" :
                    "text-muted-foreground/40"
                  }`}>
                    {rank.name}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {rank.minRespect.toLocaleString()} respect
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress bar for current rank */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{player.rank} — {currentRankMin.toLocaleString()}</span>
              <span>{player.rankProgress}%</span>
              {nextRank && <span>{nextRank.name} — {nextRank.minRespect.toLocaleString()}</span>}
            </div>
            <div className="h-2 bg-black rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${player.rankProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatCard
            icon={<Heart className="w-5 h-5 text-red-500" />}
            label="HP"
            value={`${player.hp} / ${player.maxHp}`}
            sub="Regen: 1 per 10 min"
            color="text-red-500"
          />
          <StatCard
            icon={<Zap className="w-5 h-5 text-yellow-500" />}
            label="Energy"
            value={`${player.energy} / ${player.maxEnergy}`}
            sub="Regen: 1 per 4 min"
            color="text-yellow-500"
          />
          <StatCard
            icon={<Shield className="w-5 h-5 text-blue-500" />}
            label="Nerve"
            value={`${player.nerve} / ${player.maxNerve}`}
            sub="Regen: 1 per 5 min"
            color="text-blue-500"
          />
          <StatCard
            icon={<DollarSign className="w-5 h-5 text-primary" />}
            label="Cash"
            value={new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(player.cash)}
            sub="On hand"
            color="text-primary"
          />
          <StatCard
            icon={<Star className="w-5 h-5 text-primary fill-primary" />}
            label="Respect"
            value={player.respect.toLocaleString()}
            sub="Total earned"
            color="text-primary"
          />
          <StatCard
            icon={<Award className="w-5 h-5 text-orange-400" />}
            label="Streak"
            value={`${player.streakDays} days`}
            sub="Daily login"
            color="text-orange-400"
          />
        </div>
      </div>
    </Layout>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}
