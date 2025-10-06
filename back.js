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

const user = localStorage.getItem('loggedUser');
let mesAtual = obterMesAtual();
let items = [];

btnNew.onclick = async () => {
    if (descItem.value === "" || amount.value === "" || type.value === "") {
        return alert("Preencha todos os campos!");
    }

    items.push({
        desc: descItem.value,
        amount: Math.abs(amount.value).toFixed(2),
        type: type.value,
    });

    await salvarMesFirebase(user, mesAtual, items);
    await loadItens();

    descItem.value = "";
    amount.value = "";
};

btnFinalizarMes.onclick = async () => {
    if (items.length === 0) {
        alert("Nenhum lançamento para finalizar.");
        return;
    }
    if (confirm("Finalizar mês? Os lançamentos serão salvos e o mês será reiniciado.")) {
        mesAtual = obterProximoMesNaoExistente(mesAtual);
        items = [];
        await salvarMesFirebase(user, mesAtual, items);
        await loadItens();
        document.getElementById("tituloMes").textContent = nomeMesAtualPorString(mesAtual);
    }
};

btnAnalisarMeses.onclick = () => {
    window.location.href = "meses.html";
};

async function deleteItem(index) {
    items.splice(index, 1);
    await salvarMesFirebase(user, mesAtual, items);
    await loadItens();
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

async function loadItens() {
    items = await getMesFirebase(user, mesAtual);
    if (!items) items = [];
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

async function obterProximoMesNaoExistente(mesAtual) {
    let [ano, mes] = mesAtual.split("-").map(Number);
    let mesesSalvos = await getTodosMesesFirebase(user);
    let proximo;
    do {
        mes++;
        if (mes > 12) {
            mes = 1;
            ano++;
        }
        proximo = ano + "-" + String(mes).padStart(2, "0");
    } while (mesesSalvos && mesesSalvos[proximo]);
    return proximo;
}

// --- Firebase Functions ---

function salvarMesFirebase(user, mes, dados) {
    return db.ref('financas/' + user + '/meses/' + mes).set(dados);
}

function getMesFirebase(user, mes) {
    return db.ref('financas/' + user + '/meses/' + mes).once('value').then(snapshot => snapshot.val() || []);
}

function getTodosMesesFirebase(user) {
    return db.ref('financas/' + user + '/meses').once('value').then(snapshot => snapshot.val() || {});
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

// Inicialização
loadItens();