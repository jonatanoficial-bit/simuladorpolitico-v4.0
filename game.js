/* ============================================================
   game.js — Simulador Político Deluxe 3.0
   Arquitetura: HUD + Setup + Ações + Campanha + Crises
   Compatível com GitHub Pages
   ============================================================ */

const $ = (q) => document.querySelector(q);

/* ============================================================
   1) TELAS
   ============================================================ */

const screens = {
    intro: $("#screenIntro"),
    setup: $("#screenSetup"),
    game:  $("#screenGame"),
};

function show(id){
    Object.values(screens).forEach(s => s.classList.remove("show"));
    screens[id].classList.add("show");
}

function fadeTo(id){
    const fade = $("#cineFade");
    fade.classList.remove("hidden");
    fade.classList.add("show");

    setTimeout(()=>{
        show(id);
        setTimeout(()=>{
            fade.classList.remove("show");
            fade.classList.add("hidden");
        },300);
    },250);
}

/* ============================================================
   2) DADOS DO JOGO (Partidos, Estados, Cargos)
   ============================================================ */

const parties = [
    { sigla:"PTM",  nome:"Partido do Trabalhador Moderno", logo:"simulador_images/party_ptm.png" },
    { sigla:"PSLB", nome:"Partido Social Liberal do Brasil", logo:"simulador_images/party_pslb.png" },
    { sigla:"MDBR", nome:"Movimento Democrático Brasileiro Real", logo:"simulador_images/party_mdbr.png" },
    { sigla:"PVG",  nome:"Partido Verde Global", logo:"simulador_images/party_pvg.png" },
    { sigla:"PRP",  nome:"Partido Republicano Popular", logo:"simulador_images/party_prp.png" },
];

const states = [
"Acre","Alagoas","Amapá","Amazonas","Bahia","Ceará","DF","Espirito Santo","Goiás","Maranhão",
"Mato Grosso","Mato Grosso do Sul","Minas Gerais","Pará","Paraíba","Paraná","Pernambuco",
"Piauí","Rio de Janeiro","Rio Grande do Norte","Rio Grande do Sul","Rondônia","Roraima",
"Santa Catarina","São Paulo","Sergipe","Tocantins"
];

const offices = [
  { name:"Vereador",          type:"legislative", bg:"simulador_images/municipal.jpg" },
  { name:"Prefeito",          type:"executive",   bg:"simulador_images/cityhall.jpg" },
  { name:"Deputado Estadual", type:"legislative", bg:"simulador_images/assembly.jpg" },
  { name:"Prefeito",          type:"executive",   bg:"simulador_images/cityhall.jpg" },
  { name:"Governador",        type:"executive",   bg:"simulador_images/governor.jpg" },
  { name:"Deputado Federal",  type:"legislative", bg:"simulador_images/federal.jpg" },
  { name:"Senador",           type:"legislative", bg:"simulador_images/senate.jpg" },
  { name:"Presidente",        type:"executive",   bg:"simulador_images/president.jpg" },
];

/* ============================================================
   3) ESTADO DO JOGADOR
   ============================================================ */

let G = {
    partyIdx: 0,
    state: "",
    city: "",
    officeIdx: 0,
    term: 1,
    approvals: 0,
    popPeople: 50,
    popMedia:  50,
    popParty:  50,
    feed: []
};

function clamp(v){ return Math.max(0, Math.min(100, Math.round(v))); }

function approvalsNeeded(){
    return 10 + (G.officeIdx * 3);  
}

/* ============================================================
   4) FEED / NOTÍCIAS
   ============================================================ */

function addFeed(tag,text){
    G.feed.unshift({tag,text});
    if(G.feed.length>50) G.feed.pop();
    renderFeed();
}

function renderFeed(){
    const feed = $("#feed");
    feed.innerHTML = G.feed.map(f => `
        <div class="feed-item">
          <div class="feed-tag">${f.tag}</div>
          <div class="feed-body">${f.text}</div>
        </div>
    `).join("");
}

/* ============================================================
   5) HUD E ATUALIZAÇÃO DE TELA
   ============================================================ */

function updateHUD(){
    const office = offices[G.officeIdx];
    const party  = parties[G.partyIdx];

    $("#hudOffice").textContent = office.name;
    $("#hudLocation").textContent = `${G.city} - ${G.state} • Mandato ${G.term}`;

    // Logo do Partido
    const pLogo = $("#partyLogo");
    pLogo.src = party.logo;

    // Barra de progresso
    const req = approvalsNeeded();
    const pct = Math.round((G.approvals / req) * 100);
    $("#txtProgress").textContent = pct + "%";
    $("#barProgress").style.width = pct + "%";

    // Popularidade
    $("#popPeople").textContent = G.popPeople + "%";
    $("#popMedia").textContent  = G.popMedia  + "%";
    $("#popParty").textContent  = G.popParty  + "%";

    // Fundo da tela
    $("#screenGame").style.backgroundImage =
      `linear-gradient(180deg,#000a,#000e), url('${office.bg}')`;

    // IMAGEM CENTRAL NOVA
    $("#officeImage").style.backgroundImage = `url('${office.bg}')`;
}

