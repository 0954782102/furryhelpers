
import { Rule } from '../types';

export const RULES_DATA: Rule[] = [
  // 4. Role Play Поведінка
  { id: "4.1", category: "RP Поведінка", title: "DM (Death Match)", description: "Вбивство або завдання шкоди без вагомої IC причини.", punishment: "Jail 20 хвилин", abbreviations: ["DM", "ДМ", "Дет матч"] },
  { id: "4.1.1", category: "RP Поведінка", title: "Mass DM", description: "Вбивство або завдання шкоди 3+ гравцям.", punishment: "Jail 120 хвилин", abbreviations: ["MASS DM", "МАСС ДМ", "Мдх", "Мас дм"] },
  { id: "4.1.2", category: "RP Поведінка", title: "DM GZ", description: "DM у громадських місцях / зелених зонах.", punishment: "Jail 30 хвилин", abbreviations: ["DMGZ", "ДМГЗ", "ЗЗ", "ГЗ", "Зелена зона"] },
  { id: "4.2", category: "RP Поведінка", title: "DB (Drive By)", description: "Вбивство або нанесення шкоди транспортом.", punishment: "Jail 20 хвилин", abbreviations: ["DB", "ДБ", "Драйв бай"] },
  { id: "4.3", category: "RP Поведінка", title: "RK (Revenge Kill)", description: "Повернення на місце смерті протягом 15 хв.", punishment: "Jail 20 хвилин", abbreviations: ["RK", "РК", "Ревендж кіл"] },
  { id: "4.4", category: "RP Поведінка", title: "SK (Spawn Kill)", description: "Вбивство на місці появи/відродження.", punishment: "Jail 30 хвилин", abbreviations: ["SK", "СК", "Спавн кіл"] },
  { id: "4.5", category: "RP Поведінка", title: "TK (Team Kill)", description: "Вбивство члена своєї фракції/команди.", punishment: "Jail 20 хвилин", abbreviations: ["TK", "ТК", "Тім кіл"] },
  { id: "4.6", category: "RP Поведінка", title: "PG (Powergaming)", description: "Відсутність інстинкту самозбереження, геройство.", punishment: "Jail 20 хвилин", abbreviations: ["PG", "ПГ", "Павергеймінг", "Пг"] },
  { id: "4.7", category: "RP Поведінка", title: "NonRP", description: "Дії, що неможливі в реальному житті.", punishment: "Jail 20 хвилин", abbreviations: ["NONRP", "НОНРП", "Нрп", "Нонрп"] },
  { id: "4.7.1", category: "RP Поведінка", title: "NonRP Cop", description: "Порушення правил РП процесу копом.", punishment: "Jail 60 хв / Warn", abbreviations: ["COP", "КОП", "СБУ", "ПОЛІЦІЯ", "Нрп коп"] },
  { id: "4.25", category: "RP Поведінка", title: "NonRP Drive", description: "Їзда по полях/рельсах/зустрічці. Поля 50+ км/год.", punishment: "Усне поп. / Jail 30 хвилин", abbreviations: ["NRD", "НРД", "ПОЛЯ", "Нрд"] },
  { id: "4.26", category: "RP Поведінка", title: "Таран", description: "Навмисне пошкодження ТЗ іншим ТЗ.", punishment: "Jail 20 хвилин", abbreviations: ["ТАРАН", "Таран тз"] },
  
  // 5. Чати
  { id: "5.1", category: "Чат", title: "MG (Metagaming)", description: "OOC інформація у IC чаті.", punishment: "Мут 20 хв / Warn", abbreviations: ["MG", "МГ", "Метагеймінг", "Мг"] },
  { id: "5.4", category: "Чат", title: "Flood", description: "Повтор тексту 2+ рази, флуд символами (5+).", punishment: "Мут 10 хвилин", abbreviations: ["FLOOD", "ФЛУД", "Флуд"] },
  { id: "5.6", category: "Чат", title: "CAPS", description: "Текст великими літерами.", punishment: "Мут 5 хвилин", abbreviations: ["CAPS", "КАПС", "Капс"] },
  { id: "5.7", category: "Чат", title: "Образа гравців", description: "Мат або образа у будь-який чат.", punishment: "Мут 20-60 хвилин", abbreviations: ["ОСК", "ОБРАЗА", "Оск"] },
  { id: "5.10", category: "Чат", title: "Образа рідних", description: "1-ше: 30хв, 2-ге: 90хв, 3-тє: 240хв, 4-те: 300хв.", punishment: "Мут за системою нарахувань", abbreviations: ["MQ", "РІДНЯ", "МАТИ", "БАТЬКО", "Оск мам"] },
  { id: "5.11", category: "Чат", title: "Образа адміністрації", description: "Неповага або образа адміна. 30/60/90/120 хв.", punishment: "Мут (накопичувальний)", abbreviations: ["ОСК АДМ", "АДМІН", "Оск адміна"] },
  
  // 3. Загальні
  { id: "3.1", category: "Загальні", title: "Чити", description: "Будь-які програми, що дають перевагу.", punishment: "Бан 30 - Перманент", abbreviations: ["CHEAT", "ЧИТ", "АІМ", "ГМ", "Чіти"] },
  { id: "3.3", category: "Загальні", title: "Багоюз", description: "Використання помилок моду.", punishment: "Jail 120 / Warn / Бан 15+", abbreviations: ["БАГ", "БАГОЮЗ", "Багоюз"] },
  { id: "3.30", category: "Загальні", title: "Зловживання порушеннями", description: "3+ порушення за добу.", punishment: "Jail 120 хвилин", abbreviations: ["ЗЛОУПОТРЕБ", "ЗЛОВЖИВАННЯ", "Зловживання"] }
];

export const FULL_RULES_TEXT = `База правил UA Online. ...`;
