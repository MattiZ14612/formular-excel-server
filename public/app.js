'use strict';

const form = document.getElementById('alarmForm');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');
const btnSpinner = document.getElementById('btnSpinner');
const successBox = document.getElementById('successBox');
const successMessage = document.getElementById('successMessage');
const downloadLink = document.getElementById('downloadLink');
const errorBox = document.getElementById('errorBox');
const errorMessage = document.getElementById('errorMessage');

function showElement(el) {
  el.classList.remove('hidden');
}

function hideElement(el) {
  el.classList.add('hidden');
}

function setLoading(loading) {
  submitBtn.disabled = loading;
  if (loading) {
    hideElement(btnText);
    showElement(btnSpinner);
  } else {
    showElement(btnText);
    hideElement(btnSpinner);
  }
}

function clearFieldErrors() {
  document.querySelectorAll('.field-error').forEach((el) => (el.textContent = ''));
  document.querySelectorAll('input, textarea').forEach((el) => el.classList.remove('invalid'));
}

function validateForm(data) {
  let valid = true;

  if (!data.name.trim()) {
    document.getElementById('nameError').textContent = 'Bitte geben Sie Ihren Namen ein.';
    document.getElementById('name').classList.add('invalid');
    valid = false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email.trim() || !emailRegex.test(data.email.trim())) {
    document.getElementById('emailError').textContent = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
    document.getElementById('email').classList.add('invalid');
    valid = false;
  }

  return valid;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearFieldErrors();
  hideElement(successBox);
  hideElement(errorBox);

  const data = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    comment: document.getElementById('comment').value,
  };

  if (!validateForm(data)) return;

  setLoading(true);

  try {
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      successMessage.textContent = `Dateiname: ${result.filename}`;
      downloadLink.href = result.downloadUrl;
      downloadLink.download = result.filename;
      showElement(successBox);
      form.reset();
    } else {
      errorMessage.textContent = result.error || 'Unbekannter Fehler.';
      showElement(errorBox);
    }
  } catch (err) {
    errorMessage.textContent = 'Netzwerkfehler – bitte versuchen Sie es erneut.';
    showElement(errorBox);
  } finally {
    setLoading(false);
  }
});
