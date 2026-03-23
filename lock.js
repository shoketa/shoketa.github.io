const CORRECT_PASSWORD = 'ta25';
const SESSION_KEY = 'site-unlocked';

if (!sessionStorage.getItem(SESSION_KEY)) {
  document.body.style.overflow = 'hidden';
  document.body.style.opacity = '1'; // overlay covers content — body must be visible

  const overlay = document.createElement('div');
  overlay.id = 'lock-overlay';
  overlay.innerHTML = `
    <div id="lock-box">
      <form id="lock-form">
        <input id="lock-input" type="password" placeholder="password" autocomplete="current-password" autofocus />
        <div id="lock-error"></div>
      </form>
    </div>
  `;
  document.body.appendChild(overlay);

  const form  = document.getElementById('lock-form');
  const input = document.getElementById('lock-input');
  const error = document.getElementById('lock-error');

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (input.value === CORRECT_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1');
      overlay.style.opacity = '0';
      setTimeout(() => { overlay.remove(); document.body.style.overflow = ''; }, 500);
    } else {
      error.textContent = 'Incorrect password.';
      input.value = '';
      input.focus();
      overlay.classList.add('lock-shake');
      setTimeout(() => overlay.classList.remove('lock-shake'), 400);
    }
  });
}
