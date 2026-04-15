import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `Ты — персональный wellness-ассистент для женщин 40 лет и старше.
Твой стиль: мягкий, поддерживающий, никогда не критикующий.
Ты понимаешь, что у женщин в этом возрасте могут быть особенности гормонального фона,
суставы требуют бережного обращения, и мотивация важнее перфекционизма.

Правила:
- Никогда не осуждай за пропуск или слабый результат
- Используй простой язык, без фитнес-жаргона
- Предлагай реалистичные, выполнимые планы
- Всегда учитывай ограничения по здоровью
- Включай упражнения из ортопедической и мануальной практики (безопасные для суставов, позвоночника)
- Учитывай принципы методики Бубновского
- Отвечай на русском языке
- Возвращай данные строго в запрошенном JSON формате`;

const DAYS_RU = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

interface CyclePhase {
  phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
  day: number;
  name: string;
  recommendation: string;
  intensity: 'light' | 'medium' | 'high';
  avoid: string;
}

function calculateCyclePhase(lastPeriodDate: string): CyclePhase {
  const lastPeriod = new Date(lastPeriodDate);
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24));
  const cycleDay = ((diffDays % 28) + 28) % 28 + 1; // 1-28

  if (cycleDay <= 5) {
    return {
      phase: 'menstrual',
      day: cycleDay,
      name: 'Менструальная фаза',
      recommendation: 'Мягкие тренировки: йога, растяжка, лёгкая ходьба. Упражнения с подъёмом таза помогут снять дискомфорт.',
      intensity: 'light',
      avoid: 'Интенсивные прыжки и тяжёлые силовые',
    };
  } else if (cycleDay <= 13) {
    return {
      phase: 'follicular',
      day: cycleDay,
      name: 'Фолликулярная фаза',
      recommendation: 'Лучшее время для силовых и интенсивных тренировок! Энергия на максимуме.',
      intensity: 'high',
      avoid: 'Нет ограничений — используй этот период на максимум',
    };
  } else if (cycleDay <= 16) {
    return {
      phase: 'ovulation',
      day: cycleDay,
      name: 'Овуляция',
      recommendation: 'Умеренные нагрузки с акцентом на технику. Связки сейчас более подвижны — будь аккуратнее.',
      intensity: 'medium',
      avoid: 'Взрывные движения и прыжки — повышен риск травм связок',
    };
  } else {
    return {
      phase: 'luteal',
      day: cycleDay,
      name: 'Лютеиновая фаза',
      recommendation: 'Умеренные кардио, йога, растяжка. Тело восстанавливается медленнее — не давай максимальную нагрузку.',
      intensity: 'medium',
      avoid: 'Тяжёлые интервальные тренировки и максимальные веса',
    };
  }
}

// ── Exercise Database ──

const WARMUP_EXERCISES = [
  { name: "Круговые движения шеей", duration: 30, description: "Медленные круговые движения головой по 5 раз в каждую сторону. Расслабь плечи.", modification: "Только наклоны вперёд-назад без полных кругов", isSkippable: false },
  { name: "Вращения плечами", duration: 30, description: "Круговые движения плечами вперёд 10 раз, затем назад 10 раз.", modification: "Можно делать сидя", isSkippable: false },
  { name: "Круговые движения руками", duration: 30, description: "Широкие круги прямыми руками вперёд и назад. Разогреваем плечевой пояс.", modification: "Маленькие круги при дискомфорте в плечах", isSkippable: false },
  { name: "Повороты корпуса", duration: 30, description: "Ноги на ширине плеч, руки согнуты перед грудью. Плавные повороты влево-вправо.", modification: "Уменьши амплитуду поворота", isSkippable: false },
  { name: "Круговые движения тазом", duration: 30, description: "Руки на поясе, описывай круги тазом. По 10 раз в каждую сторону.", modification: "Держись за стул для равновесия", isSkippable: false },
  { name: "Наклоны вперёд-назад", duration: 30, description: "Ноги на ширине плеч, мягкие наклоны вперёд и лёгкий прогиб назад. Без рывков.", modification: "Наклоняйся только вперёд, неглубоко", isSkippable: false },
  { name: "Вращения коленями", duration: 30, description: "Ноги вместе, слегка согнуты. Ладони на коленях, круговые движения.", modification: "Только полукруги вперёд", isSkippable: false },
  { name: "Перекаты с пятки на носок", duration: 30, description: "Стоя, поднимайся на носки и перекатывайся на пятки. 15 раз.", modification: "Держись за опору", isSkippable: false },
];

const COOLDOWN_EXERCISES = [
  { name: "Растяжка задней поверхности бедра", duration: 30, description: "Стоя, поставь пятку на невысокую опору. Мягко наклоняйся к ноге. Каждая сторона.", modification: "Слегка согни опорную ногу", isSkippable: false },
  { name: "Растяжка передней поверхности бедра", duration: 30, description: "Стоя, согни ногу назад и возьмись за стопу. Держи колени вместе. Каждая сторона.", modification: "Держись за стену, тяни слегка", isSkippable: false },
  { name: "Наклон к полу", duration: 30, description: "Ноги на ширине плеч, мягко наклонись вперёд, руки свисают к полу. Не пружинь.", modification: "Слегка согни колени", isSkippable: false },
  { name: "Глубокое дыхание лёжа", duration: 60, description: "Ляг на спину, руки вдоль тела. Вдох на 4 счёта, выдох на 6. Полностью расслабься.", modification: "Можно делать сидя в кресле", isSkippable: false },
  { name: "Потягивания лёжа", duration: 30, description: "Лёжа на спине, вытяни руки за голову и потянись всем телом. Задержись на 5 секунд, расслабься.", modification: "Тянись только руками, не напрягая поясницу", isSkippable: false },
];

const STRENGTH_UPPER = [
  { name: "Отжимания от стены", reps: 12, sets: 3, restSeconds: 60, description: "Встань лицом к стене на расстоянии вытянутой руки. Медленно сгибай и разгибай руки.", modification: "Подойди ближе к стене для меньшей нагрузки", isSkippable: true },
  { name: "Обратные отжимания от стула", reps: 10, sets: 3, restSeconds: 60, description: "Сядь на край стула, руки по бокам. Сдвинься вперёд и сгибай руки, опускаясь вниз. Выпрямляй руки.", modification: "Согни ноги ближе к себе для меньшей нагрузки", isSkippable: true },
  { name: "Подъём рук с бутылками воды", reps: 12, sets: 3, restSeconds: 60, description: "Возьми бутылки 0.5–1 л. Руки вдоль тела, поднимай прямые руки перед собой до уровня плеч.", modification: "Используй пустые бутылки или без веса", isSkippable: true },
  { name: "Планка на предплечьях", duration: 35, sets: 3, restSeconds: 60, description: "Упор на предплечья и носки. Тело — прямая линия от головы до пяток. Дыши ровно.", modification: "Планка с колен — упор на предплечья и колени", isSkippable: true },
  { name: "Разведение рук в стороны (с бутылками)", reps: 12, sets: 3, restSeconds: 60, description: "Стоя, руки с бутылками вдоль тела. Поднимай прямые руки в стороны до уровня плеч, медленно опускай.", modification: "Поднимай руки только до половины амплитуды", isSkippable: true },
  { name: "Жим вверх стоя (с бутылками)", reps: 10, sets: 3, restSeconds: 60, description: "Бутылки на уровне плеч. Выжимай руки вверх, полностью выпрямляя. Медленно опускай.", modification: "Делай сидя на стуле со спинкой", isSkippable: true },
  { name: "Тяга к поясу в наклоне (с бутылками)", reps: 12, sets: 3, restSeconds: 60, description: "Наклонись вперёд с прямой спиной. Тяни бутылки к поясу, сводя лопатки. Медленно опускай.", modification: "Опирайся одной рукой на стул, тяни другой поочерёдно", isSkippable: true },
];

const STRENGTH_LOWER = [
  { name: "Приседания с собственным весом", reps: 15, sets: 3, restSeconds: 60, description: "Ноги на ширине плеч, руки перед собой. Приседай до параллели бёдер с полом. Колени не выходят за носки.", modification: "Приседай до стула, не садясь полностью", isSkippable: true },
  { name: "Выпады назад", reps: 10, sets: 3, restSeconds: 60, description: "Стоя прямо, шагни назад и согни оба колена до 90°. Вернись в исходное. Каждая нога.", modification: "Держись за спинку стула, уменьши глубину выпада", isSkippable: true },
  { name: "Ягодичный мост", reps: 15, sets: 3, restSeconds: 60, description: "Лёжа на спине, стопы на полу. Поднимай таз вверх, сжимая ягодицы на 2 секунды в верхней точке.", modification: "Поднимай таз невысоко, без прогиба в пояснице", isSkippable: true },
  { name: "Подъём на носки", reps: 20, sets: 3, restSeconds: 45, description: "Стоя, медленно поднимайся на носки, задержись на секунду наверху, опускайся.", modification: "Держись за стену, поднимайся невысоко", isSkippable: true },
  { name: "Приседания-плие", reps: 12, sets: 3, restSeconds: 60, description: "Широкая стойка, носки развёрнуты наружу. Приседай, разводя колени в стороны. Спина прямая.", modification: "Приседай неглубоко, держись за опору", isSkippable: true },
  { name: "Махи ногой назад (стоя у стены)", reps: 15, sets: 3, restSeconds: 45, description: "Держась за стену, отводи прямую ногу назад. Сжимай ягодицу в верхней точке. Каждая нога.", modification: "Уменьши амплитуду, слегка согни опорную ногу", isSkippable: true },
  { name: "Подъём таза лёжа (по Бубновскому)", reps: 12, sets: 3, restSeconds: 60, description: "Лёжа на спине, стопы на полу. Плавно поднимай таз, напрягая мышцы тазового дна и ягодиц. Задержись на 3 секунды.", modification: "Поднимай с меньшей амплитудой, без задержки", isSkippable: true },
  { name: "Разведение ног лёжа", reps: 15, sets: 3, restSeconds: 45, description: "Лёжа на спине, подними прямые ноги вверх. Разводи и своди ноги. Поясница прижата к полу.", modification: "Согни ноги в коленях, разводи согнутые", isSkippable: true },
];

