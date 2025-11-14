// =====================
// Utils básicos
// =====================
const $  = (q) => document.querySelector(q);
const $$ = (q) => document.querySelectorAll(q);

const clamp      = (v) => Math.max(0, Math.min(100, Math.round(v)));
const randomBool = (p) => Math.random() < p;
const randInt    = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// =====================
// Telas & Fade
// =====================
const screens = {
  intro: document.getElementById("screenIntro"),
  setup: document.getElementById("screenSetup"),
  game:  document.getElementById("screenGame"),
};
let fadeEl = null;

function showScreen(id){
  Object.values(screens).forEach(s => s && s.classList.remove("show"));
  if (screens[id]) screens[id].classList.add("show");
}

function fadeTo(id){
  if (!fadeEl) { showScreen(id); return; }
  fadeEl.classList.remove("hidden");
  fadeEl.classList.add("show");
  setTimeout(()=>{
    showScreen(id);
    setTimeout(()=>{
      fadeEl.classList.remove("show");
      setTimeout(()=>fadeEl.classList.add("hidden"), 220);
    }, 80);
  }, 220);
}

// =====================
// Dados fixos
// =====================
const PARTIES = [
  { sigla:"PTM",  nome:"Partido do Trabalhador Moderno",        desc:"Programas sociais e trabalho.",      logo:"simulador_images/party_ptm.png"  },
  { sigla:"PSLB", nome:"Partido Social Liberal do Brasil",      desc:"Mercado e privatizações.",           logo:"simulador_images/party_pslb.png" },
  { sigla:"MDBR", nome:"Movimento Democrático Brasileiro Real", desc:"Pragmatismo e alianças.",            logo:"simulador_images/party_mdbr.png" },
  { sigla:"PVG",  nome:"Partido Verde Global",                  desc:"Sustentabilidade e inovação.",       logo:"simulador_images/party_pvg.png"  },
  { sigla:"PRP",  nome:"Partido Republicano Popular",           desc:"Costumes, segurança e ordem.",       logo:"simulador_images/party_prp.png"  },
];

const STATES = [
  "Acre","Alagoas","Amapá","Amazonas","Bahia","Ceará","Distrito Federal","Espírito Santo","Goiás","Maranhão",
  "Mato Grosso","Mato Grosso do Sul","Minas Gerais","Pará","Paraíba","Paraná","Pernambuco","Piauí","Rio de Janeiro",
  "Rio Grande do Norte","Rio Grande do Sul","Rondônia","Roraima","Santa Catarina","São Paulo","Sergipe","Tocantins"
];

const OFFICES = [
  { name:"Vereador",          type:"legislative", bg:"simulador_images/municipal.jpg" },
  { name:"Prefeito",          type:"executive",   bg:"simulador_images/cityhall.jpg"  },
  { name:"Deputado Estadual", type:"legislative", bg:"simulador_images/assembly.jpg"  },
  { name:"Prefeito",          type:"executive",   bg:"simulador_images/cityhall.jpg"  },
  { name:"Governador",        type:"executive",   bg:"simulador_images/governor.jpg"  },
  { name:"Deputado Federal",  type:"legislative", bg:"simulador_images/federal.jpg"   },
  { name:"Senador",           type:"legislative", bg:"simulador_images/senate.jpg"    },
  { name:"Presidente",        type:"executive",   bg:"simulador_images/president.jpg" },
];

const GROUPS_BASE = [
  { id:"trabalhadores", nome:"Trabalhadores urbanos", val:50 },
  { id:"periferia",     nome:"Periferia",             val:50 },
  { id:"empresarios",   nome:"Empresários",           val:50 },
  { id:"classe_media",  nome:"Classe média",          val:50 },
  { id:"servidores",    nome:"Servidores públicos",   val:50 },
  { id:"jovens",        nome:"Jovens",                val:50 },
  { id:"ambientalistas",nome:"Ambientalistas",        val:50 },
  { id:"igrejas",       nome:"Comunidade de fé",      val:50 },
];

