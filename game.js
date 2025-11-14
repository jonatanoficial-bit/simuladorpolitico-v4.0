// =========================
//  Simulador Político 4.x
//  Lógica principal do jogo
// =========================

const $  = (q) => document.querySelector(q);
const $$ = (q) => document.querySelectorAll(q);

// ---------- CONTROLE DE TELAS ----------
const screens = {};

function showScreen(id) {
  Object.values(screens).forEach(s => s && s.classList.remove("show"));
  if (screens[id]) screens[id].classList.add("show");
}

// ---------- MODAL (CAIXA DE DIÁLOGO) ----------
let modal, modalTitle, modalBody, modalActions;

function setupModal() {
  modal        = $("#modal");
  modalTitle   = $("#modalTitle");
  modalBody    = $("#modalBody");
  modalActions = $("#modalActions");

  if (!modal) return;

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // garante que inicie oculto
  if (!modal.classList.contains("hidden")) modal.classList.add("hidden");
}

function openModal(title, htmlBody, actions) {
  if (!modal) {
    // fallback simples caso o HTML do modal não exista
    alert(title + "\n\n" + htmlBody.replace(/<[^>]+>/g, ""));
    return;
  }

  modalTitle.innerHTML = title || "";
  modalBody.innerHTML  = htmlBody || "";
  modalActions.innerHTML = "";

  (actions || []).forEach((a) => {
    const btn = document.createElement("button");
    btn.className = "btn " + (a.className || "");
    btn.textContent = a.label;
    btn.onclick = () => { if (a.onClick) a.onClick(); };
    modalActions.appendChild(btn);
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

// ---------- DADOS DO JOGO ----------
const parties = [
  {
    sigla: "PTM",
    nome: "Partido do Trabalhador Moderno",
    desc: "Ênfase em programas sociais e direitos trabalhistas.",
    logo: "simulador_images/party_ptm.png",
  },
  {
    sigla: "PSLB",
    nome: "Partido Social Liberal do Brasil",
    desc: "Foco em mercado, privatizações e empreendedorismo.",
    logo: "simulador_images/party_pslb.png",
  },
  {
    sigla: "MDBR",
    nome: "Movimento Democrático Brasileiro Real",
    desc: "Pragmatismo, alianças amplas e negociação.",
    logo: "simulador_images/party_mdbr.png",
  },
  {
    sigla: "PVG",
    nome: "Partido Verde Global",
    desc: "Sustentabilidade, meio ambiente e cidades inteligentes.",
    logo: "simulador_images/party_pvg.png",
  },
  {
    sigla: "PRP",
    nome: "Partido Republicano Popular",
    desc: "Costumes conservadores, segurança e ordem.",
    logo: "simulador_images/party_prp.png",
  },
];

const states = [
  "Acre","Alagoas","Amapá","Amazonas","Bahia","Ceará","Distrito Federal",
  "Espírito Santo","Goiás","Maranhão","Mato Grosso","Mato Grosso do Sul",
  "Minas Gerais","Pará","Paraíba","Paraná","Pernambuco","Piauí",
  "Rio de Janeiro","Rio Grande do Norte","Rio Grande do Sul","Rondônia",
  "Roraima","Santa Catarina","São Paulo","Sergipe","Tocantins"
];

// ordem da sua carreira
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

const storeKey = "simPolitico_v4";

// ---------- ESTADO GLOBAL ----------
let G = {};

function defaultState() {
  return {
    partyIdx: 0,
    state: null,
    city: "",
    officeIdx: 0,      // começa vereador
    termTurn: 1,
    approvals: 0,      // projetos aprovados
    popPeople: 50,
    popMedia:  50,
    popParty:  50,
    feed: [],
  };
}

function resetGame() {
  G = defaultState();
}

// ---------- HELPERS ----------
const clamp = (v) => Math.max(0, Math.min(100, Math.round(v)));
const randomBool = (p) => Math.random() < p;

function addFeed(tag, text) {
  G.feed.unshift({ tag, text });
  if (G.feed.length > 40) G.feed.pop();
  renderFeed();
}

function renderFeed() {
  const el = $("#feed");
  if (!el) return;
  el.innerHTML = G.feed.map(item => `
    <div class="feed-item">
      <div class="feed-tag">${item.tag}</div>
      <div class="feed-body">${item.text}</div>
    </div>
  `).join("");
}

function setMain(title, html) {
  const t = $("#mainTitle");
  const m = $("#mainText");
  if (t) t.textContent = title;
  if (m) m.innerHTML   = html;
}

// ---------- HUD E IMAGEM CENTRAL ----------
function updateOfficeImage() {
  const office = offices[G.officeIdx];
  const el = $("#officeImage");
  if (!el) return;
  el.style.backgroundImage = `url('${office.bg}')`;
}

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

  updateOfficeImage();
}

// ---------- SALVAR / CARREGAR ----------
function saveGame() {
  try {
    localStorage.setItem(storeKey, JSON.stringify(G));
    toast("Progresso salvo!");
  } catch (e) {
    console.warn("Falha ao salvar:", e);
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(storeKey);
    if (!raw) return;
    const data = JSON.parse(raw);
    G = Object.assign(defaultState(), data || {});
  } catch (e) {
    console.warn("Falha ao carregar save:", e);
  }
}

// ---------- AÇÕES ----------

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
    `Em pauta: <b>${p}</b>.<br><br>
     Placar parcial: <b>${yes}</b> SIM • <b>${no}</b> NÃO.<br><br>
     Como você deseja votar?`,
    [
      {
        label: "Votar SIM",
        className: "btn-gold",
        onClick: () => { closeModal(); resolveVote(true, passa, p); }
      },
      {
        label: "Votar NÃO",
        onClick: () => { closeModal(); resolveVote(false, passa, p); }
      },
    ]
  );
}