/* ============================================================
   6) MODAL
   ============================================================ */

const modal = $("#modal");
const modalTitle = $("#modalTitle");
const modalBody  = $("#modalBody");
const modalActions = $("#modalActions");

function openModal(title,body,actions=[]){
    modalTitle.innerHTML = title;
    modalBody.innerHTML  = body;
    modalActions.innerHTML = "";

    actions.forEach(a=>{
        const b = document.createElement("button");
        b.className = "btn btn-gold";
        b.textContent = a.label;
        b.onclick = a.onClick;
        modalActions.appendChild(b);
    });

    modal.classList.remove("hidden");
}

function closeModal(){
    modal.classList.add("hidden");
}

/* ============================================================
   7) AÇÕES — Votar, Propor Lei, Crises
   ============================================================ */

function actVote(){
    const projetos = [
        "Reforma dos ônibus",
        "Programa de segurança",
        "Reforma de escolas",
        "Incentivo fiscal",
        "Ecoparque urbano"
    ];
    const p = projetos[Math.floor(Math.random()*projetos.length)];
    const total = 30 + Math.floor(Math.random()*40);
    const sim = Math.round(total * (0.45+Math.random()*0.3));
    const nao = total-sim;
    const passou = sim>nao;

    openModal(
        "Votação em Plenário",
        `Projeto: <b>${p}</b><br><br>
         Placar parcial:<br>
         <b>${sim}</b> SIM • <b>${nao}</b> NÃO<br><br>
         Como votar?`,
        [
            { label:"Votar SIM", onClick:()=>{closeModal();resolveVote(true,passou,p);} },
            { label:"Votar NÃO", onClick:()=>{closeModal();resolveVote(false,passou,p);} }
        ]
    );
}

function resolveVote(sim, passou, projeto){
    let dP=0,dM=0,dPa=0;

    if(passou && sim){
        dP+=3; dM+=2; dPa+=2;
        G.approvals++;
        addFeed("Votação",`Seu voto SIM aprovou <b>${projeto}</b>.`);
    } else if(!passou && !sim){
        dP+=1; dM+=2; dPa+=1;
        addFeed("Votação",`Você votou NÃO e o projeto caiu.`);
    } else {
        dP-=2; dM-=1;
        addFeed("Votação",`Seu voto em <b>${projeto}</b> causou polêmica.`);
    }

    G.popPeople += dP;
    G.popMedia  += dM;
    G.popParty  += dPa;

    updateHUD();
    setMain("Votação concluída", `Impacto final:<br>
      Povo: ${dP}%<br>Mídia: ${dM}%<br>Partido: ${dPa}%`);
}

/* ============================================================
   PROPOR LEI
   ============================================================ */

function actPropose(){
    const ideias=[
        "Wi-Fi grátis nas praças",
        "Hortas comunitárias",
        "Plano de valorização dos professores",
        "Lei anti-desperdício",
        "Corredor exclusivo para ônibus"
    ];
    const p = ideias[Math.floor(Math.random()*ideias.length)];

    openModal(
      "Propor Lei",
      `Você deseja protocolar:<br><b>${p}</b>?`,
      [
         {label:"Protocolar", onClick:()=>{
             closeModal();
             const chance = 0.5 + ((G.popParty-50)/200);
             const ok = Math.random()<chance;

             if(ok){
                G.approvals++;
                G.popPeople+=3;G.popMedia+=2;G.popParty+=2;
                addFeed("Projeto Aprovado",`O projeto <b>${p}</b> virou lei.`);
                setMain("Projeto Aprovado", "A população aprovou a medida!");
             } else {
                G.popPeople--;G.popMedia-=2;
                addFeed("Projeto Rejeitado",`O projeto <b>${p}</b> foi arquivado.`);
                setMain("Rejeitado","O projeto não avançou nas comissões.");
             }
             updateHUD();
         }},
         {label:"Cancelar", onClick:closeModal}
      ]
    );
}

/* ============================================================
   CRISES — Apenas cargos executivos
   ============================================================ */

