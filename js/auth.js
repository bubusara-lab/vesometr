/**
 * auth.js — Модуль авторизации и регистрации пользователей
 * Хранит пользователей в localStorage браузера.
 */

let currentUser = null;
let modalMode = 'login';

/* ---- Работа с хранилищем пользователей ---- */

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem('wm_users') || '{}');
  } catch (e) {
    return {};
  }
}

function saveUsers(users) {
  localStorage.setItem('wm_users', JSON.stringify(users));
}

/* ---- Открытие / закрытие модального окна ---- */

function openModal() {
  document.getElementById('authModal').classList.add('open');
  document.getElementById('authError').classList.remove('show');
  document.getElementById('authLogin').value = '';
  document.getElementById('authPassword').value = '';
}

function closeModal() {
  document.getElementById('authModal').classList.remove('open');
}

/* ---- Переключение вкладок: вход / регистрация ---- */

function switchModalTab(mode) {
  modalMode = mode;

  const tabs = document.querySelectorAll('.modal-tab');
  tabs[0].classList.toggle('active', mode === 'login');
  tabs[1].classList.toggle('active', mode === 'register');

  document.getElementById('authSubmitBtn').textContent =
    mode === 'login' ? 'Войти' : 'Зарегистрироваться';
  document.getElementById('modalTitle').textContent =
    mode === 'login' ? 'Добро пожаловать' : 'Создать аккаунт';

  document.getElementById('authError').classList.remove('show');
}

/* ---- Обработка формы авторизации ---- */

function handleAuth() {
  const login = document.getElementById('authLogin').value.trim();
  const password = document.getElementById('authPassword').value;
  const errEl = document.getElementById('authError');

  if (!login || !password) {
    errEl.textContent = 'Заполните все поля';
    errEl.classList.add('show');
    return;
  }

  const users = getUsers();

  if (modalMode === 'register') {
    if (users[login]) {
      errEl.textContent = 'Этот логин уже занят';
      errEl.classList.add('show');
      return;
    }
    users[login] = password;
    saveUsers(users);
    loginUser(login);
  } else {
    if (!users[login] || users[login] !== password) {
      errEl.textContent = 'Неверный логин или пароль';
      errEl.classList.add('show');
      return;
    }
    loginUser(login);
  }
}

/* ---- Вход в аккаунт ---- */

function loginUser(login) {
  currentUser = login;
  closeModal();

  const btn = document.getElementById('headerAuthBtn');
  btn.textContent = login + ' · Выйти';
  btn.classList.add('active');
  btn.onclick = logoutUser;

  updateRecsVisibility();
}

/* ---- Выход из аккаунта ---- */

function logoutUser() {
  currentUser = null;

  const btn = document.getElementById('headerAuthBtn');
  btn.textContent = 'Войти';
  btn.classList.remove('active');
  btn.onclick = openModal;

  updateRecsVisibility();
}

/* ---- Закрытие модального окна по клику на фон ---- */

document.getElementById('authModal').addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});
