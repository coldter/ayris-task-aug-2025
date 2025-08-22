import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/testers")({
  component: RouteComponent,
});

type UserRow = {
  id: string;
  name: string;
  email: string;
  role?: string;
};

function RouteComponent() {
  const { data: session, isPending } = authClient.useSession();
  const navigate = Route.useNavigate();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");
  const isSuperAdmin = session?.user.role === "superadmin";

  const createId = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await authClient.admin.listUsers({
        query: {
          limit,
          offset,
          searchValue: search || undefined,
          searchField: search ? "name" : undefined,
          filterField: "role",
          filterValue: "tester",
          filterOperator: "eq",
          sortBy: "createdAt",
          sortDirection: "asc",
        },
      });

      if (res.error) {
        console.error("API Error:", res.error);
        setUsers([]);
        setTotal(0);
        toast.error(res.error.message || "Failed to load testers");
        return;
      }

      if (res.data) {
        setUsers(
          Array.isArray(res.data.users) ? (res.data.users as UserRow[]) : [],
        );
        setTotal(res.data.total || 0);
      } else {
        setUsers([]);
        setTotal(0);
      }
    } catch (error) {
      console.error("Network error:", error);
      setUsers([]);
      setTotal(0);
      toast.error("Network error occurred");
    }
  }, [limit, offset, search]);

  useEffect(() => {
    if (!session && !isPending) {
      navigate({ to: "/login" });
    }
  }, [session, isPending, navigate]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    void fetchUsers();
  }, [isSuperAdmin, fetchUsers]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / limit)),
    [total, limit],
  );
  const currentPage = useMemo(
    () => Math.floor(offset / limit) + 1,
    [offset, limit],
  );

  if (isPending) return <div>Loading...</div>;
  if (!isSuperAdmin) return <div>Unauthorized</div>;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h1 className="font-bold text-2xl">Testers</h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button
            variant="outline"
            onClick={() => {
              setOffset(0);
              void fetchUsers();
            }}
          >
            Search
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border text-left text-sm">
          <thead>
            <tr className="bg-muted/40">
              <th className="border px-3 py-2">Name</th>
              <th className="border px-3 py-2">Email</th>
              <th className="border px-3 py-2">Role</th>
            </tr>
          </thead>
          <tbody>
            {users && users.length > 0 ? (
              users.map((u) => (
                <tr key={u.id}>
                  <td className="border px-3 py-2">{u.name}</td>
                  <td className="border px-3 py-2">{u.email}</td>
                  <td className="border px-3 py-2">{u.role}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="border px-3 py-4 text-center" colSpan={3}>
                  No testers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm">
          Page {currentPage} of {totalPages} — Total {total}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={offset === 0}
            onClick={() => setOffset(Math.max(0, offset - limit))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={offset + limit >= total}
            onClick={() => setOffset(Math.min(offset + limit, total - 1))}
          >
            Next
          </Button>
          <label className="ml-2 flex items-center gap-2 text-sm">
            <span>Page size</span>
            <select
              className="rounded border bg-background px-2 py-1"
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setOffset(0);
              }}
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Create Tester</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor={`${createId}-name`}>Name</Label>
              <Input
                id={`${createId}-name`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${createId}-email`}>Email</Label>
              <Input
                id={`${createId}-email`}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${createId}-password`}>Password</Label>
              <Input
                id={`${createId}-password`}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full md:w-auto"
              disabled={submitting}
              onClick={async () => {
                if (!name || !email || !password) {
                  toast.error("Please fill all fields");
                  return;
                }
                try {
                  setSubmitting(true);
                  await authClient.admin.createUser(
                    { email, password, name, role: "tester" },
                    {
                      onSuccess: () => {
                        toast.success("Tester created");
                        setName("");
                        setEmail("");
                        setPassword("");
                        void fetchUsers();
                      },
                      onError: (error) => {
                        toast.error(
                          error.error.message || "Failed to create tester",
                        );
                      },
                    },
                  );
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {submitting ? "Creating..." : "Create Tester"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
