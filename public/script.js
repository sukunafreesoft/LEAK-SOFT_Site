document.addEventListener('DOMContentLoaded', async () => {
  const cheatsContainer = document.getElementById('cheatsContainer');
  const reviewsContainer = document.getElementById('reviewsContainer');
  const reviewForm = document.getElementById('reviewForm');
  const reviewMessage = document.getElementById('reviewMessage');

  let cheatsData = [];
  let userVote = localStorage.getItem('userVote') || null;

  async function fetchCheats() {
    try {
      const res = await fetch('/api/cheats');
      if (!res.ok) throw new Error('Ошибка загрузки читов');
      return await res.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  function renderCheats() {
    cheatsContainer.innerHTML = '';
    cheatsData.forEach(cheat => {
      const voted = userVote === cheat.id;
      const voteBtnClass = voted ? 'voted' : '';
      const voteBtnText = voted ? 'Отменить' : '⭐ Голос';

      const cheatCard = document.createElement('div');
      cheatCard.className = 'cheat-card';

      cheatCard.innerHTML = `
        <img src="/img/cheats/${cheat.image}" alt="${cheat.name}" class="cheat-image" />
        <div class="cheat-info">
          <h3>${cheat.name}</h3>
          <a href="${cheat.link}" target="_blank" rel="noopener noreferrer"><!-- Купить софт ссылка --></a>
        </div>
        <div class="vote-section">
          <div class="vote-count">
            <i class="fas fa-fire"></i> ${cheat.votes.toLocaleString()} ⭐ Голосов
          </div>
          <button class="vote-btn ${voteBtnClass}" data-id="${cheat.id}">
            ${voteBtnText}
          </button>
        </div>
      `;

      cheatsContainer.appendChild(cheatCard);
    });

    document.querySelectorAll('.vote-btn').forEach(btn => {
      btn.onclick = handleVote;
    });
  }

  async function handleVote(e) {
    const id = e.currentTarget.dataset.id;
    try {
      if (userVote === id) {
        await fetch(`/api/vote/${id}`, { method: 'DELETE' });
        userVote = null;
        localStorage.removeItem('userVote');
      } else {
        if (userVote) {
          await fetch(`/api/vote/${userVote}`, { method: 'DELETE' });
        }
        await fetch(`/api/vote/${id}`, { method: 'POST' });
        userVote = id;
        localStorage.setItem('userVote', id);
      }
      cheatsData = await fetchCheats();
      renderCheats();
    } catch (err) {
      alert('Ошибка при голосовании. Попробуйте позже.');
      console.error(err);
    }
  }

  reviewForm.onsubmit = async e => {
    e.preventDefault();
    const message = reviewMessage.value.trim();
    if (!message) return alert('Введите отзыв');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ message })
      });
      if (!res.ok) throw new Error('Ошибка отправки отзыва');

      reviewMessage.value = '';
      loadReviews();
    } catch (err) {
      alert('Не удалось отправить отзыв. Попробуйте позже.');
      console.error(err);
    }
  };

  async function loadReviews() {
    try {
      const res = await fetch('/api/reviews');
      if (!res.ok) throw new Error('Ошибка загрузки отзывов');
      const reviews = await res.json();

      reviewsContainer.innerHTML = '';
      reviews.forEach(r => {
        const date = new Date(r.date);
        const formattedDate = date.toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });

        reviewsContainer.innerHTML += `
          <div class="review">
            <strong>${r.name}</strong> (${formattedDate}):<br />
            ${r.message}
          </div>
        `;
      });
    } catch (err) {
      reviewsContainer.innerHTML = '<p>Не удалось загрузить отзывы</p>';
      console.error(err);
    }
  }

  cheatsData = await fetchCheats();
  renderCheats();
  loadReviews();

  setInterval(async () => {
    const newCheats = await fetchCheats();
    if (JSON.stringify(newCheats) !== JSON.stringify(cheatsData)) {
      cheatsData = newCheats;
      renderCheats();
    }
    loadReviews();
  }, 10000);
});
