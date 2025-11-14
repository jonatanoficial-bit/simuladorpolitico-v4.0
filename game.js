// =============================
// Simulador Político — game.js
// Versão estável (sem fade, sem overlay)
// Botão INICIAR 100% clicável
// =============================

const $  = (q) => document.querySelector(q);
const $$ = (q) => document.querySelectorAll(q);

/* ---------- Gerência de telas simples ---------- */

const screens = {
  intro: null,
  setup: null,
  game:  null
};

function showScreen(id) {
  Object.values(screens).forEach(el => {
    if (el) el.classList.remove("show");
  });
  if (screens[id]) screens[id].classList.add("show");
}

/* ---------- Dados fixos ---------- */

const parties = [
  {
    sigla:"PTM",
    nome:"Partido do Trabalhador Moderno",
    desc:"Ênfase em programas sociais e direitos trabalhistas.",
    logo:"simulador_images/party_ptm.png"
  },
  {
    sigla:"PSLB",
    nome:"Partido Social Liberal do Brasil",
    desc:"Foco em mercado, privatizações e empreendedorismo.",
    logo:"simulador_images/party_pslb.png"
  },
  {
    sigla:"MDBR",
    nome:"Movimento Democrático Brasileiro Real",
    desc:"Pragmatismo, alianças amplas e negociação.",
    logo:"simulador_images/party_mdbr.png"
  },
  {
    sigla:"PVG",
    nome:"Partido Verde Global",
    desc:"Sustentabilidade, meio ambiente e cidades inteligentes.",
    logo:"simulador_images/party_pvg.png"
  },
  {
    sigla:"PRP",
    nome:"Partido Republicano Popular",
    desc:"Costumes conservadores, segurança e ordem.",
    logo:"simulador_images/party_prp.png"
  }
];

const states = [
  "Acre","Alagoas","Amapá","Amazonas","Bahia","Ceará","Distrito Federal","Espírito Santo",
  "Goiás","Maranhão","Mato Grosso","Mato Grosso do Sul","Minas Gerais","Pará","Paraíba",
  "Paraná","Pernambuco","Piauí","Rio de Janeiro","Rio Grande do Norte","Rio Grande do Sul",
  "Rondônia","Roraima","Santa Catarina","São Paulo","Sergipe","Tocantins"
];

// Ordem de cargos com imagem central
const offices = [
  {name:"Vereador",          type:"legislative", bg:"simulador_images/municipal.jpg"},
  {name:"Prefeito",          type:"executive",   bg:"simulador_images/cityhall.jpg"},
  {name:"Deputado Estadual", type:"legislative", bg:"simulador_images/assembly.jpg"},
  {name:"Prefeito",          type:"executive",   bg:"simulador_images/cityhall.jpg"},
  {name:"Governador",        type:"executive",   bg:"simulador_images/governor.jpg"},
  {name:"Deputado Federal",  type:"legislative", bg:"simulador_images/federal.jpg"},
  {name:"Senador",           type:"legislative", bg:"simulador_images/senate.jpg"},
  {name:"Presidente",        type:"executive",   bg:"simulador_images/president.jpg"}
];

const STORE_KEY = "simPolitico_4x";

/* ---------- Estado global do jogo ---------- */

let G = {
  partyIdx: 0,
  state: "",
  city: "",
  officeIdx: 0,       // índice em offices
  termTurn: 1,
  approvals: 0,       // projetos aprovados
  popPeople: 50,
  popMedia:  50,
  popParty:  50,
  feed: []
};

/* ---------- Helpers ---------- */

const clamp = (v) => Math.max(0, Math.min(100, Math.round(v)));
const randBool = (p) => Math.random() < p;

function addFeed(tag, text){
  G.feed.unshift({tag,text});
  if(G.feed.length>40) G.feed.pop();
  renderFeed();
}

function renderFeed(){
  const feedEl = $("#feed");
  if(!feedEl) return;
  feedEl.innerHTML = G.feed.map(item => `
    <div class="feed-item">
      <div class="feed-tag">${item.tag}</div>
      <div class="feed-body">${item.text}</div>
    </div>
  `).join("");
}

function setMain(title, html){
  const t = $("#mainTitle");
  const m = $("#mainText");
  if(t) t.textContent = title;
  if(m) m.innerHTML   = html;
}

/* ---------- HUD + imagem central ---------- */

