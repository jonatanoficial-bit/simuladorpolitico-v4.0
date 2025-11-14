/* =========================
   Simulador Político – Game Engine
   Versão 4.0 Estável
   ========================= */

const $  = (q) => document.querySelector(q);
const $$ = (q) => document.querySelectorAll(q);

/* ---------- Telas ---------- */
let screens = {};
let fadeEl   = null;

/* Exibe apenas uma tela */
function show(id) {
  Object.values(screens).forEach((s) => s && s.classList.remove("show"));
  if (screens[id]) screens[id].classList.add("show");
}

/* Transição com fade */
function fadeTo(id) {
  if (!fadeEl) return show(id);

  fadeEl.classList.remove("hidden");
  fadeEl.classList.add("show");

  setTimeout(() => {
    show(id);

    setTimeout(() => {
      fadeEl.classList.remove("show");
      setTimeout(() => fadeEl.classList.add("hidden"), 250);
    }, 50);

  }, 200);
}

/* ---------- Dados ---------- */

const parties = [
  { sigla:"PTM",  nome:"Partido do Trabalhador Moderno", logo:"simulador_images/party_ptm.png"  },
  { sigla:"PSLB", nome:"Partido Social Liberal do Brasil", logo:"simulador_images/party_pslb.png" },
  { sigla:"MDBR", nome:"Movimento Democrático Brasileiro Real", logo:"simulador_images/party_mdbr.png" },
  { sigla:"PVG",  nome:"Partido Verde Global", logo:"simulador_images/party_pvg.png"  },
  { sigla:"PRP",  nome:"Partido Republicano Popular", logo:"simulador_images/party_prp.png"  }
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
  { name:"Presidente",        type:"executive",   bg:"simulador_images/president.jpg" }
];

/* ---------- Estado geral ---------- */

const STORE_KEY = "SimPolitico_Save_v40";

let G = {
  partyIdx: 0,
  state: "São Paulo",
  city: "Minha Cidade",
  officeIdx: 0,
  approvals: 0,
  popPeople: 50,
  popMedia:  50,
  popParty:  50,
  feed: [],
  turn: 1
};

/* Utilidades */
const clamp = (v) => Math.max(0, Math.min(100, Math.round(v)));
const rnd    = (n) => Math.floor(Math.random() * n);
const rbool  = (p) => Math.random() < p;

/* ---------- Modal / fallback ---------- */

let modal, modalTitle, modalBody, modalActions;

function setupModal() {
  modal        = $("#modal");
  modalTitle   = $("#modalTitle");
  modalBody    = $("#modalBody");
  modalActions = $("#modalActions");
}

function openModal(title, htmlBody, actions) {

  /* Se NÃO existir modal no HTML → usamos confirm()/alert() */
  if (!modal) {
    const txt = (title ? title + "\n\n" : "") + htmlBody.replace(/<[^>]+>/g, "");

    if (actions && actions.length === 2) {
      const ok = confirm(txt);

      if (ok && actions[0].onClick) actions[0].onClick();
      if (!ok && actions[1].onClick) actions[1].onClick();
    } else {
      alert(txt);
      if (actions && actions[0] && actions[0].onClick) actions[0].onClick();
    }

    return;
  }

  /* Modal estilizado */
  modalTitle.innerHTML = title;
  modalBody.innerHTML  = htmlBody;
  modalActions.innerHTML = "";

  actions.forEach((a) => {
    const btn = document.createElement("button");
    btn.className = "btn " + (a.className || "");
    btn.textContent = a.label;
    btn.onclick = a.onClick;
    modalActions.appendChild(btn);
  });

  modal.classList.remove("hidden");
}

