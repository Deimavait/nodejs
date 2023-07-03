const groupID = new URLSearchParams(document.location.search).get('groupId');
const submitBtn = document.getElementById('add-btn-bills');
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch(`http://localhost:8080/bills/${groupID}}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const responseJSON = await response.json();
    console.log(responseJSON);

    const bills = responseJSON.data;
    console.log(bills);

    createTable(bills);

    if (responseJSON.error) {
      console.error(responseJSON.error);
      return;
    }
  } catch (error) {
    console.error('Error occurred while fetching groups:', error);
  }
});

function createRow(id, description, amount) {
  const table = document.querySelector('table');

  const tr2 = document.createElement('tr');

  const td1 = document.createElement('td');
  td1.textContent = `ID:${id}`;
  const td2 = document.createElement('td');
  td2.textContent = description;
  const td3 = document.createElement('td');
  td3.textContent = amount;

  tr2.appendChild(td1);
  tr2.appendChild(td2);
  tr2.appendChild(td3);

  table.appendChild(tr2);

  tr2.addEventListener('click', () => {
    window.location.href = `/web/bills.html?groupId=${groupId}`;
  });
}

function createTable(bills) {
  const table = document.createElement('table');
  const tr = document.createElement('tr');
  const th1 = document.createElement('th');
  th1.textContent = 'ID';
  const th2 = document.createElement('th');
  th2.textContent = 'Description';
  const th3 = document.createElement('th');
  th3.textContent = 'Amount';
  tr.appendChild(th1);
  tr.appendChild(th2);
  tr.appendChild(th3);

  table.appendChild(tr);

  document.querySelectorAll('table').forEach((element) => element.remove());

  const tableContainer = document.querySelector('.table-container');
  tableContainer.appendChild(table);
  bills.forEach((bill) => {
    createRow(bill.id, bill.description, bill.amount);
  });
}
submitBtn.addEventListener('click', async (event) => {
  event.preventDefault();

  const amountInput = document.getElementById('amount').value;
  const descriptionInput = document.getElementById('description').value;

  const payload = {
    amount: amountInput,
    description: descriptionInput,
    groups_id: groupID,
  };

  try {
    const response = await fetch('http://localhost:8080/bills', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(payload),
    });
    const responseJSON = await response.json();

    const bills = responseJSON.data;
    createTable(bills);
  } catch (error) {
    alert('Error occurred while submitting the form');
  }
});
