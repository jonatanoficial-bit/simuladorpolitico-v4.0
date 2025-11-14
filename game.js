// =========================
// Simulador Político 4.0
// game.js
// =========================

const $ = (q) => document.querySelector(q);
const $$ = (q) => document.querySelectorAll(q);

const screens = {};
let fadeEl;

// ---------- Dados básicos ----------

const parties = [
  {
    sigla: "PTM",
    nome: "Partido do Trabalhador Moderno",
    desc: "Ênfase em programas sociais e direitos trabalhistas.",
    logo: "simulador_images/party_ptm.png",
    forçaBase: 65,
  },
  {
    sigla: "PSLB",
    nome: "Partido Social Liberal do Brasil",
    desc: "Foco em mercado, privatizações e empreendedorismo.",
    logo: "simulador_images/party_pslb.png",
    forçaBase: 60,
  },
  {
    sigla: "MDBR",
    nome: "Movimento Democrático Brasileiro Real",
    desc: "Pragmatismo, alianças amplas e negociação.",
    logo: "simulador_images/party_mdbr.png",
    forçaBase: 70,
  },
  {
    sigla: "PVG",
    nome: "Partido Verde Global",
    desc: "Sustentabilidade, meio ambiente e cidades inteligentes.",
    logo: "simulador_images/party_pvg.png",
    forçaBase: 55,
  },
  {
    sigla: "PRP",
    nome: "Partido Republicano Popular",
    desc: "Costumes conservadores, segurança e ordem.",
    logo: "simulador_images/party_prp.png",
    forçaBase: 62,
  },
];

const states = [
  "Acre",
  "Alagoas",
  "Amapá",
  "Amazonas",
  "Bahia",
  "Ceará",
  "Distrito Federal",
  "Espírito Santo",
  "Goiás",
  "Maranhão",
  "Mato Grosso",
  "Mato Grosso do Sul",
  "Minas Gerais",
  "Pará",
  "Paraíba",
  "Paraná",
  "Pernambuco",
  "Piauí",
  "Rio de Janeiro",
  "Rio Grande do Norte",
  "Rio Grande do Sul",
  "Rondônia",
  "Roraima",
  "Santa Catarina",
  "São Paulo",
  "Sergipe",
  "Tocantins",
];

const offices = [
  { name: "Vereador", type: "legislative", bg: "simulador_images/municipal.jpg" },
  { name: "Prefeito", type: "executive", bg: "simulador_images/cityhall.jpg" },
  { name: "Deputado Estadual", type: "legislative", bg: "simulador_images/assembly.jpg" },
  { name: "Prefeito", type: "executive", bg: "simulador_images/cityhall.jpg" },
  { name: "Governador", type: "executive", bg: "simulador_images/governor.jpg" },
  { name: "Deputado Federal", type: "legislative", bg: "simulador_images/federal.jpg" },
  { name: "Senador", type: "legislative", bg: "simulador_images/senate.jpg" },
  { name: "Presidente", type: "executive", bg: "simulador_images/president.jpg" },
];

const storeKey = "simPolitico_v4_0";

// Estado global do jogo
let G = {
  partyIdx: 0,
  state: null,
  city: "",
  officeIdx: 0,
  termTurn: 1,
  approvals: 0,
  electionsWon: 0,
  popPeople: 50,
  popMedia: 50,
  popParty: 50,
  feed: [],
};

// ---------- Helpers ----------

const clamp = (v) => Math.max(0, Math.min(100, Math.round(v)));
const randomBool = (p) => Math.random() < p;
const randInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

function show(id) {
  Object.values(screens).forEach((s) => s && s.classList.remove("show"));
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
      setTimeout(() => fadeEl.classList.add("hidden"), 250);
    }, 60);
  }, 220);
}

function addFeed(tag, text) {
  G.feed.unshift({ tag, text });
  if (G.feed.length > 40) G.feed.pop();
  renderFeed();
}

function renderFeed() {
  const container = $("#feed");
  if (!container) return;
  container.innerHTML = G.feed
    .map(
      (i) => `
      <div class="feed-item">
        <div class="feed-tag">${i.tag}</div>
        <div class="feed-body">${i.text}</div>
      </div>
    `
    )
    .join("");
}

function setMain(title, html) {
  const t = $("#mainTitle");
  const m = $("#mainText");
  if (t) t.textContent = title;
  if (m) m.innerHTML = html;
}

// ---------- HUD & Fundo ----------