const STRENGTH_CORE = [
  { name: "Планка", duration: 35, sets: 3, restSeconds: 60, description: "Упор на предплечья и носки. Тело — прямая линия. Не прогибай поясницу. Дыши ровно.", modification: "Планка с колен", isSkippable: true },
  { name: "Скручивания лёжа", reps: 15, sets: 3, restSeconds: 45, description: "Лёжа на спине, руки за головой. Поднимай лопатки от пола, напрягая пресс. Поясница прижата.", modification: "Руки вдоль тела, поднимай только голову и плечи", isSkippable: true },
  { name: "Велосипед лёжа", reps: 20, sets: 3, restSeconds: 45, description: "Лёжа на спине, ноги подняты. Тяни правый локоть к левому колену, затем наоборот. Чередуй.", modification: "Работай только ногами без скручивания корпуса", isSkippable: true },
  { name: "Подъём ног лёжа", reps: 12, sets: 3, restSeconds: 60, description: "Лёжа на спине, руки вдоль тела. Поднимай прямые ноги до 90° и медленно опускай, не касаясь пола.", modification: "Поднимай согнутые ноги, не опускай низко", isSkippable: true },
  { name: "Боковая планка", duration: 20, sets: 2, restSeconds: 45, description: "Упор на предплечье и боковую стопу. Тело — прямая линия. Каждая сторона.", modification: "Боковая планка с колен", isSkippable: true },
  { name: "Лодочка (по Бубновскому)", reps: 10, sets: 3, restSeconds: 60, description: "Лёжа на животе, руки вытянуты вперёд. Одновременно поднимай руки и ноги от пола. Задержись на 2 секунды.", modification: "Поднимай только руки ИЛИ только ноги поочерёдно", isSkippable: true },
  { name: "Ножницы лёжа", reps: 15, sets: 3, restSeconds: 45, description: "Лёжа на спине, поднимай ноги на 30 см от пола. Делай перекрёстные махи как ножницы.", modification: "Подними ноги выше, подложи руки под поясницу", isSkippable: true },
];

const CARDIO_LOW_IMPACT = [
  { name: "Марш на месте с высоким подъёмом колен", duration: 60, description: "Энергичный марш на месте, поднимая колени к животу. Работай руками в такт.", modification: "Шагай спокойнее, колени не выше удобного уровня", isSkippable: true },
  { name: "Шаги в сторону с подъёмом рук", duration: 60, description: "Шагни вправо — руки вверх, приставь ногу — руки вниз. Чередуй стороны ритмично.", modification: "Не поднимай руки выше плеч", isSkippable: true },
  { name: "Бег на месте (мягкий)", duration: 45, description: "Лёгкий бег на месте с мягким приземлением на носки. Руки согнуты, двигаются естественно.", modification: "Замени на быстрый марш на месте", isSkippable: true },
  { name: "Прыжки на месте (степ-тач)", duration: 45, description: "Лёгкие прыжки с ноги на ногу, касаясь носком пола в стороне. Мягко пружинь.", modification: "Шаги в сторону без прыжков", isSkippable: true },
  { name: "Удары руками стоя (бокс)", duration: 60, description: "Стоя в лёгкой стойке, выполняй поочерёдные удары руками вперёд. Корпус поворачивается за рукой.", modification: "Медленнее и без усилия, как разминка", isSkippable: true },
  { name: "Скалолаз медленный", duration: 30, description: "В упоре лёжа подтягивай колени к груди поочерёдно. Темп умеренный, спина ровная.", modification: "Делай стоя, подтягивая колено к груди из положения стоя", isSkippable: true },
  { name: "Подъём колена к локтю (крест-накрест)", duration: 45, description: "Стоя, поднимай правое колено к левому локтю и наоборот. Работай прессом при скручивании.", modification: "Не поднимай колено высоко, без скручивания", isSkippable: true },
  { name: "Прыжки ноги вместе-врозь (jumping jacks)", duration: 30, description: "Прыжком расставь ноги в стороны, руки вверх. Прыжком — ноги вместе, руки вниз.", modification: "Шаги в стороны с подъёмом рук без прыжков", isSkippable: true },
];

const CARDIO_ACTIVE = [
  { name: "Берпи модифицированный (без прыжка)", reps: 8, sets: 3, restSeconds: 60, description: "Присядь, поставь руки на пол, шагни ногами назад в планку, вернись шагом и встань.", modification: "Делай без выхода в планку — просто приседай и вставай", isSkippable: true },
  { name: "Выпады с прыжком", reps: 10, sets: 3, restSeconds: 60, description: "Из выпада вперёд прыжком смени ноги в воздухе и приземлись в выпад на другую ногу.", modification: "Обычные выпады назад без прыжка, с опорой на стул", isSkippable: true },
  { name: "Приседания с прыжком", reps: 10, sets: 3, restSeconds: 60, description: "Присядь и мощно выпрыгни вверх, мягко приземляясь на носки. Колени пружинят.", modification: "Обычные приседания с подъёмом на носки вместо прыжка", isSkippable: true },
  { name: "Бег с захлёстом голени", duration: 45, sets: 3, restSeconds: 45, description: "Бег на месте с захлёстом пяток к ягодицам. Руки помогают движению.", modification: "Марш на месте, подтягивая пятку к ягодице руками", isSkippable: true },
  { name: "Марш на месте с высоким подъёмом колен", duration: 60, description: "Энергичный марш с коленями к животу. Чередуй 15 сек быстро, 15 сек спокойно.", modification: "Обычный марш без ускорений", isSkippable: true },
  { name: "Удары руками стоя (бокс)", duration: 60, description: "Интенсивные удары в быстром темпе с поворотом корпуса. Представь мешок перед собой.", modification: "Медленный темп, без напряжения", isSkippable: true },
  { name: "Скалолаз быстрый", duration: 45, sets: 3, restSeconds: 45, description: "В упоре лёжа быстро подтягивай колени к груди поочерёдно. Держи корпус стабильным.", modification: "Медленный скалолаз или стоя с подъёмом колена", isSkippable: true },
  { name: "Подъём колена к локтю (крест-накрест)", duration: 45, description: "Быстро поднимай правое колено к левому локтю и наоборот. Работай в интенсивном темпе.", modification: "Медленный темп без прыжков", isSkippable: true },
];

const FLEXIBILITY_YOGA = [
  { name: "Поза ребёнка", duration: 45, description: "Сядь на пятки, вытяни руки вперёд, опусти лоб на пол. Дыши глубоко, расслабляй спину.", modification: "Подложи подушку под живот или между бёдрами и пятками", isSkippable: true },
  { name: "Кошка-корова", duration: 60, description: "На четвереньках: вдох — прогибай спину вниз, выдох — округляй вверх. Медленно, с дыханием.", modification: "Уменьши амплитуду движений", isSkippable: true },
  { name: "Собака мордой вниз", duration: 30, description: "Из положения на четвереньках выпрями ноги, подними таз вверх. Тело образует букву V. Тяни пятки к полу.", modification: "Согни колени, не опускай пятки до пола", isSkippable: true },
  { name: "Поза голубя", duration: 30, description: "Одна нога согнута впереди, другая вытянута назад. Мягко опускайся корпусом вниз. Каждая сторона.", modification: "Делай лёжа на спине, закинув щиколотку на колено", isSkippable: true },
  { name: "Наклон к прямым ногам сидя", duration: 45, description: "Сядь на пол, ноги вытянуты вперёд. Мягко тянись руками к стопам, спина ровная.", modification: "Слегка согни колени, используй ремень", isSkippable: true },
  { name: "Скручивание лёжа", duration: 30, description: "Лёжа на спине, руки в стороны. Согнутые колени опусти вправо, голову влево. Каждая сторона.", modification: "Не опускай колени до пола, останавливайся в комфортной точке", isSkippable: true },
  { name: "Поза бабочки", duration: 45, description: "Сядь, стопы вместе, колени в стороны. Мягко надавливай на колени, наклоняйся вперёд.", modification: "Подложи подушки под колени для поддержки", isSkippable: true },
  { name: "Растяжка квадрицепса стоя", duration: 30, description: "Стоя, согни ногу назад и возьмись за стопу. Тяни пятку к ягодице, колени вместе. Каждая нога.", modification: "Держись за стену, тяни слегка", isSkippable: true },
  { name: "Растяжка грудных в дверном проёме", duration: 30, description: "Встань в дверном проёме, руки на косяках на уровне плеч. Шагни вперёд, растягивая грудные мышцы.", modification: "Руки ниже уровня плеч, меньше шаг вперёд", isSkippable: true },
  { name: "Растяжка шеи (наклоны)", duration: 30, description: "Наклони голову к правому плечу, задержись 15 сек. Повтори влево. Плечи расслаблены.", modification: "Уменьши наклон, не тяни рукой", isSkippable: true },
];

