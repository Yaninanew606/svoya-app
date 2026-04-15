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

function buildMockWorkout(type: 'strength' | 'cardio' | 'flexibility', duration: number, difficulty: string) {
  const workouts: Record<string, any> = {
    strength: {
      duration,
      difficulty,
      focus: "Силовая тренировка — укрепление мышц и осанка",
      phases: {
        warmup: [
          { name: "Круговые движения плечами", duration: 60, description: "Медленные круговые движения плечами вперёд и назад. Расслабь шею.", modification: "Можно делать сидя", isSkippable: false },
          { name: "Наклоны головы", duration: 45, description: "Плавные наклоны головы к каждому плечу, задержка 3 секунды.", modification: "Уменьши амплитуду при дискомфорте", isSkippable: false },
          { name: "Марш на месте", duration: 60, description: "Шагай на месте, поднимая колени. Руки двигаются свободно.", modification: "Шагай медленнее, не поднимай колени высоко", isSkippable: false }
        ],
        main: [
          { name: "Приседания у стены", reps: 10, sets: 2, description: "Прислонись спиной к стене, медленно приседай до угла 90°. Задержись на 2 секунды.", modification: "Приседай только до комфортного угла", isSkippable: false },
          { name: "Выпады назад с опорой", reps: 8, sets: 2, description: "Держась за спинку стула, шагни назад и согни оба колена. Вернись в исходное положение.", modification: "Уменьши глубину выпада", isSkippable: false },
          { name: "Отжимания от стены", reps: 10, sets: 2, description: "Встань лицом к стене на расстоянии вытянутой руки. Медленно сгибай и разгибай руки.", modification: "Подойди ближе к стене для меньшей нагрузки", isSkippable: true },
          { name: "Ягодичный мост", reps: 12, sets: 2, description: "Ляг на спину, согни ноги. Поднимай таз вверх, сжимая ягодицы в верхней точке. Задержись на 2 секунды.", modification: "Поднимай таз невысоко, без прогиба в пояснице", isSkippable: false },
          { name: "Подъём таза лёжа (по Бубновскому)", reps: 10, sets: 2, description: "Лёжа на спине, стопы на полу. Плавно поднимай таз, напрягая мышцы тазового дна и ягодиц.", modification: "Делай с меньшей амплитудой", isSkippable: true },
          { name: "Планка на предплечьях", duration: 20, sets: 2, description: "Упор на предплечья и носки. Тело — прямая линия. Дыши ровно.", modification: "Планка с колен", isSkippable: true }
        ],
        cooldown: [
          { name: "Растяжка задней поверхности бедра", duration: 45, description: "Сядь на пол, вытяни одну ногу. Мягко тянись к носку.", modification: "Слегка согни ногу в колене", isSkippable: false },
          { name: "Укрепление мышц спины (по Бубновскому)", duration: 60, description: "Лёжа на животе, руки вдоль тела. Плавно приподнимай грудную клетку, не запрокидывая голову.", modification: "Приподнимай совсем немного, фокус на лопатках", isSkippable: false },
          { name: "Глубокое дыхание", duration: 60, description: "Ляг на спину, руки вдоль тела. Вдох на 4 счёта, выдох на 6. Расслабляйся.", modification: "Можно делать сидя", isSkippable: false }
        ]
      }
    },
    cardio: {
      duration,
      difficulty,
      focus: "Кардио — выносливость и хорошее настроение",
      phases: {
        warmup: [
          { name: "Круговые движения руками", duration: 60, description: "Широкие круги руками вперёд и назад. Разогреваем плечевой пояс.", modification: "Маленькие круги при дискомфорте", isSkippable: false },
          { name: "Повороты корпуса", duration: 45, description: "Ноги на ширине плеч, плавные повороты корпуса влево-вправо, руки расслаблены.", modification: "Уменьши амплитуду", isSkippable: false }
        ],
        main: [
          { name: "Марш на месте с высоким подъёмом коленей", duration: 120, description: "Энергичный марш на месте, поднимая колени к животу. Работай руками.", modification: "Шагай спокойнее, колени не выше удобного уровня", isSkippable: false },
          { name: "Степ-аэробика (ступенька или платформа)", duration: 120, description: "Шагай на ступеньку и обратно, чередуя ноги. Держи спину прямо.", modification: "Используй невысокую ступеньку, держись за опору", isSkippable: false },
          { name: "Берпи модифицированный", reps: 6, sets: 2, description: "Присядь, поставь руки на пол, шагни (не прыгай) ногами назад в планку, вернись шагом и встань.", modification: "Делай без выхода в планку — просто приседай и вставай", isSkippable: true },
          { name: "Ходьба с ускорением на месте", duration: 90, description: "Чередуй 20 секунд быстрого шага и 10 секунд медленного. Дыши ритмично.", modification: "Только спокойный шаг без ускорений", isSkippable: false },
          { name: "Разработка тазобедренных суставов (по Бубновскому)", duration: 60, description: "Стоя, держась за опору, плавные круговые движения ногой в тазобедренном суставе.", modification: "Сидя на стуле, круги согнутой ногой", isSkippable: false }
        ],
        cooldown: [
          { name: "Наклоны вперёд стоя", duration: 45, description: "Ноги на ширине плеч, мягко наклоняйся вперёд, руки свисают. Не пружинь.", modification: "Слегка согни колени", isSkippable: false },
          { name: "Восстановление дыхания", duration: 60, description: "Руки вверх — вдох, руки вниз — выдох. Медленно, 8–10 раз.", modification: "Делай сидя", isSkippable: false }
        ]
      }
    },
    flexibility: {
      duration,
      difficulty,
      focus: "Гибкость и расслабление — забота о суставах и спине",
      phases: {
        warmup: [
          { name: "Вращения в лучезапястных суставах", duration: 45, description: "Круговые движения кистями в обе стороны. Разогреваем мелкие суставы.", modification: "Делай медленнее", isSkippable: false },
          { name: "Покачивания корпуса", duration: 60, description: "Стоя, ноги на ширине плеч, мягко покачивайся из стороны в сторону.", modification: "Держись за опору", isSkippable: false }
        ],
        main: [
          { name: "Кошка-корова", duration: 60, sets: 3, description: "На четвереньках: прогибай и округляй спину. Медленно, с дыханием. Полезно для позвоночника.", modification: "Уменьши амплитуду движений", isSkippable: false },
          { name: "Растяжка задней поверхности бедра сидя", duration: 45, sets: 2, description: "Сядь на пол, одна нога вытянута, вторая согнута. Тянись к носку вытянутой ноги.", modification: "Используй ремень или полотенце", isSkippable: false },
          { name: "Наклоны в стороны стоя", reps: 10, sets: 2, description: "Одна рука вверх, другая вдоль тела. Плавный наклон в сторону, чувствуя вытяжение бока.", modification: "Меньше амплитуда, держись за стул", isSkippable: false },
          { name: "Скручивания лёжа (ротация позвоночника)", duration: 45, sets: 2, description: "Лёжа на спине, руки в стороны. Согнутые колени опускай вправо-влево, плечи прижаты к полу.", modification: "Не опускай колени до пола, останавливайся в комфортной точке", isSkippable: false },
          { name: "Поза ребёнка", duration: 60, description: "Сядь на пятки, вытяни руки вперёд, лоб на полу. Дыши глубоко, расслабляй спину.", modification: "Подложи подушку под живот", isSkippable: false },
          { name: "Разработка тазобедренных суставов лёжа (по Бубновскому)", duration: 60, description: "Лёжа на спине, согни ноги. Разводи колени в стороны, как бабочка. Плавно, без рывков.", modification: "Подложи валики под колени для поддержки", isSkippable: false }
        ],
        cooldown: [
          { name: "Шавасана (расслабление)", duration: 120, description: "Ляг на спину, закрой глаза. Расслабь все мышцы тела, дыши естественно. Побудь 2 минуты в тишине.", modification: "Подложи валик под колени при дискомфорте в пояснице", isSkippable: false }
        ]
      }
    }
  };
  return workouts[type];
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
  measurements?: { height?: number; weight?: number; waist?: number }
) {
  const noMeat = foodPreferences.includes('no_meat');
  const noDairy = foodPreferences.includes('no_dairy');
  const noGluten = foodPreferences.includes('no_gluten');
  const lowSugar = foodPreferences.includes('low_sugar');
  const intermittentFasting = foodPreferences.includes('intermittent_fasting');

  // Adjust calories based on measurements
  let totalCalories = 1750;
  if (measurements?.weight && measurements?.height) {
    // Mifflin-St Jeor for women, light activity
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

  // Build meals based on preferences
  const breakfast = noGluten
    ? {
        name: "Гречневая каша с бананом и семенами чиа",
        description: "Рассыпчатая гречка с кусочками банана, семенами чиа и ложкой мёда. Без глютена.",
        calories: Math.round(totalCalories * 0.25),
        protein: 14,
        ingredients: ["Гречневая крупа 70г", "Банан 1 шт", "Семена чиа 1 ст.л.", lowSugar ? "Стевия по вкусу" : "Мёд 1 ч.л.", noDairy ? "Растительное молоко 100мл" : "Молоко 2.5% 100мл"],
        alternatives: [noDairy ? "Смузи на кокосовом молоке" : "Творог с фруктами", "Рисовая каша с ягодами"],
        prepTime: 15,
        timing: mealTiming.breakfast
      }
    : {
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

  const lunch = noMeat
    ? {
        name: "Чечевичный суп с овощами",
        description: "Густой суп из красной чечевицы с морковью, сельдереем и куркумой. Питательный растительный белок.",
        calories: Math.round(totalCalories * 0.3),
        protein: 22,
        ingredients: ["Красная чечевица 100г", "Морковь 1 шт", "Сельдерей 2 стебля", "Лук 1 шт", "Куркума 0.5 ч.л.", "Оливковое масло 1 ст.л."],
        alternatives: ["Киноа с запечёнными овощами", "Фалафель с салатом"],
        prepTime: 25,
        timing: mealTiming.lunch
      }
    : {
        name: "Куриная грудка с киноа и овощами",
        description: "Запечённая куриная грудка с киноа, брокколи и сладким перцем. Заправьте оливковым маслом.",
        calories: Math.round(totalCalories * 0.3),
        protein: 35,
        ingredients: ["Куриная грудка 150г", "Киноа 80г", "Брокколи 100г", "Сладкий перец 1 шт", "Оливковое масло 1 ст.л.", "Лимонный сок"],
        alternatives: ["Рыба на пару с рисом", "Индейка с гречкой"],
        prepTime: 25,
        timing: mealTiming.lunch
      };

  const dinner = noMeat
    ? {
        name: "Тофу с запечёнными овощами",
        description: "Маринованный тофу, запечённый с кабачками, помидорами и баклажанами. Лёгкий и сытный ужин.",
        calories: Math.round(totalCalories * 0.28),
        protein: 20,
        ingredients: ["Тофу 200г", "Кабачок 1 шт", "Помидоры 2 шт", "Баклажан 0.5 шт", "Оливковое масло 1 ст.л.", "Соевый соус 1 ст.л."],
        alternatives: ["Овощное рагу с нутом", "Фасолевое буррито"],
        prepTime: 30,
        timing: mealTiming.dinner
      }
    : {
        name: "Лосось с запечёнными овощами",
        description: "Филе лосося, запечённое с кабачками, помидорами и луком. Лёгкий и питательный ужин.",
        calories: Math.round(totalCalories * 0.28),
        protein: 30,
        ingredients: ["Филе лосося 150г", "Кабачок 1 шт", "Помидоры 2 шт", "Лук красный 1 шт", "Оливковое масло 1 ст.л.", "Чеснок 2 зубчика"],
        alternatives: ["Треска с овощами", "Омлет с зеленью"],
        prepTime: 30,
        timing: mealTiming.dinner
      };

  const snack = noDairy
    ? {
        name: "Яблоко с миндальной пастой",
        description: "Нарезанное яблоко с ложкой миндальной пасты. Сытный перекус без молочных продуктов.",
        calories: Math.round(totalCalories * 0.12),
        protein: 6,
        ingredients: ["Яблоко 1 шт", "Миндальная паста 1 ст.л."],
        alternatives: ["Горсть орехов и сухофруктов", "Хумус с морковными палочками"],
        prepTime: 2,
        timing: mealTiming.snack
      }
    : {
        name: "Греческий йогурт с мёдом",
        description: "Натуральный йогурт с ложечкой мёда и горсткой миндаля. Отличный перекус.",
        calories: Math.round(totalCalories * 0.12),
        protein: 12,
        ingredients: ["Греческий йогурт 150г", lowSugar ? "Корица" : "Мёд 1 ч.л.", "Миндаль 15г"],
        alternatives: ["Яблоко с арахисовой пастой", "Кефир с отрубями"],
        prepTime: 2,
        timing: mealTiming.snack
      };

  const mode = intermittentFasting ? 'intermittent_fasting' : 'standard';

  return {
    mode,
    totalCalories,
    macros: { protein: 85, fat: 58, carbs: 195 },
    ...(fastingNote ? { fastingNote } : {}),
    meals: { breakfast, lunch, dinner, snack }
  };
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

  const nutrition = buildNutritionForPreferences(foodPreferences, dailySchedule, params.measurements);

  const scheduleTemplate = getScheduleForLevel(fitnessLevel);

  const schedule = scheduleTemplate.map(entry => {
    if (entry.type === 'rest') {
      return { day: entry.day, type: 'rest' as const, workout: null };
    }
    return {
      day: entry.day,
      type: entry.type,
      workout: buildMockWorkout(entry.type, duration, difficulty)
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
    message: `Привет! Я подготовила для тебя недельный план — ${duration} минут тренировок и сбалансированное меню с учётом твоих предпочтений. В расписании чередуются силовые, кардио и растяжка, чтобы тело восстанавливалось. Начинай в своём темпе! 🌿`
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
}): Promise<{ nutrition: any; weeklyWorkout: any; workout: any; message: string }> {
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