function updateHUD() {
  const office = offices[G.officeIdx];
  const party = parties[G.partyIdx];

  const hudOffice = $("#hudOffice");
  const hudLocation = $("#hudLocation");
  const partyLogo = $("#partyLogo");
  const txtProgress = $("#txtProgress");
  const barProgress = $("#barProgress");
  const popPeople = $("#popPeople");
  const popMedia = $("#popMedia");
  const popParty = $("#popParty");
  const scrGame = $("#screenGame");

  if (hudOffice) hudOffice.textContent = office.name;
  if (hudLocation) hudLocation.textContent = `${G.city} - ${G.state} • Mandato ${G.termTurn}`;

  if (partyLogo) {
    if (party && party.logo) {
      partyLogo.src = party.logo;
      partyLogo.style.display = "block";
    } else {
      partyLogo.style.display = "none";
    }
  }

  const reqForNext = approvalsNeededForNext();
  const pct = Math.min(100, Math.round((G.approvals / reqForNext) * 100));
  if (txtProgress) txtProgress.textContent = `${pct}%`;
  if (barProgress) barProgress.style.width = `${pct}%`;

  if (popPeople) popPeople.textContent = `${clamp(G.popPeople)}%`;
  if (popMedia) popMedia.textContent = `${clamp(G.popMedia)}%`;
  if (popParty) popParty.textContent = `${clamp(G.popParty)}%`;

  if (scrGame) {
    scrGame.style.backgroundImage = `linear-gradient(180deg,rgba(0,0,0,.9),rgba(0,0,0,.98)),url('${office.bg}')`;
  }
}

// ---------- Modal / Toast ----------

let modal, modalTitle, modalBody, modalActions;

function setupModal() {
  modal = $("#modal");
  modalTitle = $("#modalTitle");
  modalBody = $("#modalBody");
  modalActions = $("#modalActions");

  if (modal) {
    modal.classList.add("hidden");
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }
}

function openModal(title, htmlBody, actions) {
  if (!modal) {
    alert(htmlBody.replace(/<[^>]+>/g, ""));
    return;
  }
  modalTitle.innerHTML = title || "";
  modalBody.innerHTML = htmlBody || "";
  modalActions.innerHTML = "";
  (actions || []).forEach((a) => {
    const b = document.createElement("button");
    b.className = "btn " + (a.className || "");
    b.textContent = a.label;
    b.onclick = () => {
      if (a.onClick) a.onClick();
    };
    modalActions.appendChild(b);
  });
  modal.classList.remove("hidden");
}

function closeModal() {
  if (modal) modal.classList.add("hidden");
}

function toast(text) {
  openModal("Informação", text, [{ label: "OK", className: "btn-gold", onClick: closeModal }]);
}

// ---------- Save / Load ----------