function actCrisis(){

    if(offices[G.officeIdx].type!=="executive"){
        return openModal("Não disponível","Somente cargos executivos enfrentam crises.",[
            {label:"OK",onClick:closeModal}
        ]);
    }

    const crises = [
        {area:"Saúde",ops:["Mutirão","Nova UPA","Reforço de verba"],impact:[+3,+4,+2]},
        {area:"Segurança",ops:["Policiamento","Luz pública","Guarda"],impact:[+3,+2,+2]},
        {area:"Economia",ops:["Desonerar","Atrair empresas","Capacitação"],impact:[+2,+3,+3]}
    ];

    const c = crises[Math.floor(Math.random()*crises.length)];

    let html = `Crise em <b>${c.area}</b>.<br><br>Escolha ação:<br><br>`;
    c.ops.forEach((o,i)=>{ html += `${i+1}. ${o}<br>` });

    const actions = c.ops.map((o,i)=>({
        label:o,
        onClick:()=>{
            closeModal();
            let d = c.impact[i];
            if(Math.random()<0.2) d-=2;
            G.popPeople+=d;
            G.popMedia += d>0?1:-1;
            G.popParty += d>=0?1:-2;
            G.approvals += d>0?1:0;
            addFeed("Crise",`Você agiu em ${c.area}: ${o}`);
            updateHUD();
            setMain("Crise",`Impacto no povo: ${d}%`);
        }
    }));

    openModal("Gestão de Crise",html,actions);
}

/* ============================================================
   CAMPANHA — Eleição realista
   ============================================================ */

function actCampaign(){

    const req = approvalsNeeded();

    if(G.approvals < req){
        return openModal("Não pode concorrer",
          `Você precisa de <b>${req}</b> aprovações e tem <b>${G.approvals}</b>.`,
          [{label:"OK",onClick:closeModal}]
        );
    }

    const next = offices[Math.min(G.officeIdx+1,offices.length-1)];

    openModal(
        "Campanha",
        `Deseja concorrer ao cargo de <b>${next.name}</b>?`,
        [
            {label:"Sim",onClick:()=>{closeModal();runElection(next);}},
            {label:"Não",onClick:closeModal}
        ]
    );
}

function runElection(nextOffice){

    let base =
        (G.popPeople + G.popMedia + G.popParty) / 3 +
        (G.approvals * 2);

    let chance = base / 130;

    if(chance > 0.85) chance = 0.85;
    if(chance < 0.15) chance = 0.15;

    const venceu = Math.random() < chance;

    if(venceu){
        addFeed("ELEIÇÃO",`Você venceu! Novo cargo: <b>${nextOffice.name}</b>.`);
        G.officeIdx = offices.indexOf(nextOffice);
        G.term = 1;
        G.approvals = 0;
        setMain("Vitória!",`Você agora é <b>${nextOffice.name}</b>!`);
    } else {
        addFeed("ELEIÇÃO",`Derrota para <b>${nextOffice.name}</b>.`);
        G.popPeople -= 5;
        G.popMedia  -= 3;
        setMain("Derrota Eleitoral","A campanha não foi suficiente. Tente novamente.");
    }

    updateHUD();
}

/* ============================================================
   SETUP
   ============================================================ */

function mountSetup(){
    const selParty = $("#selParty");
    const selState = $("#selState");

    parties.forEach((p,i)=>{
        const o=document.createElement("option");
        o.value=i;o.textContent=p.sigla+" - "+p.nome;
        selParty.appendChild(o);
    });

    states.forEach(s=>{
        const o=document.createElement("option");
        o.value=s;o.textContent=s;
        selState.appendChild(o);
    });
}

function setMain(title,text){
    $("#mainTitle").textContent = title;
    $("#mainText").innerHTML = text;
}

/* ============================================================
   SALVAR
   ============================================================ */

function saveGame(){
    localStorage.setItem("simPolitico",JSON.stringify(G));
    openModal("Salvar","Progresso salvo!",[{label:"OK",onClick:closeModal}]);
}

function loadGame(){
    const raw = localStorage.getItem("simPolitico");
    if(!raw) return;
    G = JSON.parse(raw);
    updateHUD();
    renderFeed();
}

/* ============================================================
   EVENTOS DE BOTÕES
   ============================================================ */

$("#btnStart").onclick = ()=>fadeTo("setup");

$("#btnBegin").onclick = ()=>{
    const city = $("#inpCity").value.trim();
    if(!city) return alert("Digite a cidade!");

    G.city = city;
    G.partyIdx = parseInt($("#selParty").value);
    G.state = $("#selState").value;

    fadeTo("game");
    updateHUD();
    setMain("Início",`Você iniciou como <b>${offices[G.officeIdx].name}</b>!`);
};

$("#btnHome").onclick = ()=>fadeTo("intro");

$("#btnSave").onclick = saveGame;

$("#btnAction1").onclick = actVote;
$("#btnAction2").onclick = actPropose;
$("#btnAction3").onclick = actCrisis;
$("#btnAction4").onclick = actCampaign;

/* ============================================================
   INÍCIO
   ============================================================ */

document.addEventListener("DOMContentLoaded",()=>{
    mountSetup();
    loadGame();
});
