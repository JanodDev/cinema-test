// Slideshow functionality
let slideIndex = 0;
let slideTimer = null;

function showSlides(n) {
  const slides = document.querySelectorAll('.slide');
  if (!slides.length) return;
  slideIndex = (n + slides.length) % slides.length;
  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === slideIndex);
  });
}

function plusSlides(n) {
  showSlides(slideIndex + n);
  resetSlideTimer();
}

function autoAdvanceSlides() {
  plusSlides(1);
}

function resetSlideTimer() {
  if (slideTimer) clearInterval(slideTimer);
  slideTimer = setInterval(autoAdvanceSlides, 5000);
}

document.addEventListener('DOMContentLoaded', () => {
  showSlides(0);
  resetSlideTimer();

  // Hamburger menu functionality
  const hamburger = document.getElementById('hamburger-menu');
  const mobileMenu = document.getElementById('mobile-menu');
  if (hamburger && mobileMenu) {
    function toggleMenu() {
      mobileMenu.classList.toggle('open');
    }
    hamburger.addEventListener('click', toggleMenu);
    hamburger.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleMenu();
      }
    });
    // Close menu when clicking outside or on a link
    document.addEventListener('mousedown', function handler(e) {
      if (mobileMenu.classList.contains('open') && !mobileMenu.contains(e.target) && e.target !== hamburger) {
        mobileMenu.classList.remove('open');
      }
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
      });
    });
  }

  // Form validation and submission
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      // Remove previous errors
      form.querySelectorAll('.input-error').forEach(el => el.remove());
      let valid = true;
      const firstName = form['first-name'];
      const lastName = form['last-name'];
      const email = form['email'];
      const comments = form['comments'];
      const terms = form['terms'];
      function showError(input, message) {
        const err = document.createElement('div');
        err.className = 'input-error';
        err.style.color = '#ff4444';
        err.style.fontSize = '0.95rem';
        err.style.marginTop = '2px';
        err.textContent = message;
        input.parentNode.appendChild(err);
      }
      if (!firstName.value.trim()) {
        showError(firstName, 'First Name is required');
        valid = false;
      }
      if (!lastName.value.trim()) {
        showError(lastName, 'Last Name is required');
        valid = false;
      }
      if (!email.value.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value)) {
        showError(email, 'Valid Email is required');
        valid = false;
      }
      if (!comments.value.trim()) {
        showError(comments, 'Message is required');
        valid = false;
      }
      if (!terms.checked) {
        showError(terms, 'You must agree to the Terms & Conditions');
        valid = false;
      }
      if (!valid) return;
      // Prepare data
      const formData = new FormData(form);
      try {
        const response = await fetch('contact.php', {
          method: 'POST',
          body: formData
        });
        const result = await response.json();
        if (result.success) {
          alert('Thank you! Your message has been sent.');
          form.reset();
        } else {
          alert('There was an error submitting the form. Please try again.');
        }
      } catch (err) {
        alert('There was an error submitting the form. Please try again.');
      }
    });
  }

  // Movie search and favourites
  const searchInput = document.getElementById('movie-search');
  const searchBtn = document.getElementById('search-btn');
  const movieGrid = document.getElementById('movie-grid');

  // Store favourite movies in memory (could be extended to backend)
  let favouriteMovies = [];

  // Helper to create a movie card
  function createMovieCard(movie, removable = true) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `
      <img src="${movie.image || 'assets/no-image.png'}" alt="${movie.title}">
      <h3>${movie.title}</h3>
      <p>${movie.description || ''}</p>
      ${removable ? '<button class="remove-btn" title="Remove">&times;</button>' : ''}
    `;
    if (removable) {
      card.querySelector('.remove-btn').onclick = () => {
        card.remove();
        favouriteMovies = favouriteMovies.filter(m => m.id !== movie.id);
      };
    }
    return card;
  }

  // Add movie to favourites grid
  function addMovieToGrid(movie) {
    // Prevent duplicates
    if (favouriteMovies.some(m => m.id === movie.id)) return;
    favouriteMovies.push(movie);
    const card = createMovieCard(movie, true);
    movieGrid.appendChild(card);
  }

  // Search movies from TVmaze
  async function searchMovies(query) {
    if (!query.trim()) return;
    try {
      const res = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      showSearchResults(data.map(item => ({
        id: item.show.id,
        title: item.show.name,
        image: item.show.image ? item.show.image.medium : '',
        description: item.show.summary ? item.show.summary.replace(/<[^>]+>/g, '') : ''
      })));
    } catch (err) {
      alert('Error fetching movies.');
    }
  }

  // Show search results as a modal or below the search bar
  function showSearchResults(results) {
    // Remove old results
    let resultsBox = document.getElementById('search-results');
    if (resultsBox) resultsBox.remove();
    resultsBox = document.createElement('div');
    resultsBox.id = 'search-results';
    resultsBox.style.position = 'absolute';
    resultsBox.style.background = '#232323';
    resultsBox.style.border = '1px solid #888';
    resultsBox.style.zIndex = 100;
    resultsBox.style.maxHeight = '350px';
    resultsBox.style.overflowY = 'auto';
    resultsBox.style.width = searchInput.offsetWidth + 'px';
    resultsBox.style.left = searchInput.getBoundingClientRect().left + window.scrollX + 'px';
    resultsBox.style.top = (searchInput.getBoundingClientRect().bottom + window.scrollY) + 'px';
    results.forEach(movie => {
      const item = document.createElement('div');
      item.style.display = 'flex';
      item.style.alignItems = 'center';
      item.style.gap = '12px';
      item.style.padding = '8px';
      item.style.cursor = 'pointer';
      item.style.borderBottom = '1px solid #333';
      item.innerHTML = `<img src="${movie.image || 'assets/no-image.png'}" alt="" style="width:40px;height:60px;object-fit:cover;"> <span style="color:#fff;">${movie.title}</span>`;
      item.onclick = () => {
        addMovieToGrid(movie);
        resultsBox.remove();
      };
      resultsBox.appendChild(item);
    });
    document.body.appendChild(resultsBox);
    // Remove results on click outside
    document.addEventListener('mousedown', function handler(e) {
      if (!resultsBox.contains(e.target) && e.target !== searchInput) {
        resultsBox.remove();
        document.removeEventListener('mousedown', handler);
      }
    });
  }

  // Search on button click or enter
  if (searchBtn) {
    searchBtn.onclick = () => searchMovies(searchInput.value);
  }
  if (searchInput) {
    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        searchMovies(searchInput.value);
      }
    });
  }
}); 