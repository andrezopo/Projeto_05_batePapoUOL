let mensagensDom = document.querySelector(".mensagens")
let mensagens = [];
let nome;
let mensagemAEnviar = document.querySelector("input");

function buscarMensagens() {
    let promise = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages")
    promise.then(renderizarMensagens);
}

function povoarDOM(mensagens){
    for ( let i = 0; i < mensagens.length; i++) {
        if (mensagens[i].type === "status") {
            mensagensDom.innerHTML += `<div class="mensagem cinza"><span><h4>${mensagens[i].time}</h4><strong> ${mensagens[i].from}</strong> ${mensagens[i].text}</span></div>`
        }
        else if (mensagens[i].type === "message"){
            mensagensDom.innerHTML += `<div class="mensagem"><span><h4>${mensagens[i].time}</h4><strong> ${mensagens[i].from}</strong> para <strong>${mensagens[i].to}:</strong> ${mensagens[i].text}</span></div>`
        }
        else {
            mensagensDom.innerHTML += `<div class="mensagem vermelho"><span><h4>${mensagens[i].time}</h4><strong> ${mensagens[i].from}</strong> para <strong>${mensagens[i].to}:</strong> ${mensagens[i].text}</span></div>`
        }
    }
}
function fazerLogin(){
    let elemento = document.querySelector(".tela-entrada");
    elemento.classList.add("invisivel");
}

function renderizarMensagens(resposta) {
    mensagens = resposta.data
    povoarDOM(mensagens)
    let ultimaMensagem = document.querySelector(".mensagens > :last-child");
    ultimaMensagem.scrollIntoView();
}

function definirUsuario() {
    nome = document.querySelector("input").value;
    document.querySelector(".login").classList.add("invisivel");
    document.querySelector(".carregando").classList.remove("invisivel");
    let promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/participants", { name: nome });
    promise.then(atualizarMensagens);
    promise.then(fazerLogin);
    promise.then(manterConexao);
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
    let mensagemAEnviar = document.querySelector(".escrever-mensagem input");

    let mensagem = {
        from: nome,
        to: "Todos",
        text: mensagemAEnviar.value,
        type: "message",
    }
    let promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/messages", mensagem);
    promise.then(buscarMensagens);
    mensagemAEnviar.value = null;
}

document.querySelector(".escrever-mensagem input").addEventListener("keydown", function (e){
    if (e.key == "Enter"){
        enviarMensagem(e);
    }
})