const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const repeatPasswordInput = document.getElementById('repeated-password');
const registerBtn = document.getElementById('register-btn');

registerBtn.addEventListener('click', async (event) => {
  event.preventDefault();

  const payload = {
    full_name: nameInput.value,
    email: emailInput.value,
    password: passwordInput.value,
  };

  if (passwordInput.value === repeatPasswordInput.value) {
    try {
      const response = await fetch('http://localhost:8080/register', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(response);

      if (
        payload.full_name.trim() &&
        payload.email.trim() &&
        payload.password.trim()
      ) {
        window.location.href =
          'http://localhost:5500/nodeJsFinal/web/login.html';
      } else {
        alert('Fill all required fields');
      }

      const body = await response.json();

      if (body.error) {
        console.error(body.error);
        return;
      }
    } catch (error) {
      // return console.error(error);
    }
  } else {
    alert('Password do not match');
  }
});
