import { supabase } from "./supabase.js";

let items = [];
let mesAtual = obterMesAtual();
let user = null;
let editingId = null;

async function init() {
    // proteção: garantir usuário logado
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
        window.location.href = "login.html";
        return;
    }

    user = data.user;

    // buscar nome do usuário
    const nomeUsuario = user.user_metadata?.nome || "Usuário";
    document.getElementById("usuarioNome").innerText = `${nomeUsuario}`;

    document.getElementById("tituloMes").innerText = mesAtual;

    document.getElementById("btnNew").onclick = async () => {
        const desc = document.getElementById("desc").value;
        const amount = document.getElementById("amount").value;
        const type = document.getElementById("type").value;
        if (!desc || !amount) return alert("Preencha todos os campos");

        if (editingId) {
            // atualizar registro existente
            const { error, status } = await supabase
                .from("financas")
                .update({
                    descricao: desc,
                    valor: Math.abs(amount),
                    tipo: type
                })
                .eq("id", editingId);

            if (error) {
                console.error("Erro ao atualizar:", error, status);
                return alert("Erro ao atualizar: " + (error.message || "verifique o console"));
            }

            // resetar modo de edição
            editingId = null;
            document.getElementById("btnNew").textContent = "Adicionar";
            document.getElementById("btnCancel").style.display = "none";
        } else {
            const { data: insertData, error: insertError, status: insertStatus } = await supabase
                .from("financas")
                .insert({
                    user_id: user.id,
                    mes: mesAtual,
                    descricao: desc,
                    valor: Math.abs(amount),
                    tipo: type
                });

            if (insertError) {
                console.error("Erro ao inserir:", insertError, insertStatus, insertData);
                return alert("Erro ao adicionar: " + insertError.message);
            }
        }

        document.getElementById("desc").value = "";
        document.getElementById("amount").value = "";

        await carregarMes();
    };

    // botão cancelar
    const btnCancel = document.getElementById("btnCancel");
    if (btnCancel) {
        btnCancel.onclick = () => {
            editingId = null;
            document.getElementById("desc").value = "";
            document.getElementById("amount").value = "";
            document.getElementById("btnNew").textContent = "Adicionar";
            btnCancel.style.display = "none";
        };
    }

    // delegação de eventos para botão Apagar (evita handlers inline)
    const tbody = document.querySelector("tbody");
    if (tbody) {
        tbody.addEventListener("click", (e) => {
            const btnDelete = e.target.closest(".btn-delete");
            if (btnDelete) {
                const id = btnDelete.dataset.id;
                if (!id) return;
                apagar(id);
                return;
            }

            const btnEdit = e.target.closest(".btn-edit");
            if (btnEdit) {
                const id = btnEdit.dataset.id;
                if (!id) return;
                startEdit(id);
                return;
            }
        });
    }

    await carregarMes();
}

init();

async function carregarMes() {
    const { data, error, status } = await supabase
        .from("financas")
        .select("*")
        .eq("mes", mesAtual);

    if (error) {
        console.error("Erro ao carregar finanças:", error, status);
        items = [];
        render();
        alert("Erro ao carregar dados: " + (error.message || "verifique o console"));
        return;
    }

    items = data || [];
    render();
}

function startEdit(id) {
    const item = items.find(it => String(it.id) === String(id));
    if (!item) return alert("Item não encontrado para edição.");

    editingId = id;
    document.getElementById("desc").value = item.descricao || "";
    document.getElementById("amount").value = item.valor || "";
    document.getElementById("type").value = item.tipo || "Entrada";
    document.getElementById("btnNew").textContent = "Salvar";
    const btnCancel = document.getElementById("btnCancel");
    if (btnCancel) btnCancel.style.display = "inline-block";
    document.getElementById("desc").focus();
}

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
                                                    <button class="btn-edit" data-id="${i.id}" title="Editar">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                                            <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                                                        </svg>
                                                    </button>
                                                    <button class="btn-delete" data-id="${i.id}" title="Apagar">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                                            <path fill="currentColor" d="M6 7h12v13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7z"/>
                                                            <path fill="currentColor" d="M9 10h2v8H9v-8zM13 10h2v8h-2v-8z"/>
                                                            <path fill="currentColor" d="M15.5 4l-1-1h-5l-1 1H5v2h14V4z"/>
                                                        </svg>
                                                    </button>
                                                </td>
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

async function apagar(id) {
    try {
        if (!confirm("Deseja realmente apagar este registro?")) return;

        if (id === undefined || id === null || String(id).trim() === "") {
            return alert("ID inválido para apagar.");
        }

        // usar id como veio do dataset (pode ser UUID string ou numérico)
        const { error, status } = await supabase
            .from("financas")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Erro ao apagar:", error, status);
            return alert("Erro ao apagar: " + (error.message || "verifique o console"));
        }

        await carregarMes();
    } catch (err) {
        console.error(err);
        alert("Erro inesperado ao apagar.");
    }
}
