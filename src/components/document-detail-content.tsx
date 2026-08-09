"use client";

import { Clock3, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Step1, Step2, Step3, Step4, Step5 } from "@/components/legacy-document-status-svg";
import { ActionSuccessPopup } from "@/components/ui/action-success-popup";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteModal } from "@/components/confirm-delete-modal";
import { FilingComposerModal } from "@/components/filing-composer-modal";
import { NewDocumentModal } from "@/components/new-document-modal";
import { DeleteIcon, DocumentIcon, EditIcon, InfoIcon } from "@/components/ui/document-action-icons";
import { FilePreviewChip } from "@/components/ui/file-preview-chip";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { SelectedActionBar } from "@/components/ui/selected-action-bar";
import type { DocumentDetail, DocumentProjectSummary, Filing, FilingTimelineEvent } from "@/lib/api";
import { deleteDocument, getDocumentByIdClient, getFilingsByDocumentClient } from "@/lib/api";
import { getDocumentTypeLabel } from "@/lib/document-view";
import { saveRecentItem } from "@/lib/recent-items";

type DocumentDetailContentProps = {
  apiBaseURL: string;
  currentUserName: string;
  document: DocumentDetail;
  initialFilings: Filing[];
  initialTimeline: FilingTimelineEvent[];
  project: DocumentProjectSummary;
};

type StepCard = {
  number: number;
  title: string;
};

const STEP_CARDS: StepCard[] = [
  { number: 1, title: "ขอเลขรัน" },
  { number: 2, title: "ส่งให้ฝ่ายเลขานุการ\nตรวจสอบ" },
  { number: 3, title: "กวศ.\nลงลายเซ็น" },
  { number: 4, title: "ส่งเอกสาร\nให้กิจการนิสิต" },
  { number: 5, title: "เอกสารได้รับ\nการอนุมัติ" }
];

const DOCUMENT_FORMS_URL =
  "https://drive.google.com/drive/folders/1JX2siBJUvARG_TogziD2Rbej93yV6ont?usp=drive_link";

function formatTimelineDateLabel(value: string) {
  const target = new Date(value);
  const today = new Date();
  const isToday =
    target.getFullYear() === today.getFullYear() &&
    target.getMonth() === today.getMonth() &&
    target.getDate() === today.getDate();

  if (isToday) {
    return "วันนี้";
  }

  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "2-digit"
  }).format(target);
}

