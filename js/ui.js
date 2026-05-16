/**
 * ui.js — Модуль управления интерфейсом
 * Отвечает за вкладки, радио-кнопки и отображение рекомендаций.
 */

/* Хранит последние рассчитанные рекомендации */
let lastRecs = [];

/* ---- Переключение главных вкладок ---- */

function switchTab(tab) {
  const tabs = document.querySelectorAll('.tab');
  tabs[0].classList.toggle('active', tab === 'imt');
  tabs[1].classList.toggle('active', tab === 'calories');

  document.getElementById('tabImt').classList.toggle('hidden', tab !== 'imt');
  document.getElementById('tabCalories').classList.toggle('hidden', tab !== 'calories');
}

/* ---- Радио-кнопки ---- */

function selectRadio(el) {
  const group = el.dataset.group;
  document.querySelectorAll('[data-group="' + group + '"]').forEach(function (btn) {
    btn.classList.remove('selected');
  });
  el.classList.add('selected');
}

function getRadioValue(group) {
  const el = document.querySelector('[data-group="' + group + '"].selected');
  return el ? el.dataset.value : null;
}

/* ---- Отображение / скрытие рекомендаций ---- */

function updateRecsVisibility() {
  const locked  = document.getElementById('recsLocked');
  const visible = document.getElementById('recsVisible');
  const badge   = document.getElementById('recsBadge');

  if (!locked || !visible) return;

  if (currentUser && lastRecs.length > 0) {
    /* Пользователь вошёл И есть результаты — показываем рекомендации */
    locked.classList.add('hidden');
    visible.classList.remove('hidden');
    visible.innerHTML = lastRecs.map(function (r) {
      return (
        '<div class="rec-item">' +
          '<div class="rec-icon">' + r.icon + '</div>' +
          '<div class="rec-text">' +
            '<strong>' + r.title + '</strong>' +
            r.text +
          '</div>' +
        '</div>'
      );
    }).join('');
    badge.textContent = '✓ Доступно';
    badge.classList.remove('locked');
    badge.classList.add('free');

  } else if (currentUser) {
    /* Вошёл, но расчёт ещё не выполнен */
    locked.classList.add('hidden');
    visible.classList.remove('hidden');
    visible.innerHTML = '<p style="color:var(--muted);font-size:14px;padding:16px 0;">Нажмите «Рассчитать ИМТ», чтобы увидеть рекомендации.</p>';
    badge.textContent = '✓ Доступно';
    badge.classList.remove('locked');
    badge.classList.add('free');

  } else {
    /* Не авторизован — показываем заглушку */
    locked.classList.remove('hidden');
    visible.classList.add('hidden');
    badge.textContent = '🔒 Требуется вход';
    badge.classList.add('locked');
    badge.classList.remove('free');
  }
}
