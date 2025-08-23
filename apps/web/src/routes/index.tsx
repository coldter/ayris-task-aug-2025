import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { useApiStatus } from "@/lib/api";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

const TITLE_TEXT = `
███████╗██╗   ██╗██████╗ ██████╗  ██████╗ ██████╗ ████████╗
██╔════╝██║   ██║██╔══██╗██╔══██╗██╔═══██╗██╔══██╗╚══██╔══╝
███████╗██║   ██║██████╔╝██████╔╝██║   ██║██████╔╝   ██║   
╚════██║██║   ██║██╔═══╝ ██╔═══╝ ██║   ██║██╔══██╗   ██║   
███████║╚██████╔╝██║     ██║     ╚██████╔╝██║  ██║   ██║   
╚══════╝ ╚═════╝ ╚═╝     ╚═╝      ╚═════╝ ╚═╝  ╚═╝   ╚═╝   
                                                           
 ██████╗███████╗███╗   ██╗████████╗███████╗██████╗         
██╔════╝██╔════╝████╗  ██║╚══██╔══╝██╔════╝██╔══██╗        
██║     █████╗  ██╔██╗ ██║   ██║   █████╗  ██████╔╝        
██║     ██╔══╝  ██║╚██╗██║   ██║   ██╔══╝  ██╔══██╗        
╚██████╗███████╗██║ ╚████║   ██║   ███████╗██║  ██║        
 ╚═════╝╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚═╝  ╚═╝        
 `;

function HomeComponent() {
  const { data: apiStatus, isLoading, isError, error } = useApiStatus();

  const getStatusVariant = () => {
    if (isLoading) return "secondary";
    if (isError) return "destructive";
    return apiStatus?.status === "ok" ? "default" : "destructive";
  };

  const getStatusText = () => {
    if (isLoading) return "Checking...";
    if (isError) return `Error: ${error?.message}`;
    return apiStatus?.status === "ok" ? "API Online" : "API Offline";
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-2">
      <pre className="overflow-x-auto font-mono text-sm">{TITLE_TEXT}</pre>
      <div className="grid gap-6">
        <section className="rounded-lg border p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-2xl">System Status</h2>
            <Badge variant={getStatusVariant()}>{getStatusText()}</Badge>
          </div>
          {!isLoading && !isError && apiStatus && (
            <div className="grid gap-2 rounded-lg bg-muted/50 p-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Backend URL:</span>
                <span className="font-mono">
                  {import.meta.env.VITE_SERVER_URL}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Last Response:</span>
                <span>{apiStatus.message}</span>
              </div>
              {apiStatus.timestamp && (
                <div className="flex justify-between">
                  <span className="font-medium">Timestamp:</span>
                  <span className="font-mono">
                    {new Date(apiStatus.timestamp).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-bold text-2xl">Login in credentials</h2>

          <h3 className="mb-2 font-bold text-xl">Admin</h3>
          <div className="grid gap-1">
            <p>
              <span className="font-bold">Email:</span> admin@example.com
            </p>
            <p>
              <span className="font-bold">Password:</span> password
            </p>
          </div>
          <hr className="my-4" />
          <h3 className="mb-2 font-bold text-xl">Tester</h3>
          <div className="grid gap-1">
            <p>
              <span className="font-bold">Email:</span> tester1@example.com
            </p>
            <p>
              <span className="font-bold">Password:</span> password
            </p>
          </div>
          <hr className="my-4" />
          <h3 className="mb-2 font-bold text-xl">Support</h3>
          <div className="grid gap-1">
            <p>
              <span className="font-bold">Email:</span> support1@example.com
            </p>
            <p>
              <span className="font-bold">Password:</span> password
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