const CAMPAIGN_THEMES = [
  {
    id:"seguranca",
    nome:"Segurança pública e combate ao crime",
    texto:"Prometer mais policiamento, inteligência e proteção às famílias.",
    grupos:["periferia","classe_media","igrejas"],
    pesosGrupos:{ periferia:1.4, classe_media:1.2, igrejas:1.1 },
    pesosTraços:{ carisma:0.8, negociacao:0.6, etica:0.3 }
  },
  {
    id:"saude",
    nome:"Saúde e atendimento digno",
    texto:"Ampliar atendimento, reduzir filas e investir em hospitais.",
    grupos:["trabalhadores","periferia","servidores"],
    pesosGrupos:{ trabalhadores:1.3, periferia:1.2, servidores:1.1 },
    pesosTraços:{ tecnica:0.8, etica:0.5, negociacao:0.4 }
  },
  {
    id:"educacao",
    nome:"Educação de qualidade",
    texto:"Valorização de professores, estrutura de escolas e tecnologia.",
    grupos:["jovens","classe_media","servidores"],
    pesosGrupos:{ jovens:1.4, classe_media:1.2, servidores:1.1 },
    pesosTraços:{ tecnica:0.8, etica:0.5, oratoria:0.4 }
  },
  {
    id:"economia",
    nome:"Emprego, renda e desenvolvimento",
    texto:"Atrair empresas, desburocratizar e apoiar pequenos negócios.",
    grupos:["empresarios","trabalhadores","classe_media"],
    pesosGrupos:{ empresarios:1.4, trabalhadores:1.2, classe_media:1.1 },
    pesosTraços:{ negociacao:0.9, tecnica:0.7, carisma:0.4 }
  },
  {
    id:"meioambiente",
    nome:"Meio ambiente e cidades sustentáveis",
    texto:"Cuidar de parques, rios, mobilidade e energias limpas.",
    grupos:["ambientalistas","jovens","classe_media"],
    pesosGrupos:{ ambientalistas:1.5, jovens:1.2, classe_media:1.1 },
    pesosTraços:{ etica:0.9, tecnica:0.5, oratoria:0.4 }
  },
];

const ADV_PROFILES = [
  { tipo:"Populista",   foco:"Povo",      bonusBase:+5, pesosTraços:{carisma:1.0, oratoria:0.8} },
  { tipo:"Técnico",     foco:"Gestão",    bonusBase:+3, pesosTraços:{tecnica:1.0, negociacao:0.7} },
  { tipo:"Conservador", foco:"Costumes",  bonusBase:+4, pesosTraços:{etica:0.8, carisma:0.5} },
  { tipo:"Verde",       foco:"Ambiente",  bonusBase:+4, pesosTraços:{etica:0.8, tecnica:0.6} },
];

const SCANDALS = [
  { nome:"Fake news nas redes sociais", impactoPop:-4, impactoMidia:-2, chance:0.25 },
  { nome:"Denúncia de adversário",      impactoPop:-7, impactoMidia:-4, chance:0.15 },
  { nome:"Erro grave em entrevista",    impactoPop:-5, impactoMidia:-3, chance:0.18 },
];

const WORKS_TEMPLATES = [
  { id:"hospital",   nome:"Construção de hospital regional", area:"saude",      minGain:4, maxGain:8 },
  { id:"escolas",    nome:"Reforma ampla de escolas",        area:"educacao",   minGain:4, maxGain:7 },
  { id:"viaduto",    nome:"Construção de viaduto/marginal",  area:"mobilidade", minGain:3, maxGain:6 },
  { id:"parques",    nome:"Revitalização de parques",        area:"lazer",      minGain:2, maxGain:5 },
  { id:"delegacia",  nome:"Novo complexo de segurança",      area:"seguranca",  minGain:4, maxGain:8 }
];

const WORKS_GROUP_EFFECTS = {
  saude:      ["trabalhadores","periferia","servidores"],
  educacao:   ["jovens","classe_media","servidores"],
  mobilidade: ["trabalhadores","periferia","classe_media"],
  lazer:      ["jovens","periferia","classe_media"],
  seguranca:  ["periferia","classe_media","igrejas"],
};

