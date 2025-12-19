const tbody = document.querySelector("tbody");
const descItem = document.querySelector("#desc");
const amount = document.querySelector("#amount");
const type = document.querySelector("#type");
const btnNew = document.querySelector("#btnNew");

const incomes = document.querySelector(".incomes");
const expenses = document.querySelector(".expenses");
const total = document.querySelector(".total");

let items = [];
let mesAtual = obterMesAtual();

// 1. Monitor de Autenticação
auth.onAuthStateChanged((user) => {
    if (user) {
        document.getElementById("tituloMes").textContent = nomeMesAtualPorString(mesAtual);
        loadItens();
    } else {
        window.location.href = "login.html";
    }
});

// 2. Salvar no Firebase
btnNew.onclick = async () => {
    if (descItem.value === "" || amount.value === "" || type.value === "") {
        return alert("Preencha todos os campos!");
    }

    const user = auth.currentUser;
    await db.collection("transacoes").add({
        userId: user.uid,
        desc: descItem.value,
        amount: Math.abs(amount.value).toFixed(2),
        type: type.value,
        mesReferencia: mesAtual,
        dataCriacao: firebase.firestore.FieldValue.serverTimestamp()
    });

    descItem.value = "";
    amount.value = "";
    loadItens();
};

// 3. Carregar do Firebase (Apenas do usuário logado)
async function loadItens() {
    const user = auth.currentUser;
    if (!user) return;

    const snapshot = await db.collection("transacoes")
        .where("userId", "==", user.uid)
        .where("mesReferencia", "==", mesAtual)
        .get();

    items = [];
    snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() });
    });

    atualizarTabela();
    getTotals();
}

function atualizarTabela() {
    tbody.innerHTML = "";
    items.forEach((item) => {
        let tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${item.desc}</td>
            <td>R$ ${item.amount}</td>
            <td class="columnType">${item.type === "Entrada"
                ? '<i class="bx bxs-chevron-up-circle"></i>'
                : '<i class="bx bxs-chevron-down-circle"></i>'}</td>
            <td class="columnAction">
                <button onclick="deleteItem('${item.id}')"><i class='bx bx-trash'></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function deleteItem(id) {
    if (confirm("Excluir lançamento?")) {
        await db.collection("transacoes").doc(id).delete();
        loadItens();
    }
}

function getTotals() {
    const totalIncomes = items
        .filter(i => i.type === "Entrada")
        .reduce((acc, cur) => acc + Number(cur.amount), 0).toFixed(2);

    const totalExpenses = items
        .filter(i => i.type === "Saída")
        .reduce((acc, cur) => acc + Number(cur.amount), 0).toFixed(2);

    incomes.innerHTML = totalIncomes;
    expenses.innerHTML = totalExpenses;
    total.innerHTML = (totalIncomes - totalExpenses).toFixed(2);
}

function obterMesAtual() {
    const hoje = new Date();
    return hoje.getFullYear() + "-" + String(hoje.getMonth() + 1).padStart(2, "0");
}

function nomeMesAtualPorString(str) {
    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const [ano, mes] = str.split("-");
    return meses[parseInt(mes, 10) - 1] + " / " + ano;
}