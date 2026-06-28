import { Layout } from "@/components/Layout";
import {
  useGetProperties,
  useBuyProperty,
  useCollectPropertyIncome,
  getGetPropertiesQueryKey,
  getGetPlayerQueryKey,
  useGetPlayer,
} from "@workspace/api-client-react";
import type { Property } from "@workspace/api-client-react";
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
import { Building, DollarSign, TrendingUp, Wallet } from "lucide-react";

export default function Properties() {
  const { data: properties, isLoading } = useGetProperties();
  const { data: player } = useGetPlayer();
  const buyProperty = useBuyProperty();
  const collectIncome = useCollectPropertyIncome();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleBuy = (propertyId: string) => {
    buyProperty.mutate(
      { propertyId },
      {
        onSuccess: (res: any) => {
          if (res.success) {
            toast({
              title: "Property Purchased!",
              description: `You now own this property.`,
            });
            queryClient.invalidateQueries({
              queryKey: getGetPropertiesQueryKey(),
            });
            queryClient.invalidateQueries({ queryKey: getGetPlayerQueryKey() });
          } else {
            toast({
              variant: "destructive",
              title: "Purchase Failed",
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

  const handleCollect = (propertyId: string) => {
    collectIncome.mutate(
      { propertyId },
      {
        onSuccess: (res: any) => {
          if (res.success) {
            toast({
              title: "Income Collected!",
              description: `You collected $${res.amountCollected.toLocaleString()}.`,
            });
            queryClient.invalidateQueries({
              queryKey: getGetPropertiesQueryKey(),
            });
            queryClient.invalidateQueries({ queryKey: getGetPlayerQueryKey() });
          } else {
            toast({
              variant: "destructive",
              title: "Collection Failed",
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
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Building className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-black tracking-widest text-primary uppercase">
            Properties
          </h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Invest your dirty money into legitimate businesses. Passive income is
          the key to reaching the top of the underworld.
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties?.map((prop: Property) => {
              const canAfford = player ? player.cash >= prop.cost : false;
              return (
                <Card
                  key={prop.id}
                  className="border-border bg-card hover:border-primary/50 transition-colors flex flex-col"
                  data-testid={`card-property-${prop.id}`}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl tracking-wider uppercase">
                        {prop.name}
                      </CardTitle>
                      {prop.isOwned && (
                        <Badge
                          variant="secondary"
                          className="bg-primary/20 text-primary border-primary/50"
                        >
                          OWNED
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{prop.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" /> Income/hr
                        </span>
                        <span className="text-green-500 font-bold">
                          ${prop.incomePerHour.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Wallet className="w-4 h-4" /> Cost
                        </span>
                        <span className="text-primary font-bold">
                          ${prop.cost.toLocaleString()}
                        </span>
                      </div>
                      {prop.isOwned && (
                        <div className="flex justify-between text-sm pt-2 border-t border-border/50">
                          <span className="text-muted-foreground">
                            Pending Income
                          </span>
                          <span className="text-green-500 font-bold">
                            ${(prop.pendingIncome || 0).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4">
                      {prop.isOwned ? (
                        <Button
                          className="w-full font-bold tracking-widest bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleCollect(prop.id)}
                          disabled={
                            collectIncome.isPending || (prop.pendingIncome || 0) <= 0
                          }
                          data-testid={`button-collect-${prop.id}`}
                        >
                          COLLECT ${ (prop.pendingIncome || 0).toLocaleString() }
                        </Button>
                      ) : (
                        <Button
                          className="w-full font-bold tracking-widest"
                          onClick={() => handleBuy(prop.id)}
                          disabled={buyProperty.isPending || !canAfford}
                          data-testid={`button-buy-${prop.id}`}
                        >
                          BUY PROPERTY
                        </Button>
                      )}
                    </div>
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