function resolveVote(votouSim, passou, projeto) {
  let dPovo = 0, dMidia = 0, dPart = 0;

  if (passou && votouSim) {
    dPovo += 3; dMidia += 2; dPart += 2;
    G.approvals++;
    addFeed("Votação", `Você apoiou <b>${projeto}</b>, aprovado em plenário.`);
  } else if (!passou && !votouSim) {
    dPovo += 1; dMidia += 2; dPart += 1;
    addFeed("Votação", `Você votou contra <b>${projeto}</b>, rejeitado.`);
  } else {
    dPovo -= 2; dMidia -= 1;
    addFeed("Votação", `Sua posição em <b>${projeto}</b> dividiu o eleitorado.`);
  }

  G.popPeople += dPovo;
  G.popMedia  += dMidia;
  G.popParty  += dPart;
  G.termTurn  += 1;

  updateHUD();
  setMain(
    "Resultado da votação",
    `Impactos:<br>
     Povo: ${(dPovo >= 0 ? "+" : "") + dPovo}%<br>
     Mídia: ${(dMidia >= 0 ? "+" : "") + dMidia}%<br>
     Partido: ${(dPart >= 0 ? "+" : "") + dPart}%`
  );
}

function actProposeLaw() {
  const ideias = [
    "Programa de Wi-Fi público nas praças",
    "Criação de corredor exclusivo de ônibus",
    "Implantação de hortas comunitárias",
    "Plano de valorização do magistério",
    "Lei anti-desperdício de alimentos"
  ];
  const p = ideias[Math.floor(Math.random() * ideias.length)];

  openModal(
    "Propor novo projeto",
    `Você está prestes a protocolar o projeto:<br><br>
     <b>${p}</b><br><br>
     Deseja enviar para tramitação?`,
    [
      {
        label: "Protocolar projeto",
        className: "btn-gold",
        onClick: () => {
          closeModal();

          const chanceBase = 0.5;
          const bonusPart  = (G.popParty - 50) / 200;
          const aprovado   = randomBool(chanceBase + bonusPart);

          if (aprovado) {
            G.approvals++;
            G.popPeople += 3;
            G.popMedia  += 2;
            G.popParty  += 2;
            addFeed("Projeto aprovado", `Seu projeto <b>${p}</b> virou lei.`);
            setMain("Projeto aprovado", "A recepção foi positiva.");
          } else {
            G.popPeople -= 1;
            G.popMedia  -= 2;
            addFeed("Projeto rejeitado", `O projeto <b>${p}</b> foi arquivado nas comissões.`);
            setMain("Projeto rejeitado", "Críticas da imprensa à articulação.");
          }

          G.termTurn += 1;
          updateHUD();
        }
      },
      { label: "Cancelar", onClick: closeModal }
    ]
  );
}

function actCrisis() {
  const office = offices[G.officeIdx];

  // só para Prefeito / Governador / Presidente
  if (office.type !== "executive") {
    toast("Crises executivas só aparecem para Prefeitos, Governadores e Presidente.");
    return;
  }

  const crises = [
    { area: "Saúde",     op: ["Mutirão de consultas", "Construir nova UPA", "Repassar recursos"],          impact: [+3,+4,+2] },
    { area: "Segurança", op: ["Aumentar policiamento", "Iluminação pública", "Criar guarda comunitária"], impact: [+3,+2,+2] },
    { area: "Economia",  op: ["Reduzir impostos", "Atrair empresas", "Programa de qualificação"],         impact: [+2,+3,+3] },
  ];

  const c = crises[Math.floor(Math.random() * crises.length)];
  let body = `Crise em <b>${c.area}</b>.<br><br>Escolha uma ação:<br><br>`;
  c.op.forEach((o, i) => body += `<b>${i+1}.</b> ${o}<br>`);

  const actions = c.op.map((o, i) => ({
    label: o,
    className: i === 0 ? "btn-gold" : "",
    onClick: () => {
      closeModal();
      let d = c.impact[i];
      if (randomBool(0.25)) d -= 2; // chance da situação piorar

      G.popPeople += d;
      G.popMedia  += (d > 0 ? 1 : -1);
      G.popParty  += (d >= 0 ? 1 : -2);
      G.termTurn  += 1;

      addFeed("Crise", `Ação em <b>${c.area}</b>: ${o}.`);
      setMain("Gestão de crise", `Impacto popular: ${(d >= 0 ? "+" : "") + d}%`);

      updateHUD();
      checkImpeachment();
    }
  }));

  openModal("Gestão de crise", body, actions);
}

