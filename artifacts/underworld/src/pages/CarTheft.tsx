import { Layout } from "@/components/Layout";
import { useGetAvailableCars, useStealCar, getGetPlayerQueryKey, getGetRecentActivityQueryKey, getGetActivityFeedQueryKey, getGetAvailableCarsQueryKey, getGetGarageVehiclesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Car, AlertTriangle, DollarSign, Zap } from "lucide-react";

export default function CarTheft() {
  const { data: cars, isLoading } = useGetAvailableCars();
  const stealCar = useStealCar();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSteal = () => {
    stealCar.mutate(undefined, {
      onSuccess: (res) => {
        if (res.success) {
          toast({
            title: "Car Stolen!",
            description: res.message,
          });
          queryClient.invalidateQueries({ queryKey: getGetPlayerQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetAvailableCarsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetRecentActivityQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetActivityFeedQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetGarageVehiclesQueryKey() });
        } else {
          toast({
            variant: "destructive",
            title: "Busted",
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
          <Car className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-black tracking-widest text-primary uppercase">Grand Theft Auto</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Scout the streets for targets. Steal cars to stash in your garage or flip for quick cash.
        </p>

        <div className="bg-card border border-border p-6 rounded-xl flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold">Search for a Target</h3>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1 text-yellow-500 font-bold">
                <Zap className="w-4 h-4" /> 20 Energy
              </span>
              <span className="text-muted-foreground">required per attempt</span>
            </div>
          </div>
          <Button 
            size="lg" 
            className="font-bold tracking-widest"
            onClick={handleSteal}
            disabled={stealCar.isPending}
          >
            STEAL RANDOM CAR
          </Button>
        </div>

        <h3 className="text-xl font-bold text-muted-foreground tracking-widest mb-4">CURRENTLY SCOUTED TARGETS</h3>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cars?.map((car) => (
              <Card key={car.id} className="border-border bg-card hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg tracking-wider">{car.make} {car.model}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-green-500 text-sm font-bold">
                    <DollarSign className="w-4 h-4" />
                    <span>${car.value.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Difficulty: {car.difficultyPct}%</span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {!cars?.length && (
              <div className="col-span-3 text-center p-8 text-muted-foreground">
                No cars scouted. Go steal one!
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
