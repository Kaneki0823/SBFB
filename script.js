// 🎯 DATA
const HEROES = ["Miya","Karina","Harith","Masha","Aulus","Julian","Saber","Minotaur","Khufra","Gloo","Xavier","Freddrin","Hayabusa","Roger","Gusion","Esmeralda","Barats","Valentina","Cyclops","Pharsa","Hanabi","Yu Zhong","Floryn","Rafaela","Ruby","Lesley","Ling","Edith","Chou","Lancelot","Valir","Benedetta"];

const ITEMS = ["Blade of Despair","Demon Hunter Sword","Sea Halberd","Golden Staff","Berserker's Fury","Haas's Claws","War Axe","Enchanted Talisman","Feather of Heaven","Glowing Wand","Ice Queen Wand","Holy Crystal","Blade Armor","Guardian Helmet","Antique Cuirass","Brute Force Breastplate","Oracle","Dominance Ice","Winter Crown","Purple Buff","Claude's Theft Device"];

let players = JSON.parse(localStorage.getItem("players")) || [];

function save(){
  localStorage.setItem("players", JSON.stringify(players));
}

//////////////////////////////////////////////////////
// ➕ FORM
//////////////////////////////////////////////////////

function openForm(index = null){
  const p = players[index];

  document.getElementById("formContainer").innerHTML = `
    <div class="card">
      <input id="name" placeholder="Name" value="${p?.name || ""}">
      <input id="bet" type="number" placeholder="Bet" value="${p?.bet || 0}">

      ${roundUI(1,p)}
      ${roundUI(2,p)}
      ${roundUI(3,p)}
      ${roundUI(4,p)}

      <button onclick="savePlayer(${index ?? 'null'})">💾 Save</button>
      <button onclick="closeForm()">❌ Cancel</button>
    </div>
  `;
}

function roundUI(n,p){
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

function closeForm(){
  document.getElementById("formContainer").innerHTML="";
}

//////////////////////////////////////////////////////
// 💾 SAVE
//////////////////////////////////////////////////////

function savePlayer(index){
  const f = document.getElementById("formContainer");

  const player = {
    name: f.querySelector("#name").value.trim(),
    bet: Number(f.querySelector("#bet").value || 0),

    rounds: [
      [f.querySelector(".r1h").value,f.querySelector(".r1i").value],
      [f.querySelector(".r2h").value,f.querySelector(".r2i").value],
      [f.querySelector(".r3h").value,f.querySelector(".r3i").value],
      [f.querySelector(".r4h").value,f.querySelector(".r4i").value]
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

//////////////////////////////////////////////////////
// 📦 PLAYERS
//////////////////////////////////////////////////////

function renderPlayers(){
  const c = document.getElementById("playersContainer");
  c.innerHTML="";

  players.forEach((p,i)=>{
    let html = `<div class="card"><b>${p.name}</b> (${p.bet})`;

    p.rounds.forEach((r,ri)=>{
      html += `
        <div>Round ${ri+1}</div>
        <div>${r[0]}</div>
        <div>${r[1]}</div>
      `;
    });

    html += `
      <button onclick="openForm(${i})">✏️ Edit</button>
      <button onclick="removePlayer(${i})">🗑 Remove</button>
    </div>`;

    c.innerHTML += html;
  });
}

function removePlayer(i){
  players.splice(i,1);
  save();
  renderAll();
}

//////////////////////////////////////////////////////
// 🎯 FIXED MARK LOGIC (IMPORTANT)
//////////////////////////////////////////////////////

function mark(value, round, state){

  players.forEach(p=>{
    p.rounds.forEach((r,i)=>{
      if(i !== round) return; // ✅ ONLY SAME ROUND

      r.forEach((g,gi)=>{
        if(g === value){
          p.marks[i][gi] = state;
        }
      });
    });
  });

  save();
  renderAll();
}

//////////////////////////////////////////////////////
// 🎯 CHECKER
//////////////////////////////////////////////////////

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
      html+=`
        <div class="guess">
          <span>${g}</span>
          <button onclick="mark('${g}',${i},1)">✔</button>
          <button onclick="mark('${g}',${i},-1)">✖</button>
        </div>
      `;
    });
  });

  el.innerHTML=html+"</div>";
}

//////////////////////////////////////////////////////
// 💰 POT + SCORE
//////////////////////////////////////////////////////

function updatePot(){
  document.getElementById("pot").innerText =
    players.reduce((a,p)=>a+(p.bet||0),0);
}

function updateScores(){
  const t=document.getElementById("scoreTable");

  let arr = players.map(p=>{
    let s=0;
    p.marks.forEach(r=>r.forEach(v=>v===1&&s++));
    return {name:p.name,score:s};
  });

  let max=Math.max(...arr.map(a=>a.score),0);

  t.innerHTML=`<tr><th>Name</th><th>Score</th><th>Status</th></tr>`;

  arr.forEach(s=>{
    t.innerHTML+=`
      <tr>
        <td>${s.name}</td>
        <td>${s.score}</td>
        <td>${s.score===max&&max>0?"🏆 WINNER":"❌"}</td>
      </tr>
    `;
  });

  document.getElementById("winnerPot").innerText =
    document.getElementById("pot").innerText;
}

//////////////////////////////////////////////////////
// 🔄 MASTER RENDER
//////////////////////////////////////////////////////

function renderAll(){
  renderPlayers();
  renderCheckerPanel();
  updatePot();
  updateScores();
}

function resetGame(){
  localStorage.removeItem("players");
  location.reload();
}

renderAll();