function actCampaign() {
  if (clamp(G.popPeople) < 60) {
    toast("Popularidade com o povo precisa ser ≥ 60% para concorrer ao próximo cargo.");
    return;
  }
  const nextIdx = Math.min(offices.length - 1, G.officeIdx + 1);
  if (nextIdx === G.officeIdx) {
    toast("Você já alcançou o cargo máximo.");
    return;
  }
  const next = offices[nextIdx];

  openModal(
    "Campanha eleitoral",
    `Você deseja lançar sua campanha para <b>${next.name}</b>?<br><br>
     O resultado leva em conta Povo, Mídia, Partido e o histórico de mandatos.`,
    [
      {
        label: "Lançar campanha",
        className: "btn-gold",
        onClick: () => { closeModal(); runElection(nextIdx); }
      },
      { label: "Ainda não", onClick: closeModal }
    ]
  );
}

function runElection(nextIdx) {
  const base = (clamp(G.popPeople) + clamp(G.popMedia) + clamp(G.popParty)) / 3;
  let pontos = 0;

  // 5 "discursos" simulados
  for (let i = 0; i < 5; i++) {
    if (randomBool(0.45 + base / 200)) pontos++;
  }

  const nextOffice = offices[nextIdx];

  if (pontos >= 3) {
    addFeed("Eleições", `Você foi eleito <b>${nextOffice.name}</b>!`);
    G.officeIdx = nextIdx;
    G.termTurn  = 1;
    G.approvals = 0;
    G.popMedia += 2;

    setMain(
      "Vitória nas urnas",
      `Sua campanha foi bem-sucedida e você foi eleito <b>${nextOffice.name}</b>!`
    );
  } else {
    addFeed("Eleições", `Sua campanha para <b>${nextOffice.name}</b> não conquistou votos suficientes.`);
    G.popPeople -= 5;
    G.popMedia  -= 3;

    setMain(
      "Derrota eleitoral",
      "A campanha não teve votos suficientes. Continue trabalhando e tente novamente."
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
      "Sua popularidade desabou e você sofreu impeachment. Voltará ao início como Vereador."
    );
    resetGame();
    updateHUD();
  }
}

// ---------- SETUP INICIAL ----------
function mountSetup() {
  const selParty = $("#selParty");
  const selState = $("#selState");

  if (selParty) {
    selParty.innerHTML = "";
    parties.forEach((p, i) => {
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

function beginMandate() {
  renderFeed();
  updateHUD();
  setMain(
    "Início de mandato",
    `Você assumiu o cargo de <b>${offices[G.officeIdx].name}</b> em <b>${G.city} - ${G.state}</b>, pelo <b>${parties[G.partyIdx].sigla}</b>.<br><br>
     Use as ações à esquerda. Cada decisão afeta Povo, Mídia e Partido.`
  );
  addFeed("Posse", `Novo mandato como <b>${offices[G.officeIdx].name}</b> em ${G.city}.`);
  showScreen("game");
}

// ---------- BIND DOS BOTÕES ----------
function bindButtons() {
  const btnStart = $("#btnStart");
  const btnBegin = $("#btnBegin");
  const btnHome  = $("#btnHome");
  const btnSave  = $("#btnSave");

  if (btnStart) {
    btnStart.style.pointerEvents = "auto";
    btnStart.style.position      = "relative";
    btnStart.style.zIndex        = "10";
    btnStart.addEventListener("click", (e) => {
      e.preventDefault();
      showScreen("setup");
    });
  }

  if (btnBegin) {
    btnBegin.addEventListener("click", (e) => {
      e.preventDefault();
      const city     = ($("#inpCity")?.value || "").trim();
      const partyIdx = parseInt($("#selParty")?.value || "0", 10) || 0;
      const state    = $("#selState")?.value || "";

      if (!city)  return toast("Digite o nome da cidade.");
      if (!state) return toast("Selecione o estado.");

      G.city     = city;
      G.partyIdx = partyIdx;
      G.state    = state;
      G.officeIdx = 0; // garante começar vereador
      G.termTurn  = 1;

      saveGame();
      beginMandate();
    });
  }

  if (btnHome) {
    btnHome.addEventListener("click", (e) => {
      e.preventDefault();
      showScreen("intro");
    });
  }

  if (btnSave) {
    btnSave.addEventListener("click", (e) => {
      e.preventDefault();
      saveGame();
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
}

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", () => {
  screens.intro = $("#screenIntro");
  screens.setup = $("#screenSetup");
  screens.game  = $("#screenGame");

  setupModal();
  mountSetup();
  loadGame();
  if (!G || !G.city) resetGame();

  showScreen("intro");
  bindButtons();
});