const FLEXIBILITY_BUBNOVSKY = [
  { name: "Подъём таза лёжа (по Бубновскому)", reps: 12, sets: 3, restSeconds: 45, description: "Лёжа на спине, стопы на полу. Плавно поднимай таз, напрягая мышцы тазового дна и ягодиц. Задержка 3 секунды.", modification: "Поднимай с меньшей амплитудой, без задержки", isSkippable: true },
  { name: "Разработка тазобедренных суставов лёжа", reps: 10, sets: 2, restSeconds: 45, description: "Лёжа на спине, согни ноги. Плавно описывай круги согнутой ногой. Каждая нога.", modification: "Уменьши амплитуду кругов", isSkippable: true },
  { name: "Разведение коленей (бабочка) лёжа", reps: 15, sets: 2, restSeconds: 45, description: "Лёжа на спине, стопы вместе. Разводи колени в стороны как крылья бабочки и своди обратно.", modification: "Подложи валики под колени для поддержки", isSkippable: true },
  { name: "Полумост с задержкой", reps: 10, sets: 3, restSeconds: 60, description: "Лёжа на спине, стопы на полу. Поднимай таз и задержись на 5 секунд в верхней точке. Медленно опускай.", modification: "Задержка 2 секунды, меньшая высота подъёма", isSkippable: true },
  { name: "Скручивания для поясницы", reps: 10, sets: 2, restSeconds: 45, description: "Лёжа на спине, руки в стороны. Согнутые колени плавно опускай вправо-влево. Лопатки прижаты к полу.", modification: "Не опускай колени до пола", isSkippable: true },
  { name: "Вытяжение позвоночника на полу", duration: 60, description: "Лёжа на спине, руки за головой. Тянись макушкой в одну сторону, пятками в другую. Вытягивай позвоночник.", modification: "Тяни только руки или только ноги поочерёдно", isSkippable: true },
  { name: "Лодочка (по Бубновскому)", reps: 10, sets: 3, restSeconds: 60, description: "Лёжа на животе, руки вытянуты вперёд. Одновременно поднимай руки и ноги, задержись на 2 секунды.", modification: "Поднимай только руки ИЛИ только ноги поочерёдно", isSkippable: true },
];

function pickExercises(pool: any[], count: number): any[] {
  if (pool.length <= count) return [...pool];
  const result: any[] = [];
  const indices = new Set<number>();
  // Deterministic but varied: pick evenly spaced
  const step = pool.length / count;
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(i * step) % pool.length;
    if (!indices.has(idx)) {
      indices.add(idx);
      result.push(pool[idx]);
    }
  }
  // Fill if needed
  for (let i = 0; result.length < count && i < pool.length; i++) {
    if (!indices.has(i)) {
      indices.add(i);
      result.push(pool[i]);
    }
  }
  return result;
}

function buildMockWorkout(type: 'strength' | 'cardio' | 'flexibility', duration: number, difficulty: string, dayIndex: number = 0) {
  // Determine exercise counts based on duration
  let warmupCount: number, mainCount: number, cooldownCount: number;
  if (duration <= 15) {
    warmupCount = 4; mainCount = 6; cooldownCount = 3;
  } else if (duration <= 30) {
    warmupCount = 5; mainCount = 8; cooldownCount = 3;
  } else {
    warmupCount = 5; mainCount = 10; cooldownCount = 4;
  }

  // Count strength days seen so far in the week (0-based dayIndex)
  // We use dayIndex to rotate between sub-types
  const strengthVariant = dayIndex % 3; // 0=upper, 1=lower, 2=core
  const cardioVariant = dayIndex % 2;   // 0=low impact, 1=active
  const flexVariant = dayIndex % 2;     // 0=yoga, 1=bubnovsky

  let mainPool: any[];
  let focus: string;

  switch (type) {
    case 'strength':
      if (strengthVariant === 0) {
        mainPool = STRENGTH_UPPER;
        focus = "Силовая — верхняя часть тела (руки, плечи, грудь, спина)";
      } else if (strengthVariant === 1) {
        mainPool = STRENGTH_LOWER;
        focus = "Силовая — нижняя часть тела (ноги, ягодицы)";
      } else {
        mainPool = STRENGTH_CORE;
        focus = "Силовая — кор и спина (пресс, поясница)";
      }
      break;
    case 'cardio':
      if (cardioVariant === 0) {
        mainPool = CARDIO_LOW_IMPACT;
        focus = "Кардио — низкая ударность, выносливость";
      } else {
        mainPool = CARDIO_ACTIVE;
        focus = "Кардио — активная тренировка, жиросжигание";
      }
      break;
    case 'flexibility':
      if (flexVariant === 0) {
        mainPool = FLEXIBILITY_YOGA;
        focus = "Гибкость — йога-позы, расслабление и растяжка";
      } else {
        mainPool = FLEXIBILITY_BUBNOVSKY;
        focus = "Гибкость — ортопедические упражнения по Бубновскому";
      }
      break;
    default:
      mainPool = STRENGTH_UPPER;
      focus = "Общая тренировка";
  }

  // Rotate warmup pool start based on dayIndex so each day gets slightly different warmup
  const rotatedWarmup = [...WARMUP_EXERCISES.slice(dayIndex % WARMUP_EXERCISES.length), ...WARMUP_EXERCISES.slice(0, dayIndex % WARMUP_EXERCISES.length)];
  const rotatedCooldown = [...COOLDOWN_EXERCISES.slice(dayIndex % COOLDOWN_EXERCISES.length), ...COOLDOWN_EXERCISES.slice(0, dayIndex % COOLDOWN_EXERCISES.length)];

  return {
    duration,
    difficulty,
    focus,
    phases: {
      warmup: pickExercises(rotatedWarmup, warmupCount),
      main: pickExercises(mainPool, mainCount),
      cooldown: pickExercises(rotatedCooldown, cooldownCount),
    }
  };
}

function getScheduleForLevel(fitnessLevel: string): Array<{ day: string; type: 'strength' | 'cardio' | 'flexibility' | 'rest' }> {
  switch (fitnessLevel) {
    case 'beginner':
      return [
        { day: DAYS_RU[0], type: 'strength' },
        { day: DAYS_RU[1], type: 'rest' },
        { day: DAYS_RU[2], type: 'flexibility' },
        { day: DAYS_RU[3], type: 'rest' },
        { day: DAYS_RU[4], type: 'cardio' },
        { day: DAYS_RU[5], type: 'flexibility' },
        { day: DAYS_RU[6], type: 'rest' },
      ];
    case 'returning':
      return [
        { day: DAYS_RU[0], type: 'strength' },
        { day: DAYS_RU[1], type: 'cardio' },
        { day: DAYS_RU[2], type: 'rest' },
        { day: DAYS_RU[3], type: 'flexibility' },
        { day: DAYS_RU[4], type: 'strength' },
        { day: DAYS_RU[5], type: 'cardio' },
        { day: DAYS_RU[6], type: 'rest' },
      ];
    case 'active':
      return [
        { day: DAYS_RU[0], type: 'strength' },
        { day: DAYS_RU[1], type: 'cardio' },
        { day: DAYS_RU[2], type: 'strength' },
        { day: DAYS_RU[3], type: 'flexibility' },
        { day: DAYS_RU[4], type: 'strength' },
        { day: DAYS_RU[5], type: 'cardio' },
        { day: DAYS_RU[6], type: 'rest' },
      ];
    case 'training':
    default:
      return [
        { day: DAYS_RU[0], type: 'strength' },
        { day: DAYS_RU[1], type: 'cardio' },
        { day: DAYS_RU[2], type: 'flexibility' },
        { day: DAYS_RU[3], type: 'strength' },
        { day: DAYS_RU[4], type: 'cardio' },
        { day: DAYS_RU[5], type: 'flexibility' },
        { day: DAYS_RU[6], type: 'rest' },
      ];
  }
}

