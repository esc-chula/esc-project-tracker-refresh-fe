export type CatalogOption = {
  value: string;
  label: string;
};

export const projectTypeOptions = [
  { value: "10", label: "โครงการฝ่ายกิจการภายใน" },
  { value: "11", label: "โครงการฝ่ายศิลปะและวัฒนธรรม" },
  { value: "12", label: "โครงการฝ่ายกีฬา" },
  { value: "13", label: "โครงการฝ่ายนวัตกรรมเพื่อการแข่งขัน" },
  { value: "14", label: "โครงการฝ่ายพัฒนาสังคมและบำเพ็ญประโยชน์" },
  { value: "15", label: "โครงการฝ่ายความยั่งยืน" },
  { value: "20", label: "โครงการฝ่ายกิจการภายนอก" },
  { value: "30", label: "โครงการฝ่ายนิสิตสัมพันธ์" },
  { value: "40", label: "โครงการฝ่ายเทคโนโลยี" },
  { value: "50", label: "โครงการฝ่ายพัฒนาองค์กร" },
  { value: "60", label: "โครงการฝ่ายประชาสัมพันธ์และการตลาด" },
  { value: "70", label: "โครงการฝ่ายวิชาการ" },
  { value: "80", label: "โครงการฝ่ายสำนักงานและพัสดุ" },
  { value: "81", label: "โครงการฝ่ายสวัสดิการนิสิต" },
  { value: "82", label: "โครงการฝ่ายสถานที่และกายภาพ" }
] as const satisfies readonly CatalogOption[];

export const projectTypeFilterOptions = [
  { value: "10", label: "10xx - โครงการฝ่ายกิจการภายใน" },
  { value: "11", label: "11xx - โครงการฝ่ายศิลปะและวัฒนธรรม" },
  { value: "12", label: "12xx - โครงการฝ่ายกีฬา" },
  { value: "13", label: "13xx - โครงการฝ่ายนวัตกรรมเพื่อการแข่งขัน" },
  { value: "14", label: "14xx - โครงการฝ่ายพัฒนาสังคมและบำเพ็ญประโยชน์" },
  { value: "15", label: "15xx - โครงการฝ่ายความยั่งยืน" },
  { value: "20", label: "20xx - โครงการฝ่ายกิจการภายนอก" },
  { value: "30", label: "30xx - โครงการฝ่ายนิสิตสัมพันธ์" },
  { value: "40", label: "40xx - โครงการฝ่ายเทคโนโลยี" },
  { value: "50", label: "50xx - โครงการฝ่ายพัฒนาองค์กร" },
  { value: "60", label: "60xx - โครงการฝ่ายประชาสัมพันธ์และการตลาด" },
  { value: "70", label: "70xx - โครงการฝ่ายวิชาการ" },
  { value: "80", label: "80xx - โครงการฝ่ายสำนักงานและพัสดุ" },
  { value: "81", label: "81xx - โครงการฝ่ายสวัสดิการนิสิต" },
  { value: "82", label: "82xx - โครงการฝ่ายสถานที่และกายภาพ" }
] as const satisfies readonly CatalogOption[];

export const documentTypeOptions = [
  { value: "0", label: "0xxx - เอกสารเปิดโครงการ" },
  { value: "1-LOCATION_EQUIPMENT_REQUEST", label: "1xxx - เอกสารขอใช้งานกายภาพ : ขอใช้สถานที่และอุปกรณ์" },
  { value: "1-PARKING_REQUEST", label: "1xxx - เอกสารขอใช้งานกายภาพ : ขอใช้ลานจอดรถ" },
  { value: "1-TRAFFIC_REROUTE_REQUEST", label: "1xxx - เอกสารขอใช้งานกายภาพ : ขอเปลี่ยนเส้นทางจราจร" },
  { value: "1-TRANSPORT_VEHICLE_REQUEST", label: "1xxx - เอกสารขอใช้งานกายภาพ : ขอใช้รถขนของ" },
  { value: "2", label: "2xxx - เอกสารขอยืมสำรองจ่าย" },
  { value: "3", label: "3xxx - เอกสารขอสปอนเซอร์" },
  { value: "4", label: "4xxx - เอกสารขอบคุณสปอนเซอร์" },
  { value: "5", label: "5xxx - เอกสารในโครงการ" },
  { value: "6", label: "6xxx - เอกสารรายงานผลการดำเนินงาน" },
  { value: "7", label: "7xxx - เอกสารขออนุมัติเบิกจ่าย" },
  { value: "8", label: "8xxx - เอกสารขอเบิกเงิน" },
  { value: "9", label: "9xxx - เอกสารนอกโครงการ" }
] as const satisfies readonly CatalogOption[];

export const documentStatusOptions = [
  { value: "draft", label: "ฉบับร่าง" },
  { value: "submitted", label: "กำลังตรวจสอบ" },
  { value: "returned", label: "ตีกลับ" },
  { value: "signed", label: "รอส่งให้กิจการนิสิต" },
  { value: "forwarded", label: "ส่งให้กิจการนิสิตแล้ว" },
  { value: "approved", label: "อนุมัติ" },
  { value: "cancelled", label: "ยกเลิกเอกสาร" }
] as const satisfies readonly CatalogOption[];

export type DocumentStatus = (typeof documentStatusOptions)[number]["value"];

export function normalizeDocumentStatus(status: string): DocumentStatus {
  switch (status) {
    case "draft":
    case "submitted":
    case "returned":
    case "signed":
    case "forwarded":
    case "approved":
    case "cancelled":
      return status;
    case "pending":
      return "submitted";
    case "rejected":
      return "returned";
    case "completed":
      return "approved";
    default:
      return "draft";
  }
}

// Legacy 1xxx subtype values kept only so documents created before the
// LOCATION_REQUEST/EQUIPMENT_REQUEST -> LOCATION_EQUIPMENT_REQUEST rename
// still show a Thai label instead of a raw enum string. Not offered as
// selectable options (see documentTypeOptions).
const legacyDocumentSubTypeLabels: Record<string, string> = {
  "1-LOCATION_REQUEST": "1xxx - เอกสารขอใช้งานกายภาพ : ขอใช้สถานที่และอุปกรณ์",
  "1-EQUIPMENT_REQUEST": "1xxx - เอกสารขอใช้งานกายภาพ : ขอใช้อุปกรณ์"
};

export function getProjectTypeLabel(projectType: string) {
  return projectTypeOptions.find((option) => option.value === projectType)?.label ?? "ไม่ระบุฝ่าย";
}

export function getDocumentTypeLabel(type: string, subType?: string) {
  const compositeValue = subType ? `${type}-${subType}` : type;

  return (
    documentTypeOptions.find((option) => option.value === compositeValue)?.label ??
    legacyDocumentSubTypeLabels[compositeValue] ??
    documentTypeOptions.find((option) => option.value === type)?.label ??
    type
  );
}

export function getDocumentStatusLabel(status: string) {
  const normalizedStatus = normalizeDocumentStatus(status);
  return documentStatusOptions.find((option) => option.value === normalizedStatus)?.label ?? normalizedStatus;
}
