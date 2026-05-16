/**
 * calculator.js — Модуль расчётов
 * Содержит логику вычисления ИМТ, суточной нормы калорий и рекомендаций.
 */

/* ================================================
   РАСЧЁТ ИМТ
   ================================================ */

function calculateIMT() {
  const height = parseFloat(document.getElementById('height').value);
  const weight = parseFloat(document.getElementById('weight').value);
  const age    = parseFloat(document.getElementById('age').value);
  const build  = getRadioValue('build');

  /* Валидация ввода */
  if (!height || !weight || height < 100 || height > 250 || weight < 30 || weight > 300) {
    alert('Проверьте данные: рост (100–250 см) и вес (30–300 кг)');
    return;
  }
  if (!age || age < 10 || age > 120) {
    alert('Проверьте возраст (10–120 лет)');
    return;
  }

  const heightM = height / 100;
  const imt     = weight / (heightM * heightM);
  const imtRounded = Math.round(imt * 10) / 10;

  /* Идеальный вес с учётом телосложения */
  const buildCorrection = { thin: -0.05, normal: 0, wide: 0.07 };
  const baseIdealWeight = 22.5 * heightM * heightM;
  const idealWeight     = Math.round(baseIdealWeight * (1 + (buildCorrection[build] || 0)));

  /* Пороги нормы ИМТ в зависимости от телосложения */
  const thresholds = getIMTThresholds(build);

  /* Определение категории */
  const { category, colorClass } = getIMTCategory(imt, thresholds);

  /* Обновление интерфейса */
  renderIMTResults(imtRounded, category, colorClass, idealWeight, imt);

  /* Формирование и сохранение рекомендаций */
  lastRecs = buildRecommendations(imt, category, build, age, weight, idealWeight);
  updateRecsVisibility();
}

/**
 * Возвращает пороговые значения нормы ИМТ для разных типов телосложения.
 */
function getIMTThresholds(build) {
  const thresholds = {
    thin:   { low: 17.5, high: 23.5 },
    normal: { low: 18.5, high: 25.0 },
    wide:   { low: 19.5, high: 27.0 }
  };
  return thresholds[build] || thresholds.normal;
}

/**
 * Определяет категорию ИМТ и CSS-класс для отображения.
 */
function getIMTCategory(imt, thresholds) {
  if (imt < thresholds.low)   return { category: 'Дефицит',  colorClass: 'imt-underweight' };
  if (imt < thresholds.high)  return { category: 'Норма',    colorClass: 'imt-normal'      };
  if (imt < 30)               return { category: 'Избыток',  colorClass: 'imt-overweight'  };
  return                             { category: 'Ожирение', colorClass: 'imt-obese'       };
}

/**
 * Обновляет DOM с результатами расчёта ИМТ.
 */
function renderIMTResults(imtRounded, category, colorClass, idealWeight, imt) {
  document.getElementById('imtValue').textContent  = imtRounded;
  document.getElementById('imtValue').className    = 'stat-value ' + colorClass;

  document.getElementById('imtCategory').textContent = category;
  document.getElementById('imtCategory').className   = 'stat-value stat-category ' + colorClass;

  document.getElementById('idealWeight').textContent = idealWeight;

  /* Позиция ползунка на шкале: ИМТ 15–40 → 0–100% */
  const pointerPct = Math.min(100, Math.max(0, ((imt - 15) / 25) * 100));
  document.getElementById('scalePointer').style.left = pointerPct + '%';

  document.getElementById('imtResults').classList.add('visible');
}

/* ================================================
   РЕКОМЕНДАЦИИ
   ================================================ */

/**
 * Формирует массив рекомендаций на основе результатов расчёта.
 */