function buildNutritionForPreferences(
  foodPreferences: string[],
  dailySchedule: string,
  measurements?: { height?: number; weight?: number; waist?: number },
  nutritionMode?: string
) {
  const noMeat = foodPreferences.includes('no_meat') || nutritionMode === 'vegetarian';
  const noDairy = foodPreferences.includes('no_dairy');
  const noGluten = foodPreferences.includes('no_gluten');
  const lowSugar = foodPreferences.includes('low_sugar');
  const intermittentFasting = foodPreferences.includes('intermittent_fasting');
  const isBudget = nutritionMode === 'budget';
  const isNoCook = nutritionMode === 'no-cook';

  // Adjust calories based on measurements
  let totalCalories = 1750;
  if (measurements?.weight && measurements?.height) {
    const bmr = 10 * measurements.weight + 6.25 * measurements.height - 5 * 45 - 161;
    totalCalories = Math.round(bmr * 1.4);
  }

  // Meal timing based on daily schedule
  let mealTiming: { breakfast: string; lunch: string; dinner: string; snack: string };
  switch (dailySchedule) {
    case 'early':
      mealTiming = { breakfast: '06:30–07:30', lunch: '12:00–13:00', dinner: '18:00–19:00', snack: '15:00' };
      break;
    case 'late':
      mealTiming = { breakfast: '10:00–11:00', lunch: '14:30–15:30', dinner: '20:00–21:00', snack: '17:00' };
      break;
    case 'irregular':
      mealTiming = { breakfast: 'при пробуждении', lunch: 'через 4–5 ч после завтрака', dinner: 'за 2–3 ч до сна', snack: 'между обедом и ужином' };
      break;
    default:
      mealTiming = { breakfast: '08:00–09:00', lunch: '13:00–14:00', dinner: '19:00–20:00', snack: '16:00' };
  }

  let fastingNote: string | undefined;
  if (intermittentFasting) {
    const window = dailySchedule === 'early'
      ? { eating: '08:00–16:00', fasting: '16:00–08:00' }
      : dailySchedule === 'late'
        ? { eating: '12:00–20:00', fasting: '20:00–12:00' }
        : { eating: '10:00–18:00', fasting: '18:00–10:00' };
    fastingNote = `Интервальное голодание: окно питания ${window.eating}, голодание ${window.fasting}. Пей воду, травяной чай.`;
    mealTiming = {
      breakfast: window.eating.split('–')[0],
      lunch: 'через 3–4 ч после первого приёма',
      dinner: window.eating.split('–')[1] + ' (последний приём)',
      snack: 'между основными приёмами внутри окна'
    };
  }

  // Helper: pick sweetener
  const sweetener = lowSugar ? "Стевия по вкусу" : "Мёд 1 ч.л.";
  // Helper: pick milk
  const milk = (amount: string) => noDairy ? `Растительное молоко ${amount}` : `Молоко 2.5% ${amount}`;

  // ── BREAKFAST ──
  let breakfast: any;

  if (isNoCook) {
    breakfast = {
      name: noGluten ? "Гречневые хлопья с ягодами (без варки)" : "Овсянка ленивая (overnight) с ягодами",
      description: noGluten
        ? "Гречневые хлопья залить молоком с вечера. Утром добавить ягоды и орехи."
        : "Овсяные хлопья залить молоком с вечера. Утром добавить ягоды и орехи. Готовить не нужно.",
      calories: Math.round(totalCalories * 0.25),
      protein: 14,
      ingredients: [
        noGluten ? "Гречневые хлопья 60г" : "Овсяные хлопья 60г",
        milk("200мл"), "Голубика 50г", "Грецкие орехи 20г", sweetener
      ],
      alternatives: [noDairy ? "Банан с миндальной пастой" : "Творог с ягодами", "Мюсли с ягодами"],
      prepTime: 0,
      timing: mealTiming.breakfast
    };
  } else if (isBudget) {
    breakfast = noGluten
      ? {
          name: "Гречневая каша с яйцом",
          description: "Рассыпчатая гречка с варёным яйцом и щепоткой зелени. Бюджетный и сытный завтрак.",
          calories: Math.round(totalCalories * 0.25),
          protein: 18,
          ingredients: ["Гречневая крупа 80г", "Яйцо куриное 1 шт", "Зелень (укроп/петрушка)", lowSugar ? "без добавок" : "Масло сливочное 5г"],
          alternatives: ["Рисовая каша на воде", "Картофельное пюре с яйцом"],
          prepTime: 15,
          timing: mealTiming.breakfast
        }
      : {
          name: noDairy ? "Овсянка на воде с бананом" : "Овсянка на молоке с бананом",
          description: "Простая и дешёвая овсяная каша с бананом. Сытно и полезно.",
          calories: Math.round(totalCalories * 0.25),
          protein: 12,
          ingredients: ["Овсяные хлопья 60г", noDairy ? "Вода 200мл" : "Молоко 2.5% 200мл", "Банан 1 шт", sweetener],
          alternatives: ["Яичница с хлебом", "Гречневая каша"],
          prepTime: 10,
          timing: mealTiming.breakfast
        };
  } else if (noMeat && noGluten) {
    breakfast = {
      name: noDairy ? "Гречневая каша с ягодами и семенами" : "Творог с ягодами и гречневыми хлопьями",
      description: noDairy
        ? "Рассыпчатая гречка с малиной, голубикой и семенами чиа. Без глютена и молочных продуктов."
        : "Мягкий творог с малиной, голубикой и гречневыми хлопьями. Без глютена, богат белком.",
      calories: Math.round(totalCalories * 0.25),
      protein: 16,
      ingredients: noDairy
        ? ["Гречневая крупа 70г", "Малина 50г", "Голубика 50г", "Семена чиа 1 ст.л.", sweetener]
        : ["Творог 5% 150г", "Малина 50г", "Голубика 50г", "Гречневые хлопья 30г", sweetener],
      alternatives: ["Рисовая каша с бананом", "Смузи из ягод с семенами льна"],
      prepTime: 15,
      timing: mealTiming.breakfast
    };
  } else if (noMeat) {
    breakfast = {
      name: noDairy ? "Овсянка на воде с ягодами и орехами" : "Творог с ягодами и гранолой",
      description: noDairy
        ? "Тёплая овсяная каша на воде с голубикой, малиной и грецкими орехами."
        : "Мягкий творог с малиной, голубикой и хрустящей гранолой. Вкусный и полезный завтрак.",
      calories: Math.round(totalCalories * 0.25),
      protein: 18,
      ingredients: noDairy
        ? ["Овсяные хлопья 60г", "Вода 200мл", "Голубика 50г", "Малина 50г", "Грецкие орехи 20г", sweetener]
        : ["Творог 5% 150г", "Малина 50г", "Голубика 50г", "Гранола 30г", sweetener],
      alternatives: [noDairy ? "Смузи с бананом на растительном молоке" : "Гранола с йогуртом", "Овсянка с ягодами"],
      prepTime: 10,
      timing: mealTiming.breakfast
    };
  } else if (noGluten) {
    breakfast = {
      name: "Гречневая каша с бананом и семенами чиа",
      description: "Рассыпчатая гречка с кусочками банана, семенами чиа. Без глютена.",
      calories: Math.round(totalCalories * 0.25),
      protein: 14,
      ingredients: ["Гречневая крупа 70г", "Банан 1 шт", "Семена чиа 1 ст.л.", sweetener, milk("100мл")],
      alternatives: [noDairy ? "Смузи на кокосовом молоке" : "Творог с фруктами", "Рисовая каша с ягодами"],
      prepTime: 15,
      timing: mealTiming.breakfast
    };
  } else {
    // Standard with meat allowed
    breakfast = {
      name: noDairy ? "Овсянка на воде с ягодами и орехами" : "Овсянка с ягодами и орехами",
      description: noDairy
        ? "Тёплая овсяная каша на воде с голубикой, малиной и грецкими орехами."
        : "Тёплая овсяная каша на молоке с голубикой, малиной и грецкими орехами. Посыпьте корицей.",
      calories: Math.round(totalCalories * 0.25),
      protein: 15,
      ingredients: ["Овсяные хлопья 60г", noDairy ? "Вода 200мл" : "Молоко 2.5% 200мл", "Голубика 50г", "Малина 50г", "Грецкие орехи 20г", lowSugar ? "Корица" : "Мёд 1 ч.л."],
      alternatives: [noDairy ? "Смузи с бананом на растительном молоке" : "Творог с фруктами", "Гречневая каша с бананом"],
      prepTime: 10,
      timing: mealTiming.breakfast
    };
  }

  // ── LUNCH ──
  let lunch: any;

  if (isNoCook) {
    lunch = noMeat
      ? {
          name: "Салат с нутом и овощами",
          description: "Консервированный нут с помидорами, огурцами, зеленью и оливковым маслом. Без готовки.",
          calories: Math.round(totalCalories * 0.3),
          protein: 18,
          ingredients: ["Нут консервированный 150г", "Помидоры 2 шт", "Огурец 1 шт", "Зелень (петрушка, укроп)", "Оливковое масло 1 ст.л.", "Лимонный сок"],
          alternatives: ["Хумус с овощными палочками и хлебцами", "Салат с фасолью и кукурузой"],
          prepTime: 0,
          timing: mealTiming.lunch
        }
      : {
          name: "Салат с тунцом и овощами",
          description: "Консервированный тунец с помидорами, огурцами, листьями салата и оливковым маслом.",
          calories: Math.round(totalCalories * 0.3),
          protein: 30,
          ingredients: ["Тунец консервированный 1 банка", "Помидоры 2 шт", "Огурец 1 шт", "Листья салата", "Оливковое масло 1 ст.л."],
          alternatives: ["Бутерброды с курицей и овощами", "Салат с крабовыми палочками"],
          prepTime: 0,
          timing: mealTiming.lunch
        };
  } else if (isBudget) {
    lunch = noMeat
      ? {
          name: "Суп из красной чечевицы",
          description: "Густой чечевичный суп с морковью и луком. Дешёвый и богатый белком.",
          calories: Math.round(totalCalories * 0.3),
          protein: 20,
          ingredients: ["Красная чечевица 100г", "Морковь 1 шт", "Лук 1 шт", "Картофель 1 шт", "Растительное масло 1 ст.л."],
          alternatives: ["Гороховый суп", "Фасоль тушёная с овощами"],
          prepTime: 25,
          timing: mealTiming.lunch
        }
      : {
          name: "Куриный суп с вермишелью",
          description: "Простой куриный суп с вермишелью, морковью и картофелем. Бюджетно и сытно.",
          calories: Math.round(totalCalories * 0.3),
          protein: 28,
          ingredients: ["Куриное бедро 150г", "Вермишель 50г", "Морковь 1 шт", "Картофель 1 шт", "Лук 1 шт"],
          alternatives: ["Гречка с курицей", "Макароны по-флотски"],
          prepTime: 30,
          timing: mealTiming.lunch
        };
  } else if (noMeat && noGluten) {
    lunch = {
      name: "Чечевичный суп с овощами (без глютена)",
      description: "Густой суп из красной чечевицы с морковью, сельдереем и куркумой. Подавать с рисовыми хлебцами.",
      calories: Math.round(totalCalories * 0.3),
      protein: 22,
      ingredients: ["Красная чечевица 100г", "Морковь 1 шт", "Сельдерей 2 стебля", "Лук 1 шт", "Куркума 0.5 ч.л.", "Оливковое масло 1 ст.л."],
      alternatives: ["Киноа с запечёнными овощами", "Рис с фасолью и овощами"],
      prepTime: 25,
      timing: mealTiming.lunch
    };
  } else if (noMeat) {
    lunch = {
      name: "Чечевичный суп с овощами",
      description: "Густой суп из красной чечевицы с морковью, сельдереем и куркумой. Питательный растительный белок.",
      calories: Math.round(totalCalories * 0.3),
      protein: 22,
      ingredients: ["Красная чечевица 100г", "Морковь 1 шт", "Сельдерей 2 стебля", "Лук 1 шт", "Куркума 0.5 ч.л.", "Оливковое масло 1 ст.л."],
      alternatives: ["Фалафель с овощами и хумусом", "Паста с грибами и шпинатом"],
      prepTime: 25,
      timing: mealTiming.lunch
    };
  } else if (noGluten) {
    lunch = {
      name: "Куриная грудка с рисом и овощами",
      description: "Запечённая куриная грудка с рисом, брокколи и сладким перцем. Без глютена.",
      calories: Math.round(totalCalories * 0.3),
      protein: 35,
      ingredients: ["Куриная грудка 150г", "Рис 80г", "Брокколи 100г", "Сладкий перец 1 шт", "Оливковое масло 1 ст.л."],
      alternatives: ["Рыба с гречкой", "Индейка с киноа"],
      prepTime: 25,
      timing: mealTiming.lunch
    };
  } else {
    lunch = {
      name: "Куриная грудка с киноа и овощами",
      description: "Запечённая куриная грудка с киноа, брокколи и сладким перцем. Заправьте оливковым маслом.",
      calories: Math.round(totalCalories * 0.3),
      protein: 35,
      ingredients: ["Куриная грудка 150г", "Киноа 80г", "Брокколи 100г", "Сладкий перец 1 шт", "Оливковое масло 1 ст.л.", "Лимонный сок"],
      alternatives: ["Рыба на пару с рисом", "Индейка с гречкой"],
      prepTime: 25,
      timing: mealTiming.lunch
    };
  }

  // ── DINNER ──
  let dinner: any;

  if (isNoCook) {
    dinner = noMeat
      ? {
          name: "Хумус с овощными палочками и хлебцами",
          description: "Готовый хумус с нарезанными огурцами, морковью, перцем и хлебцами. Без готовки.",
          calories: Math.round(totalCalories * 0.28),
          protein: 14,
          ingredients: ["Хумус готовый 150г", "Огурец 1 шт", "Морковь 1 шт", "Перец сладкий 1 шт", noGluten ? "Рисовые хлебцы 3 шт" : "Хлебцы цельнозерновые 3 шт"],
          alternatives: ["Салат с авокадо и нутом", "Роллы из лаваша с овощами"],
          prepTime: 0,
          timing: mealTiming.dinner
        }
      : {
          name: "Бутерброды с рыбой и авокадо",
          description: "Хлебцы с консервированной рыбой, авокадо и зеленью. Просто и быстро.",
          calories: Math.round(totalCalories * 0.28),
          protein: 22,
          ingredients: [noGluten ? "Рисовые хлебцы 3 шт" : "Хлебцы цельнозерновые 3 шт", "Рыба консервированная 1 банка", "Авокадо 0.5 шт", "Зелень"],
          alternatives: ["Салат с тунцом", "Сэндвич с курицей"],
          prepTime: 0,
          timing: mealTiming.dinner
        };
  } else if (isBudget) {
    dinner = noMeat
      ? {
          name: "Картофель запечённый с фасолью",
          description: "Запечённый картофель с тушёной фасолью и луком. Бюджетный и сытный ужин.",
          calories: Math.round(totalCalories * 0.28),
          protein: 16,
          ingredients: ["Картофель 2 шт", "Фасоль консервированная 150г", "Лук 1 шт", "Растительное масло 1 ст.л.", "Зелень"],
          alternatives: ["Макароны с овощным соусом", "Рис с тушёными овощами"],
          prepTime: 30,
          timing: mealTiming.dinner
        }
      : {
          name: "Гречка с тушёной курицей",
          description: "Гречневая каша с тушёным куриным бедром и луком. Дёшево и вкусно.",
          calories: Math.round(totalCalories * 0.28),
          protein: 28,
          ingredients: ["Гречневая крупа 80г", "Куриное бедро 150г", "Лук 1 шт", "Морковь 1 шт", "Растительное масло 1 ст.л."],
          alternatives: ["Рис с котлетой", "Картофельное пюре с рыбой"],
          prepTime: 25,
          timing: mealTiming.dinner
        };
  } else if (noMeat && noGluten) {
    dinner = {
      name: "Запечённые овощи с хумусом и киноа",
      description: "Кабачки, помидоры и баклажаны, запечённые с оливковым маслом. Подавать с хумусом и киноа. Без глютена.",
      calories: Math.round(totalCalories * 0.28),
      protein: 18,
      ingredients: ["Кабачок 1 шт", "Помидоры 2 шт", "Баклажан 0.5 шт", "Киноа 60г", "Хумус 50г", "Оливковое масло 1 ст.л."],
      alternatives: ["Рататуй с рисом", "Омлет с овощами и зеленью"],
      prepTime: 30,
      timing: mealTiming.dinner
    };
  } else if (noMeat) {
    dinner = {
      name: "Запечённые овощи с хумусом",
      description: "Кабачки, помидоры и баклажаны, запечённые с оливковым маслом и травами. Подавать с хумусом.",
      calories: Math.round(totalCalories * 0.28),
      protein: 16,
      ingredients: ["Кабачок 1 шт", "Помидоры 2 шт", "Баклажан 0.5 шт", "Хумус 80г", "Оливковое масло 1 ст.л.", "Прованские травы"],
      alternatives: ["Рататуй с киноа", "Омлет с зеленью и грибами"],
      prepTime: 30,
      timing: mealTiming.dinner
    };
  } else if (noGluten) {
    dinner = {
      name: "Лосось с запечёнными овощами",
      description: "Филе лосося, запечённое с кабачками и помидорами. Без глютена.",
      calories: Math.round(totalCalories * 0.28),
      protein: 30,
      ingredients: ["Филе лосося 150г", "Кабачок 1 шт", "Помидоры 2 шт", "Лук красный 1 шт", "Оливковое масло 1 ст.л.", "Чеснок 2 зубчика"],
      alternatives: ["Треска с рисом", "Курица с гречкой"],
      prepTime: 30,
      timing: mealTiming.dinner
    };
  } else {
    dinner = {
      name: "Лосось с запечёнными овощами",
      description: "Филе лосося, запечённое с кабачками, помидорами и луком. Лёгкий и питательный ужин.",
      calories: Math.round(totalCalories * 0.28),
      protein: 30,
      ingredients: ["Филе лосося 150г", "Кабачок 1 шт", "Помидоры 2 шт", "Лук красный 1 шт", "Оливковое масло 1 ст.л.", "Чеснок 2 зубчика"],
      alternatives: ["Треска с овощами", "Омлет с зеленью"],
      prepTime: 30,
      timing: mealTiming.dinner
    };
  }

  // ── SNACK ──
  let snack: any;

  if (intermittentFasting) {
    snack = null;
  } else if (isNoCook) {
    snack = noDairy
      ? {
          name: "Горсть орехов и сухофруктов",
          description: "Микс из миндаля, кешью и кураги. Без готовки.",
          calories: Math.round(totalCalories * 0.12),
          protein: 6,
          ingredients: ["Миндаль 15г", "Кешью 15г", lowSugar ? "Семена тыквы 10г" : "Курага 20г"],
          alternatives: ["Банан", "Яблоко с миндальной пастой"],
          prepTime: 0,
          timing: mealTiming.snack
        }
      : {
          name: "Йогурт с орехами",
          description: "Готовый натуральный йогурт с горсткой орехов. Без готовки.",
          calories: Math.round(totalCalories * 0.12),
          protein: 10,
          ingredients: ["Йогурт натуральный 150г", "Миндаль 15г", lowSugar ? "Корица" : "Мёд 1 ч.л."],
          alternatives: ["Кефир с отрубями", "Яблоко"],
          prepTime: 0,
          timing: mealTiming.snack
        };
  } else if (noDairy) {
    snack = {
      name: "Яблоко с миндальной пастой",
      description: "Нарезанное яблоко с ложкой миндальной пасты. Сытный перекус без молочных продуктов.",
      calories: Math.round(totalCalories * 0.12),
      protein: 6,
      ingredients: ["Яблоко 1 шт", "Миндальная паста 1 ст.л."],
      alternatives: ["Горсть орехов и сухофруктов", "Хумус с морковными палочками"],
      prepTime: 2,
      timing: mealTiming.snack
    };
  } else {
    snack = {
      name: "Греческий йогурт с мёдом",
      description: "Натуральный йогурт с ложечкой мёда и горсткой миндаля. Отличный перекус.",
      calories: Math.round(totalCalories * 0.12),
      protein: 12,
      ingredients: ["Греческий йогурт 150г", lowSugar ? "Корица" : "Мёд 1 ч.л.", "Миндаль 15г"],
      alternatives: ["Яблоко с арахисовой пастой", "Кефир с отрубями"],
      prepTime: 2,
      timing: mealTiming.snack
    };
  }

  // For intermittent fasting with standard/late schedule, skip breakfast (first meal at 12:00)
  let finalBreakfast = breakfast;
  if (intermittentFasting && (dailySchedule === 'standard' || dailySchedule === 'late')) {
    finalBreakfast = null;
  }

  const mode = intermittentFasting ? 'intermittent_fasting' : isBudget ? 'budget' : isNoCook ? 'no-cook' : noMeat ? 'vegetarian' : 'standard';

  return {
    mode,
    totalCalories,
    macros: { protein: 85, fat: 58, carbs: 195 },
    ...(fastingNote ? { fastingNote } : {}),
    meals: { breakfast: finalBreakfast, lunch, dinner, snack }
  };
}

