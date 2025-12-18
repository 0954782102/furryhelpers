
export const REPORT_TEMPLATES = [
  "Вітаю! Починаю працювати за Вашою скаргою.",
  "Порушень не виявлено. Приємної гри!",
  "Гравець буде покараний. Дякуємо за звернення!",
  "Не порушуйте правила серверу. Приємної гри!",
  "Очікуйте, передав Вашу скаргу старшій адміністрації.",
  "Шановний гравець, напишіть Вашу скаргу на форум.",
  "Не офтопте в репорт, інакше отримаєте блокування чату."
];

export const IMPORTANT_DATES = [
  { date: "Щонеділі", event: "Загальні збори адміністрації (18:00)", type: "meeting" },
  { date: "Кожен понеділок", event: "Здача тижневих звітів", type: "deadline" },
  { date: "15.01.2025", event: "Велике оновлення правил проекту", type: "update" },
  { date: "Щодня", event: "Перевірка форумних скарг", type: "work" }
];

export const ADMIN_COMMANDS = [
  { cmd: "/jail", placeholder: "ID Час Причина", label: "Деморган" },
  { cmd: "/mute", placeholder: "ID Час Причина", label: "Мут" },
  { cmd: "/kick", placeholder: "ID Причина", label: "Кік" },
  { cmd: "/warn", placeholder: "ID Причина", label: "Варн" },
  { cmd: "/ban", placeholder: "ID Дні Причина", label: "Бан" },
  { cmd: "/sethp", placeholder: "ID К-сть", label: "ХП" }
];
