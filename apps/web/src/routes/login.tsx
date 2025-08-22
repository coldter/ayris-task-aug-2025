import { createFileRoute } from "@tanstack/react-router";
import SignInForm from "@/components/sign-in-form";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  // const [showSignIn, setShowSignIn] = useState(false);

  return <SignInForm _onSwitchToSignUp={() => {}} />;
}
