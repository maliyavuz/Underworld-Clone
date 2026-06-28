import { Layout } from "@/components/Layout";
import { useGetHeistPlans, useExecuteHeist, getGetPlayerQueryKey, getGetRecentActivityQueryKey, getGetActivityFeedQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Lock, Zap, DollarSign, Users } from "lucide-react";

export default function Heist() {
  const { data: plans, isLoading } = useGetHeistPlans();
  const executeHeist = useExecuteHeist();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleExecute = (planId: string) => {
    executeHeist.mutate({ data: { planId } }, {
      onSuccess: (res) => {
        if (res.success) {
          toast({
            title: "Heist Successful!",
            description: `You earned $${res.cashGained.toLocaleString()} and ${res.respectGained} respect.`,
          });
          queryClient.invalidateQueries({ queryKey: getGetPlayerQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetRecentActivityQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetActivityFeedQueryKey() });
        } else {
          toast({
            variant: "destructive",
            title: "Heist Failed",
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
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Lock className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-black tracking-widest text-primary uppercase">Heists</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Coordinate massive hits for massive payouts. Make sure you have the nerve and the crew.
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1,2].map(i => <Skeleton key={i} className="h-64" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans?.map((plan) => (
              <Card key={plan.id} className="border-border bg-card hover:border-primary/50 transition-colors flex flex-col justify-between overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Lock className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                  <CardHeader>
                    <CardTitle className="text-2xl tracking-wider text-primary">{plan.name}</CardTitle>
                    <CardDescription className="text-base">{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3 bg-background/50 p-4 rounded-lg">
                      <div className="flex items-center justify-between text-sm font-bold">
                        <span className="text-muted-foreground flex items-center gap-2"><Zap className="w-4 h-4 text-blue-500" /> Nerve Cost</span>
                        <span className="text-blue-500">{plan.nerveCost} Nerve</span>
                      </div>
                      <div className="flex items-center justify-between text-sm font-bold">
                        <span className="text-muted-foreground flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Min Players</span>
                        <span>{plan.minPlayers}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm font-bold border-t border-border/50 pt-2">
                        <span className="text-muted-foreground flex items-center gap-2"><DollarSign className="w-4 h-4 text-green-500" /> Max Reward</span>
                        <span className="text-green-500 text-lg">${plan.reward.toLocaleString()}</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full font-bold tracking-widest text-lg h-12" 
                      onClick={() => handleExecute(plan.id)}
                      disabled={executeHeist.isPending}
                    >
                      EXECUTE PLAN
                    </Button>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
