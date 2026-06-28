import { Layout } from "@/components/Layout";
import { useGetGarageVehicles } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Car, DollarSign, Wrench } from "lucide-react";

export default function Garage() {
  const { data: vehicles, isLoading } = useGetGarageVehicles();

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Car className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-black tracking-widest text-primary uppercase">Garage</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Your collection of stolen and purchased vehicles.
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => <Skeleton key={i} className="h-40" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles?.map((v) => (
              <Card key={v.id} className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg tracking-wider">{v.year} {v.make} {v.model}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span className="text-muted-foreground flex items-center gap-2"><DollarSign className="w-4 h-4 text-green-500" /> Value</span>
                    <span className="text-green-500">${v.value.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span className="text-muted-foreground flex items-center gap-2"><Wrench className="w-4 h-4" /> Condition</span>
                    <span className="uppercase">{v.condition}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {!vehicles?.length && (
              <div className="col-span-full bg-card border border-border rounded-xl p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
                <Car className="w-12 h-12 mb-4 opacity-20" />
                <p>Your garage is empty. Time to steal some rides.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
