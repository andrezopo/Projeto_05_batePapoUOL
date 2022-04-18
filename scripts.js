let mensagensDom = document.querySelector(".mensagens");
let participantesDom = document.querySelector(".contatos");
let mensagens = [];
let participantes = [];
let nome;
let ultimoElemento;
let mensagemInput = document.querySelector(".escrever-mensagem > div");
let destinatario = "Todos";
let tipoMensagem = "message";

function buscarMensagens() {
    let promise = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages")
    promise.then(renderizarMensagens);
}

function povoarDOM(mensagens){
    mensagensDom.innerHTML = null;
    for ( let i = 0; i < mensagens.length; i++) {
        if (mensagens[i].to === nome || mensagens[i].type !== "private_message" || mensagens[i].from === nome) {
            if (mensagens[i].type === "status") {
                mensagensDom.innerHTML += `<div class="mensagem cinza"><span><h4>${mensagens[i].time}</h4><strong> ${mensagens[i].from}</strong> ${mensagens[i].text}</span></div>`
            }
            else if (mensagens[i].type === "message"){
                mensagensDom.innerHTML += `<div class="mensagem"><span><h4>${mensagens[i].time}</h4><strong> ${mensagens[i].from}</strong> para <strong>${mensagens[i].to}:</strong> ${mensagens[i].text}</span></div>`
            }
            else {
                mensagensDom.innerHTML += `<div class="mensagem vermelho"><span><h4>${mensagens[i].time}</h4><strong> ${mensagens[i].from}</strong> reservadamente para <strong>${mensagens[i].to}:</strong> ${mensagens[i].text}</span></div>`
            }
        }
    }
    mensagemAnterior = mensagens[mensagens.length - 1].innerHTML;
}
function fazerLogin(){
    let elemento = document.querySelector(".tela-entrada");
    elemento.classList.add("invisivel");
}

function renderizarMensagens(resposta) {
    ultimoElemento = resposta.data[resposta.data.length -1];
    if (mensagens[mensagens.length -1] !== ultimoElemento){
        mensagens = resposta.data
        povoarDOM(mensagens)
        let ultimaMensagem = document.querySelector(".mensagens > :last-child");
        ultimaMensagem.scrollIntoView();
    }else{
        mensagens = resposta.data
        povoarDOM(mensagens)
    }
}

function definirUsuario() {
    nome = document.querySelector("input").value;
    document.querySelector(".login").classList.add("invisivel");
    document.querySelector(".carregando").classList.remove("invisivel");
    let promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/participants", { name: nome });
    promise.then(buscarContatos);
    promise.then(buscarMensagens);
    promise.then(atualizarMensagens);
    promise.then(atualizarParticipantes);
    promise.then(manterConexao);
    promise.then(fazerLogin);
    promise.catch(falhaUsername);

}
function manterConexao(){
    let idInterval = setInterval(function () { axios.post("https://mock-api.driven.com.br/api/v6/uol/status", { name: nome });}, 4000);
}
function atualizarMensagens(){
    let idInterval = setInterval(buscarMensagens, 3000);
}

function falhaUsername(erro) {
    if (erro.response.status === 400) {
        alert("Já existe um usuário online com este nome, escolha outro.")
        document.querySelector(".login").classList.remove("invisivel");
        document.querySelector(".carregando").classList.add("invisivel");
    }
}

function enviarMensagem() {
    let mensagemAEnviar = document.querySelector(".escrever-mensagem div input");

    let mensagem = {
        from: nome,
        to: destinatario,
        text: mensagemAEnviar.value,
        type: tipoMensagem,
    }
    let promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/messages", mensagem);
    promise.then(buscarMensagens);
    mensagemAEnviar.value = "";
    promise.catch(function () {window.location.reload()} );
}
function buscarContatos(){
    let promise = axios.get("https://mock-api.driven.com.br/api/v6/uol/participants")
    promise.then(renderizarParticipantes);
    promise.catch(aviso =  () => alert("Não foi possível atualizar os participantes. Tente novamente em instantes."))
}
function visualizarContatos(){
    document.querySelector(".contatos-ativos").classList.toggle("invisivel");
}
function renderizarParticipantes(resposta){
    if (participantes !== resposta.data){
        participantesDom.innerHTML = `
        <div class="contato">
            <ion-icon name="people"></ion-icon>
            <h2 onclick="selecionarContato(this)"><span>Todos</span><ion-icon class="invisivel" name="checkmark-sharp"></ion-icon></h2>
        </div>`
        participantes = resposta.data;
        for (let i = 0; i < participantes.length; i++){
            if (participantes[i].name === destinatario){
                participantesDom.innerHTML += `
                <div class="contato">
                    <ion-icon name="person-circle"></ion-icon>
                    <h2 onclick="selecionarContato(this)"><span>${participantes[i].name}</span><ion-icon class="invisivel selecionado" name="checkmark-sharp"></ion-icon></h2>
                </div>`
            }
            else if (participantes[i].name !== nome) {
                participantesDom.innerHTML += `
                <div class="contato">
                    <ion-icon name="person-circle"></ion-icon>
                    <h2 onclick="selecionarContato(this)"><span>${participantes[i].name}</span><ion-icon class="invisivel" name="checkmark-sharp"></ion-icon></h2>
                </div>`
            }
    
        }
    }

}
function alterarFraseDestinatario(){
    if (tipoMensagem === "private_message"){
        mensagemInput.innerHTML = `
        <input type="text" placeholder="Escreva aqui...">
        <h3>Enviando para ${destinatario} (reservadamente)</h3>
        `
    }else if (tipoMensagem === "message" && destinatario !== "Todos"){
        mensagemInput.innerHTML = `
        <input type="text" placeholder="Escreva aqui...">
        <h3>Enviando para ${destinatario} (publicamente)</h3>
        `
    }else if (tipoMensagem === "message" && destinatario === "Todos"){
        mensagemInput.innerHTML = `
        <input type="text" placeholder="Escreva aqui...">
        `
    }
    enviarComEnter();
}
function atualizarParticipantes(){
    setInterval(buscarContatos, 10000);
}
function selecionarVisibilidade(elemento){
    document.querySelector(".visibilidades .selecionado").classList.remove("selecionado");
    elemento.querySelector("ion-icon").classList.add("selecionado");
    if (elemento.innerHTML.includes("Reservadamente")){
        tipoMensagem = "private_message"
    }else {
        tipoMensagem = "message"
    }
    alterarFraseDestinatario();
}
function selecionarContato(elemento){
    if (document.querySelectorAll(".selecionado").length > 1) {
        document.querySelector(".contatos .selecionado").classList.remove("selecionado");
    }    
    elemento.querySelector("ion-icon").classList.add("selecionado");
    destinatario = elemento.querySelector("span").innerHTML;
    alterarFraseDestinatario()
}

function enviarComEnter() { 
    document.querySelector(".escrever-mensagem  div  input").addEventListener("keydown", function (e){
    if (e.key == "Enter" && mensagemInput.querySelector("input").value !== ""){
        enviarMensagem(e);
    }
})
}
enviarComEnter();