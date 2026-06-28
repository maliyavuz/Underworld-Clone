import { Layout } from "@/components/Layout";
import { useGetCrimes, useCommitCrime, getGetPlayerQueryKey, getGetRecentActivityQueryKey, getGetActivityFeedQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Crosshair, Zap, DollarSign, Star } from "lucide-react";

export default function Crimes() {
  const { data: crimes, isLoading } = useGetCrimes();
  const commitCrime = useCommitCrime();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleCommit = (crimeId: string) => {
    commitCrime.mutate({ crimeId }, {
      onSuccess: (res) => {
        if (res.success) {
          toast({
            title: "Crime Successful!",
            description: `You earned $${res.cashGained} and ${res.respectGained} respect.`,
          });
          queryClient.invalidateQueries({ queryKey: getGetPlayerQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetRecentActivityQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetActivityFeedQueryKey() });
        } else {
          toast({
            variant: "destructive",
            title: "Crime Failed",
            description: res.message,
          });
        }
      },
      onError: (err: any) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message || "Something went wrong.",
        });
      }
    });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Crosshair className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-black tracking-widest text-primary uppercase">Crimes</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Hit the streets to earn cash and respect. Watch your nerve—some crimes are riskier than others.
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-48" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {crimes?.map((crime) => (
              <Card key={crime.id} className="border-border bg-card hover:border-primary/50 transition-colors flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="text-xl tracking-wider">{crime.name}</CardTitle>
                  <CardDescription>{crime.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-500" />
                      <span>{crime.nerveCost} Nerve</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Crosshair className="w-4 h-4 text-primary" />
                      <span>{crime.successRate}% Success</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-500">
                      <DollarSign className="w-4 h-4" />
                      <span>${crime.cashReward.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-primary">
                      <Star className="w-4 h-4 fill-primary" />
                      <span>{crime.respReward} EXP</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full font-bold tracking-widest" 
                    onClick={() => handleCommit(crime.id)}
                    disabled={commitCrime.isPending}
                  >
                    DO IT
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
