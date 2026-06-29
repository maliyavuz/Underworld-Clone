import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Crimes from "@/pages/Crimes";
import CarTheft from "@/pages/CarTheft";
import Heist from "@/pages/Heist";
import Travel from "@/pages/Travel";
import Garage from "@/pages/Garage";
import Rankings from "@/pages/Rankings";
import Properties from "@/pages/Properties";
import BlackMarket from "@/pages/BlackMarket";
import Messages from "@/pages/Messages";
import GroupCrimes from "@/pages/GroupCrimes";
import Notifications from "@/pages/Notifications";
import Jail from "@/pages/Jail";
import { Placeholder } from "@/pages/Placeholder";
import { Layout } from "@/components/Layout";

// Wrapper for placeholder pages
const PlaceholderPage = () => <Layout><Placeholder /></Layout>;

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/crimes" component={Crimes} />
      <Route path="/car-theft" component={CarTheft} />
      <Route path="/heist" component={Heist} />
      <Route path="/travel" component={Travel} />
      <Route path="/garage" component={Garage} />
      <Route path="/rankings" component={Rankings} />
      <Route path="/properties" component={Properties} />
      <Route path="/black-market" component={BlackMarket} />
      <Route path="/messages" component={Messages} />
      <Route path="/group-crimes" component={GroupCrimes} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/jail" component={Jail} />
      <Route path="/family" component={PlaceholderPage} />
      <Route path="/settings" component={PlaceholderPage} />
      <Route path="/account" component={PlaceholderPage} />
      {/* Fallbacks */}
      <Route path="/missions" component={PlaceholderPage} />
      <Route path="/activity" component={PlaceholderPage} />
      <Route path="/support" component={PlaceholderPage} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
