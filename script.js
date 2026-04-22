let players = JSON.parse(localStorage.getItem("players")) || [];

function save() {
  localStorage.setItem("players", JSON.stringify(players));
}

//
// 🧾 OPEN FORM (ADD / EDIT)
//
function openForm(index) {
  const container = document.getElementById("formContainer");
  const p = index !== null ? players[index] : null;

  container.innerHTML = `
    <div class="card">

      <input id="name" placeholder="Name" value="${p?.name || ""}">

      <b>Fate Box 1</b>
      <input class="b1a" placeholder="Guess 1" value="${p?.b1?.[0] || ""}">
      <input class="b1b" placeholder="Guess 2" value="${p?.b1?.[1] || ""}">

      <b>Fate Box 2</b>
      <input class="b2a" placeholder="Guess 1" value="${p?.b2?.[0] || ""}">
      <input class="b2b" placeholder="Guess 2" value="${p?.b2?.[1] || ""}">

      <b>Fate Box 3</b>
      <input class="b3a" placeholder="Guess 1" value="${p?.b3?.[0] || ""}">
      <input class="b3b" placeholder="Guess 2" value="${p?.b3?.[1] || ""}">

      <b>Fate Box 4</b>
      <input class="b4a" placeholder="Guess 1" value="${p?.b4?.[0] || ""}">
      <input class="b4b" placeholder="Guess 2" value="${p?.b4?.[1] || ""}">

      <input id="bet" type="number" placeholder="Bet" value="${p?.bet || ""}">

      <button onclick="savePlayer(${index})">💾 Save</button>
      <button onclick="closeForm()">❌ Cancel</button>
    </div>
  `;
}

function closeForm() {
  document.getElementById("formContainer").innerHTML = "";
}

//
// 💾 SAVE PLAYER (FIXED - NO BROKEN VARIABLES)
//
function savePlayer(index) {
  const form = document.getElementById("formContainer");

  const player = {
    name: form.querySelector("#name").value.trim(),

    b1: [form.querySelector(".b1a").value, form.querySelector(".b1b").value],
    b2: [form.querySelector(".b2a").value, form.querySelector(".b2b").value],
    b3: [form.querySelector(".b3a").value, form.querySelector(".b3b").value],
    b4: [form.querySelector(".b4a").value, form.querySelector(".b4b").value],

    bet: Number(form.querySelector("#bet").value || 0),

    marks: index !== null && players[index]
      ? players[index].marks
      : Array(8).fill(0)
  };

  if (!player.name) {
    alert("Please enter a name");
    return;
  }

  if (index !== null) {
    players[index] = player;
  } else {
    players.push(player);
  }

  save();
  closeForm();
  renderPlayers();
  updatePot();
  updateScores();
}

//
// 📋 RENDER PLAYERS
//
function renderPlayers() {
  const container = document.getElementById("playersContainer");
  container.innerHTML = "";

  players.forEach((p, i) => {
    const guesses = [...p.b1, ...p.b2, ...p.b3, ...p.b4];

    let html = `<div class="card">
      <b>${p.name}</b> (Bet: ${p.bet})<br><br>
    `;

    guesses.forEach((g, gi) => {
      html += `
        <div class="guess">
          <span>${g}</span>
          <button onclick="mark('${g}', 1)">✔</button>
          <button onclick="mark('${g}', -1)">✖</button>
        </div>
      `;
    });

    html += `
  <button onclick="openForm(${i})">✏️ Edit</button>
  <button onclick="removePlayer(${i})" style="background:red;color:white;">🗑 Remove</button>
</div>`;

    container.innerHTML += html;
  });
}

//
// ✔ / ✖ MARK (SYNC SAME GUESSES)
//
function mark(value, state) {
  players.forEach(p => {
    let all = [...p.b1, ...p.b2, ...p.b3, ...p.b4];

    all.forEach((g, i) => {
      if (g.toLowerCase() === value.toLowerCase()) {
        p.marks[i] = state;
      }
    });
  });

  save();
  renderPlayers();
  updateScores();
}

//
// 🧠 SCORES
//
function updateScores() {
  const table = document.getElementById("scoreTable");

  const scores = players.map(p => ({
    name: p.name,
    score: p.marks.filter(m => m === 1).length
  }));

  const max = Math.max(...scores.map(s => s.score), 0);

  table.innerHTML = `
    <tr><th>Name</th><th>Score</th><th>Status</th></tr>
  `;

  scores.forEach(s => {
    const win = s.score === max && max > 0;

    table.innerHTML += `
      <tr>
        <td>${s.name}</td>
        <td>${s.score}</td>
        <td>${win ? "🏆 WINNER" : "❌"}</td>
      </tr>
    `;
  });

  document.getElementById("winnerPot").innerText =
    document.getElementById("pot").innerText;
}

//
// 💰 POT
//
function updatePot() {
  const total = players.reduce((sum, p) => sum + p.bet, 0);
  document.getElementById("pot").innerText = total;
}

//
// 🔄 RESET
//
function resetGame() {
  localStorage.removeItem("players");
  location.reload();
}

//
// 🚀 INIT
//
renderPlayers();
updatePot();
updateScores();

function removePlayer(index) {
  if (!confirm("Remove this player from the game?")) return;

  players.splice(index, 1);

  save();
  renderPlayers();
  updatePot();
  updateScores();
}