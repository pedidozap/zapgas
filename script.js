// Objeto para armazenar o carrinho de compras
const carrinho = {};

// Função para adicionar um item ao carrinho
function adicionarAoCarrinho(nome, preco, quantidade = 1) {
  if (carrinho[nome]) {
    carrinho[nome].quantidade += quantidade; // Se o item já estiver no carrinho, aumente a quantidade
  } else {
    carrinho[nome] = { preco, quantidade }; // Se o item não estiver no carrinho, adicione-o com quantidade
  }

  atualizarCarrinho();
  atualizarContagemCarrinho();
}

// Função para remover um item do carrinho
function removerDoCarrinho(nome, quantidade = 1) {
  if (carrinho[nome]) {
    carrinho[nome].quantidade -= quantidade; // Diminua a quantidade do item no carrinho

    if (carrinho[nome].quantidade <= 0) {
      delete carrinho[nome]; // Remova o item do carrinho se a quantidade for menor ou igual a zero
    }
  }

  atualizarCarrinho();
  atualizarContagemCarrinho();
}

// Função para finalizar a compra e enviar mensagem para o WhatsApp
function finalizarCompra() {
  // Verifica se há itens no carrinho
  if (Object.keys(carrinho).length === 0) {
    alert("O carrinho está vazio. Adicione itens antes de finalizar a compra.");
    return;
  }

  // Verifica se todos os campos obrigatórios do formulário foram preenchidos
  const nomeCliente = document.getElementById("nome").value;
  const enderecoCliente = document.getElementById("endereco").value;
  const formaPagamento = document.getElementById("pagamento").value;
  const opcaoEntregaSelecionada = document.getElementById("opcaoentrega").value;
  const bairroSelecionado = document.getElementById("bairro").value;

 // Verifica se a opção de entrega é selecionada e, caso selecionada, se o bairro também foi preenchido
 if (opcaoEntregaSelecionada === "entrega" && !bairroSelecionado) {
  alert("Por favor, selecione um bairro para entrega.");
  return;
}

if (!nomeCliente || !enderecoCliente || !formaPagamento || !opcaoEntregaSelecionada) {
  alert("Por favor, preencha todos os campos obrigatórios.");
  return;
}

if (opcaoEntregaSelecionada === "entrega" && !bairroSelecionado) {
  alert("Por favor, selecione um bairro para entrega.");
  return;
}

  // Obtém o número do pedido ou define como 1 se não existir
  let numeroPedido = localStorage.getItem("numeroPedido") || 1;

  // Gera os dados do pedido
  const troco = document.getElementById("troco").value;
  const produtos = Object.entries(carrinho)
    .map(([nome, item]) => {
      return `${item.quantidade}x ${nome} - Valor: R$ ${(
        item.preco * item.quantidade
      ).toFixed(2)}`;
    })
    .join("\n");
  const observacao = document.getElementById("observacao").value;
  let taxaEntrega = 0; // Inicializa a taxa de entrega como zero

  // Verifica se a opção de entrega é selecionada e obtém a taxa de entrega
  if (opcaoEntregaSelecionada === "entrega") {
    taxaEntrega = taxasEntregaPorBairro[bairroSelecionado] || 0; // Obtém a taxa de entrega do objeto de taxas por bairro
  }

  // Calcula o subtotal do carrinho
  const subtotal = calcularSubtotal();

  // Calcula o total do carrinho
  let total = subtotal;
  if (opcaoEntregaSelecionada === "entrega") {
    total += taxaEntrega;
  }


  // Adiciona taxa para pagamento com cartão de débito ou crédito
  if (formaPagamento === "Cartão de Débito" || formaPagamento === "Cartão de Crédito") {
    total += 2.00;
    // mensagem += "\n*Forma de Pagamento:* Cartão de Débito/Crédito - *Taxa:* R$ 2.00";
  }

// Constrói a mensagem do WhatsApp
let mensagem = `*Pedido Nº: ${numeroPedido}*\n\n${new Date().toLocaleString(
  "pt-BR"
)}\n----------------------------------------------\n\n*Nome:* ${nomeCliente}\n${
  opcaoEntregaSelecionada === "retirada"
    ? "*Opção de Entrega:* Retirada na Loja"
    : `*Endereço:* ${enderecoCliente}\n*Bairro:* ${bairroSelecionado}`
}\n\n*Produtos:*\n${produtos}\n\n----------------------------------------------\n*Observação:* ${observacao}\n----------------------------------------------\n\n*Subtotal:* R$ ${subtotal.toFixed(
  2
)}\n${
  opcaoEntregaSelecionada === "entrega"
    ? `*Taxa de Entrega:* R$ ${taxaEntrega.toFixed(2)}\n`
    : ""
}*Forma de pagamento:* ${formaPagamento}${
  formaPagamento === "Dinheiro" && troco ? `\n*Troco para:* R$` + troco : ""
}\n${
  formaPagamento === "Cartão de Débito" || formaPagamento === "Cartão de Crédito"
    ? "*Taxa de cartão:* R$ 2.00\n"
    : ""
}*Total:* R$ ${total.toFixed(2)}`;




  // Incrementa o número do pedido para o próximo pedido e salva no localStorage
  localStorage.setItem("numeroPedido", parseInt(numeroPedido) + 1);

  // Codifica a mensagem para ser usada na URL
  const mensagemCodificada = encodeURIComponent(mensagem);

  // URL do WhatsApp com o número de telefone e a mensagem
  const urlWhatsApp = `https://api.whatsapp.com/send?phone=5521970129970&text=${mensagemCodificada}`;

  // Abre o WhatsApp em uma nova aba
  window.open(urlWhatsApp, "_blank");

  // Limpa o carrinho após o envio do WhatsApp
  limparCarrinho();

  // Redireciona o usuário para a página inicial após o envio do WhatsApp
  window.location.href = "index.html";
}

