/* =========================
   Simulador Político – Engine 4.1
   - Imagem central fixa
   - Modal com botões
   - Projeto com árvore de decisão
   - Auto-save localStorage
   ========================= */

const $  = (q) => document.querySelector(q);
const $$ = (q) => document.querySelectorAll(q);

/* ---------- Telas & Fade ---------- */

let screens = {};
let fadeEl  = null;

function show(id) {
  Object.values(screens).forEach(s => s && s.classList.remove("show"));
  if (screens[id]) screens[id].classList.add("show");
}

function fadeTo(id) {
  if (!fadeEl) return show(id);

  fadeEl.classList.remove("hidden");
  fadeEl.classList.add("show");

  setTimeout(() => {
    show(id);
    setTimeout(() => {
      fadeEl.classList.remove("show");
      setTimeout(() => fadeEl.classList.add("hidden"), 260);
    }, 60);
  }, 220);
}

/* ---------- Dados básicos ---------- */

const parties = [
  { sigla:"PTM",  nome:"Partido do Trabalhador Moderno",        logo:"simulador_images/party_ptm.png"  },
  { sigla:"PSLB", nome:"Partido Social Liberal do Brasil",      logo:"simulador_images/party_pslb.png" },
  { sigla:"MDBR", nome:"Movimento Democrático Brasileiro Real", logo:"simulador_images/party_mdbr.png" },
  { sigla:"PVG",  nome:"Partido Verde Global",                  logo:"simulador_images/party_pvg.png"  },
  { sigla:"PRP",  nome:"Partido Republicano Popular",           logo:"simulador_images/party_prp.png"  },
];

const states = [
  "Acre","Alagoas","Amapá","Amazonas","Bahia","Ceará","Distrito Federal","Espírito Santo","Goiás",
  "Maranhão","Mato Grosso","Mato Grosso do Sul","Minas Gerais","Pará","Paraíba","Paraná","Pernambuco",
  "Piauí","Rio de Janeiro","Rio Grande do Norte","Rio Grande do Sul","Rondônia","Roraima","Santa Catarina",
  "São Paulo","Sergipe","Tocantins"
];

const offices = [
  { name:"Vereador",          type:"legislative", bg:"simulador_images/municipal.jpg" },
  { name:"Prefeito",          type:"executive",   bg:"simulador_images/cityhall.jpg"  },
  { name:"Deputado Estadual", type:"legislative", bg:"simulador_images/assembly.jpg"  },
  { name:"Governador",        type:"executive",   bg:"simulador_images/governor.jpg"  },
  { name:"Deputado Federal",  type:"legislative", bg:"simulador_images/federal.jpg"   },
  { name:"Senador",           type:"legislative", bg:"simulador_images/senate.jpg"    },
  { name:"Presidente",        type:"executive",   bg:"simulador_images/president.jpg" },
];

/* ---------- Estado de jogo + save ---------- */

const STORE_KEY = "SimPolitico_v41_Save";

let G = {
  partyIdx: 0,
  state: "São Paulo",
  city: "Cidade Exemplo",
  officeIdx: 0,
  approvals: 0,
  popPeople: 50,
  popMedia:  50,
  popParty:  50,
  feed: [],
  turn: 1,
};

const clamp   = (v) => Math.max(0, Math.min(100, Math.round(v)));
const rnd     = (n) => Math.floor(Math.random() * n);
const rbool   = (p) => Math.random() < p;

/* Auto-save sempre que HUD for atualizado */
function autoSave() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(G));
  } catch(e) {
    console.warn("Falha ao salvar:", e);
  }
}

/* ---------- Modal estilizado ---------- */

let modal, modalTitle, modalBody, modalActions;

function setupModal() {
  modal        = $("#modal");
  modalTitle   = $("#modalTitle");
  modalBody    = $("#modalBody");
  modalActions = $("#modalActions");

  if (modal) {
    modal.addEventListener("click", (e)=>{
      if (e.target === modal) closeModal();
    });
  }
}

