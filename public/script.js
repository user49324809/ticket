const apiBase = "/tickets";

async function fetchTickets(query = "") {
  const res = await fetch(apiBase + query);
  return res.json();
}

function createTicketElement(ticket) {
  const div = document.createElement("div");
  div.className = "ticket";

  div.innerHTML = `
    <div><strong>Тема:</strong> ${ticket.subject}</div>
    <div><strong>Текст:</strong> ${ticket.message}</div>
    <div><strong>Статус:</strong> <span class="status">${ticket.status}</span></div>
    <div><strong>Дата создания:</strong> ${new Date(ticket.createdAt).toLocaleString()}</div>
    ${ticket.status === "COMPLETED" ? `<div><strong>Решение:</strong> ${ticket.solution}</div>` : ""}
    ${ticket.status === "CANCELED" ? `<div><strong>Причина отмены:</strong> ${ticket.cancelReason}</div>` : ""}
    <div class="controls"></div>
  `;

  const controls = div.querySelector(".controls");

  if (ticket.status === "NEW") {
    const btnStart = document.createElement("button");
    btnStart.textContent = "Взять в работу";
    btnStart.onclick = () => takeInWork(ticket.id);
    controls.appendChild(btnStart);
  }

  if (ticket.status === "IN_PROGRESS") {
    const btnComplete = document.createElement("button");
    btnComplete.textContent = "Завершить";
    btnComplete.onclick = () => completeTicketPrompt(ticket.id);
    controls.appendChild(btnComplete);

    const btnCancel = document.createElement("button");
    btnCancel.textContent = "Отменить";
    btnCancel.onclick = () => cancelTicketPrompt(ticket.id);
    controls.appendChild(btnCancel);
  }

  return div;
}

async function loadTickets(query = "") {
  const container = document.getElementById("tickets");
  container.innerHTML = "Загрузка...";
  try {
    const tickets = await fetchTickets(query);
    container.innerHTML = "";
    if (tickets.length === 0) {
      container.textContent = "Обращений не найдено.";
      return;
    }
    tickets.forEach(t => {
      container.appendChild(createTicketElement(t));
    });
  } catch {
    container.textContent = "Ошибка загрузки.";
  }
}

async function createTicket(event) {
  event.preventDefault();
  const form = event.target;
  const subject = form.subject.value.trim();
  const message = form.message.value.trim();

  if (!subject || !message) return alert("Заполните все поля");

  try {
    const res = await fetch(apiBase, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, message })
    });
    if (!res.ok) throw new Error();
    alert("Обращение создано");
    form.reset();
    loadTickets();
  } catch {
    alert("Ошибка создания обращения");
  }
}

async function takeInWork(id) {
  if (!confirm("Взять обращение в работу?")) return;
  try {
    const res = await fetch(`${apiBase}/${id}/start`, { method: "PATCH" });
    if (!res.ok) throw new Error();
    alert("Обращение взято в работу");
    loadTickets();
  } catch {
    alert("Ошибка");
  }
}

async function completeTicketPrompt(id) {
  const solution = prompt("Введите решение обращения:");
  if (!solution) return alert("Решение обязательно");
  try {
    const res = await fetch(`${apiBase}/${id}/complete`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ solution })
    });
    if (!res.ok) throw new Error();
    alert("Обращение завершено");
    loadTickets();
  } catch {
    alert("Ошибка");
  }
}

async function cancelTicketPrompt(id) {
  const reason = prompt("Введите причину отмены:");
  if (!reason) return alert("Причина отмены обязательна");
  try {
    const res = await fetch(`${apiBase}/${id}/cancel`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cancelReason: reason })
    });
    if (!res.ok) throw new Error();
    alert("Обращение отменено");
    loadTickets();
  } catch {
    alert("Ошибка");
  }
}

async function cancelAllInProgress() {
  if (!confirm("Отменить все обращения в работе?")) return;
  try {
    const res = await fetch(`${apiBase}/cancel-all-in-progress`, { method: "PATCH" });
    if (!res.ok) throw new Error();
    const json = await res.json();
    alert(`Отменено обращений: ${json.canceledCount}`);
    loadTickets();
  } catch {
    alert("Ошибка");
  }
}

function filterTickets(event) {
  event.preventDefault();
  const form = event.target;
  const date = form.date.value;
  const startDate = form.startDate.value;
  const endDate = form.endDate.value;

  let query = "";
  if (date) {
    query = `?date=${date}`;
  } else if (startDate && endDate) {
    query = `?startDate=${startDate}&endDate=${endDate}`;
  }

  loadTickets(query);
}

function clearFilter() {
  document.getElementById("filterForm").reset();
  loadTickets();
}

document.getElementById("createForm").addEventListener("submit", createTicket);
document.getElementById("filterForm").addEventListener("submit", filterTickets);
document.getElementById("clearFilter").addEventListener("click", clearFilter);
document.getElementById("cancelAllInProgress").addEventListener("click", cancelAllInProgress);

// загрузка обращений при старте
loadTickets();