// Função para limpar o carrinho //
function limparCarrinho() {
  for (const nome in carrinho) {
    delete carrinho[nome];
  }
}

// Função para calcular o subtotal do carrinho
function calcularSubtotal() {
  let subtotal = 0;
  for (const item of Object.values(carrinho)) {
    subtotal += item.preco * item.quantidade;
  }
  return subtotal;
}

// Função para calcular o total do carrinho
function calcularTotal() {
  const subtotal = calcularSubtotal();
  // Adicione o cálculo do valor de entrega ou outras taxas, se necessário
  return subtotal;
}

// Função para atualizar a exibição do carrinho
function atualizarCarrinho() {
  const listaCarrinho = document.querySelector(".lista-carrinho");
  const totalElement = document.getElementById("total");
  listaCarrinho.innerHTML = "";
  let total = 0;

  for (const [nome, item] of Object.entries(carrinho)) {
    const tr = document.createElement("tr");
    const quantidadeTd = document.createElement("td");
    const nomeProdutoTd = document.createElement("td");
    const precoTotalTd = document.createElement("td");
    const botoesTd = document.createElement("td");

    quantidadeTd.textContent = `${item.quantidade}`;
    nomeProdutoTd.textContent = `${nome}`;
    precoTotalTd.textContent = `R$ ${(item.preco * item.quantidade).toFixed(
      2
    )}`;

    const botaoAdicionar = criarBotao("+1", () =>
      adicionarAoCarrinho(nome, item.preco, 1)
    );
    const botaoRemover = criarBotao("- 1", () => removerDoCarrinho(nome, 1));

    botoesTd.appendChild(botaoAdicionar);
    botoesTd.appendChild(botaoRemover);

    tr.appendChild(quantidadeTd);
    tr.appendChild(nomeProdutoTd);
    tr.appendChild(precoTotalTd);
    tr.appendChild(botoesTd);

    listaCarrinho.appendChild(tr);

    total += item.preco * item.quantidade;
  }

  totalElement.textContent = `Total: R$ ${total.toFixed(2)}`;
}

