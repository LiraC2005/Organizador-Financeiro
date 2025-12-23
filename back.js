import { supabase } from "./supabase.js";


// 🔐 proteção
const { data } = await supabase.auth.getUser();
if (!data.user) {
    window.location.href = "login.html";
}

// resto do código
let items = [];
let mesAtual = obterMesAtual();
let editingId = null;

document.getElementById("tituloMes").innerText = mesAtual;

const btnNew = document.getElementById("btnNew");
btnNew.onclick = async () => {
    const desc = document.getElementById("desc").value;
    const amount = document.getElementById("amount").value;
    const type = document.getElementById("type").value;

    if (!desc || !amount) return alert("Preencha todos os campos");

    const user = (await supabase.auth.getUser()).data.user;

    if (editingId) {
        await supabase.from("financas").update({
            descricao: desc,
            valor: Math.abs(amount),
            tipo: type
        }).eq("id", editingId);
        editingId = null;
        btnNew.innerText = "Adicionar";
    } else {
        await supabase.from("financas").insert({
            user_id: user.id,
            mes: mesAtual,
            descricao: desc,
            valor: Math.abs(amount),
            tipo: type
        });
    }

    document.getElementById("desc").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("type").value = "Entrada";

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
                                <td>
                                        <button class="btn-edit" data-id="${i.id}">Editar</button>
                                        <button class="btn-delete" data-id="${i.id}">Remover</button>
                                </td>
            </tr>
        `;

        i.tipo === "Entrada"
            ? (entradas += i.valor)
            : (saidas += i.valor);
    });

    document.querySelector(".incomes").innerText = entradas.toFixed(2);
    document.querySelector(".expenses").innerText = saidas.toFixed(2);
    document.querySelector(".total").innerText = (entradas - saidas).toFixed(2);
}

// Delegation: lidar com clique e ativação por teclado em botões dentro da tabela
tbody.querySelectorAll('.btn-edit, .btn-delete').forEach(btn => {
    btn.setAttribute('type', 'button');
    btn.setAttribute('tabindex', '0');
    btn.setAttribute('aria-pressed', 'false');
});

tbody.addEventListener('click', async (e) => {
    const btn = e.target.closest('.btn-edit, .btn-delete');
    if (!btn || !tbody.contains(btn)) return;
    const id = Number(btn.dataset.id);
    if (!id) return;
    if (btn.classList.contains('btn-delete')) {
        await window.deleteItem(id);
    } else {
        window.editItem(id);
    }
});

tbody.addEventListener('keydown', async (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const btn = e.target.closest('.btn-edit, .btn-delete');
    if (!btn || !tbody.contains(btn)) return;
    e.preventDefault();
    const id = Number(btn.dataset.id);
    if (!id) return;
    if (btn.classList.contains('btn-delete')) {
        await window.deleteItem(id);
    } else {
        window.editItem(id);
    }
});



function obterMesAtual() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
}

window.logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "login.html";
};

window.deleteItem = async (id) => {
    if (!confirm("Confirma excluir este item?")) return;
    await supabase.from("financas").delete().eq("id", id);
    await carregarMes();
};

window.editItem = async (id) => {
    const item = items.find(i => i.id === id);
    if (!item) return alert('Item não encontrado');
    document.getElementById("desc").value = item.descricao;
    document.getElementById("amount").value = item.valor;
    document.getElementById("type").value = item.tipo;
    editingId = id;
    btnNew.innerText = "Salvar";
};