const MANDATE_EVENTS = [
  { turn:1,  id:"inicio100",   texto:"Primeiros 100 dias: a imprensa observa cada movimento. Medidas iniciais causam forte impressão." },
  { turn:4,  id:"ano1_crise",  texto:"Fim do primeiro ano: ajustes orçamentários geram desgaste político." },
  { turn:8,  id:"meio_mandato",texto:"Meio do mandato: a população cobra resultados concretos, especialmente em saúde e segurança." },
  { turn:12, id:"pre_eleicao", texto:"Ano pré-eleitoral: adversários começam a se movimentar e qualquer escândalo pesa dobrado." },
  { turn:16, id:"fechamento",  texto:"Último ano: balanço geral do mandato influenciará fortemente as urnas." },
];

// =====================
// Estado global
// =====================
const STORE_KEY = "SimPolitico_4_0_Deluxe";

let G = {
  partyIdx: 0,
  state: "",
  city: "",
  officeIdx: 0,
  termTurn: 1,
  approvals: 0,
  popPeople: 50,
  popMedia:  50,
  popParty:  50,
  integrity: 80,
  groups: GROUPS_BASE.map(g => ({...g})),
  traits: {
    carisma:     55,
    tecnica:     55,
    negociacao:  55,
    etica:       55,
    oratoria:    55,
  },
  feed: [],
  promises: [],
  scandals: [],
  lastTheme: null,
  works: [],
  seats: null,
  achievements: [],
  mandateEventsSeen: [],
};

// =====================
// Persistência
// =====================
function saveGame(){
  localStorage.setItem(STORE_KEY, JSON.stringify(G));
  toast("💾 Progresso salvo!");
}
function loadGame(){
  const raw = localStorage.getItem(STORE_KEY);
  if(!raw) return;
  try{
    const data = JSON.parse(raw);
    G = Object.assign(G, data || {});
  }catch(e){}
}
function resetGame(){
  G = {
    partyIdx: 0,
    state: "",
    city: "",
    officeIdx: 0,
    termTurn: 1,
    approvals: 0,
    popPeople: 50,
    popMedia:  50,
    popParty:  50,
    integrity: 80,
    groups: GROUPS_BASE.map(g => ({...g})),
    traits: {
      carisma:     55,
      tecnica:     55,
      negociacao:  55,
      etica:       55,
      oratoria:    55,
    },
    feed: [],
    promises: [],
    scandals: [],
    lastTheme: null,
    works: [],
    seats: null,
    achievements: [],
    mandateEventsSeen: [],
  };
  setupSeatsForOffice();
  saveGame();
}

// =====================
// Feed / grupos / carreira
// =====================
function addFeed(tag, text){
  G.feed.unshift({tag,text});
  if(G.feed.length>60) G.feed.pop();
  renderFeed();
}
function renderFeed(){
  const feed = $("#feed");
  if(!feed) return;
  feed.innerHTML = G.feed.map(i=>`
    <div class="feed-item">
      <div class="feed-tag">${i.tag}</div>
      <div class="feed-body">${i.text}</div>
    </div>
  `).join("");
}
function renderGroups(){
  const panel = $("#groupsPanel");
  if(!panel) return;
  panel.innerHTML = G.groups.map(g=>`
    <div class="group-row">
      <span class="group-name">${g.nome}</span>
      <span class="group-val">${clamp(g.val)}%</span>
    </div>
  `).join("");
}
function renderCareer(){
  const panel = $("#careerPanel");
  if(!panel) return;
  if(!G.achievements || !G.achievements.length){
    panel.innerHTML = `<span style="font-size:11px;opacity:.85;">Suas conquistas aparecerão aqui conforme sua carreira avança.</span>`;
    return;
  }
  panel.innerHTML = G.achievements.map(a=>`
    <div class="achv">• <b>${a.titulo}</b> – ${a.desc}</div>
  `).join("");
}
function addAchievement(id, titulo, desc){
  if(G.achievements.some(a=>a.id===id)) return;
  G.achievements.push({id,titulo,desc});
  addFeed("Conquista", titulo);
  renderCareer();
}

// =====================
// Modal / Toast
// =====================
let modal, modalTitle, modalBody, modalActions;
function setupModal(){
  modal        = $("#modal");
  modalTitle   = $("#modalTitle");
  modalBody    = $("#modalBody");
  modalActions = $("#modalActions");
  if(modal){
    if(!modal.classList.contains("hidden")) modal.classList.add("hidden");
    modal.addEventListener("click",(e)=>{ if(e.target===
