import { auth } from "@/lib/auth";

const createFirstAdmin = async () => {
  const user = await auth.api.createUser({
    body: {
      email: "admin@example.com",
      password: "password",
      name: "Admin",
      role: "superadmin",
    },
  });

  console.log("User created");
  console.log(user);
};

createFirstAdmin();
