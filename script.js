// 🎯 YOU EDIT THESE LISTS
const HEROES = [
  "Miya",
  "Karina",
  "Harith",
  "Masha",
  "Aulus",
  "Julian",
  "Saber",
  "Minotaur",
  "Khufra",
  "Gloo",
  "Xavier",
  "Freddrin",
  "Hayabusa",
  "Roger",
  "Gusion",
  "Esmeralda",
  "Barats",
  "Valentina",
  "Cyclops",
  "Pharsa",
  "Hanabi",
  "Yu Zhong",
  "Terry Bogart",
  "Floryn",
  "Rafaela",
  "Ruby",
  "Lesley",
  "Ling",
  "Edith",
  "Chou",
  "Lancelot",
  "Valir",
  "Benedetta"
];

const ITEMS = [
  "Blade of Despair",
  "Demon Hunter Sword",
  "Sea Halberd",
  "Golden Staff",
  "Berserker's Fury",
  "Haas's Claws",
  "War Axe",
  "Enchanted Talisman",
  "Feather of Heaven",
  "Glowing Wand",
  "Ice Queen Wand",
  "Holy Crystal",
  "Blade Armor",
  "Guardian Helmet",
  "Antique Cuirass",
  "Brute Force Breastplate",
  "Oracle",
  "Dominance Ice",
  "Ancient Wrath(Tuant)",
  "Winter Crown",
  "Feline Blade(PUSA)",
  "Purple Buff",
  "Claude's Theft Device"
];

let players = JSON.parse(localStorage.getItem("players")) || [];

function save() {
  localStorage.setItem("players", JSON.stringify(players));
}

//
// ➕ FORM
//
function openForm(index = null) {
  const form = document.getElementById("formContainer");
  const p = index !== null ? players[index] : null;

  form.innerHTML = `
    <div class="card">

      <input id="name" placeholder="Name" value="${p?.name || ""}">
      <input id="bet" type="number" placeholder="Bet" value="${p?.bet || ""}">

      ${createRound(1, p)}
      ${createRound(2, p)}
      ${createRound(3, p)}
      ${createRound(4, p)}

      <button onclick="savePlayer(${index})">💾 Save</button>
      <button onclick="closeForm()">❌ Cancel</button>

    </div>
  `;
}

function createRound(n, p) {
  return `
    <b>Round ${n}</b>

    <select class="r${n}h">
      <option value="">Select Hero</option>
      ${HEROES.map(h => `<option ${p?.rounds?.[n-1]?.[0] === h ? "selected" : ""}>${h}</option>`).join("")}
    </select>

    <select class="r${n}i">
      <option value="">Select Item</option>
      ${ITEMS.map(i => `<option ${p?.rounds?.[n-1]?.[1] === i ? "selected" : ""}>${i}</option>`).join("")}
    </select>
  `;
}

function closeForm() {
  document.getElementById("formContainer").innerHTML = "";
}

//
// 💾 SAVE
//
function savePlayer(index) {
  const form = document.getElementById("formContainer");

  const player = {
    name: form.querySelector("#name").value.trim(),
    bet: Number(form.querySelector("#bet").value || 0),

    rounds: [
      [form.querySelector(".r1h").value, form.querySelector(".r1i").value],
      [form.querySelector(".r2h").value, form.querySelector(".r2i").value],
      [form.querySelector(".r3h").value, form.querySelector(".r3i").value],
      [form.querySelector(".r4h").value, form.querySelector(".r4i").value]
    ],

    marks: index !== null && players[index]
      ? players[index].marks
      : [
          [0,0],
          [0,0],
          [0,0],
          [0,0]
        ]
  };

  if (!player.name) return alert("Enter name");

  if (index !== null) players[index] = player;
  else players.push(player);

  save();
  closeForm();
  renderPlayers();
  updatePot();
  updateScores();
}

//
// 📦 RENDER
//
function renderPlayers() {
  const container = document.getElementById("playersContainer");
  container.innerHTML = "";

  players.forEach((p, i) => {

    let html = `
      <div class="card">
        <b>${p.name}</b> (Bet: ${p.bet})
        <div id="r-${i}" style="display:none;margin-top:10px;">
    `;

    p.rounds.forEach((r, ri) => {
      html += `
        <b>Round ${ri + 1}</b>

        <div class="guess">
          <span>Hero: ${r[0]}</span>
          <button onclick="mark('${r[0]}',1)">✔</button>
          <button onclick="mark('${r[0]}',-1)">✖</button>
        </div>

        <div class="guess">
          <span>Item: ${r[1]}</span>
          <button onclick="mark('${r[1]}',1)">✔</button>
          <button onclick="mark('${r[1]}',-1)">✖</button>
        </div>
      `;
    });

    html += `
        </div>

        <button onclick="toggle(${i})">👁 Show/Hide</button>
        <button onclick="openForm(${i})">✏️ Edit</button>
        <button onclick="removePlayer(${i})" style="background:red;">🗑 Remove</button>
      </div>
    `;

    container.innerHTML += html;
  });
}

//
// 👁 TOGGLE
//
function toggle(i) {
  const el = document.getElementById(`r-${i}`);
  el.style.display = el.style.display === "none" ? "block" : "none";
}

//
// 🗑 REMOVE
//
function removePlayer(i) {
  if (!confirm("Remove player?")) return;
  players.splice(i, 1);
  save();
  renderPlayers();
  updatePot();
  updateScores();
}

//
// ✔ / ✖ SYNC
//
function mark(value, state) {
  players.forEach(p => {
    p.rounds.forEach((r, ri) => {
      r.forEach((g, gi) => {
        if (g === value) {
          p.marks[ri][gi] = state;
        }
      });
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

  const scores = players.map(p => {
    let score = 0;
    p.marks.forEach(r => r.forEach(m => m === 1 && score++));
    return { name: p.name, score };
  });

  const max = Math.max(...scores.map(s => s.score), 0);

  table.innerHTML = `<tr><th>Name</th><th>Score</th><th>Status</th></tr>`;

  scores.forEach(s => {
    table.innerHTML += `
      <tr>
        <td>${s.name}</td>
        <td>${s.score}</td>
        <td>${s.score === max && max > 0 ? "🏆 WINNER" : "❌"}</td>
      </tr>
    `;
  });

  winnerPot.innerText = pot.innerText;
}

//
// 💰 POT
//
function updatePot() {
  pot.innerText = players.reduce((a, p) => a + p.bet, 0);
}

//
// 🔄 RESET
//
function resetGame() {
  localStorage.removeItem("players");
  location.reload();
}
function renderCheckerPanel() {
  const container = document.getElementById("checkerPanel");

  const rounds = [[], [], [], []];

  // collect guesses per round
  players.forEach(p => {
    p.rounds.forEach((r, i) => {
      r.forEach(g => {
        if (g && !rounds[i].includes(g)) {
          rounds[i].push(g);
        }
      });
    });
  });

  let html = `<div class="card"><h2>🎯 Checker Panel</h2>`;

  rounds.forEach((r, ri) => {
    html += `<h3>Round ${ri + 1}</h3>`;

    r.forEach(g => {
      html += `
        <div class="guess">
          <span>${g}</span>
          <button onclick="mark('${g}',1)">✔</button>
          <button onclick="mark('${g}',-1)">✖</button>
        </div>
      `;
    });
  });

  html += `</div>`;

  container.innerHTML = html;
}
renderPlayers();
updatePot();
updateScores();
renderCheckerPanel();
