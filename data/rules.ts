
import { Rule } from '../types';

export const RULES_DATA: Rule[] = [
  // 4. Role Play Поведінка
  { id: "4.1", category: "RP Поведінка", title: "DM (Death Match)", description: "Вбивство або завдання шкоди без вагомої IC причини.", punishment: "Jail 20 хвилин", abbreviations: ["DM", "ДМ"] },
  { id: "4.1.1", category: "RP Поведінка", title: "Mass DM", description: "Вбивство або завдання шкоди 3+ гравцям.", punishment: "Jail 120 хвилин", abbreviations: ["MASS DM", "МАСС ДМ"] },
  { id: "4.1.2", category: "RP Поведінка", title: "DM GZ", description: "DM у громадських місцях / зелених зонах.", punishment: "Jail 30 хвилин", abbreviations: ["DMGZ", "ДМГЗ", "ЗЗ"] },
  { id: "4.2", category: "RP Поведінка", title: "DB (Drive By)", description: "Вбивство або нанесення шкоди транспортом.", punishment: "Jail 20 хвилин", abbreviations: ["DB", "ДБ"] },
  { id: "4.3", category: "RP Поведінка", title: "RK (Revenge Kill)", description: "Повернення на місце смерті протягом 15 хв.", punishment: "Jail 20 хвилин", abbreviations: ["RK", "РК"] },
  { id: "4.4", category: "RP Поведінка", title: "SK (Spawn Kill)", description: "Вбивство на місці появи/відродження.", punishment: "Jail 30 хвилин", abbreviations: ["SK", "СК"] },
  { id: "4.5", category: "RP Поведінка", title: "TK (Team Kill)", description: "Вбивство члена своєї фракції/команди.", punishment: "Jail 20 хвилин", abbreviations: ["TK", "ТК"] },
  { id: "4.6", category: "RP Поведінка", title: "PG (Powergaming)", description: "Відсутність інстинкту самозбереження, геройство.", punishment: "Jail 20 хвилин", abbreviations: ["PG", "ПГ"] },
  { id: "4.7", category: "RP Поведінка", title: "NonRP", description: "Дії, що неможливі в реальному житті.", punishment: "Jail 20 хвилин", abbreviations: ["NONRP", "НОНРП"] },
  { id: "4.7.1", category: "RP Поведінка", title: "NonRP Cop", description: "Порушення правил РП процесу копом.", punishment: "Jail 60 хв / Warn", abbreviations: ["COP", "КОП", "СБУ", "ПОЛІЦІЯ"] },
  { id: "4.25", category: "RP Поведінка", title: "NonRP Drive", description: "Їзда по полях/рельсах/зустрічці. Поля 50+ км/год.", punishment: "Усне поп. / Jail 30 хвилин", abbreviations: ["NRD", "НРД", "ПОЛЯ"] },
  { id: "4.26", category: "RP Поведінка", title: "Таран", description: "Навмисне пошкодження ТЗ іншим ТЗ.", punishment: "Jail 20 хвилин", abbreviations: ["ТАРАН"] },
  
  // 5. Чати
  { id: "5.1", category: "Чат", title: "MG (Metagaming)", description: "OOC інформація у IC чаті.", punishment: "Мут 20 хв / Warn", abbreviations: ["MG", "МГ"] },
  { id: "5.4", category: "Чат", title: "Flood", description: "Повтор тексту 2+ рази, флуд символами (5+).", punishment: "Мут 10 хвилин", abbreviations: ["FLOOD", "ФЛУД"] },
  { id: "5.6", category: "Чат", title: "CAPS", description: "Текст великими літерами.", punishment: "Мут 5 хвилин", abbreviations: ["CAPS", "КАПС"] },
  { id: "5.7", category: "Чат", title: "Образа гравців", description: "Мат або образа у будь-який чат.", punishment: "Мут 20-60 хвилин", abbreviations: ["ОСК", "ОБРАЗА"] },
  { id: "5.10", category: "Чат", title: "Образа рідних", description: "1-ше: 30хв, 2-ге: 90хв, 3-тє: 240хв, 4-те: 300хв.", punishment: "Мут за системою нарахувань", abbreviations: ["MQ", "РІДНЯ", "МАТИ", "БАТЬКО"] },
  { id: "5.11", category: "Чат", title: "Образа адміністрації", description: "Неповага або образа адміна. 30/60/90/120 хв.", punishment: "Мут (накопичувальний)", abbreviations: ["ОСК АДМ", "АДМІН"] },
  
  // 3. Загальні
  { id: "3.1", category: "Загальні", title: "Чити", description: "Будь-які програми, що дають перевагу.", punishment: "Бан 30 - Перманент", abbreviations: ["CHEAT", "ЧИТ", "АІМ", "ГМ"] },
  { id: "3.3", category: "Загальні", title: "Багоюз", description: "Використання помилок моду.", punishment: "Jail 120 / Warn / Бан 15+", abbreviations: ["БАГ", "БАГОЮЗ"] },
  { id: "3.30", category: "Загальні", title: "Зловживання порушеннями", description: "3+ порушення за добу.", punishment: "Jail 120 хвилин", abbreviations: ["ЗЛОУПОТРЕБ", "ЗЛОВЖИВАННЯ"] }
];

export const FULL_RULES_TEXT = `
ЦЕ ПРАВИЛА UA ONLINE. Творець: Артем Процко (Artem_Furrry).
Основні розділи:
1. Загальні положення: Незнання не звільняє, адмін має бути ввічливим.
2. Аккаунт: Нік Ім'я_Прізвище латиницею. Передача аккаунта - бан. Купівля віртів - бан.
3. Загальні: Чити - бан 30. Багоюз - jail/warn. Злив сервера - чс. Зловживання порушеннями (3+ за добу) - 120 хв jail.
4. RP: DM-20хв, DB-20хв, PG-20хв, NonRP-20хв. NonRP Cop-60хв/Warn. Обман на майно - пермач. NonRP Drive - 30хв. 
5. Чати: MG-20хв, Flood-10хв, CAPS-5хв. Образа рідних - мут 30/90/240/300 хв. Образа адміна - 30/60/90/120 хв.
6. Майно: Продаж в обхід системи - бан. Передача грошей між своїми аккаунтами - бан.
7. Репорт: Для скарг та допомоги. Оффтоп - мут 5-10хв.
8. Хабарі: Тільки ігрова валюта. Дозволено СБУ та ВР. Не більше 30 днів ЧС фракції.
`;
