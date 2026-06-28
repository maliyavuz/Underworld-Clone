import { Layout } from "@/components/Layout";
import { useGetCities, useTravelToCity, getGetPlayerQueryKey, getGetRecentActivityQueryKey, getGetActivityFeedQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Plane, MapPin, DollarSign, Lock } from "lucide-react";

export default function Travel() {
  const { data: cities, isLoading } = useGetCities();
  const travel = useTravelToCity();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleTravel = (cityId: string) => {
    travel.mutate({ data: { cityId } }, {
      onSuccess: (res) => {
        if (res.success) {
          toast({
            title: "Arrived",
            description: res.message,
          });
          queryClient.invalidateQueries({ queryKey: getGetPlayerQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetRecentActivityQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetActivityFeedQueryKey() });
        } else {
          toast({
            variant: "destructive",
            title: "Travel Failed",
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
          <Plane className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-black tracking-widest text-primary uppercase">Travel Agency</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Smuggle goods or lay low. Travelling to a new city takes cash and unlinks you from local heat.
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-48" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cities?.map((city) => (
              <Card key={city.id} className="border-border bg-card hover:border-primary/50 transition-colors flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl tracking-wider flex items-center gap-2">
                        {city.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {city.country}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm font-bold bg-background/50 p-3 rounded">
                    <span className="text-muted-foreground">Flight Cost</span>
                    <span className="text-green-500 flex items-center"><DollarSign className="w-4 h-4"/> {city.travelCost.toLocaleString()}</span>
                  </div>
                  
                  {city.unlockRank === "OUTSIDER" ? (
                    <Button 
                      className="w-full font-bold tracking-widest" 
                      onClick={() => handleTravel(city.id)}
                      disabled={travel.isPending}
                    >
                      BOOK FLIGHT
                    </Button>
                  ) : (
                    <Button 
                      variant="outline"
                      className="w-full font-bold tracking-widest border-muted-foreground text-muted-foreground cursor-not-allowed" 
                      disabled
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      REQ: {city.unlockRank}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