function adjustNutritionForCyclePhase(nutrition: any, phase: CyclePhase, foodPreferences: string[]): any {
  const adjusted = JSON.parse(JSON.stringify(nutrition));
  const noMeat = foodPreferences.includes('no_meat');

  switch (phase.phase) {
    case 'menstrual': {
      // Iron-rich, warm, anti-inflammatory meals; +100-150 kcal
      adjusted.meals.breakfast = {
        name: 'Гречневая каша с бананом и тёмным шоколадом',
        description: 'Тёплая гречка с бананом, грецкими орехами и кусочками тёмного шоколада. Богата железом и магнием — то, что нужно в первые дни цикла.',
        calories: 420,
        protein: 14,
        ingredients: ['Гречневая крупа 80г', 'Банан 1 шт', 'Грецкие орехи 15г', 'Тёмный шоколад 10г', 'Корица по вкусу'],
        alternatives: ['Овсянка с бананом и орехами', 'Каша из киноа с ягодами'],
        prepTime: 12,
        timing: adjusted.meals.breakfast.timing,
      };

      if (noMeat) {
        adjusted.meals.lunch = {
          name: 'Чечевичный суп с куркумой и имбирём',
          description: 'Согревающий густой суп из красной чечевицы с куркумой и свежим имбирём. Отличный источник растительного железа и противовоспалительных специй.',
          calories: 480,
          protein: 22,
          ingredients: ['Красная чечевица 100г', 'Морковь 1 шт', 'Лук 1 шт', 'Куркума 1 ч.л.', 'Имбирь свежий 10г', 'Оливковое масло 1 ст.л.', 'Шпинат 50г'],
          alternatives: ['Суп из красной фасоли', 'Тыквенный крем-суп с чечевицей'],
          prepTime: 25,
          timing: adjusted.meals.lunch.timing,
        };
        adjusted.meals.dinner = {
          name: 'Свекольный салат с грецким орехом и гранатом',
          description: 'Тёплый салат из запечённой свёклы с гранатовыми зёрнами, грецкими орехами и шпинатом. Насыщен железом и витамином C для его усвоения.',
          calories: 420,
          protein: 12,
          ingredients: ['Свёкла 200г', 'Гранат 80г', 'Грецкие орехи 30г', 'Шпинат 60г', 'Оливковое масло 1 ст.л.', 'Лимонный сок 1 ч.л.'],
          alternatives: ['Тушёные овощи с красной фасолью', 'Гречка с тушёным шпинатом'],
          prepTime: 30,
          timing: adjusted.meals.dinner.timing,
        };
      } else {
        adjusted.meals.lunch = {
          name: 'Чечевичный суп с куркумой и имбирём',
          description: 'Согревающий густой суп из красной чечевицы с куркумой и свежим имбирём. Можно добавить кусочки индейки для дополнительного белка.',
          calories: 500,
          protein: 28,
          ingredients: ['Красная чечевица 80г', 'Индейка филе 80г', 'Морковь 1 шт', 'Куркума 1 ч.л.', 'Имбирь свежий 10г', 'Оливковое масло 1 ст.л.', 'Шпинат 50г'],
          alternatives: ['Суп с говядиной и чечевицей', 'Рыбный суп с имбирём'],
          prepTime: 30,
          timing: adjusted.meals.lunch.timing,
        };
        adjusted.meals.dinner = {
          name: 'Свекольный салат с грецким орехом и запечённой рыбой',
          description: 'Запечённая свёкла с гранатом, грецкими орехами и кусочком лосося — идеальное сочетание железа и омега-3 жирных кислот.',
          calories: 460,
          protein: 26,
          ingredients: ['Свёкла 200г', 'Лосось 100г', 'Гранат 60г', 'Грецкие орехи 20г', 'Шпинат 50г', 'Оливковое масло 1 ст.л.'],
          alternatives: ['Тушёная говядина с гречкой', 'Рыба на пару со свёклой'],
          prepTime: 35,
          timing: adjusted.meals.dinner.timing,
        };
      }

      if (adjusted.meals.snack) {
        adjusted.meals.snack = {
          ...adjusted.meals.snack,
          name: 'Банан с тёмным шоколадом и орехами',
          description: 'Банан с парой долек тёмного шоколада и миндалём. Магний поможет снять спазмы.',
          calories: 200,
          protein: 5,
          ingredients: ['Банан 1 шт', 'Тёмный шоколад 15г', 'Миндаль 10г'],
        };
      }

      adjusted.totalCalories = (adjusted.totalCalories || 1750) + 120;
      adjusted.cycleNote = 'Менструальная фаза: меню обогащено железом (гречка, чечевица, свёкла, гранат), магнием и противовоспалительными продуктами. Калорийность немного увеличена.';
      break;
    }

    case 'follicular': {
      // Fresh, protein-rich, fermented foods
      adjusted.meals.breakfast = {
        name: noMeat ? 'Смузи-боул с ягодами и гранолой' : 'Омлет с овощами и кефир',
        description: noMeat
          ? 'Густой смузи из ягод и банана, украшенный гранолой, семенами чиа и свежими ягодами. Лёгкий и энергичный старт дня.'
          : 'Пышный омлет с помидорами, шпинатом и болгарским перцем. Стакан кефира для пищеварения.',
        calories: 380,
        protein: noMeat ? 12 : 24,
        ingredients: noMeat
          ? ['Банан 1 шт', 'Голубика 80г', 'Малина 50г', 'Гранола 30г', 'Семена чиа 1 ст.л.', 'Растительное молоко 100мл']
          : ['Яйца 3 шт', 'Помидор 1 шт', 'Шпинат 40г', 'Перец болгарский 0.5 шт', 'Кефир 200мл'],
        alternatives: noMeat ? ['Овсянка с ягодами', 'Тост с авокадо'] : ['Творог с ягодами', 'Гречка с яйцом'],
        prepTime: noMeat ? 8 : 12,
        timing: adjusted.meals.breakfast.timing,
      };

      adjusted.meals.lunch = {
        name: noMeat ? 'Салат с киноа, авокадо и квашеной капустой' : 'Куриная грудка с киноа и свежим салатом',
        description: noMeat
          ? 'Свежий салат из киноа, авокадо, огурца, помидоров и порции квашеной капусты. Ферментированные продукты поддержат микробиом.'
          : 'Запечённая куриная грудка с киноа, свежими овощами и ложкой квашеной капусты.',
        calories: 480,
        protein: noMeat ? 16 : 35,
        ingredients: noMeat
          ? ['Киноа 80г', 'Авокадо 0.5 шт', 'Огурец 1 шт', 'Помидоры черри 80г', 'Квашеная капуста 50г', 'Оливковое масло 1 ст.л.', 'Лимонный сок']
          : ['Куриная грудка 150г', 'Киноа 70г', 'Огурец 1 шт', 'Помидор 1 шт', 'Квашеная капуста 40г', 'Оливковое масло 1 ст.л.'],
        alternatives: noMeat ? ['Бурый рис с овощами', 'Салат с бататом'] : ['Индейка с бурым рисом', 'Рыба с овощами'],
        prepTime: noMeat ? 20 : 25,
        timing: adjusted.meals.lunch.timing,
      };

      adjusted.meals.dinner = {
        name: noMeat ? 'Батат запечённый с кефирным соусом и зеленью' : 'Рыба на гриле с бататом и овощами',
        description: noMeat
          ? 'Сладкий батат, запечённый до мягкости, с соусом из кефира и свежей зелени. Подаётся со свежим салатом.'
          : 'Филе трески на гриле с запечённым бататом и свежими овощами. Лёгкий и сытный ужин.',
        calories: 430,
        protein: noMeat ? 10 : 28,
        ingredients: noMeat
          ? ['Батат 200г', 'Кефир 100мл', 'Зелень (укроп, петрушка)', 'Огурец 1 шт', 'Оливковое масло 1 ч.л.']
          : ['Треска 150г', 'Батат 150г', 'Брокколи 100г', 'Лимон', 'Оливковое масло 1 ст.л.'],
        alternatives: noMeat ? ['Овощное рагу с киноа', 'Фаршированный перец с рисом'] : ['Курица с овощами', 'Индейка с гречкой'],
        prepTime: 30,
        timing: adjusted.meals.dinner.timing,
      };

      adjusted.cycleNote = 'Фолликулярная фаза: меню с акцентом на свежие продукты, белок и ферментированные продукты. Энергия на подъёме — идеальное время для интенсивных тренировок!';
      break;
    }

    case 'ovulation': {
      // Light, anti-inflammatory, fiber-rich (cruciferous)
      const breakfastCal = Math.round((adjusted.totalCalories || 1750) * 0.22);

      adjusted.meals.breakfast = {
        name: 'Смузи с зеленью и ягодами',
        description: 'Лёгкий зелёный смузи со шпинатом, бананом, голубикой и семенами льна. Освежает и не перегружает пищеварение.',
        calories: 320,
        protein: 10,
        ingredients: ['Шпинат 60г', 'Банан 1 шт', 'Голубика 80г', 'Семена льна 1 ст.л.', 'Вода или растительное молоко 200мл'],
        alternatives: ['Йогурт с ягодами', 'Фруктовый салат с орехами'],
        prepTime: 5,
        timing: adjusted.meals.breakfast.timing,
      };

      adjusted.meals.lunch = {
        name: noMeat ? 'Киноа с брокколи и цветной капустой' : 'Лосось на пару с брокколи и киноа',
        description: noMeat
          ? 'Киноа с запечёнными брокколи и цветной капустой, заправленная лимонным соком. Крестоцветные помогают метаболизму эстрогена.'
          : 'Нежный лосось на пару с брокколи и киноа. Омега-3 и клетчатка в одном блюде.',
        calories: 440,
        protein: noMeat ? 16 : 32,
        ingredients: noMeat
          ? ['Киноа 80г', 'Брокколи 120г', 'Цветная капуста 100г', 'Лимонный сок', 'Оливковое масло 1 ст.л.', 'Семена тыквы 15г']
          : ['Лосось 150г', 'Брокколи 120г', 'Киноа 60г', 'Лимон', 'Оливковое масло 1 ст.л.'],
        alternatives: noMeat ? ['Овощной салат с тофу', 'Цветная капуста на гриле'] : ['Треска с овощами', 'Куриная грудка с капустой'],
        prepTime: noMeat ? 25 : 20,
        timing: adjusted.meals.lunch.timing,
      };

      adjusted.meals.dinner = {
        name: noMeat ? 'Салат из капусты с авокадо и ягодами' : 'Лёгкий салат с курицей и крестоцветными',
        description: noMeat
          ? 'Хрустящий салат из молодой капусты, авокадо, голубики и грецких орехов с лёгкой заправкой.'
          : 'Салат из пекинской капусты с куриной грудкой, авокадо и ягодами. Лёгкий ужин для фазы овуляции.',
        calories: 380,
        protein: noMeat ? 8 : 26,
        ingredients: noMeat
          ? ['Капуста молодая 150г', 'Авокадо 0.5 шт', 'Голубика 50г', 'Грецкие орехи 20г', 'Оливковое масло 1 ст.л.', 'Лимонный сок']
          : ['Куриная грудка 120г', 'Капуста пекинская 150г', 'Авокадо 0.5 шт', 'Голубика 40г', 'Оливковое масло 1 ст.л.'],
        alternatives: noMeat ? ['Рагу из кабачков и брокколи', 'Суп-пюре из цветной капусты'] : ['Рыба с салатом', 'Индейка с овощами'],
        prepTime: 15,
        timing: adjusted.meals.dinner.timing,
      };

      adjusted.totalCalories = Math.round((adjusted.totalCalories || 1750) * 0.95);
      adjusted.cycleNote = 'Овуляция: лёгкое меню с акцентом на крестоцветные овощи (брокколи, капуста), ягоды и противовоспалительные продукты. Калорийность чуть снижена.';
      break;
    }

    case 'luteal': {
      // Comfort food, serotonin-boosting, more calories, magnesium + B6
      adjusted.meals.breakfast = {
        name: 'Овсянка с бананом, орехами и тёмным шоколадом',
        description: 'Тёплая овсяная каша с бананом, миндалём, кешью и стружкой тёмного шоколада. Поднимает серотонин и настроение.',
        calories: 450,
        protein: 14,
        ingredients: ['Овсяные хлопья 70г', 'Банан 1 шт', 'Миндаль 15г', 'Кешью 10г', 'Тёмный шоколад 15г', 'Молоко или растительное молоко 200мл'],
        alternatives: ['Гранола с йогуртом и бананом', 'Блинчики из овсянки с ягодами'],
        prepTime: 10,
        timing: adjusted.meals.breakfast.timing,
      };

      adjusted.meals.lunch = {
        name: noMeat ? 'Тёплый салат с бататом, авокадо и семечками' : 'Индейка с бурым рисом и авокадо',
        description: noMeat
          ? 'Запечённый батат с авокадо, тыквенными семечками и листьями шпината. Сложные углеводы и здоровые жиры помогут справиться с тягой к сладкому.'
          : 'Филе индейки с бурым рисом, авокадо и шпинатом. Триптофан из индейки поддержит уровень серотонина.',
        calories: 520,
        protein: noMeat ? 14 : 34,
        ingredients: noMeat
          ? ['Батат 200г', 'Авокадо 0.5 шт', 'Тыквенные семечки 20г', 'Шпинат 60г', 'Оливковое масло 1 ст.л.', 'Лимонный сок']
          : ['Индейка филе 150г', 'Бурый рис 80г', 'Авокадо 0.5 шт', 'Шпинат 50г', 'Оливковое масло 1 ст.л.'],
        alternatives: noMeat ? ['Чечевица с бататом', 'Овощной карри с рисом'] : ['Курица с гречкой', 'Рыба с бурым рисом'],
        prepTime: 30,
        timing: adjusted.meals.lunch.timing,
      };

      adjusted.meals.dinner = {
        name: noMeat ? 'Овощное рагу с нутом и авокадо' : 'Запечённый лосось с овощами и оливковым маслом',
        description: noMeat
          ? 'Густое овощное рагу с нутом, подаётся с ломтиками авокадо. Магний и B6 из нута помогут снизить симптомы ПМС.'
          : 'Лосось, запечённый с кабачками и помидорами. Здоровые жиры и магний для лютеиновой фазы.',
        calories: 480,
        protein: noMeat ? 18 : 30,
        ingredients: noMeat
          ? ['Нут 100г', 'Кабачок 150г', 'Помидоры 100г', 'Авокадо 0.5 шт', 'Лук 1 шт', 'Чеснок 2 зубчика', 'Оливковое масло 1 ст.л.']
          : ['Лосось 150г', 'Кабачок 150г', 'Помидоры 100г', 'Оливковое масло 1 ст.л.', 'Чеснок 2 зубчика', 'Лимон'],
        alternatives: noMeat ? ['Карри из чечевицы', 'Фаршированные перцы с рисом'] : ['Треска с овощами', 'Куриные котлеты с пюре'],
        prepTime: 35,
        timing: adjusted.meals.dinner.timing,
      };

      if (adjusted.meals.snack) {
        adjusted.meals.snack = {
          ...adjusted.meals.snack,
          name: 'Авокадо-тост с семечками',
          description: 'Тост с авокадо, тыквенными семечками и щепоткой морской соли. B6 и магний против ПМС.',
          calories: 230,
          protein: 6,
          ingredients: ['Цельнозерновой хлеб 1 ломтик', 'Авокадо 0.5 шт', 'Тыквенные семечки 10г', 'Морская соль'],
        };
      }

      adjusted.totalCalories = (adjusted.totalCalories || 1750) + 170;
      adjusted.cycleNote = 'Лютеиновая фаза: меню с акцентом на сложные углеводы, здоровые жиры и продукты, повышающие серотонин. Калорийность увеличена — организм сжигает больше энергии.';
      break;
    }
  }

  return adjusted;
}

