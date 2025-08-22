import { createFileRoute } from "@tanstack/react-router";

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
  return (
    <div className="container mx-auto max-w-3xl px-4 py-2">
      <pre className="overflow-x-auto font-mono text-sm">{TITLE_TEXT}</pre>
      <div className="grid gap-6">
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
