import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import {
  useGetJailStatus,
  usePayBail,
  useBustFromJail,
  getGetJailStatusQueryKey,
  getGetPlayerQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { ShieldOff, DollarSign, Zap, Clock } from "lucide-react";

function formatTime(seconds: number): string {
  if (seconds <= 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function Jail() {
  const { data: jailStatus, isLoading } = useGetJailStatus();
  const payBail = usePayBail();
  const bust = useBustFromJail();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!jailStatus?.inJail) return;
    setCountdown(jailStatus.secondsRemaining);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          queryClient.invalidateQueries({ queryKey: getGetJailStatusQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetPlayerQueryKey() });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [jailStatus?.inJail, jailStatus?.secondsRemaining]);

  const handleBail = () => {
    payBail.mutate(undefined, {
      onSuccess: (res) => {
        toast({ title: "Bailed Out!", description: res.message });
        queryClient.invalidateQueries({ queryKey: getGetJailStatusQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetPlayerQueryKey() });
      },
      onError: (err: any) => {
        toast({ variant: "destructive", title: "Error", description: err.message });
      },
    });
  };

  const handleBust = () => {
    bust.mutate(undefined, {
      onSuccess: (res) => {
        toast({ title: res.secondsRemaining === 0 ? "You're Free!" : "Sentence Reduced", description: res.message });
        queryClient.invalidateQueries({ queryKey: getGetJailStatusQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetPlayerQueryKey() });
      },
      onError: (err: any) => {
        toast({ variant: "destructive", title: "Error", description: err.message });
      },
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-muted-foreground animate-pulse">Checking jail status...</div>
        </div>
      </Layout>
    );
  }

  if (!jailStatus?.inJail) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <ShieldOff className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-black tracking-widest text-primary uppercase">Jail</h1>
          </div>
          <Card className="border-green-500/30 bg-green-950/20">
            <CardContent className="pt-8 pb-8 text-center space-y-3">
              <div className="text-6xl font-black text-green-500">FREE</div>
              <p className="text-muted-foreground">
                You are not in jail. Stay off the radar.
              </p>
              <p className="text-xs text-muted-foreground/60">
                Commit crimes carefully — getting caught means doing time.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold tracking-widest uppercase text-muted-foreground">
                How Jail Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-3 items-start">
                <span className="text-primary font-bold shrink-0">01</span>
                <p>Every failed crime carries a chance of arrest. Riskier crimes mean more time.</p>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-primary font-bold shrink-0">02</span>
                <p>While in jail you cannot commit crimes. Serve your time, pay bail, or spend nerve to bust out.</p>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-primary font-bold shrink-0">03</span>
                <p>Each Bust attempt costs 10 Nerve and reduces your sentence by 2 minutes.</p>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-primary font-bold shrink-0">04</span>
                <p>Bail costs vary by crime severity. The bigger the job, the steeper the bail.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const initialSeconds = jailStatus.secondsRemaining;
  const progressPct = initialSeconds > 0 ? Math.max(0, (countdown / initialSeconds) * 100) : 0;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <ShieldOff className="w-8 h-8 text-red-500" />
          <h1 className="text-3xl font-black tracking-widest text-red-500 uppercase">In Jail</h1>
        </div>

        {/* Timer card */}
        <Card className="border-red-500/40 bg-red-950/20">
          <CardContent className="pt-8 pb-6 space-y-5 text-center">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Time Remaining</p>
              <div className="text-7xl font-black font-mono text-red-400 tabular-nums tracking-wider">
                {formatTime(countdown)}
              </div>
            </div>
            <Progress value={100 - progressPct} className="h-2 bg-red-900/40 [&>div]:bg-red-500" />
            <p className="text-sm text-muted-foreground">
              Sit tight or find a way out.
            </p>
          </CardContent>
        </Card>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Pay Bail */}
          <Card className="border-border bg-card hover:border-primary/40 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="w-5 h-5 text-primary" />
                Pay Bail
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Walk out immediately by paying your bail. Instant freedom, no questions asked.
              </p>
              <div className="text-2xl font-black text-primary">
                ${jailStatus.bailAmount.toLocaleString()}
              </div>
              <Button
                className="w-full font-bold tracking-widest"
                onClick={handleBail}
                disabled={payBail.isPending}
              >
                {payBail.isPending ? "Processing..." : "PAY BAIL"}
              </Button>
            </CardContent>
          </Card>

          {/* Bust Out */}
          <Card className="border-border bg-card hover:border-blue-500/40 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="w-5 h-5 text-blue-400" />
                Bust Out
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Spend nerve to bribe a guard and shave time off your sentence. 2 min per bust.
              </p>
              <div className="flex items-center gap-2 text-blue-400 font-bold">
                <Zap className="w-4 h-4" />
                <span>Costs 10 Nerve</span>
              </div>
              <Button
                variant="outline"
                className="w-full font-bold tracking-widest border-blue-500/40 text-blue-400 hover:bg-blue-950/40"
                onClick={handleBust}
                disabled={bust.isPending}
              >
                {bust.isPending ? "Busting..." : "BUST OUT (−2 MIN)"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Serve time card */}
        <Card className="border-border/40 bg-card/50">
          <CardContent className="py-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-muted-foreground shrink-0" />
            <p className="text-sm text-muted-foreground">
              Or just wait. Your sentence ends automatically when the timer hits zero.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