function buildRecommendations(imt, category, build, age, weight, idealWeight) {
  const diff = Math.round(weight - idealWeight);
  const recs = [];

  switch (category) {
    case 'Норма':
      recs.push({
        icon: '✅',
        title: 'Поддержание веса',
        text: 'Ваш вес в норме. Продолжайте придерживаться сбалансированного питания и регулярной физической активности.'
      });
      recs.push({
        icon: '🥗',
        title: 'Питание',
        text: 'Разнообразное питание: достаточно белка, клетчатки и ненасыщенных жиров. Избегайте ультраобработанных продуктов.'
      });
      recs.push({
        icon: '🏃',
        title: 'Физическая активность',
        text: 'Не менее 150 минут умеренной аэробной активности в неделю плюс 2 силовые тренировки.'
      });
      break;

    case 'Дефицит':
      recs.push({
        icon: '⚖️',
        title: 'Набор веса',
        text: 'Рекомендуется набрать около ' + Math.abs(diff) + ' кг. Делайте это постепенно: +300–500 ккал/день сверх нормы.'
      });
      recs.push({
        icon: '🍖',
        title: 'Питание',
        text: 'Увеличьте потребление белка (1.8–2.2 г на кг массы тела). Добавьте сложные углеводы: крупы, хлеб, бобовые, картофель.'
      });
      recs.push({
        icon: '💪',
        title: 'Силовые тренировки',
        text: 'Занятия с отягощениями 3–4 раза в неделю помогут набрать мышечную, а не жировую массу.'
      });
      if (age < 20) {
        recs.push({
          icon: '👨‍⚕️',
          title: 'Консультация специалиста',
          text: 'При значительном дефиците массы у молодых людей рекомендуется консультация с врачом или диетологом.'
        });
      }
      break;

    case 'Избыток':
      recs.push({
        icon: '📉',
        title: 'Снижение веса',
        text: 'Желательно снизить вес на ' + diff + ' кг. Оптимальный темп — 0.5–1 кг в неделю (дефицит около 500 ккал/день).'
      });
      recs.push({
        icon: '🥦',
        title: 'Питание',
        text: 'Сократите быстрые углеводы и насыщенные жиры. Увеличьте долю овощей, белка и клетчатки в рационе.'
      });
      recs.push({
        icon: '🚶',
        title: 'Начало с малого',
        text: 'Начните с ходьбы 30 минут в день, постепенно повышая интенсивность. Плавание и велосипед — отличные варианты.'
      });
      break;

    case 'Ожирение':
      recs.push({
        icon: '🚨',
        title: 'Снижение веса — приоритет',
        text: 'ИМТ указывает на ожирение. Рекомендуется снизить вес на ' + diff + ' кг. Необходима консультация с врачом.'
      });
      recs.push({
        icon: '🥗',
        title: 'Питание',
        text: 'Дефицит 500–750 ккал/день. Исключите ультраобработанные продукты, сладкие напитки и алкоголь. Ведите дневник питания.'
      });
      recs.push({
        icon: '🏊',
        title: 'Бережная активность',
        text: 'Начните с малоинтенсивных нагрузок: ходьба, плавание. При лишнем весе суставы требуют щадящего подхода.'
      });
      recs.push({
        icon: '👨‍⚕️',
        title: 'Медицинское наблюдение',
        text: 'Рекомендуется проверить уровень сахара, холестерин и давление. Проконсультируйтесь с терапевтом или эндокринологом.'
      });
      break;
  }

  /* Пояснение по типу телосложения */
  if (build === 'wide') {
    recs.push({
      icon: 'ℹ️',
      title: 'Учёт телосложения',
      text: 'Для гиперстеников (крупная кость) допустимый диапазон ИМТ выше стандартного — это учтено в расчёте.'
    });
  }
  if (build === 'thin') {
    recs.push({
      icon: 'ℹ️',
      title: 'Учёт телосложения',
      text: 'Для астеников (тонкая кость) норма ИМТ несколько ниже стандартной — это учтено в расчёте вашего идеального веса.'
    });
  }

  return recs;
}

/* ================================================
   РАСЧЁТ КАЛОРИЙ
   ================================================ */

function calculateCalories() {
  const height   = parseFloat(document.getElementById('cHeight').value);
  const weight   = parseFloat(document.getElementById('cWeight').value);
  const age      = parseFloat(document.getElementById('cAge').value);
  const gender   = getRadioValue('cgender');
  const activity = parseFloat(getRadioValue('activity'));

  /* Валидация */
  if (!height || !weight || height < 100 || height > 250 || weight < 30) {
    alert('Проверьте введённые данные');
    return;
  }
  if (!age || age < 10) {
    alert('Проверьте возраст');
    return;
  }

  /* Формула Миффлина–Сан Жеора */
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  /* Суточные нормы */
  const maintenance = Math.round(bmr * activity);
  const deficit     = Math.max(1200, maintenance - 500);
  const surplus     = maintenance + 300;

  /* Макронутриенты (для поддержания) */
  const protein  = Math.round(weight * 1.8);          /* г */
  const fatCal   = Math.round(maintenance * 0.25);    /* ккал на жиры */
  const fat      = Math.round(fatCal / 9);            /* г */
  const carbCal  = maintenance - protein * 4 - fatCal;
  const carbs    = Math.round(Math.max(0, carbCal) / 4); /* г */

  /* Обновление интерфейса */
  document.getElementById('calMaintain').textContent = maintenance;
  document.getElementById('calDeficit').textContent  = deficit;
  document.getElementById('calSurplus').textContent  = surplus;
  document.getElementById('macroProtein').textContent = protein;
  document.getElementById('macroFat').textContent     = fat;
  document.getElementById('macroCarbs').textContent   = carbs;

  document.getElementById('calResults').classList.add('visible');
}