function formatTimelineTimeLabel(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

const activityLabels: Record<string, string> = {
  submitted: "ส่งเอกสาร",
  returned: "ตีกลับ",
  signed: "กวศ. ลงลายเซ็น",
  forwarded: "ส่งให้กิจการนิสิตแล้ว",
  approved: "อนุมัติ",
  cancelled: "ยกเลิกเอกสาร"
};

function getActivityLabel(filing: Filing) {
  if (filing.status === "number_requested") {
    return "ขอเลขรัน";
  }

  return (filing.action && activityLabels[filing.action]) || "อัปโหลด";
}

function getActivityLabelClassName(filing: Filing) {
  switch (filing.action) {
    case "approved":
      return "text-emerald-500";
    case "returned":
      return "text-red-700";
    case "cancelled":
      return "text-gray-500";
    case "signed":
    case "forwarded":
      return "text-emerald-600";
    default:
      return "text-black";
  }
}

function getActorLabel(filing: Filing, ownerDisplayName: string, currentUserName: string) {
  return filing.ownerName || ownerDisplayName || currentUserName;
}

function getCommentText(filing: Filing) {
  return (
    filing.approveMessage ||
    filing.cancelMessage ||
    filing.forwardMessage ||
    filing.signMessage ||
    filing.returnMessage ||
    filing.replyMessage ||
    filing.message ||
    ""
  );
}

function isAdminAction(filing: Filing) {
  if (filing.action) {
    return filing.action !== "submitted";
  }
  return filing.status === "approved" || filing.status === "returned";
}

function hasFilingDetailPanel(filing: Filing) {
  return filing.status !== "number_requested";
}

function getFilingFiles(filing: Filing) {
  return filing.attachments ?? [];
}

function buildRunningNumberFiling(document: DocumentDetail, project: DocumentProjectSummary): Filing {
  return {
    id: `${document.id}-running-number`,
    documentId: document.id,
    projectId: project.id,
    ownerUserId: document.ownerUserId,
    status: "number_requested",
    message: "",
    attachments: [],
    createdAt: document.createdAt,
    updatedAt: document.createdAt,
    submittedAt: document.createdAt
  };
}

function getActivityTime(filing: Filing) {
  if (filing.status === "approved") {
    return filing.approvedAt || filing.updatedAt;
  }
  return filing.createdAt || filing.updatedAt;
}

function getStepStatuses(documentStatus: string) {
  switch (documentStatus) {
    case "submitted":
      return ["accepted", "warning", "disabled", "disabled", "disabled"];
    case "returned":
      return ["accepted", "error", "disabled", "disabled", "disabled"];
    case "signed":
      return ["accepted", "accepted", "accepted", "disabled", "disabled"];
    case "forwarded":
      return ["accepted", "accepted", "accepted", "accepted", "disabled"];
    case "approved":
      return ["accepted", "accepted", "accepted", "accepted", "accepted"];
    case "cancelled":
      return ["disabled", "disabled", "disabled", "disabled", "disabled"];
    default:
      return ["accepted", "disabled", "disabled", "disabled", "disabled"];
  }
}

function getStepCircleClassName(stepStatus: string) {
  if (stepStatus === "warning") return "bg-yellow-500";
  if (stepStatus === "error") return "bg-red-500";
  if (stepStatus === "disabled") return "bg-gray-200 text-gray-500";
  return "bg-emerald-500";
}

function getStepLineClassName(leftStepStatus: string, rightStepStatus: string) {
  if (rightStepStatus === "error") return "bg-red-500";
  if (rightStepStatus === "warning") return "bg-yellow-500";
  if (rightStepStatus === "disabled") return "bg-gray-200";
  return "bg-emerald-500";
}

export function DocumentDetailContent({
  apiBaseURL,
  currentUserName,
  document,
  initialFilings,
  project
}: DocumentDetailContentProps) {
  const router = useRouter();
  const [currentDocument, setCurrentDocument] = useState<DocumentDetail>(document);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [liveFilings, setLiveFilings] = useState<Filing[]>(initialFilings);

  const documentCode = `${project.projectCode}-${currentDocument.documentCode}`;
  const documentTitle = currentDocument.name || getDocumentTypeLabel(currentDocument.type, currentDocument.subType);
  const stepStatuses = getStepStatuses(currentDocument.status);
  const ownerDisplayName = currentDocument.owner?.displayName || currentUserName;
  const runningNumberFiling = useMemo(() => buildRunningNumberFiling(currentDocument, project), [currentDocument, project]);
  const permissions = currentDocument.permissions;
  const allowedActions = permissions?.allowedWorkflowActions ?? [];
  const canEdit = permissions?.canEdit ?? false;
  const canDelete = permissions?.canDelete ?? false;

  const legacyStepVisuals = [
    <Step1 key="step-1" className="h-[94px] w-auto" fill={stepStatuses[0] ?? "disabled"} />,
    <Step2 key="step-2" className="h-[94px] w-auto" fill={stepStatuses[1] ?? "disabled"} />,
    <Step3 key="step-3" className="h-[94px] w-auto" fill={stepStatuses[2] ?? "disabled"} />,
    <Step4 key="step-4" className="h-[94px] w-auto" fill={stepStatuses[3] ?? "disabled"} />,
    <Step5 key="step-5" className="h-[94px] w-auto" fill={stepStatuses[4] ?? "disabled"} />
  ];

  useEffect(() => {
    saveRecentItem({
      kind: "document",
      id: document.id,
      title: `${documentCode} ${documentTitle}`,
      subtitle: "เอกสาร",
      href: `/project/${encodeURIComponent(documentCode)}`
    });
  }, [document.id, documentCode, documentTitle, project.projectCode]);

  useEffect(() => {
    let cancelled = false;

    void getFilingsByDocumentClient(document.id, { apiBaseURL }).then((refreshedFilings) => {
      if (cancelled || refreshedFilings.error) {
        return;
      }

      setLiveFilings(refreshedFilings.filings);
    });

    return () => {
      cancelled = true;
    };
  }, [apiBaseURL, document.id]);

  const groupedFilings = useMemo(() => {
    const sorted = [runningNumberFiling, ...liveFilings].sort(
      (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
    );
    const groups: Array<{ dateLabel: string; filings: Filing[] }> = [];

    for (const filing of sorted) {
      const dateLabel = formatTimelineDateLabel(getActivityTime(filing));
      const currentGroup = groups[groups.length - 1];

      if (!currentGroup || currentGroup.dateLabel !== dateLabel) {
        groups.push({ dateLabel, filings: [filing] });
        continue;
      }

      currentGroup.filings.push(filing);
    }

    return groups;
  }, [liveFilings, runningNumberFiling]);

  return (
    <div className="flex min-h-full flex-col">
      <section className="flex min-h-full flex-1 flex-col rounded-[20px] bg-white px-8 pb-10 pt-8">
        <h2 className="mb-7 text-center text-2xl font-medium text-black">สถานะเอกสารปัจจุบัน</h2>

        <div className="mx-auto max-w-[1120px]">
          <div className="grid grid-cols-5 items-center">
            {legacyStepVisuals.map((visual) => (
              <div className="flex h-[96px] items-center justify-center" key={visual.key}>
                {visual}
              </div>
            ))}
          </div>

          <div className="relative mt-2 grid grid-cols-5 gap-0">
            <div className="absolute left-[10%] right-[10%] top-[18px] grid grid-cols-4 gap-0">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  className={`h-[3px] ${getStepLineClassName(stepStatuses[index] ?? "disabled", stepStatuses[index + 1] ?? "disabled")}`}
                  key={`step-line-${index + 1}`}
                />
              ))}
            </div>
            {STEP_CARDS.map((step, index) => (
              <div className="relative z-10 flex flex-col items-center" key={`${step.number}-meta`}>
                <div
                  className={[
                    "flex h-9 w-9 items-center justify-center rounded-full text-base font-semibold text-white",
                    getStepCircleClassName(stepStatuses[index] ?? "disabled")
                  ].join(" ")}
                >
                  {step.number}
                </div>
                <div className="mt-3 min-h-[48px] whitespace-pre-line text-center text-base font-medium leading-6 text-black">{step.title}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-8">
            <div className="min-w-0">
              <SelectedActionBar
                deleteIcon={<DeleteIcon className="h-6 w-6" />}
                editIcon={<EditIcon className="h-6 w-6" />}
                hideDelete={!canDelete}
                hideEdit={!canEdit}
                icon={<DocumentIcon className="h-6 w-6" />}
                onDelete={() => {
                  setDeleteErrorMessage("");
                  setIsDeleteOpen(true);
                }}
                onEdit={() => setIsEditOpen(true)}
                title={`${documentCode} ${documentTitle}`}
              />
            </div>

            <div className="flex shrink-0 items-center gap-4">
              <a
                className="flex items-center gap-2 text-base font-medium text-gray-500 transition hover:text-black"
                href={DOCUMENT_FORMS_URL}
                rel="noreferrer"
                target="_blank"
              >
                <InfoIcon className="h-6 w-6" />
                <span>ฟอร์มเอกสาร</span>
              </a>
              {allowedActions.length > 0 ? (
                <Button onClick={() => setIsUploadOpen(true)} type="button" variant="appRed">
                  <Upload className="h-5 w-5" strokeWidth={2.5} />
                  อัปโหลดไฟล์
                </Button>
              ) : null}
            </div>
          </div>

          <section className="relative mt-10 pb-2">
            <div className="relative z-10 space-y-6">
              {groupedFilings.map((group) => (
                <div className="space-y-4" key={group.dateLabel}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EEF1F5]">
                      <Clock3 className="h-3.5 w-3.5 text-black" strokeWidth={2.5} />
                    </div>
                    <div className="text-xl font-semibold leading-8 text-black">{group.dateLabel}</div>
                  </div>

                  <div className="space-y-4">
                    {group.filings.map((filing) => (
                      <article className="overflow-hidden rounded-2xl bg-gray-100" key={filing.id}>
                        <div className={hasFilingDetailPanel(filing) ? "grid xl:grid-cols-[300px_minmax(0,1fr)]" : "grid"}>
                          <div className={`space-y-7 px-7 pb-3 pt-6 xl:py-6 ${hasFilingDetailPanel(filing) ? "xl:border-r xl:border-gray-300" : ""}`}>
                            <div className="flex items-start gap-4">
                              <ProfileAvatar className="h-12 w-12" role={isAdminAction(filing) ? "admin" : "student"} />
                              <div className="min-w-0">
                                <div className="truncate text-base font-bold leading-6 text-black md:leading-6 xl:leading-8">
                                  {getActorLabel(filing, ownerDisplayName, currentUserName)}
                                </div>
                                <div className="text-sm leading-5 text-black">
                                  <span className={getActivityLabelClassName(filing)}>{getActivityLabel(filing)}</span>
                                  <span> เมื่อ {formatTimelineTimeLabel(getActivityTime(filing))} น.</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {hasFilingDetailPanel(filing) ? (
                            <div className="space-y-5 px-7 pb-6 pt-3 xl:py-6">
                              <div className="min-w-0 space-y-2">
                                <div className="text-base font-semibold text-black">ไฟล์แนบ</div>
                                <div className="flex max-w-full flex-wrap gap-2">
                                  {getFilingFiles(filing).map((file) => (
                                    <FilePreviewChip
                                      fileName={file.name}
                                      href={file.url || undefined}
                                      key={`${filing.id}-${file.name}`}
                                      mimeType={file.mimeType}
                                    />
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="text-base font-semibold text-black">ข้อความ</div>
                                <div className="min-h-11 rounded-xl bg-white px-5 py-3 text-sm text-black">{getCommentText(filing)}</div>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>

      <NewDocumentModal
        apiBaseURL={apiBaseURL}
        document={currentDocument}
        onClose={() => setIsEditOpen(false)}
        onCreated={() => {}}
        onUpdated={(updatedDocument) => setCurrentDocument({ ...currentDocument, ...updatedDocument })}
        open={isEditOpen}
        projectCode={project.projectCode}
        projectId={project.id}
      />

      <FilingComposerModal
        allowedActions={allowedActions}
        apiBaseURL={apiBaseURL}
        documentId={currentDocument.id}
        onClose={() => setIsUploadOpen(false)}
        onCreated={async (filing) => {
          const [refreshedFilings, refreshedDocument] = await Promise.all([
            getFilingsByDocumentClient(currentDocument.id, { apiBaseURL }),
            getDocumentByIdClient(currentDocument.id, { apiBaseURL })
          ]);

          if (refreshedFilings.filings.length > 0 || refreshedFilings.timeline.length > 0) {
            setLiveFilings(refreshedFilings.filings);
          } else {
            setLiveFilings((currentFilings) => {
              const nextFilings = currentFilings.filter((currentFiling) => currentFiling.id !== filing.id);
              return [filing, ...nextFilings];
            });
          }

          if (refreshedDocument) {
            setCurrentDocument(refreshedDocument);
            return;
          }

          setCurrentDocument((current) => ({
            ...current,
            status: filing.status,
            updatedAt: filing.updatedAt,
            latestFiling: {
              id: filing.id,
              status: filing.status,
              submittedAt: filing.submittedAt,
              updatedAt: filing.updatedAt,
              approvedAt: filing.approvedAt
            }
          }));
        }}
        onSuccess={setSuccessMessage}
        open={isUploadOpen}
      />

      <ActionSuccessPopup message={successMessage} onClose={() => setSuccessMessage("")} open={Boolean(successMessage)} />

      <ConfirmDeleteModal
        description="ยืนยันว่าต้องการลบเอกสารนี้"
        errorMessage={deleteErrorMessage}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={async () => {
          const result = await deleteDocument({ apiBaseURL, id: currentDocument.id });
          if (result.error) {
            setDeleteErrorMessage(result.error);
            return;
          }
          setIsDeleteOpen(false);
          router.push(`/project/${encodeURIComponent(project.projectCode)}`);
          router.refresh();
        }}
        open={isDeleteOpen}
        title="ลบเอกสาร"
      />
    </div>
  );
}
