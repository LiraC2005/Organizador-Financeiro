import { supabase } from "./supabase.js";

// 🔐 proteção
const { data } = await supabase.auth.getUser();
if (!data.user) {
    window.location.href = "login.html";
}

const user = data.user;

// 🔹 NOVO: buscar nome do usuário
const nomeUsuario =
    user.user_metadata?.nome || "Usuário";

document.getElementById("usuarioNome").innerText =
    `Olá, ${nomeUsuario} 👋`;


// resto do código
let items = [];
let mesAtual = obterMesAtual();

document.getElementById("tituloMes").innerText = mesAtual;

document.getElementById("btnNew").onclick = async () => {
    const desc = document.getElementById("desc").value;
    const amount = document.getElementById("amount").value;
    const type = document.getElementById("type").value;

    if (!desc || !amount) return alert("Preencha todos os campos");

    await supabase.from("financas").insert({
        user_id: user.id,
        mes: mesAtual,
        descricao: desc,
        valor: Math.abs(amount),
        tipo: type
    });

    document.getElementById("desc").value = "";
    document.getElementById("amount").value = "";

    carregarMes();
};

async function carregarMes() {
    const { data } = await supabase
        .from("financas")
        .select("*")
        .eq("mes", mesAtual);

    items = data || [];
    render();
}

await carregarMes();

function render() {
    const tbody = document.querySelector("tbody");
    tbody.innerHTML = "";

    let entradas = 0;
    let saidas = 0;

    items.forEach(i => {
        const tipoIcone =
            i.tipo === "Entrada"
                ? '<span class="arrow up">⬆</span>'
                : '<span class="arrow down">⬇</span>';

        tbody.innerHTML += `
          <tr>
            <td>${i.descricao}</td>
            <td>R$ ${Number(i.valor).toFixed(2)}</td>
            <td class="columnType">${tipoIcone}</td>
          </tr>
        `;

        i.tipo === "Entrada"
            ? (entradas += i.valor)
            : (saidas += i.valor);
    });

    document.querySelector(".incomes").innerText = entradas.toFixed(2);
    document.querySelector(".expenses").innerText = saidas.toFixed(2);
    document.querySelector(".total").innerText =
        (entradas - saidas).toFixed(2);
}

function obterMesAtual() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
}

window.logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "login.html";
};