function openModal(title, htmlBody, actions) {
  if (!modal) {
    // Fallback simples se o HTML da modal não existir
    const txt = (title ? title + "\n\n" : "") + htmlBody.replace(/<[^>]+>/g,"");
    alert(txt);
    if (actions && actions[0] && actions[0].onClick) actions[0].onClick();
    return;
  }

  modalTitle.innerHTML = title || "";
  modalBody.innerHTML  = htmlBody || "";
  modalActions.innerHTML = "";

  (actions || []).forEach(a => {
    const b = document.createElement("button");
    b.className   = "btn " + (a.className || "");
    b.textContent = a.label;
    b.onclick     = a.onClick || (()=>{});
    modalActions.appendChild(b);
  });

  modal.classList.remove("hidden");
}

function closeModal() {
  if (modal) modal.classList.add("hidden");
}

function toast(msg) {
  openModal("Informação", msg, [
    { label:"OK", className:"btn-gold", onClick: closeModal }
  ]);
}

/* ---------- Feed ---------- */

function addFeed(tag, text) {
  G.feed.unshift({ tag, text });
  if (G.feed.length > 40) G.feed.pop();
  renderFeed();
}

function renderFeed() {
  const box = $("#feed");
  if (!box) return;
  box.innerHTML = G.feed.map(f => `
    <div class="feed-item">
      <div class="feed-tag">${f.tag}</div>
      <div class="feed-body">${f.text}</div>
    </div>
  `).join("");
}

/* ---------- HUD, imagem central e layout ---------- */

function setMain(title, html) {
  const t = $("#mainTitle");
  const m = $("#mainText");
  if (t) t.textContent = title;
  if (m) m.innerHTML   = html;
}

function updateHUD() {
  const office = offices[G.officeIdx];
  const party  = parties[G.partyIdx];

  $("#hudOffice").textContent   = office.name;
  $("#hudLocation").textContent = `${G.city} - ${G.state} • Mandato ${G.turn}`;

  const logo = $("#partyLogo");
  if (logo && party) logo.src = party.logo || "";

  $("#popPeople").textContent = clamp(G.popPeople) + "%";
  $("#popMedia").textContent  = clamp(G.popMedia)  + "%";
  $("#popParty").textContent  = clamp(G.popParty)  + "%";

  const pct = Math.min(100, Math.round((G.approvals / 15) * 100));
  $("#txtProgress").textContent      = pct + "%";
  $("#barProgress").style.width      = pct + "%";

  // Imagem grande no centro (como você gostou)
  const centerImg = $("#centerImage");
  if (centerImg) {
    centerImg.src = office.bg;
    centerImg.alt = office.name;
  }

  const scrGame = $("#screenGame");
  if (scrGame) {
    scrGame.style.backgroundImage =
      `linear-gradient(180deg,rgba(0,0,0,.90),rgba(0,0,0,.96)),url('${office.bg}')`;
  }

  autoSave();
}

/* ---------- Ações: Votação ---------- */

function actVoteProjects() {
  const projetos = [
    "Reforma da frota de ônibus",
    "Incentivo fiscal para pequenas empresas",
    "Requalificação de escolas públicas",
    "Programa de combate à violência",
    "Parque urbano sustentável"
  ];

  const p      = projetos[rnd(projetos.length)];
  const total  = 30 + rnd(40);
  const yes    = Math.round(total * (0.4 + Math.random()*0.3));
  const no     = total - yes;
  const passou = yes > no;

  openModal(
    "Votação em plenário",
    `Em pauta: <b>${p}</b>.<br><br>Placar: <b>${yes}</b> SIM • <b>${no}</b> NÃO.<br><br><b>Como você deseja votar?</b>`,
    [
      {
        label:"Votar SIM",
        className:"btn-gold",
        onClick:()=>{
          closeModal();
          resolveVote(true, passou, p, yes, no);
        }
      },
      {
        label:"Votar NÃO",
        onClick:()=>{
          closeModal();
          resolveVote(false, passou, p, yes, no);
        }
      }
    ]
  );
}