function updateHUD(){
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
  const officeImage = $("#officeImage");

  if(hudOffice)   hudOffice.textContent   = office.name;
  if(hudLocation) hudLocation.textContent = `${G.city} - ${G.state} • Mandato ${G.termTurn}`;

  if(partyLogo){
    if(party && party.logo){
      partyLogo.src = party.logo;
      partyLogo.style.display = "block";
    }else{
      partyLogo.style.display = "none";
    }
  }

  const pct = Math.min(100, Math.round((G.approvals/15)*100));
  if(txtProgress) txtProgress.textContent = pct + "%";
  if(barProgress) barProgress.style.width = pct + "%";

  if(popPeople) popPeople.textContent = clamp(G.popPeople) + "%";
  if(popMedia)  popMedia.textContent  = clamp(G.popMedia)  + "%";
  if(popParty)  popParty.textContent  = clamp(G.popParty)  + "%";

  // Imagem central do cargo
  if(officeImage){
    officeImage.style.backgroundImage = `url('${office.bg}')`;
  }
}

/* ---------- Salvar / carregar ---------- */

function saveGame(){
  try{
    localStorage.setItem(STORE_KEY, JSON.stringify(G));
    alert("💾 Progresso salvo!");
  }catch(e){
    console.warn("Erro ao salvar:",e);
  }
}

function loadGame(){
  try{
    const raw = localStorage.getItem(STORE_KEY);
    if(!raw) return;
    const data = JSON.parse(raw);
    G = Object.assign(G, data || {});
  }catch(e){
    console.warn("Erro ao carregar:",e);
  }
}

/* ---------- Setup inicial (partido/estado) ---------- */

function mountSetup(){
  const selParty = $("#selParty");
  const selState = $("#selState");

  if(selParty){
    selParty.innerHTML = "";
    parties.forEach((p,i)=>{
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = `${p.sigla} - ${p.nome}`;
      selParty.appendChild(opt);
    });
  }

  if(selState){
    selState.innerHTML = "";
    states.forEach(s=>{
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      selState.appendChild(opt);
    });
  }
}

/* ---------- Início de mandato ---------- */

function beginMandate(){
  G.termTurn = 1;
  renderFeed();
  updateHUD();

  const office = offices[G.officeIdx];
  const party  = parties[G.partyIdx];

  setMain(
    "Início de mandato",
    `Você assumiu o cargo de <b>${office.name}</b> em <b>${G.city} - ${G.state}</b>, pelo partido <b>${party.sigla}</b>.<br><br>
     Use as ações à esquerda para votar projetos, propor leis, lidar com crises (quando for do executivo) e preparar campanhas.`
  );

  addFeed("Posse", `Novo mandato como <b>${office.name}</b> em ${G.city}.`);
  showScreen("game");
}

/* ---------- Mecânicas principais ---------- */

function actVoteProjects(){
  const office = offices[G.officeIdx];
  if(office.type !== "legislative"){
    setMain(
      "Votação",
      "Você está em um cargo do executivo. Aqui você não vota diretamente projetos em plenário, foque em <b>Crises & Política</b>."
    );
    return;
  }

  const projetos = [
    "Reforma da frota de ônibus",
    "Programa municipal de segurança nos bairros",
    "Requalificação de escolas públicas",
    "Incentivo fiscal para pequenas empresas",
    "Criação de novo parque urbano",
    "Programa de cultura nas periferias"
  ];
  const p = projetos[Math.floor(Math.random()*projetos.length)];

  const total  = 30 + Math.floor(Math.random()*40);
  const baseYes = 0.4 + Math.random()*0.3;
  const yes = Math.round(total*baseYes);
  const no  = total - yes;
  const passa = yes > no;

  const voceSim = randBool(0.6); // aleatório se você votou sim/não pra simulação simples
  let dPovo=0,dMidia=0,dPart=0;

  if(passa && voceSim){
    dPovo+=3; dMidia+=2; dPart+=2;
    G.approvals++;
    addFeed("Votação", `O projeto <b>${p}</b> foi aprovado. Você acompanhou a maioria.`);
  }else if(!passa && !voceSim){
    dPovo+=1; dMidia+=2; dPart+=1;
    addFeed("Votação", `O projeto <b>${p}</b> foi rejeitado e você se posicionou contra.`);
  }else{
    dPovo-=2; dMidia-=1;
    addFeed("Votação", `Sua posição no projeto <b>${p}</b> gerou polêmica.`);
  }

  G.popPeople += dPovo;
  G.popMedia  += dMidia;
  G.popParty  += dPart;
  G.termTurn  += 1;

  updateHUD();
  setMain(
    "Resultado da votação",
    `Projeto: <b>${p}</b><br>
     Placar: <b>${yes}</b> SIM • <b>${no}</b> NÃO<br><br>
     Impactos:<br>
     Povo: ${(dPovo>=0?"+":"")+dPovo}%<br>
     Mídia: ${(dMidia>=0?"+":"")+dMidia}%<br>
     Partido: ${(dPart>=0?"+":"")+dPart}%`
  );
}

