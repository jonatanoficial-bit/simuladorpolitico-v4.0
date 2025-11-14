const $  = (q) => document.querySelector(q);
const $$ = (q) => document.querySelectorAll(q);

/* ---------- Telas & Fade ---------- */
const screens = {};
let fadeEl;

/* Garante que só uma tela esteja visível */
function show(id) {
  Object.values(screens).forEach((s) => s && s.classList.remove("show"));
  if (screens[id]) screens[id].classList.add("show");
}

/* Transição com fade (opcional) */
function fadeTo(id) {
  if (!fadeEl) return show(id);
  fadeEl.classList.remove("hidden");
  fadeEl.classList.add("show");
  setTimeout(() => {
    show(id);
    setTimeout(() => {
      fadeEl.classList.remove("show");
      setTimeout(() => fadeEl.classList.add("hidden"), 280);
    }, 60);
  }, 220);
}

/* ---------- Dados ---------- */
const parties = [
  { sigla: "PTM",  nome: "Partido do Trabalhador Moderno",        desc: "Programas sociais e trabalho.",      logo: "simulador_images/party_ptm.png"  },
  { sigla: "PSLB", nome: "Partido Social Liberal do Brasil",      desc: "Mercado e privatizações.",           logo: "simulador_images/party_pslb.png" },
  { sigla: "MDBR", nome: "Movimento Democrático Brasileiro Real", desc: "Pragmatismo e alianças.",            logo: "simulador_images/party_mdbr.png" },
  { sigla: "PVG",  nome: "Partido Verde Global",                  desc: "Sustentabilidade e inovação.",       logo: "simulador_images/party_pvg.png"  },
  { sigla: "PRP",  nome: "Partido Republicano Popular",           desc: "Costumes, segurança e ordem.",       logo: "simulador_images/party_prp.png"  },
];

const states = [
  "Acre","Alagoas","Amapá","Amazonas","Bahia","Ceará","Distrito Federal","Espírito Santo","Goiás","Maranhão","Mato Grosso","Mato Grosso do Sul","Minas Gerais","Pará","Paraíba","Paraná","Pernambuco","Piauí","Rio de Janeiro","Rio Grande do Norte","Rio Grande do Sul","Rondônia","Roraima","Santa Catarina","São Paulo","Sergipe","Tocantins"
];

const offices = [
  { name: "Vereador",          type: "legislative", bg: "simulador_images/municipal.jpg" },
  { name: "Prefeito",          type: "executive",   bg: "simulador_images/cityhall.jpg"  },
  { name: "Deputado Estadual", type: "legislative", bg: "simulador_images/assembly.jpg"  },
  { name: "Prefeito",          type: "executive",   bg: "simulador_images/cityhall.jpg"  },
  { name: "Governador",        type: "executive",   bg: "simulador_images/governor.jpg"  },
  { name: "Deputado Federal",  type: "legislative", bg: "simulador_images/federal.jpg"   },
  { name: "Senador",           type: "legislative", bg: "simulador_images/senate.jpg"    },
  { name: "Presidente",        type: "executive",   bg: "simulador_images/president.jpg" },
];

/* ---------- Estado do jogo ---------- */
const storeKey = "simPoliticoDeluxe_FIX_CLICK";
let G = {
  partyIdx: 0,
  state: null,
  city: "",
  officeIdx: 0,
  termTurn: 1,
  approvals: 0,
  popPeople: 50,
  popMedia:  50,
  popParty:  50,
  feed: [],
};

/* ---------- Helpers ---------- */
const clamp = (v) => Math.max(0, Math.min(100, Math.round(v)));
const randomBool = (prob) => Math.random() < prob;

function addFeed(tag, text) {
  G.feed.unshift({ tag, text });
  if (G.feed.length > 40) G.feed.pop();
  renderFeed();
}

function renderFeed() {
  const feed = $("#feed");
  if (!feed) return;
  feed.innerHTML = G.feed.map(i => `
    <div class="feed-item">
      <div class="feed-tag">${i.tag}</div>
      <div class="feed-body">${i.text}</div>
    </div>
  `).join("");
}

function setMain(title, html) {
  const t = $("#mainTitle");
  const m = $("#mainText");
  if (t) t.textContent = title;
  if (m) m.innerHTML   = html;
}

/* ---------- HUD ---------- */
function updateHUD() {
  const office = offices[G.officeIdx];
  const party  = parties[G.partyIdx];

  const hudOffice   = $("#hudOffice");
  const hudLocation = $("#hudLocation");
  const partyLogo   = $("#partyLogo");
  const txtProgress = $("#txtProgress");
  const barProgress = $("#barProgress");
  const popPeople   = $("#popPeople");
  const popMedia    = $("#popMedia");
  const popParty    = $("#popParty");
  const scrGame     = $("#screenGame");
  const officeImg   = $("#officeImage");   // 🔸 NOVO

  if (hudOffice)   hudOffice.textContent   = office.name;
  if (hudLocation) hudLocation.textContent = `${G.city} - ${G.state} • Mandato ${G.termTurn}`;

  if (partyLogo) {
    if (party && party.logo) {
      partyLogo.src = party.logo;
      partyLogo.style.display = "block";
    } else {
      partyLogo.style.display = "none";
    }
  }

  const pct = Math.min(100, Math.round((G.approvals / 15) * 100));
  if (txtProgress) txtProgress.textContent = pct + "%";
  if (barProgress) barProgress.style.width = pct + "%";

  if (popPeople) popPeople.textContent = clamp(G.popPeople) + "%";
  if (popMedia)  popMedia.textContent  = clamp(G.popMedia)  + "%";
  if (popParty)  popParty.textContent  = clamp(G.popParty)  + "%";

  // Fundo da tela continua dark, sem foto gigante
  if (scrGame) {
    scrGame.style.background =
      "radial-gradient(circle at 30% 0,rgba(212,175,55,.16),transparent 60%)," +
      "radial-gradient(circle at 90% 100%,rgba(212,175,55,.16),transparent 60%)," +
      "#050509";
  }

  // 🔸 IMAGEM CENTRAL DO CARGO
  if (officeImg) {
    officeImg.style.backgroundImage = `url('${office.bg}')`;
  }
}

