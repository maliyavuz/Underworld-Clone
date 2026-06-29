import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import {
  useGetCrimes,
  useCommitCrime,
  useGetPlayer,
  getGetPlayerQueryKey,
  getGetRecentActivityQueryKey,
  getGetActivityFeedQueryKey,
  getGetJailStatusQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Crosshair, Zap, DollarSign, Star, Clock, ShieldOff, AlertTriangle, Heart } from "lucide-react";

function useCooldownTimer(until: string | null | undefined) {
  const [secs, setSecs] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!until) { setSecs(0); return; }
    const update = () => {
      const diff = Math.ceil((new Date(until).getTime() - Date.now()) / 1000);
      setSecs(Math.max(0, diff));
    };
    update();
    intervalRef.current = setInterval(update, 500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [until]);

  return secs;
}

function formatSecs(s: number) {
  if (s <= 0) return null;
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

export default function Crimes() {
  const { data: crimes, isLoading: crimesLoading } = useGetCrimes();
  const { data: player } = useGetPlayer();
  const commitCrime = useCommitCrime();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const cooldownSecs = useCooldownTimer(player?.crimeCooldownUntil);
  const jailSecs = useCooldownTimer(player?.jailUntil);
  const inJail = jailSecs > 0;

  // Auto-invalidate when cooldown/jail expires
  useEffect(() => {
    if (cooldownSecs === 0 || jailSecs === 0) {
      queryClient.invalidateQueries({ queryKey: getGetPlayerQueryKey() });
    }
  }, [cooldownSecs, jailSecs]);

  const handleCommit = (crimeId: string) => {
    commitCrime.mutate({ crimeId }, {
      onSuccess: (res) => {
        queryClient.invalidateQueries({ queryKey: getGetPlayerQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetRecentActivityQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetActivityFeedQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetJailStatusQueryKey() });

        if (res.success) {
          toast({
            title: "Crime Successful!",
            description: `Earned $${res.cashGained.toLocaleString()} and ${res.respectGained} respect.`,
          });
        } else if (res.jailed) {
          toast({
            variant: "destructive",
            title: "Busted! You're in jail.",
            description: res.message,
          });
        } else {
          toast({
            variant: "destructive",
            title: "Crime Failed",
            description: `${res.message}${res.hpLost > 0 ? ` Lost ${res.hpLost} HP.` : ""}`,
          });
        }
      },
      onError: (err: any) => {
        toast({
          variant: "destructive",
          title: "Blocked",
          description: err.message || "Something went wrong.",
        });
      }
    });
  };

  const isLoading = crimesLoading;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Crosshair className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-black tracking-widest text-primary uppercase">Crimes</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Hit the streets to earn cash and respect. Every crime triggers a cooldown — fail and you might end up in jail.
        </p>

        {/* Jail Banner */}
        {inJail && (
          <Card className="border-red-500/50 bg-red-950/25">
            <CardContent className="py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ShieldOff className="w-6 h-6 text-red-400 shrink-0" />
                <div>
                  <p className="font-bold text-red-400 uppercase tracking-wider text-sm">You are in jail</p>
                  <p className="text-xs text-muted-foreground">
                    Released in{" "}
                    <span className="font-mono font-bold text-red-300">{formatSecs(jailSecs)}</span>
                    {" "}— pay bail or bust out early.
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="shrink-0 font-bold tracking-wider"
                onClick={() => navigate("/jail")}
              >
                GO TO JAIL
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Global Cooldown Banner */}
        {!inJail && cooldownSecs > 0 && (
          <Card className="border-yellow-500/30 bg-yellow-950/20">
            <CardContent className="py-3 flex items-center gap-3">
              <Clock className="w-5 h-5 text-yellow-400 shrink-0" />
              <p className="text-sm text-yellow-300">
                Crime cooldown:{" "}
                <span className="font-mono font-bold">{formatSecs(cooldownSecs)}</span>
                {" "}remaining
              </p>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-64" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {crimes?.map((crime) => {
              const blocked = inJail || cooldownSecs > 0 || commitCrime.isPending;
              return (
                <Card
                  key={crime.id}
                  className={`border-border bg-card flex flex-col justify-between transition-colors ${
                    blocked ? "opacity-60" : "hover:border-primary/50"
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-lg tracking-wider">{crime.name}</CardTitle>
                        <CardDescription className="mt-1 text-xs">{crime.description}</CardDescription>
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0 border-primary/40 text-primary">
                        {crime.successRate}% success
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2 text-blue-400">
                        <Zap className="w-3.5 h-3.5" />
                        <span>{crime.nerveCost} Nerve</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-400">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>${crime.cashReward.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-primary">
                        <Star className="w-3.5 h-3.5 fill-primary" />
                        <span>{crime.respReward} EXP</span>
                      </div>
                      <div className="flex items-center gap-2 text-orange-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{crime.cooldownSeconds}s cooldown</span>
                      </div>
                    </div>

                    {/* Risk indicators */}
                    <div className="flex flex-wrap gap-2">
                      <span className="flex items-center gap-1 text-[10px] bg-red-950/40 border border-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                        <Heart className="w-3 h-3" />
                        -{crime.hpLossOnFail} HP on fail
                      </span>
                      <span className="flex items-center gap-1 text-[10px] bg-orange-950/40 border border-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3" />
                        {crime.jailChanceOnFail}% arrest risk
                      </span>
                    </div>

                    <Button
                      className="w-full font-bold tracking-widest"
                      onClick={() => handleCommit(crime.id)}
                      disabled={blocked}
                    >
                      {inJail
                        ? "IN JAIL"
                        : cooldownSecs > 0
                        ? `COOLDOWN ${formatSecs(cooldownSecs)}`
                        : commitCrime.isPending
                        ? "..."
                        : "DO IT"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