function actProposeLaw(){
  const office = offices[G.officeIdx];
  if(office.type !== "legislative"){
    setMain(
      "Propor projeto",
      "Como membro do executivo, você não protocola leis diretamente. Foque em <b>Crises & Política</b> e gestão."
    );
    return;
  }

  const ideias = [
    "Wi-Fi público gratuito nas praças",
    "Corredor exclusivo de ônibus",
    "Hortas comunitárias nos bairros",
    "Plano de valorização do magistério",
    "Lei anti-desperdício de alimentos",
    "Programa de esporte para jovens em risco"
  ];
  const p = ideias[Math.floor(Math.random()*ideias.length)];

  const chanceBase   = 0.5;
  const bonusPartido = (G.popParty - 50)/200; // -0.25 a +0.25
  const aprovado     = randBool(chanceBase + bonusPartido);

  if(aprovado){
    G.approvals++;
    G.popPeople += 4;
    G.popMedia  += 2;
    G.popParty  += 3;
    addFeed("Projeto aprovado", `Seu projeto <b>${p}</b> foi aprovado e virou lei.`);
    setMain(
      "Projeto aprovado",
      `Seu projeto <b>${p}</b> avançou e foi aprovado.<br>
       A população e a imprensa reagiram positivamente.`
    );
  }else{
    G.popPeople -= 1;
    G.popMedia  -= 2;
    addFeed("Projeto rejeitado", `O projeto <b>${p}</b> foi engavetado nas comissões.`);
    setMain(
      "Projeto rejeitado",
      `O projeto <b>${p}</b> não avançou e foi rejeitado nas comissões.<br>
       Críticas surgiram sobre sua articulação política.`
    );
  }

  G.termTurn += 1;
  updateHUD();
}

function actCrisis(){
  const office = offices[G.officeIdx];
  if(office.type !== "executive"){
    setMain(
      "Crises & Política",
      "Crises de governo são tratadas diretamente por <b>prefeitos, governadores e presidente</b>. Suba de cargo para liderar esse tipo de decisão."
    );
    return;
  }

  const pacotes = [
    {
      area:"Saúde",
      op:[
        {texto:"Lançar mutirão de consultas", impact:+3},
        {texto:"Construir uma nova UPA", impact:+4},
        {texto:"Repassar recursos a hospitais filantrópicos", impact:+2}
      ]
    },
    {
      area:"Segurança",
      op:[
        {texto:"Reforçar policiamento em áreas críticas", impact:+3},
        {texto:"Investir em iluminação pública", impact:+2},
        {texto:"Criar guarda comunitária treinada", impact:+2}
      ]
    },
    {
      area:"Economia",
      op:[
        {texto:"Reduzir impostos de pequenos negócios", impact:+3},
        {texto:"Atrair empresas com incentivos", impact:+3},
        {texto:"Programa de qualificação profissional", impact:+3}
      ]
    },
    {
      area:"Educação",
      op:[
        {texto:"Reformar escolas prioritárias", impact:+3},
        {texto:"Valorizar o piso do magistério", impact:+4},
        {texto:"Ampliar tempo integral", impact:+3}
      ]
    }
  ];

  const crise = pacotes[Math.floor(Math.random()*pacotes.length)];
  const escolha = crise.op[Math.floor(Math.random()*crise.op.length)];
  let delta = escolha.impact;
  if(randBool(0.25)) delta -= 2; // chance de problema imprevisto

  G.popPeople += delta;
  G.popMedia  += (delta>0?1:-2);
  G.popParty  += (delta>=0?1:-2);
  G.termTurn  += 1;

  addFeed("Crise", `Na área de <b>${crise.area}</b>, você decidiu: ${escolha.texto}.`);

  setMain(
    "Gestão de crise",
    `Crise em <b>${crise.area}</b>.<br>
     Decisão: ${escolha.texto}.<br><br>
     Impacto popular: ${(delta>=0?"+":"")+delta}%`
  );

  updateHUD();
  checkImpeachment();
}

