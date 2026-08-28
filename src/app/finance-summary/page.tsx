import { AppContentSection } from "@/components/app-shell";
import {
  ProjectDocumentsAccordion,
  type ProjectDocumentsAccordionItem
} from "@/components/project-documents-accordion";

const mockProjectDocuments: ProjectDocumentsAccordionItem[] = [
  {
    project: {
      activityBudget: 30000,
      id: "project-1",
      name: "ค่ายวิศวกรรมบุตร ครั้งที่ 22",
      projectCode: "4001",
      sponsorBudget: 15000,
      otherBudget: 5000
    },
    documents: [
      {
        documentCode: "4001-2001",
        href: "/project/4001-2001",
        id: "document-1",
        name: "ขอยืมสำรองจ่าย"
      },
      {
        documentCode: "4001-7001",
        href: "/project/4001-7001",
        id: "document-2",
        name: "ส่งใบเสร็จ งวดที่ 1"
      },
      {
        documentCode: "4001-8001",
        href: "/project/4001-8001",
        id: "document-3",
        name: "ขอเบิกเงิน"
      }
    ]
  },
  {
    project: {
      activityBudget: 150000,
      id: "project-2",
      name: "Intania Open House",
      projectCode: "4002",
      sponsorBudget: 40000,
      otherBudget: 10000
    },
    documents: []
  },
  {
    project: {
      activityBudget: 80000,
      id: "project-3",
      name: "ค่ายอาสา",
      projectCode: "4003",
      sponsorBudget: 20000,
      otherBudget: 0
    },
    documents: []
  }
];

export default function FinanceSummaryPage() {
  return (
    <AppContentSection>
      <div className="space-y-6">
        <div className="overflow-x-auto">
          <ProjectDocumentsAccordion items={mockProjectDocuments} />
        </div>
      </div>
    </AppContentSection>
  );
}
