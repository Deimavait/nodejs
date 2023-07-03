const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');

loginBtn.addEventListener('click', async (event) => {
  event.preventDefault();

  const payload = {
    email: emailInput.value,
    password: passwordInput.value,
  };

  try {
    const response = await fetch('http://localhost:8080/login', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const body = await response.json();

    if (body.error) {
      console.error(body.error);
      alert('Incorrect email or password');
      return;
    }
    localStorage.setItem('token', body.token);
    window.location.href = 'groups.html';
  } catch (error) {
    console.error(error);
  }
});
