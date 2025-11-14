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
  intro: $("#screenIntro"),
  setup: $("#screenSetup"),
  game:  $("#screenGame"),
};
const fadeEl = $("#cineFade");

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

// Grupos sociais
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

// Temas de campanha
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

// Adversários
const ADV_PROFILES = [
  { tipo:"Populista",   foco:"Povo",      bonusBase:+5, pesosTraços:{carisma:1.0, oratoria:0.8} },
  { tipo:"Técnico",     foco:"Gestão",    bonusBase:+3, pesosTraços:{tecnica:1.0, negociacao:0.7} },
  { tipo:"Conservador", foco:"Costumes",  bonusBase:+4, pesosTraços:{etica:0.8, carisma:0.5} },
  { tipo:"Verde",       foco:"Ambiente",  bonusBase:+4, pesosTraços:{etica:0.8, tecnica:0.6} },
];

// Escândalos de campanha
const SCANDALS = [
  { nome:"Fake news nas redes sociais", impactoPop:-4, impactoMidia:-2, chance:0.25 },
  { nome:"Denúncia de adversário",      impactoPop:-7, impactoMidia:-4, chance:0.15 },
  { nome:"Erro grave em entrevista",    impactoPop:-5, impactoMidia:-3, chance:0.18 },
];

// Obras de longo prazo
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

// Eventos de mandato (linha do tempo)
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
    modal.addEventListener("click",(e)=>{ if(e.target===modal) closeModal(); });
  }
}
function openModal(title, htmlBody, actions){
  if(!modal) return alert(htmlBody.replace(/<[^>]+>/g,""));
  modalTitle.innerHTML = title || "";
  modalBody.innerHTML  = htmlBody || "";
  modalActions.innerHTML = "";
  (actions||[]).forEach(a=>{
    const b = document.createElement("button");
    b.className = "btn " + (a.className||"");
    b.textContent = a.label;
    b.onclick = () => { if(a.onClick) a.onClick(); };
    modalActions.appendChild(b);
  });
  modal.classList.remove("hidden");
}
function closeModal(){
  if(modal) modal.classList.add("hidden");
}
function toast(text){
  openModal("Informação", text, [
    {label:"OK", className:"btn-gold", onClick:closeModal}
  ]);
}

// =====================
// HUD / cena / bancadas
// =====================
function setupSeatsForOffice(){
  const office = OFFICES[G.officeIdx];
  let baseTotal;
  if(office.name==="Vereador")            baseTotal = randInt(9,25);
  else if(office.name==="Deputado Estadual") baseTotal = randInt(24,60);
  else if(office.name==="Deputado Federal")  baseTotal = randInt(100,250);
  else if(office.name==="Senador")           baseTotal = randInt(21,81);
  else baseTotal = randInt(9,25);

  const baseAliadoFrac = 0.18 + (G.popParty-50)/250;
  const aliados   = Math.max(1, Math.round(baseTotal * baseAliadoFrac));
  const oposicao  = Math.max(1, Math.round(baseTotal * (0.3 + (50-G.popParty)/300)));
  let centro      = baseTotal - aliados - oposicao;
  if(centro<0) centro = Math.max(0, baseTotal - aliados - oposicao);

  G.seats = {total:baseTotal, aliados, oposicao, centro};
}