function actCampaign(){
  // Trava: precisa de aprovações e popularidade
  if(G.approvals < 8){
    setMain(
      "Campanha",
      "Você ainda não tem histórico suficiente de projetos e vitórias. Conquiste pelo menos <b>8 conquistas</b> (barra de progresso) antes de tentar o próximo cargo."
    );
    return;
  }
  if(clamp(G.popPeople) < 60){
    setMain(
      "Campanha",
      "Sua popularidade com o povo precisa estar em pelo menos <b>60%</b> para uma campanha competitiva ao próximo cargo."
    );
    return;
  }

  const atual = offices[G.officeIdx];
  const proximoIdx = Math.min(offices.length-1, G.officeIdx+1);
  const proximo = offices[proximoIdx];
  if(proximoIdx === G.officeIdx){
    setMain("Topo da carreira","Você já alcançou o cargo máximo: <b>Presidente</b>. Agora o desafio é se manter com boa aprovação.");
    return;
  }

  // "Simulação" de campanha
  const base = (clamp(G.popPeople)+clamp(G.popMedia)+clamp(G.popParty))/3;
  const forcaPartido = clamp(G.popParty);
  let pontos = 0;

  // 3 rodadas: pré-campanha, debates, reta final
  for(let i=0;i<3;i++){
    const prob = 0.45 + (base/250) + (forcaPartido/500);
    if(randBool(prob)) pontos++;
  }

  if(pontos >= 2){
    addFeed("Eleições", `Você foi eleito para o cargo de <b>${proximo.name}</b>!`);
    G.officeIdx = proximoIdx;
    G.termTurn  = 1;
    G.approvals = 0;
    G.popMedia += 2;

    updateHUD();
    setMain(
      "Vitória nas urnas",
      `Sua campanha para <b>${proximo.name}</b> foi bem-sucedida.<br>
       Um novo ciclo de poder se inicia.`
    );
  }else{
    addFeed("Eleições", `Você não conseguiu votos suficientes para <b>${proximo.name}</b>.`);
    G.popPeople -= 5;
    G.popMedia  -= 3;

    updateHUD();
    setMain(
      "Derrota eleitoral",
      `A campanha não alcançou o apoio necessário.<br>
       Trabalhe mais no cargo atual e tente novamente.`
    );
  }
}

/* ---------- Impeachment ---------- */

function checkImpeachment(){
  if(clamp(G.popPeople) <= 0){
    addFeed("Crise máxima","Popularidade com o povo chegou a 0%. Você sofreu impeachment!");
    setMain(
      "Impeachment",
      "Sua gestão perdeu completamente o apoio popular.<br>Você volta ao início da carreira como <b>Vereador</b>."
    );
    // reset básico mantendo partido/estado/cidade
    G.officeIdx = 0;
    G.termTurn  = 1;
    G.approvals = 0;
    G.popPeople = 40;
    G.popMedia  = 40;
    G.popParty  = 40;
    updateHUD();
  }
}

/* ---------- Binds de botões ---------- */

function bindButtons(){
  const btnStart  = $("#btnStart");
  const btnBegin  = $("#btnBegin");
  const btnHome   = $("#btnHome");
  const btnSave   = $("#btnSave");
  const btnAct1   = $("#btnAction1");
  const btnAct2   = $("#btnAction2");
  const btnAct3   = $("#btnAction3");
  const btnAct4   = $("#btnAction4");

  if(btnStart){
    // garante clique SEM NADA por cima
    btnStart.style.pointerEvents = "auto";
    btnStart.style.position = "relative";
    btnStart.style.zIndex = "9999";
    btnStart.addEventListener("click", (e)=>{
      e.preventDefault();
      showScreen("setup");
    });
  }

  if(btnBegin){
    btnBegin.addEventListener("click",(e)=>{
      e.preventDefault();
      const city = ($("#inpCity")?.value || "").trim();
      const partyIdx = parseInt($("#selParty")?.value || "0",10) || 0;
      const state    = $("#selState")?.value || "";

      if(!city){
        alert("Digite o nome da cidade.");
        return;
      }

      G.city     = city;
      G.partyIdx = partyIdx;
      G.state    = state;

      saveGame();
      beginMandate();
    });
  }

  if(btnHome){
    btnHome.addEventListener("click",(e)=>{
      e.preventDefault();
      showScreen("intro");
    });
  }

  if(btnSave) btnSave.onclick = saveGame;

  if(btnAct1) btnAct1.onclick = actVoteProjects;
  if(btnAct2) btnAct2.onclick = actProposeLaw;
  if(btnAct3) btnAct3.onclick = actCrisis;
  if(btnAct4) btnAct4.onclick = actCampaign;
}

/* ---------- Init ---------- */

document.addEventListener("DOMContentLoaded", ()=>{
  // mapeia telas
  screens.intro = $("#screenIntro");
  screens.setup = $("#screenSetup");
  screens.game  = $("#screenGame");

  mountSetup();
  loadGame();

  // sempre começa na intro
  showScreen("intro");

  bindButtons();
  updateHUD();
  renderFeed();
});