// Função auxiliar para criar botões
function criarBotao(texto, onClick) {
  const botao = document.createElement("button");
  botao.textContent = texto;
  botao.classList.add("btn", "btn-secondary", "btn-lg", "mx-1");
  botao.addEventListener("click", onClick);
  return botao;
}

// Função para atualizar a contagem de itens no carrinho
function atualizarContagemCarrinho() {
  const cartCountElement = document.querySelector(".cart-count");
  let totalCount = 0;

  for (const item of Object.values(carrinho)) {
    totalCount += item.quantidade;
  }

  // Atualiza o elemento com o número total de itens no carrinho
  cartCountElement.textContent = totalCount.toString();
}

// Adiciona ouvintes de evento para cada botão "Adicionar ao Carrinho"
document.querySelectorAll(".btn-add-to-cart").forEach((botao) => {
  botao.addEventListener("click", () => {
    const cardSoma = botao.closest(".cardSoma");
    const nome = cardSoma.querySelector(".title").textContent;
    const precoTexto = cardSoma.querySelector(".price").textContent;
    const preco = parseFloat(precoTexto.replace("R$ ", ""));
    adicionarAoCarrinho(nome, preco, 1);
  });
});

// Adiciona ouvinte de evento para o botão "Finalizar Compra"
document
  .getElementById("finalizar-compra")
  .addEventListener("click", finalizarCompra);

// Adiciona ouvinte de evento para o formulário de checkout
document
  .getElementById("checkout-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const nome = this.querySelector("#nome").value;
    const endereco = this.querySelector("#endereco").value;
    const formaPagamento = this.querySelector("#formaPagamento").value;

    if (!nome || !endereco || !formaPagamento) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    // Processamento do formulário...
    window.location.href = "index.html"; // Redireciona após o processamento
    this.reset();
  });

// Adiciona ouvinte de evento para o campo de seleção de pagamento
document.getElementById("pagamento").addEventListener("change", function () {
  const divTroco = document.getElementById("trocoField");
  divTroco.style.display = this.value === "Dinheiro" ? "block" : "none";
});

// Objeto para armazenar as taxas de entrega por bairro
const taxasEntregaPorBairro = {
  Centro: 5.0,
  "Bairro A": 7.5,
  "Bairro B": 10.0,
  // Adicione mais bairros e suas taxas de entrega conforme necessário
};

// Adiciona ouvinte de evento para o campo de seleção de entrega
document.getElementById("opcaoentrega").addEventListener("change", function () {
  const enderecoLoja = document.getElementById("enderecoloja");
  const selecionarBairro = document.getElementById("selecionebairro");
  const taxaEntrega = document.getElementById("taxaentrega");
  const bairroSelect = document.getElementById("bairro");
  const taxaEntregaSpan = document.getElementById("valortaxaentrega");

  if (this.value === "retirada") {
    enderecoLoja.style.display = "block";
    selecionarBairro.style.display = "none";
    taxaEntrega.style.display = "none";
    taxaEntregaSpan.textContent = ""; // Limpa o valor da taxa de entrega
    bairroSelect.style.display = "none"; // Oculta o campo de seleção de bairro
    bairroSelect.selectedIndex = 0; // Reinicia a seleção do bairro
  } else if (this.value === "entrega") {
    enderecoLoja.style.display = "none";
    selecionarBairro.style.display = "block";
    taxaEntrega.style.display = "block";
    // Se a opção anterior era 'retirada', limpa o valor do bairro selecionado e reexibe o campo de seleção
    if (bairroSelect.value === "") {
      bairroSelect.selectedIndex = 0;
      bairroSelect.style.display = "block";
    }
  } else {
    enderecoLoja.style.display = "none";
    selecionarBairro.style.display = "none";
    taxaEntrega.style.display = "none";
    taxaEntregaSpan.textContent = ""; // Limpa o valor da taxa de entrega
    bairroSelect.style.display = "none"; // Oculta o campo de seleção de bairro
    bairroSelect.selectedIndex = 0; // Reinicia a seleção do bairro
  }
});