function resolveVote(votouSim, passou, projeto, yes, no) {
  let dPovo = 0, dMidia = 0, dPart = 0;

  if (passou && votouSim) {
    dPovo+=3; dMidia+=2; dPart+=2;
    G.approvals++;
    addFeed("Votação", `Você apoiou <b>${projeto}</b>, aprovado por ${yes} a ${no}.`);
  } else if (!passou && !votouSim) {
    dPovo+=1; dMidia+=2; dPart+=1;
    addFeed("Votação", `Você votou contra <b>${projeto}</b>, rejeitado por ${no} a ${yes}.`);
  } else {
    dPovo-=2; dMidia-=1;
    addFeed("Votação", `Seu voto em <b>${projeto}</b> desagradou parte do eleitorado.`);
  }

  G.popPeople += dPovo;
  G.popMedia  += dMidia;
  G.popParty  += dPart;
  G.turn++;

  updateHUD();
  setMain(
    "Resultado da votação",
    `
      Impactos:<br>
      Povo: ${(dPovo>=0?"+":"")+dPovo}%<br>
      Mídia: ${(dMidia>=0?"+":"")+dMidia}%<br>
      Partido: ${(dPart>=0?"+":"")+dPart}%
    `
  );
}

/* ---------- Ações: PROJETO com árvore de decisão ---------- */

const PROJECT_TREE = {
  "Saúde": [
    "Construir uma nova UPA 24h",
    "Contratar mais médicos para postos",
    "Programa de remédios gratuitos"
  ],
  "Educação": [
    "Reformar escolas antigas",
    "Implantar laboratório de informática",
    "Formação continuada para professores"
  ],
  "Segurança": [
    "Aumentar policiamento em áreas de risco",
    "Iluminação pública em bairros perigosos",
    "Programa Guarda Comunitária"
  ],
  "Economia": [
    "Reduzir impostos para pequenas empresas",
    "Criar incubadora de startups",
    "Programa de qualificação profissional"
  ],
  "Meio ambiente": [
    "Criar parque ecológico",
    "Programa de reciclagem nos bairros",
    "Projeto de hortas comunitárias"
  ]
};

function actProposeLaw() {
  // 1ª etapa: escolher área
  const areas = Object.keys(PROJECT_TREE);
  let body = "Escolha a área do seu projeto:<br><br>";
  areas.forEach(a => body += `• ${a}<br>`);

  openModal(
    "Novo projeto de lei",
    body,
    areas.map(area => ({
      label: area,
      className: "btn-gold",
      onClick:()=>{
        closeModal();
        chooseProjectDetail(area);
      }
    }))
  );
}

function chooseProjectDetail(area) {
  const options = PROJECT_TREE[area] || [];
  let body = `Área escolhida: <b>${area}</b>.<br><br>Agora escolha o foco do projeto:<br><br>`;
  options.forEach(o => body += `• ${o}<br>`);

  openModal(
    "Detalhamento do projeto",
    body,
    options.map(o => ({
      label: o,
      className: "btn-gold",
      onClick:()=>{
        closeModal();
        finalizeProject(area, o);
      }
    }))
  );
}

