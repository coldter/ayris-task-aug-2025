import { auth } from "@/lib/auth";

const createFirstAdmin = async () => {
  await auth.api.createUser({
    body: {
      email: "admin@example.com",
      password: "password",
      name: "Admin",
      role: "superadmin",
    },
  });

  console.log("Admin created");
};

const createSupportUsers = async () => {
  const count = 10;

  for (let i = 0; i < count; i++) {
    await auth.api.createUser({
      body: {
        email: `support${i + 1}@example.com`,
        password: "password",
        name: `Support ${i + 1}`,
        role: "support",
      },
    });

    console.log(`Support user ${i + 1} created`);
  }
};

const createTesterUsers = async () => {
  const count = 10;

  for (let i = 0; i < count; i++) {
    await auth.api.createUser({
      body: {
        email: `tester${i + 1}@example.com`,
        password: "password",
        name: `Tester ${i + 1}`,
        role: "tester",
      },
    });

    console.log(`Tester user ${i + 1} created`);
  }
};

createFirstAdmin();
createSupportUsers();
createTesterUsers();