function getMockPlan(params: {
  age: number;
  goals: string[];
  fitnessLevel: string;
  timeAvailable: number;
  foodPreferences: string[];
  dailySchedule: string;
  trainingTypes: string[];
  healthRestrictions: string[];
  measurements?: { height?: number; weight?: number; waist?: number };
  // Legacy compat
  activityLevel?: string;
  nutritionMode?: string;
  difficulty?: string;
  lastPeriodDate?: string;
}) {
  const duration = params.timeAvailable || 15;
  const fitnessLevel = params.fitnessLevel || params.activityLevel || 'beginner';
  const foodPreferences = params.foodPreferences || [];
  const dailySchedule = params.dailySchedule || 'standard';

  const difficultyMap: Record<string, string> = {
    beginner: 'easy',
    returning: 'easy',
    training: 'medium',
    active: 'hard'
  };
  const difficulty = params.difficulty || difficultyMap[fitnessLevel] || 'medium';

  let nutrition = buildNutritionForPreferences(foodPreferences, dailySchedule, params.measurements, params.nutritionMode);

  // Calculate cycle phase if lastPeriodDate provided
  const cyclePhase = params.lastPeriodDate ? calculateCyclePhase(params.lastPeriodDate) : null;

  if (cyclePhase) {
    nutrition = adjustNutritionForCyclePhase(nutrition, cyclePhase, foodPreferences);
  }

  const scheduleTemplate = getScheduleForLevel(fitnessLevel);

  const schedule = scheduleTemplate.map((entry, dayIndex) => {
    if (entry.type === 'rest') {
      return { day: entry.day, type: 'rest' as const, workout: null };
    }

    let adjustedType = entry.type;
    let adjustedDifficulty = difficulty;

    if (cyclePhase) {
      if (cyclePhase.phase === 'menstrual') {
        // Replace strength with flexibility/yoga, make all workouts easy
        if (entry.type === 'strength') adjustedType = 'flexibility';
        adjustedDifficulty = 'easy';
      } else if (cyclePhase.phase === 'follicular') {
        // Allow strength and high-intensity — no changes needed
      } else if (cyclePhase.phase === 'ovulation') {
        // Prefer controlled strength, avoid explosive — downgrade difficulty
        if (adjustedDifficulty === 'hard') adjustedDifficulty = 'medium';
      } else if (cyclePhase.phase === 'luteal') {
        // Prefer moderate, avoid max intensity
        if (entry.type === 'strength' && adjustedDifficulty === 'hard') adjustedDifficulty = 'medium';
        if (adjustedDifficulty === 'hard') adjustedDifficulty = 'medium';
      }
    }

    return {
      day: entry.day,
      type: adjustedType,
      workout: buildMockWorkout(adjustedType, duration, adjustedDifficulty, dayIndex)
    };
  });

  // Today's workout for backward compat (use Monday's or first non-rest day)
  const todayIndex = new Date().getDay();
  const dayIndex = todayIndex === 0 ? 6 : todayIndex - 1; // JS Sunday=0 -> index 6
  const todayEntry = schedule[dayIndex];
  const todayWorkout = todayEntry.workout || schedule.find(s => s.workout)?.workout;

  return {
    nutrition,
    weeklyWorkout: { schedule },
    workout: todayWorkout,
    message: `Привет! Я подготовила для тебя недельный план — ${duration} минут тренировок и сбалансированное меню с учётом твоих предпочтений. В расписании чередуются силовые, кардио и растяжка, чтобы тело восстанавливалось. Начинай в своём темпе! 🌿`,
    cyclePhase,
  };
}

