import type { CurrentUser, Document, Project, ProjectPermissions } from "@/lib/api";
import { getLocalMockRole } from "@/lib/mock-mode";

const demoRole = getLocalMockRole();
const now = "2026-08-27T06:00:00Z";

const localProjectPermissions: ProjectPermissions = {
  canCreateDocument: false,
  canDelete: false,
  canEdit: false,
  canManageMembers: false
};

const displayNameByRole: Record<string, string> = {
  admin: "ผู้ดูแลระบบ (Mock)",
  finance: "ฝ่ายการเงิน (Mock)",
  secretary: "เลขานุการ (Mock)",
  student: "สมาชิกโครงการ (Mock)"
};

export const localDemoUser: CurrentUser = {
  avatarUrl: "",
  displayName: displayNameByRole[demoRole],
  email: "demo@example.com",
  emailVerified: true,
  id: "local-demo-user",
  phone: "0812345678",
  role: demoRole
};

export const localDemoProject: Project = {
  createdAt: now,
  id: "local-demo-project",
  name: "ค่ายวิชันอุดมการณ์ ครั้งที่ 22",
  ownerUserId: "local-demo-owner",
  permissions: localProjectPermissions,
  projectCode: "3002",
  status: "active",
  type: "30",
  updatedAt: now
};

export const localDemoDocuments: Document[] = [
  {
    createdAt: now,
    documentCode: "0003",
    id: "local-demo-document",
    name: "ขออนุมัติโครงการ",
    ownerUserId: localDemoUser.id,
    permissions: { allowedWorkflowActions: [], canDelete: false, canEdit: false },
    projectCode: localDemoProject.projectCode,
    projectId: localDemoProject.id,
    status: "draft",
    type: "0",
    updatedAt: now
  }
];
