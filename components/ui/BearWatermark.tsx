/**
 * 公文書の透かしっぽいクマの線画。特定のキャラクターではなく、
 * 丸と楕円だけで構成した汎用的なクマ。
 */
export function BearWatermark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 230"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* 耳 */}
      <circle cx="52" cy="48" r="20" />
      <circle cx="148" cy="48" r="20" />
      <circle cx="52" cy="48" r="9" />
      <circle cx="148" cy="48" r="9" />
      {/* 頭 */}
      <circle cx="100" cy="82" r="54" />
      {/* 顔 */}
      <ellipse cx="100" cy="100" rx="22" ry="15" />
      <ellipse cx="100" cy="93" rx="7" ry="4.5" fill="currentColor" stroke="none" />
      <circle cx="78" cy="76" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="122" cy="76" r="3.5" fill="currentColor" stroke="none" />
      {/* 体 */}
      <path d="M62 132 C48 150 44 190 58 212 C72 226 128 226 142 212 C156 190 152 150 138 132" />
      <ellipse cx="100" cy="176" rx="26" ry="30" />
      {/* 腕 */}
      <path d="M62 140 C40 150 30 170 38 186 C46 198 62 190 70 176" />
      <path d="M138 140 C160 150 170 170 162 186 C154 198 138 190 130 176" />
    </svg>
  );
}