function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  return new Anthropic();
}

export async function generatePlan(params: {
  age: number;
  goals: string[];
  fitnessLevel: string;
  timeAvailable: number;
  foodPreferences: string[];
  dailySchedule: string;
  trainingTypes: string[];
  healthRestrictions: string[];
  measurements?: { height?: number; weight?: number; waist?: number };
  // Legacy compat
  activityLevel?: string;
  nutritionMode?: string;
  difficulty?: string;
  lastPeriodDate?: string;
}): Promise<{ nutrition: any; weeklyWorkout: any; workout: any; message: string; cyclePhase?: any }> {
  const client = getClient();
  if (!client) {
    console.log('[Claude] No API key, returning mock plan');
    return getMockPlan(params);
  }

  const fitnessLevel = params.fitnessLevel || params.activityLevel || 'beginner';
  const foodPreferences = params.foodPreferences || [];
  const dailySchedule = params.dailySchedule || 'standard';
  const measurements = params.measurements;

  let measurementsText = 'не указаны';
  if (measurements) {
    const parts = [];
    if (measurements.height) parts.push(`рост ${measurements.height} см`);
    if (measurements.weight) parts.push(`вес ${measurements.weight} кг`);
    if (measurements.waist) parts.push(`талия ${measurements.waist} см`);
    if (parts.length) measurementsText = parts.join(', ');
  }

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Создай недельный план питания и тренировок для пользователя:
- Возраст: ${params.age}
- Цели: ${params.goals.join(', ')}
- Уровень подготовки: ${fitnessLevel}
- Время на тренировку: ${params.timeAvailable} минут в день
- Ограничения по здоровью: ${params.healthRestrictions.join(', ') || 'нет'}
- Предпочтения в еде: ${foodPreferences.join(', ') || 'без ограничений'}
- Распорядок дня: ${dailySchedule}
- Предпочтения по тренировкам: ${(params.trainingTypes || []).join(', ') || 'любые'}
- Замеры: ${measurementsText}

Правила для недельного плана тренировок:
- 7 дней, правильная ротация: 2-3 дня силовых, 1-2 дня кардио, 1-2 дня растяжки/гибкости, минимум 1 день отдыха
- Силовые: упражнения с собственным весом, безопасные для суставов (приседания, выпады, планка, отжимания от стены, ягодичный мост)
- Кардио: марш на месте, степ, модифицированный берпи, ходьба
- Растяжка: кошка-корова, наклоны, скручивания лёжа, поза ребёнка
- Включи упражнения из практики Бубновского (ортопедические, безопасные для позвоночника и суставов)
- Каждое упражнение должно иметь поле "modification" — облегчённый вариант
- Адаптируй сложность под уровень: ${fitnessLevel}

Правила для питания:
- Учти предпочтения: ${foodPreferences.join(', ') || 'нет'}
- Учти распорядок дня для времени приёмов пищи (${dailySchedule})
${foodPreferences.includes('intermittent_fasting') ? '- Интервальное голодание: распредели приёмы пищи в 8-часовом окне, укажи окно голодания' : ''}
${measurements ? `- Рассчитай калории на основе замеров: ${measurementsText}` : ''}

Верни JSON строго по такой схеме (без markdown, только JSON):
{
  "nutrition": {
    "mode": "standard",
    "totalCalories": 1800,
    "macros": { "protein": 80, "fat": 60, "carbs": 200 },
    "fastingNote": "только если интервальное голодание — описание окна",
    "meals": {
      "breakfast": { "name": "...", "description": "...", "calories": 400, "protein": 20, "ingredients": ["..."], "alternatives": ["..."], "prepTime": 15, "timing": "08:00–09:00" },
      "lunch": { "name": "...", "description": "...", "calories": 500, "protein": 25, "ingredients": ["..."], "alternatives": ["..."], "prepTime": 20, "timing": "13:00–14:00" },
      "dinner": { "name": "...", "description": "...", "calories": 450, "protein": 25, "ingredients": ["..."], "alternatives": ["..."], "prepTime": 25, "timing": "19:00–20:00" },
      "snack": { "name": "...", "description": "...", "calories": 200, "protein": 10, "ingredients": ["..."], "prepTime": 5, "timing": "16:00" }
    }
  },
  "weeklyWorkout": {
    "schedule": [
      {
        "day": "Понедельник",
        "type": "strength",
        "workout": {
          "duration": ${params.timeAvailable},
          "difficulty": "...",
          "focus": "...",
          "phases": {
            "warmup": [{ "name": "...", "duration": 60, "description": "...", "modification": "...", "isSkippable": false }],
            "main": [{ "name": "...", "reps": 12, "sets": 3, "description": "...", "modification": "...", "isSkippable": true }],
            "cooldown": [{ "name": "...", "duration": 60, "description": "...", "modification": "...", "isSkippable": false }]
          }
        }
      },
      { "day": "Среда", "type": "rest", "workout": null }
    ]
  },
  "message": "Приветственное сообщение для пользователя"
}

Все 7 дней недели должны быть в schedule (Понедельник–Воскресенье).
Для дней отдыха type="rest" и workout=null.
Приёмы пищи — конкретные (название блюда + ингредиенты).
Упражнения — с точным временем или количеством повторений.
Все тексты на русском.`
      }]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const parsed = JSON.parse(text);

    // Add backward-compat workout field (today's workout)
    const todayIndex = new Date().getDay();
    const dayIndex = todayIndex === 0 ? 6 : todayIndex - 1;
    const todayEntry = parsed.weeklyWorkout?.schedule?.[dayIndex];
    parsed.workout = todayEntry?.workout || parsed.weeklyWorkout?.schedule?.find((s: any) => s.workout)?.workout;

    // Add cycle phase if lastPeriodDate provided
    parsed.cyclePhase = params.lastPeriodDate ? calculateCyclePhase(params.lastPeriodDate) : null;

    return parsed;
  } catch (err) {
    console.error('[Claude] API error, returning mock plan:', err);
    return getMockPlan(params);
  }
}

export async function generateMotivation(params: {
  mood: number;
  sleep: string;
  nutrition: string;
  workout: string;
  streak: number;
}): Promise<string> {
  const client = getClient();

  const fallbackMessages: Record<string, string> = {
    good: 'Ты молодец — сегодня ты позаботилась о себе. Это важнее, чем кажется. 🌿',
    hard: 'Тяжёлые дни бывают у всех. Завтра будет легче, и план уже мягче. 💛',
    streak: `${params.streak} дней подряд — это уже привычка. Ты строишь что-то настоящее. 🌱`,
  };

  const key = params.streak >= 3 ? 'streak' : params.mood >= 3 ? 'good' : 'hard';

  if (!client) {
    return fallbackMessages[key]!;
  }

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Пользователь завершил чек-ин:
- Самочувствие: ${params.mood}/4
- Сон: ${params.sleep}
- Питание выполнено: ${params.nutrition}
- Тренировка выполнено: ${params.workout}
- Серия дней подряд: ${params.streak}

Напиши короткое (2–3 предложения) поддерживающее сообщение.
Если день был тяжёлым — утешь. Если всё хорошо — похвали.
Если серия 3+ дней — отметь это особо. Без клише, по-человечески.
Верни только текст сообщения, без JSON.`
      }]
    });

    return response.content[0].type === 'text' ? response.content[0].text : fallbackMessages[key]!;
  } catch {
    return fallbackMessages[key]!;
  }
}
