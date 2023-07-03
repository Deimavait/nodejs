// only to check if authentification passed

fetch('http://localhost:8080/groups', {
  headers: {
    authorization: `Bearer ${localStorage.getItem('token')}`,
  },
})
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
    if (data?.error === 'Token is bad') {
      window.location.href = 'login.html';
      return;
    }
  })
  .catch((error) => {
    console.error(error);
  });

const submitForm = document.querySelector('form');
const submitBtn = document.getElementById('add-btn-group');

function createCard(groupId, groupName) {
  const cardWrap = document.createElement('div');
  cardWrap.classList.add('card-wrap');

  const card = document.createElement('div');
  card.classList.add('card');

  const cardHeading = document.createElement('h2');
  cardHeading.textContent = `ID:${groupId}`;

  const cardText = document.createElement('p');
  cardText.textContent = groupName;

  card.appendChild(cardHeading);
  card.appendChild(cardText);
  cardWrap.appendChild(card);

  const groupCardsContainer = document.querySelector('.group-cards');
  groupCardsContainer.appendChild(cardWrap);

  cardWrap.addEventListener('click', () => {
    window.location.href = `/web/bills.html?groupId=${groupId}`;
  });
}

function createAllCards(accounts) {
  document
    .querySelectorAll('.card-wrap')
    .forEach((element) => element.remove());

  accounts.forEach((account) => {
    createCard(account.groups_id, account.name);
  });
}

window.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('http://localhost:8080/accounts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const responseJSON = await response.json();
    console.log(responseJSON);

    const accounts = responseJSON.data;
    console.log(accounts);

    createAllCards(accounts);

    if (responseJSON.error) {
      console.error(responseJSON.error);
      return;
    }
  } catch (error) {
    console.error('Error occurred while fetching groups:', error);
  }

  //

  try {
    const response = await fetch('http://localhost:8080/groups', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const responseJSON = await response.json();
    console.log(responseJSON);

    const groups = responseJSON.data;
    console.log(groups);

    groups.forEach((group) => {
      //create option elements
      const select = document.getElementById('group-id');

      const option = document.createElement('option');
      option.value = group.id;
      option.textContent = option.value;
      select.appendChild(option);
    });

    if (responseJSON.error) {
      console.error(responseJSON.error);
      return;
    }
  } catch (error) {
    console.error('Error occurred while fetching groups:', error);
  }
});

submitBtn.addEventListener('click', async (event) => {
  event.preventDefault();

  const groupIdInput = document.getElementById('group-id').value;

  const payload = {
    groups_id: groupIdInput,
  };

  try {
    const response = await fetch('http://localhost:8080/accounts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(payload),
    });
    const responseJSON = await response.json();

    const accounts = responseJSON.data;
    createAllCards(accounts);
    console.log(response);
  } catch (error) {
    alert('Error occurred while submitting the form');
  }
});
