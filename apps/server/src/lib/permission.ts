import { createAccessControl } from "better-auth/plugins/access";

const statement = {
  testCase: [
    "read",
    "updateTesterStatus",
    "updateSupportStatus",
    "create",
    "delete",
  ],
  user: ["create", "read", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

export const testerRole = ac.newRole({
  testCase: ["read", "updateTesterStatus"],
});

export const supportRole = ac.newRole({
  testCase: ["read", "updateSupportStatus", "create", "delete"],
});

export const superadminRole = ac.newRole({
  user: ["create"],
});

export const roles = {
  tester: testerRole,
  support: supportRole,
  superadmin: superadminRole,
};
