async function verificarLogin() {
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
        window.location.href = "login.html";
    }
}

verificarLogin();


let items = [];
let mesAtual = obterMesAtual();

async function verificarLogin() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) window.location.href = "login.html";
}
verificarLogin();

document.getElementById("tituloMes").innerText = mesAtual;

document.getElementById("btnNew").onclick = async () => {
    const desc = document.getElementById("desc").value;
    const amount = document.getElementById("amount").value;
    const type = document.getElementById("type").value;

    if (!desc || !amount) return alert("Preencha todos os campos");

    const user = (await supabase.auth.getUser()).data.user;

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
carregarMes();

function render() {
    const tbody = document.querySelector("tbody");
    tbody.innerHTML = "";

    let entradas = 0;
    let saidas = 0;

    items.forEach(i => {
        tbody.innerHTML += `
      <tr>
        <td>${i.descricao}</td>
        <td>R$ ${i.valor}</td>
        <td>${i.tipo}</td>
      </tr>
    `;

        i.tipo === "Entrada" ? entradas += i.valor : saidas += i.valor;
    });

    document.querySelector(".incomes").innerText = entradas.toFixed(2);
    document.querySelector(".expenses").innerText = saidas.toFixed(2);
    document.querySelector(".total").innerText = (entradas - saidas).toFixed(2);
}

function obterMesAtual() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
}

async function logout() {
    await supabase.auth.signOut();
    window.location.href = "login.html";
}
