import { Layout } from "@/components/Layout";
import { useGetTopRankings } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Star, Crown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Rankings() {
  const { data: rankings, isLoading } = useGetTopRankings();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-black tracking-widest text-primary uppercase">Hall of Fame</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          The most feared and respected bosses in the city.
        </p>

        <Card className="border-border bg-card overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="divide-y divide-border">
                {[1,2,3,4,5].map(i => <div key={i} className="p-4"><Skeleton className="h-12" /></div>)}
              </div>
            ) : (
              <div className="divide-y divide-border">
                <div className="grid grid-cols-12 gap-4 p-4 text-xs font-bold tracking-widest text-muted-foreground uppercase bg-background/50">
                  <div className="col-span-1 text-center">#</div>
                  <div className="col-span-5">Player</div>
                  <div className="col-span-3 text-right">Rank</div>
                  <div className="col-span-3 text-right">Respect</div>
                </div>
                
                {rankings?.map((entry) => (
                  <div key={entry.position} className={`grid grid-cols-12 gap-4 p-4 items-center hover:bg-sidebar-accent transition-colors ${entry.position <= 3 ? 'bg-primary/5' : ''}`}>
                    <div className="col-span-1 text-center font-mono font-bold text-lg">
                      {entry.position === 1 ? <Crown className="w-6 h-6 text-primary mx-auto" /> : entry.position}
                    </div>
                    <div className="col-span-5 flex items-center gap-3">
                      <Avatar className={`w-10 h-10 border-2 ${entry.position === 1 ? 'border-primary' : 'border-border'}`}>
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.username}&backgroundColor=1a1a1a`} />
                        <AvatarFallback>{entry.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className={`font-bold ${entry.position === 1 ? 'text-primary text-lg' : ''}`}>
                        {entry.username}
                      </span>
                    </div>
                    <div className="col-span-3 text-right text-sm font-bold uppercase text-muted-foreground">
                      {entry.rank}
                    </div>
                    <div className="col-span-3 text-right flex items-center justify-end gap-2 font-mono font-bold">
                      <Star className="w-4 h-4 text-primary fill-primary" />
                      {entry.respect.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
