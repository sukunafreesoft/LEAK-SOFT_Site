// Путь к JSON
const CHEATS_JSON = 'cheats.json';
let cheats = [];
let isEditMode = false;
let currentEditId = null;

// Загрузка читов
async function loadCheats() {
  try {
    const res = await fetch(CHEATS_JSON + '?t=' + new Date().getTime());
    if (!res.ok) throw new Error('Файл не найден');
    cheats = await res.json();
    if (document.getElementById('cheatsContainer')) {
      renderCheats();
    }
    if (document.getElementById('cheatsList')) {
      renderCheatsList();
    }
  } catch (err) {
    console.warn('Не удалось загрузить JSON. Работаем в режиме редактирования (пустой список).');
    cheats = [];
    if (document.getElementById('cheatsList')) {
      renderCheatsList();
    }
  }
}

// Поиск (на главной)
document.getElementById('searchInput')?.addEventListener('input', (e) => {
  renderCheats(e.target.value.toLowerCase());
});

function renderCheats(search = '') {
  const container = document.getElementById('cheatsContainer');
  const filtered = cheats.filter(c =>
    c.title.toLowerCase().includes(search) ||
    c.game.toLowerCase().includes(search) ||
    c.description.toLowerCase().includes(search)
  );

  container.innerHTML = filtered.map(cheat => `
    <div class="card">
      <h3>${cheat.title}</h3>
      <p class="info"><strong>Игра:</strong> ${cheat.game}</p>
      <p>${cheat.description}</p>
      <div class="card-footer">
        <div class="actions">
          <span class="feature-link" onclick="openModal(${cheat.id})">Функции</span>
        </div>
        <a href="${cheat.downloadLink}" target="_blank" class="btn">Скачать</a>
      </div>
    </div>
  `).join('');
}

// === МОДАЛЬНОЕ ОКНО ===
function openModal(id) {
  const cheat = cheats.find(c => c.id === id);
  if (cheat) {
    document.getElementById('modalTitle').textContent = 'Функции: ' + cheat.title;
    document.getElementById('modalFeatures').textContent = cheat.features;
    document.getElementById('featureModal').style.display = 'block';
  }
}

document.querySelector('.modal .close')?.addEventListener('click', () => {
  document.getElementById('featureModal').style.display = 'none';
});

window.addEventListener('click', (e) => {
  const modal = document.getElementById('featureModal');
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

// === АДМИНКА ===
document.getElementById('cheatForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const game = document.getElementById('game').value.trim();
  const description = document.getElementById('description').value.trim();
  const features = document.getElementById('features').value.trim();
  const downloadLink = document.getElementById('downloadLink').value.trim();

  if (!title || !game || !description || !features || !downloadLink) {
    alert('Заполните все поля!');
    return;
  }

  if (isEditMode) {
    const cheat = cheats.find(c => c.id == currentEditId);
    if (cheat) {
      Object.assign(cheat, { title, game, description, features, downloadLink });
    }
    isEditMode = false;
    currentEditId = null;
    document.getElementById('formTitle').textContent = '➕ Добавить чит';
    document.getElementById('cancelEdit').style.display = 'none';
  } else {
    const newId = cheats.length ? Math.max(...cheats.map(c => c.id)) + 1 : 1;
    cheats.push({ id: newId, title, game, description, features, downloadLink });
  }

  saveTemp(); // Сохраняем в память
  document.getElementById('cheatForm').reset();
  renderCheatsList();
  alert('Чит сохранён (в памяти). Не забудьте экспортировать JSON!');
});

// Отображение списка в админке
function renderCheatsList() {
  const list = document.getElementById('cheatsList');
  list.innerHTML = cheats.map(cheat => `
    <li>
      <div>
        <strong>${cheat.title}</strong> (${cheat.game})
      </div>
      <div>
        <button class="btn btn-sm btn-danger" onclick="deleteCheats(${cheat.id})">Удалить</button>
        <button class="btn btn-sm" onclick="editCheats(${cheat.id})">Редактировать</button>
      </div>
    </li>
  `).join('');
}

// Удаление
function deleteCheats(id) {
  if (confirm('Удалить чит?')) {
    cheats = cheats.filter(c => c.id !== id);
    saveTemp();
    renderCheatsList();
  }
}

// Редактирование
function editCheats(id) {
  const cheat = cheats.find(c => c.id === id);
  if (cheat) {
    document.getElementById('title').value = cheat.title;
    document.getElementById('game').value = cheat.game;
    document.getElementById('description').value = cheat.description;
    document.getElementById('features').value = cheat.features;
    document.getElementById('downloadLink').value = cheat.downloadLink;
    isEditMode = true;
    currentEditId = id;
    document.getElementById('formTitle').textContent = '✏️ Редактировать чит';
    document.getElementById('cancelEdit').style.display = 'inline-block';
    window.scrollTo(0, 0);
  }
}

// Отмена редактирования
document.getElementById('cancelEdit')?.addEventListener('click', () => {
  document.getElementById('cheatForm').reset();
  isEditMode = false;
  currentEditId = null;
  document.getElementById('formTitle').textContent = '➕ Добавить чит';
  document.getElementById('cancelEdit').style.display = 'none';
});

// Временное сохранение (в памяти)
function saveTemp() {
  // Данные хранятся в переменной `cheats`, всё ок
}

// === ЭКСПОРТ JSON ===
document.getElementById('exportJson')?.addEventListener('click', () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cheats, null, 2));
  const a = document.createElement('a');
  a.href = dataStr;
  a.download = 'cheats.json';
  a.click();
});

// === ИНИЦИАЛИЗАЦИЯ ===
document.addEventListener('DOMContentLoaded', () => {
  loadCheats();

  // Если на странице админки — добавляем обработчик экспорта
  if (document.getElementById('exportJson')) {
    // Уже есть обработчик выше
  }
});