function updateHUD(){
  const office = OFFICES[G.officeIdx];
  const party  = PARTIES[G.partyIdx];

  const hudOffice   = $("#hudOffice");
  const hudLocation = $("#hudLocation");
  const partyLogo   = $("#partyLogo");
  const scene       = $("#sceneImage");

  if(hudOffice)   hudOffice.textContent   = office.name;
  if(hudLocation) hudLocation.textContent = `${G.city} - ${G.state} • Mandato ${G.termTurn}`;

  if(partyLogo){
    if(party && party.logo){
      partyLogo.src = party.logo;
      partyLogo.style.display="block";
    }else{
      partyLogo.style.display="none";
    }
  }
  if(scene){
    scene.style.backgroundImage = `url('${office.bg}')`;
  }

  const pct = Math.min(100, Math.round((G.approvals/15)*100));
  const txtProg = $("#txtProgress");
  const barProg = $("#barProgress");
  if(txtProg) txtProg.textContent = pct+"%";
  if(barProg) barProg.style.width = pct+"%";

  const elP = $("#popPeople");
  const elM = $("#popMedia");
  const elPar = $("#popParty");
  const elInt = $("#integrityVal");
  if(elP)   elP.textContent   = clamp(G.popPeople)+"%";
  if(elM)   elM.textContent   = clamp(G.popMedia)+"%";
  if(elPar) elPar.textContent = clamp(G.popParty)+"%";
  if(elInt) elInt.textContent = clamp(G.integrity)+"%";

  const elCar = $("#traitCarisma");
  const elTec = $("#traitTecnica");
  const elNeg = $("#traitNegociacao");
  const elEt  = $("#traitEtica");
  if(elCar) elCar.textContent = clamp(G.traits.carisma);
  if(elTec) elTec.textContent = clamp(G.traits.tecnica);
  if(elNeg) elNeg.textContent = clamp(G.traits.negociacao);
  if(elEt)  elEt.textContent  = clamp(G.traits.etica);

  // Bancada
  const hudSeats = $("#hudSeats");
  if(hudSeats && G.seats){
    hudSeats.textContent = `Bancada: ${G.seats.aliados} aliados • ${G.seats.centro} centro • ${G.seats.oposicao} oposição`;
  }

  renderGroups();
  renderCareer();
}

function setMain(title, html){
  const t = $("#mainTitle");
  const m = $("#mainText");
  if(t) t.textContent = title;
  if(m) m.innerHTML   = html;
}

// =====================
// Mandato / eventos de linha do tempo
// =====================
function checkMandateEvents(){
  const now = G.termTurn;
  MANDATE_EVENTS.forEach(ev=>{
    if(now === ev.turn && !G.mandateEventsSeen.includes(ev.id)){
      G.mandateEventsSeen.push(ev.id);
      addFeed("Mandato", ev.texto);
      // Pequeno impacto global
      if(ev.id==="pre_eleicao"){
        G.popPeople -= 2;
        G.popMedia  += 1;
      }
      if(ev.id==="meio_mandato"){
        G.popPeople -= 1;
      }
      updateHUD();
    }
  });
}

// =====================
// AÇÕES – Votar projetos
// =====================
function actVoteProjects(){
  const office = OFFICES[G.officeIdx];
  if(office.type !== "legislative"){
    toast("Votação de projetos só está disponível para Vereador, Deputados e Senador.");
    return;
  }

  const projetos = [
    "Reforma da frota de ônibus",
    "Programa de segurança nos bairros",
    "Requalificação de escolas públicas",
    "Incentivo fiscal para pequenas empresas",
    "Criação de parque urbano",
  ];
  const p = projetos[randInt(0,projetos.length-1)];

  if(!G.seats) setupSeatsForOffice();
  const s = G.seats;
  const aliadoFrac = s ? s.aliados / s.total : 0.25;

  const total  = randInt(30,70);
  const baseYes = 0.25 + aliadoFrac*0.5 + Math.random()*0.15;
  let yes = Math.round(total*baseYes);
  let no  = total-yes;
  const passa = yes>no;

  openModal(
    "Votação em plenário",
    `Em pauta: <b>${p}</b>.<br><br>
     Bancada atual: <b>${s.aliados}</b> aliados, <b>${s.centro}</b> centro, <b>${s.oposicao}</b> oposição.<br><br>
     Placar parcial:<br>
     <b>${yes}</b> votos SIM • <b>${no}</b> votos NÃO.<br><br>
     Como você deseja votar?`,
    [
      {label:"Votar SIM", className:"btn-gold", onClick:()=>{closeModal(); resolveVote(true, passa, p, yes,no);}},
      {label:"Votar NÃO",                    onClick:()=>{closeModal(); resolveVote(false,passa, p, yes,no);}},
    ]
  );
}

