const tbody = document.querySelector("tbody");
const descItem = document.querySelector("#desc");
const amount = document.querySelector("#amount");
const type = document.querySelector("#type");
const btnNew = document.querySelector("#btnNew");
const btnFinalizarMes = document.querySelector("#btnFinalizarMes");
const btnAnalisarMeses = document.querySelector("#btnAnalisarMeses");

const incomes = document.querySelector(".incomes");
const expenses = document.querySelector(".expenses");
const total = document.querySelector(".total");

let mesAtual = obterMesAtual();
let items = [];

btnNew.onclick = () => {
    if (descItem.value === "" || amount.value === "" || type.value === "") {
        return alert("Preencha todos os campos!");
    }

    items.push({
        desc: descItem.value,
        amount: Math.abs(amount.value).toFixed(2),
        type: type.value,
    });

    salvarMes(mesAtual, items);
    loadItens();

    descItem.value = "";
    amount.value = "";
};

btnFinalizarMes.onclick = () => {
    if (items.length === 0) {
        alert("Nenhum lançamento para finalizar.");
        return;
    }
    if (confirm("Finalizar mês? Os lançamentos serão salvos e o mês será reiniciado.")) {
        mesAtual = obterProximoMesNaoExistente(mesAtual);
        items = [];
        salvarMes(mesAtual, items);
        loadItens();
        document.getElementById("tituloMes").textContent = nomeMesAtualPorString(mesAtual);
    }
};

btnAnalisarMeses.onclick = () => {
    window.location.href = "meses.html";
};

function deleteItem(index) {
    items.splice(index, 1);
    salvarMes(mesAtual, items);
    loadItens();
}

function insertItem(item, index) {
    let tr = document.createElement("tr");

    tr.innerHTML = `
    <td>${item.desc}</td>
    <td>R$ ${item.amount}</td>
    <td class="columnType">${item.type === "Entrada"
            ? '<i class="bx bxs-chevron-up-circle"></i>'
            : '<i class="bx bxs-chevron-down-circle"></i>'
        }</td>
    <td class="columnAction">
      <button onclick="deleteItem(${index})"><i class='bx bx-trash'></i></button>
    </td>
  `;

    tbody.appendChild(tr);
}

function loadItens() {
    items = getTodosMeses()[mesAtual] || [];
    atualizarTabela();
    getTotals();
}

function atualizarTabela() {
    tbody.innerHTML = "";
    items.forEach((item, index) => {
        insertItem(item, index);
    });
}

function getTotals() {
    const amountIncomes = items
        .filter((item) => item.type === "Entrada")
        .map((transaction) => Number(transaction.amount));

    const amountExpenses = items
        .filter((item) => item.type === "Saída")
        .map((transaction) => Number(transaction.amount));

    const totalIncomes = amountIncomes
        .reduce((acc, cur) => acc + cur, 0)
        .toFixed(2);

    const totalExpenses = Math.abs(
        amountExpenses.reduce((acc, cur) => acc + cur, 0)
    ).toFixed(2);

    const totalItems = (totalIncomes - totalExpenses).toFixed(2);

    incomes.innerHTML = totalIncomes;
    expenses.innerHTML = totalExpenses;
    total.innerHTML = totalItems;
}

// Obter usuário logado
function getLoggedUser() {
    return localStorage.getItem('loggedUser');
}

// Funções para lidar com meses, agora por usuário
function getTodosMeses() {
    const user = getLoggedUser();
    return JSON.parse(localStorage.getItem("financas_meses_" + user)) ?? {};
}

function salvarMes(mes, dados) {
    const user = getLoggedUser();
    const meses = getTodosMeses();
    meses[mes] = dados;
    localStorage.setItem("financas_meses_" + user, JSON.stringify(meses));
}

// Funções para lidar com meses
function obterMesAtual() {
    const hoje = new Date();
    return hoje.getFullYear() + "-" + String(hoje.getMonth() + 1).padStart(2, "0");
}

function obterProximoMes(mes) {
    let [ano, mesNum] = mes.split("-").map(Number);
    mesNum++;
    if (mesNum > 12) {
        mesNum = 1;
        ano++;
    }
    return ano + "-" + String(mesNum).padStart(2, "0");
}

function obterProximoMesNaoExistente(mesAtual) {
    // Recebe o mês atual no formato "YYYY-MM"
    let [ano, mes] = mesAtual.split("-").map(Number);
    let mesesSalvos = getTodosMeses();
    do {
        mes++;
        if (mes > 12) {
            mes = 1;
            ano++;
        }
        var proximo = ano + "-" + String(mes).padStart(2, "0");
    } while (mesesSalvos[proximo]);
    return proximo;
}

// Função para mostrar o nome do mês a partir do formato "YYYY-MM"
function nomeMesAtualPorString(str) {
    const meses = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    const [ano, mes] = str.split("-");
    return meses[parseInt(mes, 10) - 1] + " / " + ano;
}

loadItens();