function finalizeProject(area, descricao) {
  const projetoNome = `${area}: ${descricao}`;

  // chance baseada em popularidade e apoio do partido
  let chance = 0.45;
  chance += (G.popPeople - 50) / 300;
  chance += (G.popParty  - 50) / 400;

  const aprovado = rbool(chance);

  if (aprovado) {
    G.approvals++;
    G.popPeople += 4;
    G.popMedia  += 2;
    G.popParty  += 3;

    addFeed("Projeto aprovado", `Seu projeto <b>${projetoNome}</b> foi aprovado e virou lei.`);
    setMain(
      "Projeto aprovado",
      `A população e a mídia reagiram bem ao projeto <b>${projetoNome}</b>.`
    );
  } else {
    G.popPeople -= 1;
    G.popMedia  -= 3;

    addFeed("Projeto rejeitado", `O projeto <b>${projetoNome}</b> foi barrado nas comissões.`);
    setMain(
      "Projeto rejeitado",
      `Sua articulação não foi suficiente para aprovar <b>${projetoNome}</b>.`
    );
  }

  G.turn++;
  updateHUD();
}

/* ---------- Crises (apenas Executivo) ---------- */

function actCrisis() {
  const office = offices[G.officeIdx];
  if (office.type !== "executive") {
    toast("Somente cargos do Executivo (Prefeito, Governador, Presidente) enfrentam crises diretas.");
    return;
  }

  const crises = [
    { area:"Saúde",     op:["Mutirão de consultas","Construir nova UPA","Repassar recursos a hospitais"], impact:[+3,+4,+2] },
    { area:"Segurança", op:["Aumentar policiamento","Melhorar iluminação","Criar guarda comunitária"],   impact:[+3,+2,+2] },
    { area:"Economia",  op:["Reduzir impostos","Atrair empresas","Programa de qualificação"],            impact:[+2,+3,+3] },
  ];

  const c = crises[rnd(crises.length)];
  let body = `Crise em <b>${c.area}</b>.<br><br>Escolha sua estratégia:<br><br>`;
  c.op.forEach(o => body += `• ${o}<br>`);

  const actions = c.op.map((o,i)=>({
    label:o,
    className: i===0 ? "btn-gold" : "",
    onClick:()=>{
      closeModal();
      let d = c.impact[i];
      if (rbool(0.2)) d -= 2; // pode dar ruim

      G.popPeople += d;
      G.popMedia  += d>=0 ? 1 : -1;
      G.popParty  += d>=0 ? 1 : -2;
      G.turn++;

      addFeed("Crise", `Você atuou em <b>${c.area}</b> com a medida: ${o}.`);
      setMain("Gestão de crise", `Impacto popular: ${d>=0?"+":""}${d}%`);

      updateHUD();
      checkImpeachment();
    }
  }));

  openModal("Gestão de crise", body, actions);
}

function checkImpeachment() {
  if (clamp(G.popPeople) <= 0) {
    addFeed("Impeachment", "Sua popularidade caiu a 0%. Você perdeu o cargo.");
    setMain("Impeachment", "Você foi afastado. A carreira recomeça como Vereador.");
    G.officeIdx = 0;
    G.popPeople = 50;
    G.popMedia  = 50;
    G.popParty  = 50;
    G.approvals = 0;
    G.turn      = 1;
    updateHUD();
  }
}

/* ---------- Campanha para próximo cargo ---------- */

function actCampaign() {
  if (G.officeIdx >= offices.length - 1) {
    toast("Você já alcançou o cargo máximo.");
    return;
  }

  if (clamp(G.popPeople) < 60) {
    toast("Popularidade mínima de 60% com o povo para disputar o próximo cargo.");
    return;
  }

  const next = offices[G.officeIdx + 1];

  openModal(
    "Campanha eleitoral",
    `Deseja lançar campanha para <b>${next.name}</b>?<br><br>A chance de vitória depende da sua popularidade com Povo, Mídia e Partido.`,
    [
      {
        label:"Lançar campanha",
        className:"btn-gold",
        onClick:()=>{
          closeModal();
          runElection(next);
        }
      },
      { label:"Ainda não", onClick: closeModal }
    ]
  );
}