function resolveVote(votouSim, passou, projeto, yes,no){
  let dPovo=0, dMidia=0, dPart=0;

  if(passou && votouSim){
    dPovo+=3; dMidia+=2; dPart+=2;
    G.approvals++;
    G.traits.negociacao += 1;
    addFeed("Votação", `Você apoiou <b>${projeto}</b>, aprovado em plenário (${yes} x ${no}).`);
  }else if(!passou && !votouSim){
    dPovo+=1; dMidia+=2; dPart+=1;
    addFeed("Votação", `Você votou contra <b>${projeto}</b>, rejeitado (${yes} x ${no}).`);
  }else{
    dPovo-=2; dMidia-=1;
    addFeed("Votação", `Sua posição em <b>${projeto}</b> dividiu o eleitorado (${yes} x ${no}).`);
  }

  G.popPeople += dPovo;
  G.popMedia  += dMidia;
  G.popParty  += dPart;
  G.termTurn++;

  setMain(
    "Resultado da votação",
    `Impactos:<br>
     Povo: ${(dPovo>=0?"+":"")+dPovo}%<br>
     Mídia: ${(dMidia>=0?"+":"")+dMidia}%<br>
     Partido: ${(dPart>=0?"+":"")+dPart}%`
  );
  checkMandateEvents();
  checkImpeachment();
  updateHUD();
  saveGame();
}

// =====================
// AÇÕES – Propor lei
// =====================
function actProposeLaw(){
  const office = OFFICES[G.officeIdx];
  if(office.type !== "legislative"){
    toast("Proposição de novos projetos de lei é exclusiva dos cargos legislativos.");
    return;
  }

  const ideias = [
    "Wi-Fi público nas praças",
    "Corredor exclusivo de ônibus",
    "Hortas comunitárias",
    "Plano de valorização do magistério",
    "Lei anti-desperdício de alimentos"
  ];
  const p = ideias[randInt(0,ideias.length-1)];

  openModal(
    "Propor novo projeto",
    `Você vai protocolar o projeto:<br><br><b>${p}</b><br><br>Enviar para tramitação?`,
    [
      {label:"Protocolar", className:"btn-gold", onClick:()=>{
        closeModal();
        if(!G.seats) setupSeatsForOffice();
        const aliadoFrac = G.seats ? G.seats.aliados / G.seats.total : 0.25;

        const chanceBase   = 0.48;
        const bonusPartido = (G.popParty - 50)/200;
        const bonusNeg     = (G.traits.negociacao - 50)/250;
        const bonusBancada = (aliadoFrac - 0.25)*0.8;
        const aprovado = randomBool(chanceBase + bonusPartido + bonusNeg + bonusBancada);

        if(aprovado){
          G.approvals++;
          G.popPeople += 3;
          G.popMedia  += 2;
          G.popParty  += 2;
          G.traits.tecnica += 1;
          addFeed("Projeto aprovado", `Seu projeto <b>${p}</b> foi aprovado e virou lei.`);
          setMain("Projeto aprovado", "A recepção foi positiva entre a população e os grupos interessados.");
        }else{
          G.popPeople -= 1;
          G.popMedia  -= 2;
          addFeed("Projeto rejeitado", `O projeto <b>${p}</b> foi arquivado nas comissões.`);
          setMain("Projeto rejeitado", "A imprensa criticou a sua articulação política.");
        }
        G.termTurn++;
        checkMandateEvents();
        checkImpeachment();
        updateHUD();
        saveGame();
      }},
      {label:"Cancelar", onClick:closeModal}
    ]
  );
}

