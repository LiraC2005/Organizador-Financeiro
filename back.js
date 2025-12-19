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

// Monitor de Login
auth.onAuthStateChanged((user) => {
    if (user) {
        document.getElementById("tituloMes").textContent = nomeMesAtualPorString(mesAtual);
        loadItens();
    } else {
        window.location.href = "login.html";
    }
});

btnNew.onclick = async () => {
    if (descItem.value === "" || amount.value === "" || type.value === "") return alert("Preencha tudo!");

    await db.collection("transacoes").add({
        userId: auth.currentUser.uid,
        desc: descItem.value,
        amount: Math.abs(amount.value).toFixed(2),
        type: type.value,
        mesReferencia: mesAtual,
        dataCriacao: firebase.firestore.FieldValue.serverTimestamp()
    });

    descItem.value = ""; amount.value = "";
    loadItens();
};

async function loadItens() {
    const user = auth.currentUser;
    const snapshot = await db.collection("transacoes")
        .where("userId", "==", user.uid)
        .where("mesReferencia", "==", mesAtual)
        .get();

    items = [];
    snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
    render();
}

function render() {
    tbody.innerHTML = "";
    items.forEach((item) => {
        let tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${item.desc}</td>
            <td>R$ ${item.amount}</td>
            <td>${item.type === "Entrada" ? '<i class="bx bxs-chevron-up-circle"></i>' : '<i class="bx bxs-chevron-down-circle"></i>'}</td>
            <td class="columnAction"><button onclick="deleteItem('${item.id}')"><i class='bx bx-trash'></i></button></td>
        `;
        tbody.appendChild(tr);
    });
    updateTotals();
}

async function deleteItem(id) {
    if (confirm("Excluir?")) {
        await db.collection("transacoes").doc(id).delete();
        loadItens();
    }
}

function updateTotals() {
    const inc = items.filter(i => i.type === "Entrada").reduce((a, c) => a + Number(c.amount), 0);
    const exp = items.filter(i => i.type === "Saída").reduce((a, c) => a + Number(c.amount), 0);
    incomes.innerHTML = inc.toFixed(2);
    expenses.innerHTML = exp.toFixed(2);
    total.innerHTML = (inc - exp).toFixed(2);
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