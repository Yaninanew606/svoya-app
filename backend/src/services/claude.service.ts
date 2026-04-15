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
- Отвечай на русском языке
- Возвращай данные строго в запрошенном JSON формате`;

function getMockPlan(params: {
  age: number;
  goals: string[];
  activityLevel: string;
  timeAvailable: number;
  healthRestrictions: string[];
  nutritionMode?: string;
  difficulty?: string;
}) {
  const duration = params.timeAvailable || 15;
  const difficulty = params.difficulty || 'medium';
  const mode = params.nutritionMode || 'standard';

  return {
    nutrition: {
      mode,
      totalCalories: 1750,
      macros: { protein: 85, fat: 58, carbs: 195 },
      meals: {
        breakfast: {
          name: "Овсянка с ягодами и орехами",
          description: "Тёплая овсяная каша на молоке с голубикой, малиной и грецкими орехами. Посыпьте корицей для аромата.",
          calories: 420,
          protein: 15,
          ingredients: ["Овсяные хлопья 60г", "Молоко 2.5% 200мл", "Голубика 50г", "Малина 50г", "Грецкие орехи 20г", "Мёд 1 ч.л."],
          alternatives: ["Гречневая каша с бананом", "Творог с фруктами"],
          prepTime: 10
        },
        lunch: {
          name: "Куриная грудка с киноа и овощами",
          description: "Запечённая куриная грудка с киноа, брокколи и сладким перцем. Заправьте оливковым маслом и лимонным соком.",
          calories: 520,
          protein: 35,
          ingredients: ["Куриная грудка 150г", "Киноа 80г", "Брокколи 100г", "Сладкий перец 1 шт", "Оливковое масло 1 ст.л.", "Лимонный сок"],
          alternatives: ["Рыба на пару с рисом", "Индейка с гречкой"],
          prepTime: 25
        },
        dinner: {
          name: "Лосось с запечёнными овощами",
          description: "Филе лосося, запечённое с кабачками, помидорами и луком. Лёгкий и питательный ужин.",
          calories: 480,
          protein: 30,
          ingredients: ["Филе лосося 150г", "Кабачок 1 шт", "Помидоры 2 шт", "Лук красный 1 шт", "Оливковое масло 1 ст.л.", "Чеснок 2 зубчика"],
          alternatives: ["Треска с овощами", "Омлет с зеленью"],
          prepTime: 30
        },
        snack: {
          name: "Греческий йогурт с мёдом",
          description: "Натуральный йогурт с ложечкой мёда и горсткой миндаля. Отличный перекус между обедом и ужином.",
          calories: 180,
          protein: 12,
          ingredients: ["Греческий йогурт 150г", "Мёд 1 ч.л.", "Миндаль 15г"],
          alternatives: ["Яблоко с арахисовой пастой", "Кефир с отрубями"],
          prepTime: 2
        }
      }
    },
    workout: {
      duration,
      difficulty,
      focus: "Общий тонус и осанка",
      phases: {
        warmup: [
          { name: "Круговые движения плечами", duration: 60, description: "Медленные круговые движения плечами вперёд и назад. Расслабь шею.", modification: "Можно делать сидя", isSkippable: false },
          { name: "Наклоны головы", duration: 45, description: "Плавные наклоны головы к каждому плечу, задержка 3 секунды.", modification: "Уменьши амплитуду при дискомфорте", isSkippable: false },
          { name: "Марш на месте", duration: 60, description: "Шагай на месте, поднимая колени. Руки двигаются свободно.", modification: "Шагай медленнее, не поднимай колени высоко", isSkippable: false }
        ],
        main: [
          { name: "Приседания у стены", reps: 10, sets: 2, description: "Прислонись спиной к стене, медленно приседай до угла 90°. Задержись на 2 секунды.", modification: "Приседай только до комфортного угла", isSkippable: false },
          { name: "Отжимания от стены", reps: 10, sets: 2, description: "Встань лицом к стене на расстоянии вытянутой руки. Медленно сгибай и разгибай руки.", modification: "Подойди ближе к стене для меньшей нагрузки", isSkippable: true },
          { name: "Подъём на носки", reps: 15, sets: 2, description: "Встань ровно, медленно поднимайся на носки и опускайся. Держись за стул для равновесия.", modification: "Делай меньше повторений", isSkippable: true },
          { name: "Планка на предплечьях", duration: 20, sets: 2, description: "Упор на предплечья и носки. Тело — прямая линия. Дыши ровно.", modification: "Планка с колен", isSkippable: true }
        ],
        cooldown: [
          { name: "Растяжка задней поверхности бедра", duration: 45, description: "Сядь на пол, вытяни одну ногу. Мягко тянись к носку.", modification: "Слегка согни ногу в колене", isSkippable: false },
          { name: "Поза кошки-коровы", duration: 60, description: "На четвереньках: прогибай и округляй спину. Медленно, с дыханием.", modification: "Уменьши амплитуду движений", isSkippable: false },
          { name: "Глубокое дыхание", duration: 60, description: "Ляг на спину, руки вдоль тела. Вдох на 4 счёта, выдох на 6. Расслабляйся.", modification: "Можно делать сидя", isSkippable: false }
        ]
      }
    },
    message: `Привет! Я подобрала для тебя мягкий план на сегодня — ${duration} минут упражнений и вкусное сбалансированное меню. Начинай в своём темпе, всё получится! 🌿`
  };
}

function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  return new Anthropic();
}

export async function generatePlan(params: {
  age: number;
  goals: string[];
  activityLevel: string;
  timeAvailable: number;
  healthRestrictions: string[];
  nutritionMode?: string;
  difficulty?: string;
}): Promise<{ nutrition: any; workout: any; message: string }> {
  const client = getClient();
  if (!client) {
    console.log('[Claude] No API key, returning mock plan');
    return getMockPlan(params);
  }

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Создай план питания и тренировки для пользователя:
- Возраст: ${params.age}
- Цели: ${params.goals.join(', ')}
- Активность: ${params.activityLevel}
- Время: ${params.timeAvailable} минут в день
- Ограничения: ${params.healthRestrictions.join(', ') || 'нет'}
- Режим питания: ${params.nutritionMode || 'standard'}
- Сложность тренировки: ${params.difficulty || 'medium'}

Верни JSON строго по такой схеме (без markdown, только JSON):
{
  "nutrition": {
    "mode": "standard",
    "totalCalories": 1800,
    "macros": { "protein": 80, "fat": 60, "carbs": 200 },
    "meals": {
      "breakfast": { "name": "...", "description": "...", "calories": 400, "protein": 20, "ingredients": ["..."], "alternatives": ["..."], "prepTime": 15 },
      "lunch": { "name": "...", "description": "...", "calories": 500, "protein": 25, "ingredients": ["..."], "alternatives": ["..."], "prepTime": 20 },
      "dinner": { "name": "...", "description": "...", "calories": 450, "protein": 25, "ingredients": ["..."], "alternatives": ["..."], "prepTime": 25 },
      "snack": { "name": "...", "description": "...", "calories": 200, "protein": 10, "ingredients": ["..."], "prepTime": 5 }
    }
  },
  "workout": {
    "duration": ${params.timeAvailable},
    "difficulty": "${params.difficulty || 'medium'}",
    "focus": "...",
    "phases": {
      "warmup": [{ "name": "...", "duration": 60, "description": "...", "modification": "...", "isSkippable": false }],
      "main": [{ "name": "...", "reps": 12, "sets": 3, "description": "...", "modification": "...", "isSkippable": true }],
      "cooldown": [{ "name": "...", "duration": 60, "description": "...", "isSkippable": false }]
    }
  },
  "message": "Приветственное сообщение для пользователя"
}

Приёмы пищи должны быть конкретными (название блюда + ингредиенты).
Упражнения — с точным временем или количеством повторений.`
      }]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    return JSON.parse(text);
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