// =====================
// AÇÕES – Crises (Executivo)
// =====================
function actCrisis(){
  const office = OFFICES[G.officeIdx];
  if(office.type !== "executive"){
    toast("Crises de gestão só aparecem para Prefeito, Governador e Presidente.");
    return;
  }

  const crises = [
    { area:"Saúde",     op:["Mutirão de consultas","Construir nova UPA","Repassar recursos aos hospitais"],  impact:[+3,+4,+2] },
    { area:"Segurança", op:["Aumentar policiamento","Melhorar iluminação pública","Criar guarda comunitária"], impact:[+3,+2,+2] },
    { area:"Economia",  op:["Reduzir impostos","Atrair novas empresas","Programa de qualificação profissional"], impact:[+2,+3,+3] },
    { area:"Educação",  op:["Reforma de escolas","Formação de professores","Ampliação de vagas em creches"], impact:[+3,+3,+2] },
  ];
  const c = crises[randInt(0,crises.length-1)];
  let body = `Crise em <b>${c.area}</b>.<br><br>Escolha uma estratégia:<br><br>`;
  c.op.forEach((o,i)=>{ body += `<b>${i+1}.</b> ${o}<br>`; });

  const actions = c.op.map((o,i)=>({
    label: o,
    className: i===0 ? "btn-gold" : "",
    onClick: ()=>{
      closeModal();
      let d = c.impact[i];

      d += (G.traits.tecnica - 50)/30;
      if(d>0 && randomBool(0.25)) d += 1;

      G.popPeople += d;
      G.popMedia  += (d>0 ? 1 : -1);
      G.popParty  += (d>=0 ? 1 : -2);

      G.traits.tecnica    += d>0 ? 1 : 0;
      G.traits.negociacao += d>=0 ? 1 : 0;

      G.termTurn++;

      addFeed("Crise", `Você atuou na área de <b>${c.area}</b> com a medida: ${o}.`);
      setMain(
        "Gestão de crise",
        `Sua decisão em <b>${c.area}</b> gerou impacto de ${(d>=0?"+":"")+Math.round(d)}% na percepção popular.<br><br>
         A mídia reagiu ${d>=0?"de forma positiva":"com duras críticas"}.`
      );
      checkMandateEvents();
      checkImpeachment();
      updateHUD();
      saveGame();
    }
  }));

  openModal("Gestão de crise", body, actions);
}

// =====================
// AÇÕES – Obras & plano
// =====================
function actWorksPanel(){
  const office = OFFICES[G.officeIdx];
  if(office.type !== "executive"){
    toast("Gestão de obras e plano de governo só está disponível para Prefeito, Governador e Presidente.");
    return;
  }

  let html = "";

  if(G.works.length === 0){
    html += `<b>Você ainda não iniciou nenhuma obra de grande porte.</b><br><br>`;
  }else{
    html += `<b>Obras em andamento:</b><br><br>`;
    G.works.forEach(w=>{
      html += `• ${w.nome} — progresso: <b>${w.progress}%</b> ${w.done ? "(concluída)" : "(em execução)"}<br>`;
    });
    html += `<br>`;
  }

  html += `<hr><b>Iniciar ou acelerar obra:</b><br><br>`;
  html += `<select id="selWorkType" style="width:100%;padding:6px;border-radius:8px;border:1px solid rgba(212,175,55,.5);background:#111;color:#f5f5f5;">`;
  WORKS_TEMPLATES.forEach(w=>{
    html += `<option value="${w.id}">${w.nome}</option>`;
  });
  html += `</select><br><br>`;
  html += `<span style="font-size:12px;opacity:.85;">Cada avanço de obra pode aumentar sua popularidade com grupos específicos 
           (trabalhadores, periferia, classe média, etc.). Quando uma obra é concluída, o impacto é ainda maior.</span>`;

  openModal(
    "Obras & plano de governo",
    html,
    [
      {label:"Iniciar/avançar obra", className:"btn-gold", onClick:()=>{
        const sel = $("#selWorkType");
        if(!sel){ closeModal(); return; }
        const workId = sel.value;
        const tmpl = WORKS_TEMPLATES.find(w=>w.id===workId);
        if(!tmpl){ closeModal(); return; }

        let work = G.works.find(w=>w.id===workId);
        if(!work){
          work = {
            id: tmpl.id,
            nome: tmpl.nome,
            area: tmpl.area,
            progress: randInt(15,30),
            done:false
          };
          G.works.push(work);
          addFeed("Obras", `Você iniciou a obra: <b>${work.nome}</b>.`);
        }else if(!work.done){
          work.progress += randInt(20,40);
        }

        if(work.progress >= 100 && !work.done){
          work.progress = 100;
          work.done = true;

          const gain = randInt(tmpl.minGain, tmpl.maxGain);
          G.popPeople += gain;
          G.popMedia  += Math.round(gain/2);
          G.approvals++;

          const groupsAffected = WORKS_GROUP_EFFECTS[work.area] || [];
          groupsAffected.forEach(id=>{
            const g = G.groups.find(gr=>gr.id===id);
            if(g) g.val += randInt(3,7);
          });

          addFeed("Obras concluídas", `A obra <b>${work.nome}</b> foi concluída e inaugurada com festa.`);
          setMain(
            "Obra concluída",
            `A obra <b>${work.nome}</b> foi entregue à população.<br><br>
             Isso gerou um aumento de popularidade e fortaleceu sua imagem de gestor que realiza entregas concretas.`
          );

          if(G.works.filter(w=>w.done).length>=3){
            addAchievement("rei_obras","Rei das Obras","Concluiu pelo menos 3 obras de grande porte em mandatos executivos.");
          }

        }else if(!work.done){
          addFeed("Obras", `A obra <b>${work.nome}</b> avançou para <b>${work.progress}%</b>.`);
          setMain(
            "Obra em andamento",
            `A obra <b>${work.nome}</b> continua em execução e já alcançou <b>${work.progress}%</b> de progresso.<br><br>
             Manter o ritmo das entregas ajuda a consolidar sua força nas próximas eleições.`
          );
        }

        G.termTurn++;
        checkMandateEvents();
        checkImpeachment();
        updateHUD();
        saveGame();
        closeModal();
      }},
      {label:"Fechar", onClick:closeModal}
    ]
  );
}

