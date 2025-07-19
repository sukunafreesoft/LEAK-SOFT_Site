import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const app = express();
const PORT = 3000;

// Инициализация базы данных
let db = {
  cheats: [
    {
      id: 'nerestpc',
      name: 'NerestPC',
      link: 'https://example.com/aimgod',
      votes: 0,
      image: 'nerestpc.png'
    },
    {
      id: 'plutonium',
      name: 'Plutonium',
      link: 'https://example.com/wallmaster',
      votes: 0,
      image: 'plutonium.jpg'
    },
    {
      id: 'elysium',
      name: 'Elysium',
      link: 'https://example.com/speedhack',
      votes: 0,
      image: 'elysium.png'
    }
  ],
  reviews: []
};

// Настройка CORS
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Читы
app.get('/api/cheats', (req, res) => {
  res.json(db.cheats);
});

// API Голосование
app.post('/api/vote/:cheatId', (req, res) => {
  const { cheatId } = req.params;
  const cheat = db.cheats.find(c => c.id === cheatId);
  if (!cheat) return res.status(404).json({ error: 'Чит не найден' });
  cheat.votes++;
  saveDatabase();
  res.json({ success: true, votes: cheat.votes, cheatId: cheat.id });
});

app.delete('/api/vote/:cheatId', (req, res) => {
  const { cheatId } = req.params;
  const cheat = db.cheats.find(c => c.id === cheatId);
  if (!cheat) return res.status(404).json({ error: 'Чит не найден' });
  cheat.votes = Math.max(0, cheat.votes - 1);
  saveDatabase();
  res.json({ success: true, votes: cheat.votes, cheatId: cheat.id });
});

// API Отзывы
app.get('/api/reviews', (req, res) => {
  res.json(db.reviews || []);
});

app.post('/api/reviews', (req, res) => {
  const { name, message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Текст отзыва обязателен' });
  }

  const nickname = name?.trim() || `Anonim${Math.floor(Math.random() * 9000) + 1000}`;

  if (!db.reviews) db.reviews = [];

  const newReview = {
    id: Date.now(),
    name: nickname,
    message: message.trim(),
    date: new Date().toISOString()
  };

  db.reviews.push(newReview);
  saveDatabase();
  res.json({ success: true, review: newReview });
});

// Вспомогательная функция
function saveDatabase() {
  fs.writeFileSync('db.json', JSON.stringify(db, null, 2));
}

// Если есть файл — загружаем
if (fs.existsSync('db.json')) {
  try {
    db = JSON.parse(fs.readFileSync('db.json', 'utf8'));
  } catch (err) {
    console.error('Ошибка чтения базы:', err);
  }
}

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});