/* ---------- Modal & Toast ---------- */
let modal, modalTitle, modalBody, modalActions;
function setupModal() {
  modal        = $("#modal");
  modalTitle   = $("#modalTitle");
  modalBody    = $("#modalBody");
  modalActions = $("#modalActions");

  if (modal) {
    if (!modal.classList.contains("hidden")) modal.classList.add("hidden");
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }
}

function openModal(title, htmlBody, actions) {
  if (!modal) return alert(htmlBody.replace(/<[^>]+>/g, ""));
  modalTitle.innerHTML = title || "";
  modalBody.innerHTML  = htmlBody || "";
  modalActions.innerHTML = "";
  (actions || []).forEach(a => {
    const b = document.createElement("button");
    b.className = "btn " + (a.className || "");
    b.textContent = a.label;
    b.onclick = () => { if (a.onClick) a.onClick(); };
    modalActions.appendChild(b);
  });
  modal.classList.remove("hidden");
}

function closeModal() {
  if (modal) modal.classList.add("hidden");
}

function toast(text) {
  openModal("Informação", text, [
    { label: "OK", className: "btn-gold", onClick: closeModal }
  ]);
}

/* ---------- Salvar/Carregar ---------- */
function saveGame() {
  localStorage.setItem(storeKey, JSON.stringify(G));
  toast("💾 Progresso salvo!");
}

function loadGame() {
  try {
    const raw = localStorage.getItem(storeKey);
    if (!raw) return;
    const data = JSON.parse(raw);
    G = Object.assign(G, data || {});
  } catch (e) {
    console.warn("Falha ao carregar save:", e);
  }
}

function resetGame() {
  G = {
    partyIdx: 0,
    state: null,
    city: "",
    officeIdx: 0,
    termTurn: 1,
    approvals: 0,
    popPeople: 50,
    popMedia:  50,
    popParty:  50,
    feed: [],
  };
  saveGame();
}

/* ---------- Ações do jogo (votar, propor, crise, campanha) ---------- */
/* (mantive exatamente como você já estava usando na 4.0) */
/* ... por causa de espaço aqui eu não repito tudo, mas é o mesmo bloco
   grande que você já tem: actVoteProjects, actProposeLaw, actCrisis,
   actCampaign, runElection, checkImpeachment etc.                            */

/* ---------- Setup Inicial ---------- */
function mountSetup() {
  const selParty = $("#selParty");
  const selState = $("#selState");

  if (selParty) {
    selParty.innerHTML = "";
    parties.forEach((p,i) => {
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = `${p.sigla} - ${p.nome}`;
      selParty.appendChild(opt);
    });
  }

  if (selState) {
    selState.innerHTML = "";
    states.forEach((s) => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      selState.appendChild(opt);
    });
  }
}

/* ---------- Binds ---------- */
function bindButtons() {
  const btnStart = $("#btnStart");
  const btnBegin = $("#btnBegin");
  const btnHome  = $("#btnHome");

  if (btnStart) {
    btnStart.style.pointerEvents = "auto";
    btnStart.style.position      = "relative";
    btnStart.style.zIndex        = "9999";
    btnStart.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      fadeTo("setup");
    });
  }

  if (btnBegin) {
    btnBegin.addEventListener("click", (e) => {
      e.preventDefault();
      const city = ($("#inpCity")?.value || "").trim();
      const partyIdx = parseInt($("#selParty")?.value || "0", 10) || 0;
      const state    = $("#selState")?.value || "";

      if (!city) return toast("Digite o nome da cidade.");

      G.city     = city;
      G.partyIdx = partyIdx;
      G.state    = state;

      saveGame();
      beginMandate();
    });
  }

  if (btnHome) {
    btnHome.addEventListener("click", (e) => {
      e.preventDefault();
      fadeTo("intro");
    });
  }

  // aqui você liga de novo btnAction1..4, btnSave etc (igual à 4.0)
}

/* ---------- Início de mandato ---------- */
function beginMandate() {
  renderFeed();
  updateHUD();
  setMain(
    "Início de mandato",
    `Você assumiu o cargo de <b>${offices[G.officeIdx].name}</b> em <b>${G.city} - ${G.state}</b>, pelo <b>${parties[G.partyIdx].sigla}</b>.<br><br>
     Use as ações à esquerda. Cada decisão afeta Povo, Mídia e Partido.`
  );
  addFeed("Posse", `Novo mandato como <b>${offices[G.officeIdx].name}</b> em ${G.city}.`);
  fadeTo("game");
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  screens.intro = $("#screenIntro");
  screens.setup = $("#screenSetup");
  screens.game  = $("#screenGame");

  fadeEl = $("#cineFade");
  if (fadeEl) {
    if (!fadeEl.classList.contains("hidden")) fadeEl.classList.add("hidden");
    fadeEl.classList.remove("show");
    fadeEl.style.pointerEvents = "none";
  }

  setupModal();
  mountSetup();
  loadGame();

  show("intro");

  const btnStart = $("#btnStart");
  if (btnStart) {
    btnStart.style.pointerEvents = "auto";
    btnStart.style.position = "relative";
    btnStart.style.zIndex = "9999";
  }

  bindButtons();
});