// =====================
// AÇÕES – Bastidores & corrupção
// =====================
function actBackroom(){
  const cenarios = [
    {
      id:"empreiteira",
      texto:"Uma grande empreiteira oferece uma doação 'não declarada' em troca de prioridade em futuras obras.",
      payoffParty:+4, payoffEmp:+5, intLoss:-10
    },
    {
      id:"caixa_dois",
      texto:"Aliados sugerem um esquema de caixa dois para turbinar sua próxima campanha.",
      payoffParty:+5, payoffEmp:+3, intLoss:-12
    },
    {
      id:"contrato_amigo",
      texto:"Um amigo de infância pede um contrato superfaturado em troca de apoio político.",
      payoffParty:+3, payoffEmp:+4, intLoss:-8
    },
  ];
  const c = cenarios[randInt(0,cenarios.length-1)];

  openModal(
    "Bastidores & riscos",
    `Situação de bastidor:<br><br>
     <i>${c.texto}</i><br><br>
     Você pode ganhar apoio rápido do partido e de empresários, mas isso fere sua <b>integridade</b> e aumenta o risco de escândalos futuros.<br><br>
     O que deseja fazer?`,
    [
      {label:"Aceitar o esquema", className:"btn-gold", onClick:()=>{
        closeModal();
        G.popParty   += c.payoffParty;
        const emp = G.groups.find(g=>g.id==="empresarios");
        if(emp) emp.val += c.payoffEmp;
        G.integrity  += c.intLoss;
        G.traits.etica -= 2;

        addFeed("Escândalo potencial", "Você aceitou um acordo político arriscado nos bastidores.");
        setMain(
          "Escolha arriscada",
          "Você optou por um atalho perigoso. Seu partido e alguns empresários ficaram satisfeitos,<br>mas sua integridade caiu e o risco de escândalos aumentou."
        );
        G.termTurn++;
        checkMandateEvents();
        checkImpeachment();
        updateHUD();
        saveGame();
      }},
      {label:"Recusar e denunciar", onClick:()=>{
        closeModal();
        G.integrity += 5;
        G.traits.etica += 2;
        G.popParty -= 2;
        const emp = G.groups.find(g=>g.id==="empresarios");
        if(emp) emp.val -= 3;
        addFeed("Postura ética", "Você recusou o esquema e denunciou a proposta suspeita.");
        setMain(
          "Postura ética",
          "Você manteve sua integridade e reforçou sua imagem de político que não aceita atalhos ilegais.<br><br>
           Parte do partido e de empresários ficou irritada, mas sua reputação moral cresceu."
        );
        G.termTurn++;
        checkMandateEvents();
        checkImpeachment();
        updateHUD();
        saveGame();
      }},
      {label:"Ignorar o assunto", onClick:()=>{
        closeModal();
        G.traits.etica += 1;
        G.termTurn++;
        addFeed("Ambiguidade", "Você preferiu não se envolver diretamente, mas também não cortou o problema pela raiz.");
        checkMandateEvents();
        updateHUD();
        saveGame();
      }}
    ]
  );
}

