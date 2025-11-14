// =========================
// Simulador Político 4.0
// game.js (com imagem central do cenário)
// =========================

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
  "Acre","Alagoas","Amapá","Amazonas","Bahia","Ceará","Distrito Federal","Espírito Santo",
  "Goiás","Maranhão","Mato Grosso","Mato Grosso do Sul","Minas Gerais","Pará","Paraíba",
  "Paraná","Pernambuco","Piauí","Rio de Janeiro","Rio Grande do Norte","Rio Grande do Sul",
  "Rondônia","Roraima","Santa Catarina","São Paulo","Sergipe","Tocantins"
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
  const officeImg   = $("#officeImage"); // div da imagem central

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

  // fundo geral dark com brilho dourado
  if (scrGame) {
    scrGame.style.background =
      "radial-gradient(circle at 30% 0,rgba(212,175,55,.16),transparent 60%)," +
      "radial-gradient(circle at 90% 100%,rgba(212,175,55,.16),transparent 60%)," +
      "#050509";
  }

  // imagem central do cargo
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

/* ---------- Ações do jogo ---------- */

function actVoteProjects() {
  const projetos = [
    "Reforma da frota de ônibus",
    "Programa de segurança nos bairros",
    "Requalificação de escolas públicas",
    "Incentivo fiscal para pequenas empresas",
    "Criação de parque urbano",
  ];
  const p = projetos[Math.floor(Math.random() * projetos.length)];
  const total = 30 + Math.floor(Math.random() * 40);
  const baseYes = 0.4 + Math.random() * 0.3;
  const yes = Math.round(total * baseYes);
  const no  = total - yes;
  const passa = yes > no;

  openModal(
    "Votação em plenário",
    `Em pauta: <b>${p}</b>.<br><br>Placar parcial:<br><b>${yes}</b> votos SIM • <b>${no}</b> votos NÃO.<br><br>Como você deseja votar?`,
    [
      { label:"Votar SIM", className:"btn-gold", onClick:()=>{ closeModal(); resolveVote(true,  passa, p); } },
      { label:"Votar NÃO",                    onClick:()=>{ closeModal(); resolveVote(false, passa, p); } },
    ]
  );
}

function resolveVote(votouSim, passou, projeto) {
  let dPovo=0, dMidia=0, dPart=0;

  if (passou && votouSim) {
    dPovo+=3; dMidia+=2; dPart+=2;
    G.approvals++;
    addFeed("Votação", `Você apoiou <b>${projeto}</b>, aprovado em plenário. A população gostou.`);
  } else if (!passou && !votouSim) {
    dPovo+=1; dMidia+=2; dPart+=1;
    addFeed("Votação", `Você se posicionou contra <b>${projeto}</b>, rejeitado em plenário.`);
  } else {
    dPovo-=2; dMidia-=1;
    addFeed("Votação", `Sua posição em <b>${projeto}</b> desagradou parte do eleitorado.`);
  }

  G.popPeople += dPovo;
  G.popMedia  += dMidia;
  G.popParty  += dPart;
  G.termTurn  += 1;

  updateHUD();
  setMain(
    "Resultado da votação",
    `Impactos:<br>
     Povo: ${(dPovo>=0?"+":"")+dPovo}%<br>
     Mídia: ${(dMidia>=0?"+":"")+dMidia}%<br>
     Partido: ${(dPart>=0?"+":"")+dPart}%`
  );
}

function actProposeLaw() {
  const ideias = [
    "Programa de Wi-Fi público nas praças",
    "Criação de corredor exclusivo de ônibus",
    "Implantação de hortas comunitárias",
    "Plano de valorização do magistério",
    "Projeto de lei anti-desperdício de alimentos"
  ];
  const p = ideias[Math.floor(Math.random() * ideias.length)];

  openModal(
    "Propor novo projeto",
    `Você está prestes a protocolar o projeto:<br><br><b>${p}</b><br><br>Deseja enviar para tramitação?`,
    [
      { label:"Protocolar projeto", className:"btn-gold", onClick:()=>{
          closeModal();
          const chanceBase = 0.5;
          const bonusPart  = (G.popParty - 50) / 200; // -0.25 a +0.25
          const aprovado   = randomBool(chanceBase + bonusPart);

          if (aprovado) {
            G.approvals++;
            G.popPeople += 3;
            G.popMedia  += 2;
            G.popParty  += 2;
            addFeed("Projeto aprovado", `Seu projeto <b>${p}</b> foi aprovado com apoio amplo.`);
            setMain(
              "Projeto aprovado",
              `Seu projeto <b>${p}</b> foi aprovado!<br><br>
               A população e a mídia reagiram positivamente. Seus aliados de partido também ficaram satisfeitos.`
            );
          } else {
            G.popPeople -= 1;
            G.popMedia  -= 2;
            addFeed("Projeto rejeitado", `O projeto <b>${p}</b> travou nas comissões e foi rejeitado.`);
            setMain(
              "Projeto rejeitado",
              `O projeto <b>${p}</b> não avançou e foi rejeitado nas comissões.<br><br>
               Parte da imprensa criticou sua articulação política.`
            );
          }

          G.termTurn += 1;
          updateHUD();
        }},
      { label:"Desistir", onClick: closeModal },
    ]
  );
}

