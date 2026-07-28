type IconProps = {
  className?: string;
};

export function DocumentIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z"
        stroke="#111827"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function ProjectIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 7.5C3 6.39543 3.89543 5.5 5 5.5H9.17157C9.70201 5.5 10.2107 5.71071 10.5858 6.08579L12 7.5H19C20.1046 7.5 21 8.39543 21 9.5V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V7.5Z"
        stroke="#111827"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function EditIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 19.9997H21M16.376 3.62173C16.7741 3.22364 17.314 3 17.877 3C18.44 3 18.9799 3.22364 19.378 3.62173C19.7761 4.01982 19.9997 4.55975 19.9997 5.12273C19.9997 5.68572 19.7761 6.22564 19.378 6.62373L7.36798 18.6347C7.13007 18.8726 6.836 19.0467 6.51298 19.1407L3.64098 19.9787C3.55493 20.0038 3.46372 20.0053 3.37689 19.9831C3.29006 19.9608 3.2108 19.9157 3.14742 19.8523C3.08404 19.7889 3.03887 19.7097 3.01662 19.6228C2.99437 19.536 2.99588 19.4448 3.02098 19.3587L3.85898 16.4867C3.9532 16.1641 4.12722 15.8704 4.36498 15.6327L16.376 3.62173Z"
        stroke="#737373"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function DeleteIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 6H21M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6M10 11V17M14 11V17"
        stroke="#737373"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function InfoIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
        stroke="#737373"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function EyeIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2.06202 12.3484C1.97868 12.1238 1.97868 11.8769 2.06202 11.6524C2.87372 9.68421 4.25153 8.0014 6.02079 6.81726C7.79004 5.63312 9.87106 5.00098 12 5.00098C14.129 5.00098 16.21 5.63312 17.9792 6.81726C19.7485 8.0014 21.1263 9.68421 21.938 11.6524C22.0214 11.8769 22.0214 12.1238 21.938 12.3484C21.1263 14.3165 19.7485 15.9993 17.9792 17.1835C16.21 18.3676 14.129 18.9997 12 18.9997C9.87106 18.9997 7.79004 18.3676 6.02079 17.1835C4.25153 15.9993 2.87372 14.3165 2.06202 12.3484Z"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M12 15.0004C13.6569 15.0004 15 13.6572 15 12.0004C15 10.3435 13.6569 9.00036 12 9.00036C10.3432 9.00036 9.00002 10.3435 9.00002 12.0004C9.00002 13.6572 10.3432 15.0004 12 15.0004Z"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function FileBadgeIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <path d="M96 38C96 17.0132 113.013 0 134 0H352L480 128V474C480 494.987 462.987 512 442 512H134C113.013 512 96 494.987 96 474V38Z" fill="#E2E8EC" />
      <path d="M352 0L480 128H380C364.536 128 352 115.464 352 100V0Z" fill="#B8C0C7" />
      <path d="M380 128L480 228V128H380Z" fill="#D3D9DE" />
      <rect fill="#FA4F42" height="192" rx="14" width="384" x="32" y="240" />
      <text fill="white" fontFamily="Arial, sans-serif" fontSize="120" fontWeight="700" x="98" y="382">
        PDF
      </text>
    </svg>
  );
}

export function WordBadgeIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <path d="M61 38C61 17.0132 78.0132 0 99 0H316L451 135V474C451 494.987 433.987 512 413 512H99C78.0132 512 61 494.987 61 474V38Z" fill="#4285F4" />
      <path d="M316 0L451 135H344C328.536 135 316 122.464 316 107V0Z" fill="#8AB4F8" />
      <path d="M166 226H346" stroke="#F8FAFC" strokeLinecap="round" strokeWidth="30" />
      <path d="M166 286H346" stroke="#F8FAFC" strokeLinecap="round" strokeWidth="30" />
      <path d="M166 346H346" stroke="#F8FAFC" strokeLinecap="round" strokeWidth="30" />
      <path d="M166 406H286" stroke="#F8FAFC" strokeLinecap="round" strokeWidth="30" />
    </svg>
  );
}

export function DefaultFileIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <path d="M72 38C72 17.0132 89.0132 0 110 0H312L440 128V474C440 494.987 422.987 512 402 512H110C89.0132 512 72 494.987 72 474V38Z" fill="#DDE4EF" />
      <path d="M312 0L440 128H340C324.536 128 312 115.464 312 100V0Z" fill="#A9B6C4" />
      <path d="M340 128L440 228V128H340Z" fill="#C6D3E0" />
      <path d="M192 168H320" stroke="#A9B6C4" strokeLinecap="round" strokeWidth="16" />
      <path d="M144 240H368" stroke="#A9B6C4" strokeLinecap="round" strokeWidth="16" />
      <path d="M144 288H368" stroke="#A9B6C4" strokeLinecap="round" strokeWidth="16" />
      <path d="M144 336H368" stroke="#A9B6C4" strokeLinecap="round" strokeWidth="16" />
      <path d="M144 384H368" stroke="#A9B6C4" strokeLinecap="round" strokeWidth="16" />
      <path d="M144 432H272" stroke="#A9B6C4" strokeLinecap="round" strokeWidth="16" />
    </svg>
  );
}