// =====================
// AÇÕES – Campanha premium
// =====================
function actCampaign(){
  if(G.officeIdx >= OFFICES.length-1){
    toast("Você já está no cargo máximo (Presidente).");
    return;
  }
  if(G.approvals < 8){
    toast("Você precisa ter pelo menos 8 projetos/decisões bem-sucedidos antes de disputar um novo cargo.");
    return;
  }
  if(clamp(G.popPeople) < 60){
    toast("Sua popularidade com o povo precisa ser pelo menos 60% para se candidatar ao próximo cargo.");
    return;
  }

  const next = OFFICES[G.officeIdx+1];

  let body = `
    Você está prestes a lançar sua campanha para <b>${next.name}</b>.<br><br>
    Escolha o <b>tema central</b> da sua campanha. Ele define quais grupos sociais você conquista mais,
    e como seus atributos entram no cálculo da eleição.<br><br>
  `;
  CAMPAIGN_THEMES.forEach(t=>{
    body += `<b>${t.nome}</b><br><span style="font-size:12px;opacity:.85;">${t.texto}</span><br><br>`;
  });

  const actions = CAMPAIGN_THEMES.map(theme => ({
    label: theme.nome,
    className:"btn-gold",
    onClick: ()=>{
      closeModal();
      G.lastTheme = theme.id;
      addFeed("Campanha", `Você lança campanha para <b>${next.name}</b> com foco em <b>${theme.nome}</b>.`);
      runElection(next, theme);
    }
  }));

  openModal("Planejamento de campanha", body, actions);
}

