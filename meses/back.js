async function verificarLogin() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) window.location.href = "../login.html";
}

verificarLogin();


async function carregarMeses() {
    const { data } = await supabase
        .from("financas")
        .select("*")
        .order("mes", { ascending: false });

    const meses = {};
    data.forEach(i => {
        if (!meses[i.mes]) meses[i.mes] = [];
        meses[i.mes].push(i);
    });

    const container = document.getElementById("listaMeses");
    container.innerHTML = "";

    Object.entries(meses).forEach(([mes, itens]) => {
        container.innerHTML += `
      <h3>${mes}</h3>
      <ul>
        ${itens.map(i => `
          <li>${i.descricao} - R$ ${i.valor}</li>
        `).join("")}
      </ul>
    `;
    });
}

carregarMeses();
