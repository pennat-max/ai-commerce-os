export const locales = ["th", "zh", "en"] as const;

export type Locale = (typeof locales)[number];

export const localeOptions: Array<{
  code: Locale;
  label: string;
  name: string;
}> = [
  { code: "th", label: "TH", name: "ไทย" },
  { code: "zh", label: "中文", name: "中文" },
  { code: "en", label: "EN", name: "English" },
];

export const appShellCopy: Record<
  Locale,
  {
    openMenu: string;
    notifications: string;
    profile: string;
    language: string;
    roles: Record<string, string>;
    desktopMode: string;
  }
> = {
  th: {
    openMenu: "เปิดเมนู",
    notifications: "แจ้งเตือน",
    profile: "โปรไฟล์",
    language: "ภาษา",
    roles: {
      SUPER_ADMIN: "ผู้ดูแลระบบ",
      CUSTOMER_OWNER: "เจ้าของร้าน",
      CUSTOMER_STAFF: "ทีมร้านค้า",
    },
    desktopMode: "โหมดอนุมัติเอง",
  },
  zh: {
    openMenu: "打开菜单",
    notifications: "通知",
    profile: "个人资料",
    language: "语言",
    roles: {
      SUPER_ADMIN: "平台管理员",
      CUSTOMER_OWNER: "店主",
      CUSTOMER_STAFF: "店铺团队",
    },
    desktopMode: "手动审批模式",
  },
  en: {
    openMenu: "Open menu",
    notifications: "Notifications",
    profile: "Profile",
    language: "Language",
    roles: {
      SUPER_ADMIN: "Platform admin",
      CUSTOMER_OWNER: "Store owner",
      CUSTOMER_STAFF: "Store team",
    },
    desktopMode: "Manual approval mode",
  },
};

export const navCopy: Record<
  Locale,
  {
    seller: Record<"home" | "inbox" | "opportunities" | "assistant" | "menu", string>;
    admin: Record<"overview" | "customers" | "plans" | "usage", string>;
  }
> = {
  th: {
    seller: {
      home: "หน้าหลัก",
      inbox: "ข้อความ",
      opportunities: "โอกาส",
      assistant: "AI Assistant",
      menu: "เมนู",
    },
    admin: {
      overview: "ภาพรวม",
      customers: "ลูกค้า",
      plans: "แพ็กเกจ",
      usage: "การใช้งาน",
    },
  },
  zh: {
    seller: {
      home: "首页",
      inbox: "消息",
      opportunities: "机会",
      assistant: "AI 助手",
      menu: "菜单",
    },
    admin: {
      overview: "总览",
      customers: "客户",
      plans: "套餐",
      usage: "用量",
    },
  },
  en: {
    seller: {
      home: "Home",
      inbox: "Inbox",
      opportunities: "Opportunities",
      assistant: "AI Assistant",
      menu: "Menu",
    },
    admin: {
      overview: "Overview",
      customers: "Customers",
      plans: "Plans",
      usage: "Usage",
    },
  },
};

export function resolveLocale(value: string | string[] | null | undefined): Locale {
  const candidate = Array.isArray(value) ? value[0] : value;
  return locales.includes(candidate as Locale) ? (candidate as Locale) : "th";
}

export function withLocalePath(path: string, locale: Locale) {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}lang=${locale}`;
}