function runElection(nextOffice, theme){
  // escândalos – chance aumenta se integridade está baixa
  let escText = "";
  const integFactor = (100 - clamp(G.integrity))/100;
  SCANDALS.forEach(s=>{
    const extraChance = s.chance * integFactor;
    if(randomBool(s.chance + extraChance)){
      G.popPeople += s.impactoPop;
      G.popMedia  += s.impactoMidia;
      G.scandals.push({nome:s.nome, impacto:s.impactoPop});
      escText += `• ${s.nome} (-${Math.abs(s.impactoPop)}% de popularidade com o povo)<br>`;
    }
  });
  if(escText){
    addFeed("Escândalo", "Durante a campanha houve ruídos e crises de imagem.");
  }

  const baseOpinioes = (clamp(G.popPeople)+clamp(G.popMedia)+clamp(G.popParty))/3;

  // grupos
  let somaGrupos = 0;
  let pesoTotalGrupos = 0;
  G.groups.forEach(g=>{
    const peso = (theme.pesosGrupos && theme.pesosGrupos[g.id]) || 1.0;
    somaGrupos += clamp(g.val) * peso;
    pesoTotalGrupos += peso;
  });
  const mediaGrupos = pesoTotalGrupos>0 ? (somaGrupos/pesoTotalGrupos) : 50;

  // atributos
  let scoreAtributos = 0;
  for(const key in theme.pesosTraços){
    const peso = theme.pesosTraços[key];
    if(key==="carisma")    scoreAtributos += G.traits.carisma    * peso;
    if(key==="tecnica")    scoreAtributos += G.traits.tecnica    * peso;
    if(key==="negociacao") scoreAtributos += G.traits.negociacao * peso;
    if(key==="etica")      scoreAtributos += G.traits.etica      * peso;
    if(key==="oratoria")   scoreAtributos += G.traits.oratoria   * peso;
  }
  scoreAtributos = scoreAtributos / 3.5;

  // integridade ajuda se for alta
  const integBonus = (clamp(G.integrity)-50)/4;

  let scorePlayer = baseOpinioes*0.4 + mediaGrupos*0.3 + scoreAtributos*0.2 + integBonus;
  scorePlayer += randInt(-5,5);

  function scoreAdv(adv){
    let base = randInt(38,60) + adv.bonusBase;
    let somaAttr = 0;
    for(const key in adv.pesosTraços){
      const peso = adv.pesosTraços[key];
      const fakeVal = randInt(45,85);
      somaAttr += fakeVal * peso;
    }
    somaAttr = somaAttr / 3.5;
    return base*0.6 + somaAttr*0.4 + randInt(-5,5);
  }

  const adv1 = ADV_PROFILES[randInt(0,ADV_PROFILES.length-1)];
  const adv2 = ADV_PROFILES[randInt(0,ADV_PROFILES.length-1)];
  const sAdv1 = scoreAdv(adv1);
  const sAdv2 = scoreAdv(adv2);

  const total = Math.max(1, scorePlayer + sAdv1 + sAdv2);
  const pctPlayer = Math.round((scorePlayer/total)*100);
  const pctOpp1   = Math.round((sAdv1/total)*100);
  const pctOpp2   = 100 - pctPlayer - pctOpp1;

  let winner = "player";
  if(pctOpp1>pctPlayer && pctOpp1>=pctOpp2) winner="opp1";
  else if(pctOpp2>pctPlayer && pctOpp2>=pctOpp1) winner="opp2";

  let escBlock = escText
    ? `<br><b>Durante a campanha ocorreram:</b><br>${escText}<br>`
    : "";

  let resumo = `
    <b>Corrida eleitoral para ${nextOffice.name}</b><br><br>
    Tema central da sua campanha: <b>${theme.nome}</b>.<br>
    ${escBlock}
    <b>Resultado aproximado das urnas:</b><br><br>
    Você: <b>${pctPlayer}%</b> dos votos válidos<br>
    Candidato A (${adv1.tipo}): <b>${pctOpp1}%</b><br>
    Candidato B (${adv2.tipo}): <b>${pctOpp2}%</b><br><br>
  `;

  const bodyEl = document.body;

  if(winner==="player"){
    addFeed("Eleições", `Você foi eleito para o cargo de <b>${nextOffice.name}</b>!`);
    G.officeIdx++;
    G.termTurn = 1;
    G.approvals = 0;
    G.popMedia  += 3;
    G.popPeople += 4;
    G.traits.carisma    += 2;
    G.traits.negociacao += 2;

    setupSeatsForOffice();

    resumo += `Você foi <b>eleito</b> e assume o novo cargo. Seu discurso em torno de <b>${theme.nome}</b> convenceu a maioria do eleitorado.`;

    theme.grupos.forEach(id=>{
      const g = G.groups.find(gr=>gr.id===id);
      if(g) g.val += randInt(3,8);
    });

    setMain("Vitória nas urnas", resumo);
    if(bodyEl){
      bodyEl.classList.add("flash-gold");
      setTimeout(()=>bodyEl.classList.remove("flash-gold"), 650);
    }

    if(G.officeIdx===OFFICES.length-1 && clamp(G.popPeople)>=75 && clamp(G.integrity)>=75){
      addAchievement("estadista","Estadista do povo","Chegou à Presidência com alta popularidade e integridade.");
    }

  }else{
    addFeed("Eleições", `Você não conseguiu votos suficientes para <b>${nextOffice.name}</b>.`);
    G.popPeople -= 5;
    G.popMedia  -= 3;

    resumo += `Você <b>não foi eleito</b> desta vez. Os adversários conseguiram conectar melhor com o eleitorado.<br><br>
               Continue trabalhando no cargo atual, aprove projetos relevantes e mantenha alta popularidade para tentar novamente.`;
    setMain("Derrota eleitoral", resumo);
  }

  checkMandateEvents();
  checkImpeachment();
  updateHUD();
  saveGame();
}

// =====================
// Impeachment / fins ruins
// =====================
function checkImpeachment(){
  const bodyEl = document.body;

  if(clamp(G.popPeople) <= 0){
    addFeed("Crise máxima","Popularidade com o povo chegou a 0%. Você sofreu impeachment!");
    setMain(
      "Impeachment",
      `Sua popularidade desabou e você sofreu <b>impeachment</b>.<br><br>
       Sua carreira política recomeça como vereador. Tente construir uma trajetória mais sólida desta vez.`
    );
    if(bodyEl){
      bodyEl.classList.add("flash-red");
      setTimeout(()=>bodyEl.classList.remove("flash-red"),650);
    }
    addAchievement("queda_impopular","Queda por impopularidade","Chegou a 0% de apoio popular e foi retirado do cargo.");
    resetGame();
    updateHUD();
    return;
  }

  if(clamp(G.integrity) <= 10){
    addFeed("Escândalo grave","Sua integridade despencou e um escândalo de corrupção estourou.");
    setMain(
      "Queda por corrupção",
      `Após uma série de denúncias e investigações, você perde o mandato por <b>corrupção</b>.<br><br>
       Além do impeachment, sua imagem fica marcada como ficha suja. A reconstrução da carreira será longa.`
    );
    if(bodyEl){
      bodyEl.classList.add("flash-red");
      setTimeout(()=>bodyEl.classList.remove("flash-red"),650);
    }
    addAchievement("queda_corrupcao","Queda por corrupção","Perdeu o cargo após escândalo grave de integridade.");
    resetGame();
    updateHUD();
  }

  // Conquista de legislador forte
  if(G.approvals>=30){
    addAchievement("arquiteto_leis","Arquiteto de Leis","Teve mais de 30 projetos/decisões bem-sucedidos ao longo da carreira.");
  }
}

