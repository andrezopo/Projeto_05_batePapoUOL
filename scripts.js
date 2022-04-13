let mensagensDom = document.querySelector(".mensagens")
let mensagens = [];
let nome;

function buscarMensagens() {
    let promise = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages")
    promise.then(renderizarMensagens);
}

function renderizarMensagens(resposta) {
    console.log(resposta);
    mensagens = resposta.data
    for (i = 0; i < mensagens.length; i++) {
        if (mensagens[i].type === "status") {
            mensagensDom.innerHTML += `<div class="mensagem cinza"><span><h4>${mensagens[i].time}</h4><strong> ${mensagens[i].from}</strong> ${mensagens[i].text}</span></div>`
        }
        else if (mensagens[i].type === "message"){
            `<div class="mensagem"><span><h4>${mensagens[i].time}</h4><strong> ${mensagens[i].from}</strong> para <strong>${mensagens[i].to}:</strong> ${mensagens[i].text}</span></div>`
        }
        else {
            `<div class="mensagem vermelho"><span><h4>${mensagens[i].time}</h4><strong> ${mensagens[i].from}</strong> para <strong>${mensagens[i].to}:</strong> ${mensagens[i].text}</span></div>`
        }
    }
}

function definirUsuario() {
    nome = prompt("Qual o nome de usuário?");
    let promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/participants", { name: nome });
    promise.then(buscarMensagens);
    promise.then(manterConexao);
    promise.catch(falhaUsername);

}
function manterConexao(){
    let idInterval = setInterval(function () { axios.post("https://mock-api.driven.com.br/api/v6/uol/participants", { name: nome });}, 180000);
}

function falhaUsername(erro) {
    if (erro.response.status === 400) {
        alert("Já existe um usuário online com este nome, escolha outro.")
        definirUsuario()
    }
}