function closeModal() {
  if (modal) modal.classList.add("hidden");
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

/* ---------- HUD ---------- */

function updateHUD() {
  const office = offices[G.officeIdx];
  const party  = parties[G.partyIdx];

  $("#hudOffice").textContent   = office.name;
  $("#hudLocation").textContent = `${G.city} - ${G.state} • Mandato ${G.turn}`;

  $("#partyLogo").src = party.logo;

  $("#popPeople").textContent = G.popPeople + "%";
  $("#popMedia").textContent  = G.popMedia  + "%";
  $("#popParty").textContent  = G.popParty  + "%";

  const pct = Math.min(100, Math.round((G.approvals / 15) * 100));
  $("#txtProgress").textContent = pct + "%";
  $("#barProgress").style.width = pct + "%";

  // Imagem central
  const centerImg = $("#centerImage");
  if (centerImg) centerImg.src = office.bg;

  $("#screenGame").style.backgroundImage =
    `linear-gradient(180deg,rgba(0,0,0,.85),rgba(0,0,0,.93)),url('${office.bg}')`;
}

/* ---------- Ações do Jogo ---------- */

function actVote() {
  const projetos = [
    "Reforma da frota de ônibus",
    "Incentivo fiscal para pequenas empresas",
    "Requalificação de escolas públicas",
    "Zona verde urbana",
    "Programa Saúde Já"
  ];

  const p = projetos[rnd(projetos.length)];
  const total = 30 + rnd(40);
  const sim   = Math.round(total * (0.4 + Math.random()*0.3));
  const nao   = total - sim;
  const passou = sim > nao;

  openModal(
    "Votação em plenário",
    `Em pauta: <b>${p}</b>.<br>Placar: <b>${sim}</b> SIM • <b>${nao}</b> NÃO.<br><br>Como deseja votar?`,
    [
      {
        label:"Votar SIM",
        className:"btn-gold",
        onClick: () => resolveVote(true, passou, p)
      },
      {
        label:"Votar NÃO",
        onClick: () => resolveVote(false, passou, p)
      }
    ]
  );
}

function resolveVote(votouSim, passou, projeto) {
  let dp = 0, dm = 0, dpt = 0;

  if (passou && votouSim) {
    dp+=3; dm+=2; dpt+=2;
    G.approvals++;
    addFeed("Votação", `Você apoiou <b>${projeto}</b> e o projeto foi aprovado.`);
  }
  else if (!passou && !votouSim) {
    dp+=1; dm+=2; dpt+=1;
    addFeed("Votação", `Você votou contra <b>${projeto}</b>, rejeitado.`);
  }
  else {
    dp-=2; dm-=1;
    addFeed("Votação", `Sua decisão sobre <b>${projeto}</b> gerou divisão.`);
  }

  G.popPeople += dp;
  G.popMedia  += dm;
  G.popParty  += dpt;
  G.turn++;

  updateHUD();

  setMain(
    "Resultado da votação",
    `
      Povo: ${(dp>=0?"+":"")+dp}%<br>
      Mídia: ${(dm>=0?"+":"")+dm}%<br>
      Partido: ${(dpt>=0?"+":"")+dpt}%
    `
  );
}

/* ---------- Propor Projeto ---------- */

function actPropose() {
  const ideias = [
    "Plano de Wi-Fi Público",
    "Ciclovias Inteligentes",
    "Kit Educação Digital",
    "Programa Alimentar",
    "Transporte Verde"
  ];

  const p = ideias[rnd(ideias.length)];

  openModal(
    "Propor Projeto",
    `Deseja protocolar o projeto:<br><b>${p}</b>?`,
    [
      {
        label:"Protocolar",
        className:"btn-gold",
        onClick: () => {
          closeModal();
          const aprovado = rbool(0.5 + (G.popParty-50)/200);

          if (aproprovado) {
            G.approvals++;
            G.popPeople+=3;
            G.popMedia +=2;
            G.popParty +=2;
            addFeed("Projeto aprovado", `Seu projeto <b>${p}</b> virou lei.`);
            setMain("Projeto aprovado", "A população gostou da iniciativa.");
          } else {
            G.popPeople--;
            G.popMedia -=2;
            addFeed("Projeto rejeitado", `O projeto <b>${p}</b> foi arquivado.`);
            setMain("Projeto rejeitado", "A mídia criticou sua articulação.");
          }
          G.turn++;
          updateHUD();
        }
      },
      {
        label:"Cancelar",
        onClick: closeModal
      }
    ]
  );
}

/* ---------- Crises ---------- */

function actCrisis() {
  const office = offices[G.officeIdx];
  if (office.type !== "executive") {
    return alert("Somente cargos do Executivo enfrentam crises.");
  }

  const crises = [
    {area:"Saúde", op:["Mutirão","UPA","Recursos"], impact:[+3,+4,+2]},
    {area:"Segurança", op:["Policiamento","Iluminação","Guarda"], impact:[+3,+2,+2]},
    {area:"Economia", op:["Redução de impostos","Atração de empresas","Cursos"], impact:[+2,+3,+3]}
  ];

  const c = crises[rnd(crises.length)];

  openModal(
    "Crise em " + c.area,
    "Escolha uma ação:",
    c.op.map((acao,i)=>({
      label: acao,
      onClick:()=>{
        let d = c.impact[i];
        if (rbool(0.2)) d -= 2;

        G.popPeople += d;
        G.popMedia  += d>=0?1:-1;
        G.popParty  += d>=0?1:-2;
        G.turn++;

        addFeed("Crise", `Você atuou em <b>${c.area}</b>: ${acao}`);
        setMain("Crise", `Impacto popular: ${d>=0?"+":""}${d}%`);

        updateHUD();
      }
    }))
  );
}

/* ---------- Campanha ---------- */

function actCampaign() {

  if (G.popPeople < 60) {
    alert("Popularidade mínima: 60% para campanha.");
    return;
  }

  const next = offices[G.officeIdx+1];
  if (!next) return alert("Você já está no cargo máximo!");

  openModal(
    "Campanha eleitoral",
    `Lançar campanha para <b>${next.name}</b>?`,
    [
      {
        label:"Iniciar campanha",
        className:"btn-gold",
        onClick:()=>{
          closeModal();

          const base = (G.popPeople + G.popMedia + G.popParty)/3;
          let pontos = 0;
          for (let i=0;i<5;i++) if (rbool(0.45+base/200)) pontos++;

          if (pontos>=3) {
            G.officeIdx++;
            G.turn = 1;
            G.approvals = 0;
            G.popMedia+=2;
            addFeed("Eleições", `Você foi eleito <b>${next.name}</b>!`);
            setMain("Vitória!", `Parabéns! Agora você é <b>${next.name}</b>.`);
          } else {
            G.popPeople-=4;
            G.popMedia -=3;
            addFeed("Eleições", `Sua campanha para <b>${next.name}</b> falhou.`);
            setMain("Derrota eleitoral", "Tente novamente mais tarde.");
          }

          updateHUD();
        }
      },
      {
        label:"Cancelar",
        onClick: closeModal
      }
    ]
  );
}

/* ---------- Sistema de Salvamento ---------- */

function saveGame() {
  localStorage.setItem(STORE_KEY, JSON.stringify(G));
  alert("Progresso salvo!");
}

function loadGame() {
  const data = localStorage.getItem(STORE_KEY);
  if (!data) return;
  G = Object.assign(G, JSON.parse(data));
}

/* ---------- Setup ---------- */

function setMain(title, html) {
  $("#mainTitle").textContent = title;
  $("#mainText").innerHTML    = html;
}

function mountSetup() {
  const p = $("#selParty");
  parties.forEach((pt,i)=>{
    const o = document.createElement("option");
    o.value=i;
    o.textContent=pt.sigla+" - "+pt.nome;
    p.appendChild(o);
  });

  const s = $("#selState");
  states.forEach(st=>{
    const o = document.createElement("option");
    o.value = st;
    o.textContent = st;
    s.appendChild(o);
  });
}

/* ---------- Bind ---------- */

function bindButtons() {

  $("#btnStart").onclick = ()=>fadeTo("setup");

  $("#btnBegin").onclick = ()=>{
    const city = $("#inpCity").value.trim();
    if (!city) return alert("Digite sua cidade.");

    G.city     = city;
    G.state    = $("#selState").value;
    G.partyIdx = parseInt($("#selParty").value);

    beginMandate();
  };

  $("#btnAction1").onclick = actVote;
  $("#btnAction2").onclick = actPropose;
  $("#btnAction3").onclick = actCrisis;
  $("#btnAction4").onclick = actCampaign;

  $("#btnSave").onclick = saveGame;
  $("#btnHome").onclick = ()=>fadeTo("intro");
}

/* ---------- Mandato ---------- */

function beginMandate() {
  renderFeed();
  updateHUD();

  setMain(
    "Início de mandato",
    `Você assumiu o cargo de <b>${offices[G.officeIdx].name}</b> em <b>${G.city} - ${G.state}</b>.`
  );

  addFeed("Posse", `Começou como <b>${offices[G.officeIdx].name}</b> em ${G.city}.`);

  fadeTo("game");
}

/* ---------- Inicialização ---------- */

document.addEventListener("DOMContentLoaded", () => {

  screens = {
    intro: $("#screenIntro"),
    setup: $("#screenSetup"),
    game : $("#screenGame")
  };

  fadeEl = $("#cineFade");
  if (fadeEl) fadeEl.classList.add("hidden");

  setupModal();
  mountSetup();
  loadGame();
  bindButtons();

  show("intro");
});