// =====================
// Setup inicial
// =====================
function mountSetup(){
  const selParty = $("#selParty");
  const selState = $("#selState");

  if(selParty){
    selParty.innerHTML = "";
    PARTIES.forEach((p,i)=>{
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = `${p.sigla} - ${p.nome}`;
      selParty.appendChild(opt);
    });
  }
  if(selState){
    selState.innerHTML = "";
    STATES.forEach(s=>{
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      selState.appendChild(opt);
    });
  }
}

function beginMandate(){
  addFeed("Posse", `Você assumiu o cargo de <b>${OFFICES[G.officeIdx].name}</b> em ${G.city} - ${G.state}.`);
  setMain(
    "Início de mandato",
    `Você agora é <b>${OFFICES[G.officeIdx].name}</b> em <b>${G.city} - ${G.state}</b>, pelo partido <b>${PARTIES[G.partyIdx].sigla}</b>.<br><br>
     Use as ações para construir sua reputação com o povo, a mídia, o partido e os grupos sociais. 
     Decisões de bastidor podem acelerar ou destruir sua carreira.`
  );
  setupSeatsForOffice();
  updateHUD();
  renderFeed();
  fadeTo("game");
}

// =====================
// Binds de botões
// =====================
function bindButtons(){
  const btnStart = $("#btnStart");
  const btnBegin = $("#btnBegin");
  const btnHome  = $("#btnHome");
  const btnSave  = $("#btnSave");

  if(btnStart){
    btnStart.style.pointerEvents = "auto";
    btnStart.style.position = "relative";
    btnStart.style.zIndex  = "10";
    btnStart.addEventListener("click",(e)=>{
      e.preventDefault();
      fadeTo("setup");
    });
  }

  if(btnBegin){
    btnBegin.addEventListener("click",(e)=>{
      e.preventDefault();
      const city     = ($("#inpCity")?.value || "").trim();
      const partyIdx = parseInt($("#selParty")?.value || "0",10) || 0;
      const state    = $("#selState")?.value || "";

      if(!city){
        toast("Digite o nome da cidade.");
        return;
      }

      G.city     = city;
      G.partyIdx = partyIdx;
      G.state    = state;
      G.officeIdx = 0;
      G.termTurn  = 1;
      G.mandateEventsSeen = [];
      setupSeatsForOffice();
      saveGame();
      beginMandate();
    });
  }

  if(btnHome){
    btnHome.addEventListener("click",(e)=>{
      e.preventDefault();
      fadeTo("intro");
    });
  }
  if(btnSave){
    btnSave.addEventListener("click",(e)=>{
      e.preventDefault();
      saveGame();
    });
  }

  const a1 = $("#btnAction1");
  const a2 = $("#btnAction2");
  const a3 = $("#btnAction3");
  const a4 = $("#btnAction4");
  const a5 = $("#btnAction5");
  const a6 = $("#btnAction6");

  if(a1) a1.onclick = actVoteProjects;
  if(a2) a2.onclick = actProposeLaw;
  if(a3) a3.onclick = actCrisis;
  if(a4) a4.onclick = actCampaign;
  if(a5) a5.onclick = actWorksPanel;
  if(a6) a6.onclick = actBackroom;
}

// =====================
// Init
// =====================
document.addEventListener("DOMContentLoaded",()=>{
  setupModal();
  mountSetup();
  loadGame();
  renderFeed();
  renderGroups();
  renderCareer();
  if(!G.seats) setupSeatsForOffice();
  updateHUD();
  showScreen("intro");
  bindButtons();
});
