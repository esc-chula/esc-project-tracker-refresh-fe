export type CatalogOption = {
  value: string;
  label: string;
};

export const projectTypeOptions = [
  { value: "10", label: "โครงการฝ่ายกิจการภายใน" },
  { value: "11", label: "โครงการฝ่ายศิลปะและวัฒนธรรม" },
  { value: "12", label: "โครงการฝ่ายกีฬา" },
  { value: "13", label: "โครงการฝ่ายพัฒนาสังคมและบำเพ็ญประโยชน์" },
  { value: "14", label: "โครงการฝ่ายสวัสดิการนิสิตและสิ่งแวดล้อม" },
  { value: "20", label: "โครงการฝ่ายกิจการภายนอก" },
  { value: "30", label: "โครงการฝ่ายนิสิตสัมพันธ์" },
  { value: "40", label: "โครงการฝ่ายเทคโนโลยี" },
  { value: "50", label: "โครงการฝ่ายพัฒนาองค์กร" },
  { value: "60", label: "โครงการฝ่ายประชาสัมพันธ์และการตลาด" },
  { value: "70", label: "โครงการฝ่ายวิชาการ" },
  { value: "80", label: "โครงการอื่น ๆ" },
  { value: "90", label: "โครงการฝ่ายสำนักงานและพัสดุ" }
] as const satisfies readonly CatalogOption[];

export const projectTypeFilterOptions = [
  { value: "10", label: "10xx - โครงการฝ่ายกิจการภายใน" },
  { value: "11", label: "11xx - โครงการฝ่ายศิลปะและวัฒนธรรม" },
  { value: "12", label: "12xx - โครงการฝ่ายกีฬา" },
  { value: "13", label: "13xx - โครงการฝ่ายพัฒนาสังคมและบำเพ็ญประโยชน์" },
  { value: "14", label: "14xx - โครงการฝ่ายสวัสดิการนิสิตและสิ่งแวดล้อม" },
  { value: "20", label: "20xx - โครงการฝ่ายกิจการภายนอก" },
  { value: "30", label: "30xx - โครงการฝ่ายนิสิตสัมพันธ์" },
  { value: "40", label: "40xx - โครงการฝ่ายเทคโนโลยี" },
  { value: "50", label: "50xx - โครงการฝ่ายพัฒนาองค์กร" },
  { value: "60", label: "60xx - โครงการฝ่ายประชาสัมพันธ์และการตลาด" },
  { value: "70", label: "70xx - โครงการฝ่ายวิชาการ" },
  { value: "80", label: "80xx - โครงการอื่น ๆ" },
  { value: "90", label: "90xx - โครงการฝ่ายสำนักงานและพัสดุ" }
] as const satisfies readonly CatalogOption[];

export const documentTypeOptions = [
  { value: "0", label: "0xxx - เอกสารเปิดโครงการ" },
  { value: "1-LOCATION_REQUEST", label: "1xxx - เอกสารขอใช้งานกายภาพ : ขอใช้สถานที่และอุปกรณ์" },
  { value: "1-EQUIPMENT_REQUEST", label: "1xxx - เอกสารขอใช้งานกายภาพ : ขอใช้อุปกรณ์" },
  { value: "1-PARKING_REQUEST", label: "1xxx - เอกสารขอใช้งานกายภาพ : ขอใช้ลานจอดรถ" },
  { value: "1-TRAFFIC_REROUTE_REQUEST", label: "1xxx - เอกสารขอใช้งานกายภาพ : ขอเปลี่ยนเส้นทางจราจร" },
  { value: "2", label: "2xxx - เอกสารขอยืมสำรองจ่าย" },
  { value: "3", label: "3xxx - เอกสารขอสปอนเซอร์" },
  { value: "4", label: "4xxx - เอกสารขอบคุณสปอนเซอร์" },
  { value: "5-GENERAL_INTERNAL_LETTER", label: "5xxx - เอกสารในโครงการ : จดหมายทั่วไปในคณะ" },
  { value: "5-GENERAL_EXTERNAL_LETTER", label: "5xxx - เอกสารในโครงการ : จดหมายทั่วไปนอกคณะ" },
  { value: "5-SPEAKER_INVITATION_LETTER", label: "5xxx - เอกสารในโครงการ : จดหมายเชิญวิทยากร" },
  { value: "5-SPEAKER_GRATITUDE_LETTER", label: "5xxx - เอกสารในโครงการ : จดหมายขอบคุณวิทยากร" },
  { value: "6", label: "6xxx - เอกสารรายงานผลการดำเนินงาน" },
  { value: "7", label: "7xxx - เอกสารขออนุมัติเบิกจ่าย" },
  { value: "8", label: "8xxx - เอกสารขอเบิกเงิน" },
  { value: "9", label: "9xxx - เอกสารนอกโครงการ" }
] as const satisfies readonly CatalogOption[];

export const documentStatusOptions = [
  { value: "draft", label: "ฉบับร่าง" },
  { value: "rejected", label: "เอกสารถูกตีกลับ" },
  { value: "pending", label: "ส่งให้เลขาตรวจสอบ" },
  { value: "approved", label: "ส่งให้กิจการนิสิตแล้ว" },
  { value: "completed", label: "เอกสารถูกอนุมัติแล้ว" }
] as const satisfies readonly CatalogOption[];

export function getProjectTypeLabel(projectType: string) {
  return projectTypeOptions.find((option) => option.value === projectType)?.label ?? "ไม่ระบุฝ่าย";
}

export function getDocumentTypeLabel(type: string, subType?: string) {
  const compositeValue = subType ? `${type}-${subType}` : type;

  return (
    documentTypeOptions.find((option) => option.value === compositeValue)?.label ??
    documentTypeOptions.find((option) => option.value === type)?.label ??
    type
  );
}

export function getDocumentStatusLabel(status: string) {
  return documentStatusOptions.find((option) => option.value === status)?.label ?? status;
}
