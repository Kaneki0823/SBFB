// 🎯 LISTS
const HEROES = [/* keep your list unchanged */ "Miya","Karina","Harith","Masha","Aulus","Julian","Saber","Minotaur","Khufra","Gloo","Xavier","Freddrin","Hayabusa","Roger","Gusion","Esmeralda","Barats","Valentina","Cyclops","Pharsa","Hanabi","Yu Zhong","Terry Bogart","Floryn","Rafaela","Ruby","Lesley","Ling","Edith","Chou","Lancelot","Valir","Benedetta"];

const ITEMS = [/* keep your list unchanged */ "Blade of Despair","Demon Hunter Sword","Sea Halberd","Golden Staff","Berserker's Fury","Haas's Claws","War Axe","Enchanted Talisman","Feather of Heaven","Glowing Wand","Ice Queen Wand","Holy Crystal","Blade Armor","Guardian Helmet","Antique Cuirass","Brute Force Breastplate","Oracle","Dominance Ice","Ancient Wrath(Tuant)","Winter Crown","Feline Blade(PUSA)","Purple Buff","Claude's Theft Device"];

// 📦 DATA
let players = JSON.parse(localStorage.getItem("players")) || [];

// 💾 SAVE
function save() {
  localStorage.setItem("players", JSON.stringify(players));
}

// ➕ OPEN FORM
function openForm(index = null) {
  const form = document.getElementById("formContainer");
  const p = players[index];

  form.innerHTML = `
    <div class="card">
      <input id="name" placeholder="Name" value="${p?.name || ""}">
      <input id="bet" type="number" placeholder="Bet" value="${p?.bet || ""}">

      ${createRound(1,p)}
      ${createRound(2,p)}
      ${createRound(3,p)}
      ${createRound(4,p)}

      <button onclick="savePlayer(${index})">💾 Save</button>
      <button onclick="closeForm()">❌ Cancel</button>
    </div>
  `;
}

// 🎯 ROUND UI
function createRound(n,p){
  return `
    <b>Round ${n}</b>

    <select class="r${n}h">
      ${HEROES.map(h=>`<option ${p?.rounds?.[n-1]?.[0]===h?"selected":""}>${h}</option>`).join("")}
    </select>

    <select class="r${n}i">
      ${ITEMS.map(i=>`<option ${p?.rounds?.[n-1]?.[1]===i?"selected":""}>${i}</option>`).join("")}
    </select>
  `;
}

// ❌ CLOSE
function closeForm(){
  document.getElementById("formContainer").innerHTML="";
}

// 💾 SAVE PLAYER (FIXED)
function savePlayer(index){
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

    marks: [[0,0],[0,0],[0,0],[0,0]]
  };

  if(!player.name) return alert("Enter name");

  if(index != null) players[index] = player;
  else players.push(player);

  save();
  closeForm();
  renderAll();
}

// 📦 RENDER ALL (IMPORTANT FIX)
function renderAll(){
  renderPlayers();
  updatePot();
  updateScores();
  renderCheckerPanel();
}

// 👥 PLAYERS
function renderPlayers(){
  const c = document.getElementById("playersContainer");
  c.innerHTML="";

  players.forEach((p,i)=>{
    let html = `
      <div class="card">
        <b>${p.name}</b> (${p.bet})

        <button onclick="openForm(${i})">✏️ Edit</button>
        <button onclick="removePlayer(${i})">🗑 Remove</button>
    `;

    p.rounds.forEach((r,ri)=>{
      html += `
        <div>Round ${ri+1}</div>

        <div class="guess">${r[0]}</div>
        <div class="guess">${r[1]}</div>
      `;
    });

    html += `</div>`;
    c.innerHTML += html;
  });
}

// 🗑 REMOVE
function removePlayer(i){
  if(!confirm("Remove player?")) return;
  players.splice(i,1);
  save();
  renderAll();
}

// 💰 POT
function updatePot(){
  const el = document.getElementById("pot");
  el.innerText = players.reduce((a,p)=>a+(p.bet||0),0);
}

// 🏆 SCORES
function updateScores(){
  const table = document.getElementById("scoreTable");

  let arr = players.map(p=>{
    let s=0;
    p.marks.forEach(r=>r.forEach(v=>v===1&&s++));
    return {name:p.name,score:s};
  });

  let max = Math.max(...arr.map(a=>a.score),0);

  table.innerHTML = `<tr><th>Name</th><th>Score</th><th>Status</th></tr>`;

  arr.forEach(s=>{
    table.innerHTML += `
      <tr>
        <td>${s.name}</td>
        <td>${s.score}</td>
        <td>${s.score===max&&max>0?"🏆 WINNER":"❌"}</td>
      </tr>
    `;
  });
}

// 🎯 CHECKER PANEL (FIXED)
function renderCheckerPanel(){
  const el = document.getElementById("checkerPanel");

  let rounds=[[],[],[],[]];

  players.forEach(p=>{
    p.rounds.forEach((r,i)=>{
      r.forEach(g=>{
        if(g && !rounds[i].includes(g)) rounds[i].push(g);
      });
    });
  });

  let html=`<div class="card">`;

  rounds.forEach((r,i)=>{
    html+=`<h3>Round ${i+1}</h3>`;
    r.forEach(g=>{
      html+=`<div>${g}</div>`;
    });
  });

  el.innerHTML=html+"</div>";
}

// 🔄 INIT
renderAll();
