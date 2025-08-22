import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import Loader from "@/components/loader";
import SignInForm from "@/components/sign-in-form";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (session?.user && !isPending) {
      navigate({
        to: "/dashboard",
        replace: true, // Replace current history entry to prevent back navigation to login
      });
    }
  }, [session, isPending, navigate]);

  // Show loader while checking session
  if (isPending) {
    return <Loader />;
  }

  // If user is logged in, show loader while redirecting
  if (session?.user) {
    return <Loader />;
  }

  return <SignInForm _onSwitchToSignUp={() => {}} />;
}
