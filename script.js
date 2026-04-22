// ===============================
// 🔥 FIREBASE SETUP
// ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  onValue
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCdZb1-Wd_zDE3WqyqtNISpX2Iji9ihCU",
  authDomain: "sb-fb-4cd02.firebaseapp.com",
  databaseURL: "https://sb-fb-4cd02-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sb-fb-4cd02",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const playersRef = ref(db, "players");

// ===============================
// 🎯 DATA
// ===============================
let players = [];

// LIVE SYNC
onValue(playersRef, (snap) => {
  players = snap.val() || [];
  renderAll();
});

// ===============================
// 🎮 HEROES / ITEMS
// ===============================
const HEROES = [
  "Miya","Karina","Harith","Masha","Aulus","Julian","Saber","Minotaur",
  "Khufra","Gloo","Xavier","Hayabusa","Roger","Gusion","Esmeralda",
  "Valentina","Pharsa","Hanabi","Ling","Chou","Lancelot","Valir"
];

const ITEMS = [
  "Blade of Despair","Demon Hunter Sword","Sea Halberd","Golden Staff",
  "Berserker's Fury","Haas's Claws","War Axe","Enchanted Talisman",
  "Glowing Wand","Ice Queen Wand","Holy Crystal","Oracle","Dominance Ice"
];

// ===============================
// ➕ OPEN FORM
// ===============================
window.openForm = function(index = null) {
  const p = players[index];

  document.getElementById("formContainer").innerHTML = `
    <div class="card">
      <input id="name" placeholder="Name" value="${p?.name || ""}">
      <input id="bet" type="number" placeholder="Bet" value="${p?.bet || 0}">

      ${round(1,p)}
      ${round(2,p)}
      ${round(3,p)}
      ${round(4,p)}

      <button onclick="savePlayer(${index ?? 'null'})">💾 Save Player</button>
      <button onclick="closeForm()">❌ Cancel</button>
    </div>
  `;
};

function round(n,p){
  return `
    <b>Round ${n}</b>
    <input class="r${n}h" placeholder="Hero" value="${p?.rounds?.[n-1]?.[0] || ""}">
    <input class="r${n}i" placeholder="Item" value="${p?.rounds?.[n-1]?.[1] || ""}">
  `;
}

// ===============================
// ❌ CLOSE FORM
// ===============================
window.closeForm = function(){
  document.getElementById("formContainer").innerHTML = "";
};

// ===============================
// 💾 SAVE PLAYER (FIXED)
// ===============================
window.savePlayer = async function(index) {

  const f = document.getElementById("formContainer");

  const player = {
    name: f.querySelector("#name").value.trim(),
    bet: Number(f.querySelector("#bet").value || 0),
    rounds: [
      [f.querySelector(".r1h").value, f.querySelector(".r1i").value],
      [f.querySelector(".r2h").value, f.querySelector(".r2i").value],
      [f.querySelector(".r3h").value, f.querySelector(".r3i").value],
      [f.querySelector(".r4h").value, f.querySelector(".r4i").value]
    ],
    marks: [[0,0],[0,0],[0,0],[0,0]]
  };

  if (!player.name) return alert("Enter name");

  // SAFELY rebuild from current memory
  let updated = players ? [...players] : [];

  if (index != null) {
    updated[index] = player;
  } else {
    updated.push(player);
  }

  // FORCE SYNC
  await set(playersRef, updated);

  closeForm();
};
// ===============================
// 🗑 REMOVE PLAYER
// ===============================
window.removePlayer = async function(i){
  players.splice(i,1);
  await set(playersRef, players);
};

// ===============================
// ✔ ✖ CHECKER (ROUND SAFE FIX)
// ===============================
window.mark = async function(value, round, state){

  players.forEach(p=>{
    p.rounds.forEach((r,i)=>{
      if(i !== round) return;

      r.forEach((g,gi)=>{
        if(g === value){
          p.marks[i][gi] = state;
        }
      });
    });
  });

  await set(playersRef, players);
};

// ===============================
// 📦 RENDER PLAYERS
// ===============================
function renderPlayers(){
  const c = document.getElementById("playersContainer");
  c.innerHTML="";

  players.forEach((p,i)=>{
    let html = `<div class="card"><b>${p.name}</b> (${p.bet})`;

    p.rounds.forEach((r,ri)=>{
      html += `<div>Round ${ri+1}: ${r[0]} / ${r[1]}</div>`;
    });

    html += `
      <button onclick="openForm(${i})">✏️ Edit</button>
      <button onclick="removePlayer(${i})">🗑 Remove</button>
    </div>`;

    c.innerHTML += html;
  });
}

// ===============================
// 🎯 CHECKER PANEL
// ===============================
function renderChecker(){

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

  el.innerHTML = html + "</div>";
}

// ===============================
// 💰 POT + SCORE
// ===============================
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

// ===============================
// 🔄 MASTER RENDER
// ===============================
function renderAll(){
  renderPlayers();
  renderChecker();
  updatePot();
  updateScores();
}

// ===============================
// 🧷 INIT GLOBALS (IMPORTANT FIX)
// ===============================
window.openForm = openForm;
window.closeForm = closeForm;
window.savePlayer = savePlayer;
window.removePlayer = removePlayer;
window.mark = mark;