function actCrisis() {
  const office = offices[G.officeIdx];

  const crises = (office.type === "executive")
    ? [
        { area:"Saúde",     op:["Mutirão de consultas","Construir nova UPA","Repassar recursos a hospitais"], impact:[+3,+4,+2] },
        { area:"Segurança", op:["Aumentar policiamento","Investir em iluminação pública","Criar guarda comunitária"], impact:[+3,+2,+2] },
        { area:"Economia",  op:["Reduzir impostos","Atrair empresas","Programa de qualificação"], impact:[+2,+3,+3] },
      ]
    : [
        { area:"Transporte", op:["Audiência pública","Relatório técnico","Emenda a projeto"], impact:[+2,+2,+1] },
        { area:"Educação",   op:["Reunião com professores","Visita a escolas","Proposta de comissão"], impact:[+2,+1,+2] },
      ];

  const c = crises[Math.floor(Math.random() * crises.length)];
  let body = `Crise em <b>${c.area}</b>.<br><br>Qual estratégia você deseja adotar?<br><br>`;
  c.op.forEach((o,i) => { body += `<b>${i+1}.</b> ${o}<br>`; });

  const actions = c.op.map((o,i) => ({
    label: o,
    className: i===0 ? "btn-gold" : "",
    onClick: () => {
      closeModal();
      let delta = c.impact[i];
      if (randomBool(0.25)) delta -= 2; // ruído negativo eventual

      G.popPeople += delta;
      G.popMedia  += (delta > 0 ? 1 : -1);
      G.popParty  += (delta >= 0 ? 1 : -2);
      G.termTurn  += 1;

      addFeed("Crise", `Você atuou na área de <b>${c.area}</b> com a medida: ${o}.`);
      setMain(
        "Gestão de crise",
        `Sua decisão na área de <b>${c.area}</b> teve impacto de ${(delta>=0?"+":"")+delta}% na percepção popular.<br><br>
         A mídia e o partido reagiram de forma ${delta>=0?"majoritariamente positiva":"crítica"}.`
      );

      updateHUD();
      checkImpeachment();
    }
  }));

  openModal("Gestão de crise", body, actions);
}

function actCampaign() {
  if (clamp(G.popPeople) < 60) {
    toast("Sua popularidade com o povo ainda não é suficiente (mínimo 60%) para disputar o próximo cargo.");
    return;
  }
  const next = offices[Math.min(offices.length - 1, G.officeIdx + 1)];

  openModal(
    "Campanha eleitoral",
    `Você deseja lançar sua campanha para <b>${next.name}</b>?<br><br>
     Uma campanha bem-sucedida depende da popularidade atual e de alguns discursos estratégicos.`,
    [
      { label:"Lançar campanha", className:"btn-gold", onClick:()=>{ closeModal(); runElection(next); } },
      { label:"Ainda não", onClick: closeModal },
    ]
  );
}

function runElection(nextOffice) {
  const base = (clamp(G.popPeople) + clamp(G.popMedia) + clamp(G.popParty)) / 3;
  let pontos = 0;
  for (let i=0; i<5; i++) {
    const prob = 0.45 + (base / 200);
    if (randomBool(prob)) pontos++;
  }

  if (pontos >= 3) {
    addFeed("Eleições", `Você foi eleito para o cargo de <b>${nextOffice.name}</b>!`);
    G.officeIdx = offices.indexOf(nextOffice);
    G.termTurn  = 1;
    G.approvals = 0;
    G.popMedia += 2;

    setMain(
      "Vitória nas urnas",
      `Sua campanha foi bem-sucedida e você foi eleito <b>${nextOffice.name}</b>!<br><br>
       Um novo ciclo de poder se inicia. Continue administrando com cuidado para manter a confiança do povo.`
    );
  } else {
    addFeed("Eleições", `Sua campanha para <b>${nextOffice.name}</b> não conquistou votos suficientes.`);
    G.popPeople -= 5;
    G.popMedia  -= 3;

    setMain(
      "Derrota eleitoral",
      `Apesar dos esforços, a campanha não teve votos suficientes.<br><br>
       Sua popularidade caiu um pouco, mas você pode continuar trabalhando e tentar novamente.`
    );
  }

  updateHUD();
  saveGame();
}

function checkImpeachment() {
  if (clamp(G.popPeople) <= 0) {
    addFeed("Crise máxima", "Popularidade com o povo chegou a 0%. Você sofreu impeachment!");
    setMain(
      "Impeachment",
      `Sua popularidade desabou e você sofreu <b>impeachment</b>.<br><br>
       O jogo continua, mas você retornará ao início como vereador para reconstruir sua carreira política.`
    );
    resetGame();
    updateHUD();
  }
}

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

/* ---------- Binds ---------- */
function bindButtons() {
  const btnStart = $("#btnStart");
  const btnBegin = $("#btnBegin");
  const btnHome  = $("#btnHome");

  // FIX: botão iniciar sempre clicável
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

  const a1 = $("#btnAction1");
  const a2 = $("#btnAction2");
  const a3 = $("#btnAction3");
  const a4 = $("#btnAction4");
  if (a1) a1.onclick = actVoteProjects;
  if (a2) a2.onclick = actProposeLaw;
  if (a3) a3.onclick = actCrisis;
  if (a4) a4.onclick = actCampaign;

  const btnSave = $("#btnSave");
  if (btnSave) btnSave.onclick = saveGame;
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  // mapeia telas
  screens.intro = $("#screenIntro");
  screens.setup = $("#screenSetup");
  screens.game  = $("#screenGame");

  // fade
  fadeEl = $("#cineFade");
  if (fadeEl) {
    if (!fadeEl.classList.contains("hidden")) fadeEl.classList.add("hidden");
    fadeEl.classList.remove("show");
    fadeEl.style.pointerEvents = "none";
  }

  setupModal();
  mountSetup();
  loadGame();

  // força tela inicial
  show("intro");

  // segurança extra no botão iniciar
  const btnStart = $("#btnStart");
  if (btnStart) {
    btnStart.style.pointerEvents = "auto";
    btnStart.style.position = "relative";
    btnStart.style.zIndex = "9999";
  }

  bindButtons();
});
