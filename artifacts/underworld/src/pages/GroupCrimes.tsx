import { Layout } from "@/components/Layout";
import {
  useGetGroupCrimes,
  useCommitGroupCrime,
  getGetGroupCrimesQueryKey,
  getGetPlayerQueryKey,
  getGetRecentActivityQueryKey,
} from "@workspace/api-client-react";
import type { GroupCrime } from "@workspace/api-client-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Users, Zap, DollarSign, Crosshair, UserPlus } from "lucide-react";

export default function GroupCrimes() {
  const { data: crimes, isLoading } = useGetGroupCrimes();
  const commitCrime = useCommitGroupCrime();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleCommit = (crimeId: string) => {
    commitCrime.mutate(
      { crimeId },
      {
        onSuccess: (res: any) => {
          if (res.success) {
            toast({
              title: "Group Crime Successful!",
              description: `Your crew pulled it off! You earned $${res.cashGained.toLocaleString()} and ${res.respectGained} respect.`,
            });
            queryClient.invalidateQueries({
              queryKey: getGetGroupCrimesQueryKey(),
            });
            queryClient.invalidateQueries({ queryKey: getGetPlayerQueryKey() });
            queryClient.invalidateQueries({
              queryKey: getGetRecentActivityQueryKey(),
            });
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
        },
      },
    );
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-black tracking-widest text-primary uppercase">
            Group Crimes
          </h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Coordinate with your crew for bigger payouts. Higher nerve cost,
          higher reward. Strength in numbers.
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-56" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {crimes?.map((crime: GroupCrime) => (
              <Card
                key={crime.id}
                className="border-border bg-card hover:border-primary/50 transition-colors flex flex-col justify-between"
                data-testid={`card-group-crime-${crime.id}`}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl tracking-wider uppercase">
                      {crime.name}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="border-primary/50 text-primary flex items-center gap-1"
                    >
                      <UserPlus className="w-3 h-3" /> Min {crime.minMembers}
                    </Badge>
                  </div>
                  <CardDescription>{crime.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-500" />
                      <span className="text-muted-foreground">
                        {crime.nerveCost} Nerve
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Crosshair className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">
                        {crime.successRate}% Success
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-green-500 col-span-2">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-bold">
                        Up to ${crime.cashReward.toLocaleString()} reward
                      </span>
                    </div>
                  </div>
                  <Button
                    className="w-full font-bold tracking-widest bg-primary text-black hover:bg-primary/90"
                    onClick={() => handleCommit(crime.id)}
                    disabled={commitCrime.isPending}
                    data-testid={`button-execute-${crime.id}`}
                  >
                    EXECUTE
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
