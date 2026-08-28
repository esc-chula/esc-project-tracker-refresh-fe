export const isLocalMockMode = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

const supportedRoles = ["student", "finance", "secretary", "admin"] as const;
export type LocalMockRole = (typeof supportedRoles)[number];

export function getLocalMockRole(): LocalMockRole {
  const configuredRole = process.env.NEXT_PUBLIC_MOCK_ROLE?.trim();
  return configuredRole && supportedRoles.includes(configuredRole as LocalMockRole)
    ? (configuredRole as LocalMockRole)
    : "student";
}
