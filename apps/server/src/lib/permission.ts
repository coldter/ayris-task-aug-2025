import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

const statement = {
  ...defaultStatements,
  testCase: [
    "read",
    "updateTesterStatus",
    "updateSupportStatus",
    "create",
    "delete",
  ],
} as const;

export const ac = createAccessControl(statement);

export const testerRole = ac.newRole({
  testCase: ["read", "updateTesterStatus"],
});

export const supportRole = ac.newRole({
  testCase: ["read", "updateSupportStatus", "create", "delete"],
});

export const superadminRole = ac.newRole({
  // user: ["create"],
  testCase: [
    "read",
    "updateTesterStatus",
    "updateSupportStatus",
    "create",
    "delete",
  ],
  ...adminAc.statements,
});

export const roles = {
  tester: testerRole,
  support: supportRole,
  superadmin: superadminRole,
};