// Adiciona ouvinte de evento para o campo de seleção de bairro
document.getElementById("bairro").addEventListener("change", function () {
  const taxaEntregaSpan = document.getElementById("valortaxaentrega");
  const bairroSelecionado = this.value;

  // Verifica se o bairro selecionado tem uma taxa de entrega definida
  if (taxasEntregaPorBairro[bairroSelecionado]) {
    taxaEntregaSpan.textContent =
      taxasEntregaPorBairro[bairroSelecionado].toFixed(2);
  } else {
    taxaEntregaSpan.textContent = "0.00"; // Se não houver taxa definida, exibe 0.00
  }
});


// Adiciona ouvinte de evento para o campo de seleção de pagamento
document.getElementById("pagamento").addEventListener("change", function () {
  const divTroco = document.getElementById("trocoField");
  divTroco.style.display = this.value === "Dinheiro" ? "block" : "none";

  const divAcrescimoCartao = document.getElementById("acrescimoCartao");
  if (this.value === "Cartão de Crédito" || this.value === "Cartão de Débito") {
    divAcrescimoCartao.style.display = "block";
  } else {
    divAcrescimoCartao.style.display = "none";
  }
});


// Define o dia da semana que aparece a promoção
document.addEventListener("DOMContentLoaded", function() {
  var currentDate = new Date();
  var currentDayOfWeek = currentDate.getDay(); // 0 para Domingo, 1 para Segunda, ..., 6 para Sábado

  // SEGUNDA
  if (currentDayOfWeek === 1) {
      document.querySelector(".promoSeg").style.display = "block";
  } else {
      // Se não for quarta-feira, esconde a categoria de promoção de quarta-feira
      document.querySelector(".promoSeg").style.display = "none";
  }
});


// Define o dia da semana que aparece a promoção
document.addEventListener("DOMContentLoaded", function() {
  var currentDate = new Date();
  var currentDayOfWeek = currentDate.getDay(); // 0 para Domingo, 1 para Segunda, ..., 6 para Sábado

  // TERÇA
  if (currentDayOfWeek === 2) {
      document.querySelector(".promoTer").style.display = "block";
  } else {
      // Se não for quarta-feira, esconde a categoria de promoção de quarta-feira
      document.querySelector(".promoTer").style.display = "none";
  }
});


// Define o dia da semana que aparece a promoção
document.addEventListener("DOMContentLoaded", function() {
  var currentDate = new Date();
  var currentDayOfWeek = currentDate.getDay(); // 0 para Domingo, 1 para Segunda, ..., 6 para Sábado

  // QUARTA
  if (currentDayOfWeek === 3) {
      document.querySelector(".promoQua").style.display = "block";
  } else {
      // Se não for quarta-feira, esconde a categoria de promoção de quarta-feira
      document.querySelector(".promoQua").style.display = "none";
  }
});

// Define o dia da semana que aparece a promoção
document.addEventListener("DOMContentLoaded", function() {
  var currentDate = new Date();
  var currentDayOfWeek = currentDate.getDay(); // 0 para Domingo, 1 para Segunda, ..., 6 para Sábado

  // QUINTA
  if (currentDayOfWeek === 4) {
      document.querySelector(".promoQui").style.display = "block";
  } else {
      // Se não for quarta-feira, esconde a categoria de promoção de quarta-feira
      document.querySelector(".promoQui").style.display = "none";
  }
});

// Define o dia da semana que aparece a promoção
document.addEventListener("DOMContentLoaded", function() {
  var currentDate = new Date();
  var currentDayOfWeek = currentDate.getDay(); // 0 para Domingo, 1 para Segunda, ..., 6 para Sábado

  // SEXTA
  if (currentDayOfWeek === 5) {
      document.querySelector(".promoSex").style.display = "block";
  } else {
      // Se não for quarta-feira, esconde a categoria de promoção de quarta-feira
      document.querySelector(".promoSex").style.display = "none";
  }
});