function runElection(nextOffice) {
  const base = (clamp(G.popPeople) + clamp(G.popMedia) + clamp(G.popParty)) / 3;
  let pontos = 0;
  for (let i=0;i<5;i++) if (rbool(0.45 + base/200)) pontos++;

  if (pontos >= 3) {
    addFeed("Eleições", `Você foi eleito <b>${nextOffice.name}</b>!`);
    G.officeIdx = offices.indexOf(nextOffice);
    G.turn      = 1;
    G.approvals = 0;
    G.popMedia += 2;

    setMain("Vitória nas urnas", `Sua campanha foi bem-sucedida. Agora você é <b>${nextOffice.name}</b>.`);
  } else {
    addFeed("Eleições", `Sua campanha para <b>${nextOffice.name}</b> não teve votos suficientes.`);
    G.popPeople -= 4;
    G.popMedia  -= 3;
    setMain("Derrota eleitoral", "O resultado nas urnas não foi suficiente. Trabalhe mais e tente novamente.");
  }

  updateHUD();
}

/* ---------- Save / Load ---------- */

function loadGame() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    G = Object.assign(G, data || {});
  } catch(e) {
    console.warn("Falha ao carregar save:", e);
  }
}

/* ---------- Setup inicial ---------- */

function mountSetup() {
  const selParty = $("#selParty");
  const selState = $("#selState");

  if (selParty) {
    selParty.innerHTML = "";
    parties.forEach((p,i)=>{
      const o = document.createElement("option");
      o.value = i;
      o.textContent = `${p.sigla} - ${p.nome}`;
      selParty.appendChild(o);
    });
  }

  if (selState) {
    selState.innerHTML = "";
    states.forEach(s=>{
      const o = document.createElement("option");
      o.value = s;
      o.textContent = s;
      selState.appendChild(o);
    });
  }
}

function beginMandate() {
  renderFeed();
  updateHUD();
  setMain(
    "Início de mandato",
    `Você assumiu o cargo de <b>${offices[G.officeIdx].name}</b> em <b>${G.city} - ${G.state}</b>, pelo partido <b>${parties[G.partyIdx].sigla}</b>.`
  );
  addFeed("Posse", `Novo mandato como <b>${offices[G.officeIdx].name}</b> em ${G.city}.`);
  fadeTo("game");
}

/* ---------- Bind de botões ---------- */

function bindButtons() {
  const btnStart = $("#btnStart");
  const btnBegin = $("#btnBegin");
  const btnHome  = $("#btnHome");

  if (btnStart) {
    btnStart.addEventListener("click",(e)=>{
      e.preventDefault();
      fadeTo("setup");
    });
  }

  if (btnBegin) {
    btnBegin.addEventListener("click",(e)=>{
      e.preventDefault();
      const city  = ($("#inpCity")?.value || "").trim();
      const state = $("#selState")?.value || "";
      const pIdx  = parseInt($("#selParty")?.value || "0", 10) || 0;

      if (!city) {
        toast("Digite a cidade para começar.");
        return;
      }

      G.city     = city;
      G.state    = state;
      G.partyIdx = pIdx;

      beginMandate();
    });
  }

  if (btnHome) {
    btnHome.addEventListener("click",(e)=>{
      e.preventDefault();
      fadeTo("intro");
    });
  }

  $("#btnAction1")?.addEventListener("click", actVoteProjects);
  $("#btnAction2")?.addEventListener("click", actProposeLaw);
  $("#btnAction3")?.addEventListener("click", actCrisis);
  $("#btnAction4")?.addEventListener("click", actCampaign);

  $("#btnSave")?.addEventListener("click", ()=>{
    autoSave();
    toast("Progresso salvo no dispositivo.");
  });
}

/* ---------- INIT ---------- */

document.addEventListener("DOMContentLoaded", () => {
  screens.intro = $("#screenIntro");
  screens.setup = $("#screenSetup");
  screens.game  = $("#screenGame");

  fadeEl = $("#cineFade");
  if (fadeEl) fadeEl.classList.add("hidden");

  setupModal();
  mountSetup();
  loadGame();
  bindButtons();
  updateHUD();   // caso já exista save

  show("intro");
});
