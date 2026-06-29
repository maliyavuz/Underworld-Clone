import { Layout } from "@/components/Layout";
import {
  useGetMarketItems,
  useBuyMarketItem,
  useUseMarketItem,
  getGetMarketItemsQueryKey,
  getGetPlayerQueryKey,
  useGetPlayer,
} from "@workspace/api-client-react";
import type { MarketItem } from "@workspace/api-client-react";
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
import { ShoppingCart, Tag, Shield, Wrench, Sword, Heart, Zap } from "lucide-react";

export default function BlackMarket() {
  const { data: items, isLoading } = useGetMarketItems();
  const { data: player } = useGetPlayer();
  const buyItem = useBuyMarketItem();
  const useItem = useUseMarketItem();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getGetMarketItemsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetPlayerQueryKey() });
  };

  const handleBuy = (itemId: string) => {
    buyItem.mutate(
      { itemId },
      {
        onSuccess: (res: any) => {
          if (res.success) {
            toast({ title: "Item Purchased!", description: "Check your inventory." });
            invalidate();
          } else {
            toast({ variant: "destructive", title: "Purchase Failed", description: res.message });
          }
        },
        onError: (err: any) => {
          toast({ variant: "destructive", title: "Error", description: err.response?.data?.error || err.message });
        },
      }
    );
  };

  const handleUse = (itemId: string, itemName: string) => {
    useItem.mutate(
      { itemId },
      {
        onSuccess: (res: any) => {
          toast({
            title: res.success ? `${itemName} Used!` : "Already Full",
            description: res.message,
          });
          invalidate();
        },
        onError: (err: any) => {
          toast({ variant: "destructive", title: "Error", description: err.response?.data?.error || err.message });
        },
      }
    );
  };

  const getTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case "weapon":
        return (
          <Badge className="bg-red-900/50 text-red-400 border-red-800/50 flex items-center gap-1">
            <Sword className="w-3 h-3" /> WEAPON
          </Badge>
        );
      case "protection":
        return (
          <Badge className="bg-blue-900/50 text-blue-400 border-blue-800/50 flex items-center gap-1">
            <Shield className="w-3 h-3" /> PROTECTION
          </Badge>
        );
      case "tool":
        return (
          <Badge className="bg-yellow-900/50 text-yellow-400 border-yellow-800/50 flex items-center gap-1">
            <Wrench className="w-3 h-3" /> TOOL
          </Badge>
        );
      case "consumable":
        return (
          <Badge className="bg-green-900/50 text-green-400 border-green-800/50 flex items-center gap-1">
            <Heart className="w-3 h-3" /> CONSUMABLE
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-black tracking-widest text-primary uppercase">
            Black Market
          </h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Illegal goods for the serious professional. Upgrade your arsenal —
          or patch yourself up with consumables.
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items?.map((item: MarketItem) => {
              const canAfford = player ? player.cash >= item.price : false;
              const isConsumable = item.type === "consumable";
              const isOwned = item.isOwned ?? false;

              return (
                <Card
                  key={item.id}
                  className="border-border bg-card hover:border-primary/50 transition-colors flex flex-col"
                  data-testid={`card-item-${item.id}`}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      {getTypeBadge(item.type)}
                      {isOwned && !isConsumable && (
                        <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/50">
                          OWNED
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl tracking-wider uppercase">{item.name}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="p-3 bg-muted/50 rounded-md border border-border/50">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                          Effect
                        </p>
                        <p className="text-sm font-medium">{item.effect}</p>
                      </div>
                      <div className="flex items-center gap-2 text-primary font-bold">
                        <Tag className="w-4 h-4" />
                        <span>${item.price.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="pt-4 space-y-2">
                      {/* Consumables: buy + use */}
                      {isConsumable ? (
                        <div className="flex gap-2">
                          <Button
                            className="flex-1 font-bold tracking-widest"
                            onClick={() => handleBuy(item.id)}
                            disabled={buyItem.isPending || !canAfford}
                            data-testid={`button-buy-item-${item.id}`}
                          >
                            BUY ${item.price.toLocaleString()}
                          </Button>
                          {isOwned && (
                            <Button
                              variant="secondary"
                              className="font-bold flex items-center gap-1"
                              onClick={() => handleUse(item.id, item.name)}
                              disabled={useItem.isPending}
                              data-testid={`button-use-item-${item.id}`}
                            >
                              <Zap className="w-4 h-4" /> USE
                            </Button>
                          )}
                        </div>
                      ) : isOwned ? (
                        <Button className="w-full font-bold tracking-widest" variant="secondary" disabled>
                          OWNED
                        </Button>
                      ) : (
                        <Button
                          className="w-full font-bold tracking-widest"
                          onClick={() => handleBuy(item.id)}
                          disabled={buyItem.isPending || !canAfford}
                          data-testid={`button-buy-item-${item.id}`}
                        >
                          BUY ITEM
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