function saveGame() {
  try {
    localStorage.setItem(storeKey, JSON.stringify(G));
    toast("💾 Progresso salvo!");
  } catch (e) {
    console.warn("Falha ao salvar:", e);
  }
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

// ---------- Regras de carreira ----------

function approvalsNeededForNext() {
  // aumenta a exigência conforme sobe de cargo
  return 5 + G.officeIdx * 2;
}

function canRunForNextOffice() {
  if (G.officeIdx >= offices.length - 1) return false;
  const needs = approvalsNeededForNext();
  return G.approvals >= needs && clamp(G.popPeople) >= 60;
}

// ---------- Ações ----------

function actVoteProjects() {
  const projetos = [
    "Reforma da frota de ônibus",
    "Programa de segurança nos bairros",
    "Requalificação de escolas públicas",
    "Incentivo fiscal para pequenas empresas",
    "Criação de parque urbano",
    "Programa de cultura de bairro",
  ];
  const p = projetos[randInt(0, projetos.length - 1)];
  const total = randInt(35, 60);
  const baseYes = 0.45 + Math.random() * 0.25;
  const yes = Math.round(total * baseYes);
  const no = total - yes;
  const passa = yes > no;

  openModal(
    "Votação em plenário",
    `Em pauta: <b>${p}</b>.<br><br>Placar parcial: <b>${yes}</b> SIM • <b>${no}</b> NÃO.<br><br>Como você deseja votar?`,
    [
      {
        label: "Votar SIM",
        className: "btn-gold",
        onClick: () => {
          closeModal();
          resolveVote(true, passa, p);
        },
      },
      {
        label: "Votar NÃO",
        onClick: () => {
          closeModal();
          resolveVote(false, passa, p);
        },
      },
    ]
  );
}

function resolveVote(votouSim, passou, projeto) {
  let dPovo = 0,
    dMidia = 0,
    dPart = 0;

  if (passou && votouSim) {
    dPovo += 3;
    dMidia += 2;
    dPart += 2;
    G.approvals++;
    addFeed("Votação", `Você apoiou <b>${projeto}</b>, aprovado em plenário.`);
  } else if (!passou && !votouSim) {
    dPovo += 1;
    dMidia += 2;
    dPart += 1;
    addFeed("Votação", `Você votou contra <b>${projeto}</b>, que acabou rejeitado.`);
  } else {
    dPovo -= 2;
    dMidia -= 1;
    dPart -= 1;
    addFeed("Votação", `Sua posição em <b>${projeto}</b> dividiu o eleitorado.`);
  }

  G.popPeople += dPovo;
  G.popMedia += dMidia;
  G.popParty += dPart;
  G.termTurn += 1;

  updateHUD();
  setMain(
    "Resultado da votação",
    `Impactos:<br>Povo: ${(dPovo >= 0 ? "+" : "") + dPovo}%<br>Mídia: ${
      (dMidia >= 0 ? "+" : "") + dMidia
    }%<br>Partido: ${(dPart >= 0 ? "+" : "") + dPart}%<br><br>Leis aprovadas no cargo atual: <b>${
      G.approvals
    }</b> (necessárias <b>${approvalsNeededForNext()}</b> para habilitar campanha).`
  );
}

function actProposeLaw() {
  const ideias = [
    "Wi-Fi público nas praças",
    "Corredor exclusivo de ônibus",
    "Hortas comunitárias",
    "Valorização do magistério",
    "Lei anti-desperdício de alimentos",
    "Programa de acolhimento psicológico",
  ];
  const p = ideias[randInt(0, ideias.length - 1)];

  openModal(
    "Propor novo projeto",
    `Você pretende protocolar:<br><br><b>${p}</b><br><br>Enviar para tramitação?`,
    [
      {
        label: "Protocolar",
        className: "btn-gold",
        onClick: () => {
          closeModal();
          const chanceBase = 0.5;
          const bonusPart = (G.popParty - 50) / 200; // -0.25 a +0.25
          const aprovado = randomBool(chanceBase + bonusPart);

          if (aprovado) {
            G.approvals++;
            G.popPeople += 3;
            G.popMedia += 2;
            G.popParty += 2;
            addFeed("Projeto aprovado", `Seu projeto <b>${p}</b> virou lei.`);
            setMain(
              "Projeto aprovado",
              `Sua articulação deu certo. O projeto <b>${p}</b> foi aprovado e bem recebido pela sociedade.`
            );
          } else {
            G.popPeople -= 1;
            G.popMedia -= 2;
            G.popParty -= 1;
            addFeed("Projeto rejeitado", `O projeto <b>${p}</b> foi arquivado nas comissões.`);
            setMain(
              "Projeto rejeitado",
              `O projeto <b>${p}</b> travou nas comissões e acabou arquivado. A imprensa criticou sua articulação.`
            );
          }
          G.termTurn += 1;
          updateHUD();
        },
      },
      { label: "Cancelar", onClick: closeModal },
    ]
  );
}

function actCrisis() {
  const office = offices[G.officeIdx];

  if (office.type !== "executive") {
    toast("Crises executivas só estão disponíveis para Prefeito, Governador e Presidente.");
    return;
  }

  const crises = [
    {
      area: "Saúde",
      op: ["Mutirão de consultas", "Construir nova UPA", "Reforçar repasses a hospitais"],
      impact: [3, 4, 2],
    },
    {
      area: "Segurança",
      op: ["Aumentar policiamento", "Iluminação de ruas", "Guarda comunitária"],
      impact: [3, 2, 2],
    },
    {
      area: "Economia",
      op: ["Reduzir impostos", "Atrair empresas", "Programa de qualificação"],
      impact: [2, 3, 3],
    },
    {
      area: "Educação",
      op: ["Reforma de escolas", "Plano de formação docente", "Merenda reforçada"],
      impact: [3, 3, 2],
    },
  ];

  const c = crises[randInt(0, crises.length - 1)];
  let body = `Crise em <b>${c.area}</b>.<br><br>Escolha uma estratégia de resposta:<br><br>`;
  c.op.forEach((o, i) => {
    body += `<b>${i + 1}.</b> ${o}<br>`;
  });

  const actions = c.op.map((o, i) => ({
    label: o,
    className: i === 0 ? "btn-gold" : "",
    onClick: () => {
      closeModal();
      let d = c.impact[i];
      if (randomBool(0.25)) d -= 2; // às vezes dá ruim

      G.popPeople += d;
      G.popMedia += d > 0 ? 1 : -1;
      G.popParty += d >= 0 ? 1 : -2;
      G.termTurn += 1;

      addFeed("Crise", `Na área de <b>${c.area}</b>, você adotou a medida: ${o}.`);
      setMain(
        "Gestão de crise",
        `Impacto popular: ${(d >= 0 ? "+" : "") + d}%<br>Mídia: ${
          d >= 0 ? "+1%" : "-1%"
        }<br>Partido: ${d >= 0 ? "+1%" : "-2%"}`
      );
      updateHUD();
      checkImpeachment();
    },
  }));

  openModal("Gestão de crise", body, actions);
}

// ---------- Campanha e eleição ----------

function actCampaign() {
  if (!canRunForNextOffice()) {
    const needs = approvalsNeededForNext();
    toast(
      `Para disputar o próximo cargo você precisa de pelo menos <b>${needs}</b> leis aprovadas e <b>60% de apoio do povo</b>.`
    );
    return;
  }

  const next = offices[Math.min(offices.length - 1, G.officeIdx + 1)];
  const party = parties[G.partyIdx];

  openModal(
    "Campanha eleitoral",
    `Você deseja lançar sua campanha para <b>${next.name}</b>.<br><br>
    Escolha uma estratégia de campanha. Ela influencia sua força contra os adversários nas urnas.`,
    [
      {
        label: "Campanha limpa de propostas",
        className: "btn-gold",
        onClick: () => {
          closeModal();
          runElection(next, { tipo: "propostas", bonusPovo: 6, bonusMidia: 3, bonusPartido: 0 });
        },
      },
      {
        label: "Campanha agressiva de confronto",
        onClick: () => {
          closeModal();
          runElection(next, { tipo: "agressiva", bonusPovo: -1, bonusMidia: -3, bonusPartido: 5 });
        },
      },
      {
        label: "Campanha digital e marketing",
        onClick: () => {
          closeModal();
          runElection(next, { tipo: "digital", bonusPovo: 3, bonusMidia: 2, bonusPartido: 2 });
        },
      },
    ]
  );
}

function runElection(nextOffice, estrategia) {
  const party = parties[G.partyIdx];

  // Base do candidato
  let forcaEleitor = clamp(G.popPeople) * 0.5 + clamp(G.popMedia) * 0.2 + clamp(G.popParty) * 0.3;
  forcaEleitor += estrategia.bonusPovo + estrategia.bonusMidia + estrategia.bonusPartido;
  forcaEleitor += (party.forçaBase - 60) * 0.6; // partido mais forte ajuda

  // Adversários
  const adversariosN = randInt(2, 4);
  const nomes = ["Silva", "Souza", "Oliveira", "Santos", "Lima", "Pereira", "Almeida", "Costa"];
  const cand = [];

  cand.push({ nome: "Você", forca: forcaEleitor });

  for (let i = 0; i < adversariosN; i++) {
    const nome = `${nomes[randInt(0, nomes.length - 1)]} (${randInt(10, 99)}xx)`;
    const base = randInt(45, 80);
    const variacao = randInt(-5, 8);
    cand.push({ nome, forca: base + variacao });
  }

  // Ordena
  cand.sort((a, b) => b.forca - a.forca);
  const posicao = cand.findIndex((c) => c.nome === "Você") + 1;
  const venceu = posicao === 1;

  let corpo = `<b>Candidatos e força de campanha</b><br><br>`;
  cand.forEach((c, idx) => {
    corpo += `${idx + 1}º - ${c.nome}: ${Math.round(c.forca)} pontos<br>`;
  });
  corpo += `<br>Estratégia escolhida: <b>${estrategia.tipo}</b>.<br><br>`;

  if (venceu) {
    G.officeIdx = offices.indexOf(nextOffice);
    G.termTurn = 1;
    G.approvals = 0;
    G.electionsWon += 1;
    G.popMedia += 2;
    addFeed("Eleições", `Você foi eleito para o cargo de <b>${nextOffice.name}</b>!`);

    corpo += `Você <b>venceu</b> a eleição e assume o cargo de <b>${nextOffice.name}</b>! Um novo mandato começa.`;

    openModal("Vitória nas urnas", corpo, [
      {
        label: "Assumir o cargo",
        className: "btn-gold",
        onClick: () => {
          closeModal();
          updateHUD();
          setMain(
            "Início de mandato",
            `Você assumiu o cargo de <b>${nextOffice.name}</b> em <b>${G.city} - ${G.state}</b>, pelo partido <b>${party.sigla}</b>.<br><br>Use as ações à esquerda. Cada decisão afeta Povo, Mídia e Partido.`
          );
        },
      },
    ]);
  } else {
    G.popPeople -= 5;
    G.popMedia -= 3;
    addFeed("Eleições", `Sua campanha para <b>${nextOffice.name}</b> não conquistou votos suficientes.`);
    corpo += `Você <b>não foi eleito</b> desta vez. Continue trabalhando no cargo atual, fortalecendo leis e popularidade para uma nova tentativa.`;

    openModal("Derrota eleitoral", corpo, [
      {
        label: "Voltar ao trabalho",
        className: "btn-gold",
        onClick: () => {
          closeModal();
          updateHUD();
        },
      },
    ]);
  }

  updateHUD();
  saveGame();
}

// ---------- Impeachment ----------

function checkImpeachment() {
  if (clamp(G.popPeople) <= 0) {
    addFeed("Crise máxima", "Popularidade chegou a 0%. Você sofreu impeachment!");

    openModal(
      "Impeachment",
      `Sua popularidade despencou a <b>0%</b>. Você sofreu <b>impeachment</b> e precisará recomeçar a carreira a partir de Vereador.`,
      [
        {
          label: "Recomeçar como Vereador",
          className: "btn-gold",
          onClick: () => {
            closeModal();
            G.officeIdx = 0;
            G.termTurn = 1;
            G.approvals = 0;
            G.popPeople = 50;
            G.popMedia = 50;
            G.popParty = 50;
            updateHUD();
            setMain(
              "Novo começo",
              `Após o impeachment, você retorna à base como <b>Vereador</b>. Use o aprendizado para construir uma carreira mais sólida.`
            );
          },
        },
      ]
    );
  }
}

// ---------- Setup inicial ----------

function mountSetup() {
  const selParty = $("#selParty");
  const selState = $("#selState");
  const partyDesc = $("#partyDesc");

  if (selParty) {
    selParty.innerHTML = "";
    parties.forEach((p, i) => {
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = `${p.sigla} - ${p.nome}`;
      selParty.appendChild(opt);
    });
    selParty.addEventListener("change", () => {
      const p = parties[parseInt(selParty.value || "0", 10)];
      if (partyDesc) partyDesc.textContent = p ? p.desc : "";
    });
    // descrição inicial
    if (partyDesc && parties[0]) partyDesc.textContent = parties[0].desc;
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
  const office = offices[G.officeIdx];
  const party = parties[G.partyIdx];

  setMain(
    "Início de mandato",
    `Você assumiu o cargo de <b>${office.name}</b> em <b>${G.city} - ${G.state}</b>, pelo partido <b>${party.sigla}</b>.<br><br>
    • Vote projetos e proponha leis para ganhar relevância.<br>
    • Crises só aparecerão quando você ocupar cargos executivos (Prefeito, Governador, Presidente).<br>
    • Ao atingir o mínimo de leis aprovadas e boa popularidade, você poderá disputar o próximo cargo.`
  );

  addFeed("Posse", `Novo mandato como <b>${office.name}</b> em ${G.city}.`);
  fadeTo("game");
}

// ---------- Bind de botões ----------

function bindButtons() {
  const btnStart = $("#btnStart");
  const btnBegin = $("#btnBegin");
  const btnHome = $("#btnHome");
  const btnSave = $("#btnSave");
  const a1 = $("#btnAction1");
  const a2 = $("#btnAction2");
  const a3 = $("#btnAction3");
  const a4 = $("#btnAction4");

  if (btnStart) {
    btnStart.style.pointerEvents = "auto";
    btnStart.style.position = "relative";
    btnStart.style.zIndex = "9999";
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
      const state = $("#selState")?.value || "";

      if (!city) return toast("Digite o nome da cidade.");
      if (!state) return toast("Escolha um estado.");

      G.city = city;
      G.partyIdx = partyIdx;
      G.state = state;
      G.officeIdx = G.officeIdx || 0;

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

  if (btnSave) btnSave.onclick = saveGame;

  if (a1) a1.onclick = actVoteProjects;
  if (a2) a2.onclick = actProposeLaw;
  if (a3) a3.onclick = actCrisis;
  if (a4) a4.onclick = actCampaign;
}

// ---------- Init ----------

document.addEventListener("DOMContentLoaded", () => {
  screens.intro = $("#screenIntro");
  screens.setup = $("#screenSetup");
  screens.game = $("#screenGame");

  fadeEl = $("#cineFade");
  if (fadeEl) {
    fadeEl.classList.add("hidden");
    fadeEl.classList.remove("show");
    fadeEl.style.pointerEvents = "none";
  }

  setupModal();
  mountSetup();
  loadGame();

  // Garante que a tela inicial comece visível
  show("intro");

  bindButtons();
});
