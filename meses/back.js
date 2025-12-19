function getTodosMeses() {
    return JSON.parse(localStorage.getItem("financas_meses")) ?? {};
}

function salvarTodosMeses(meses) {
    localStorage.setItem("financas_meses", JSON.stringify(meses));
}

function apagarMes(mes) {
    if (confirm(`Deseja apagar o mês ${mes}? Esta ação não pode ser desfeita.`)) {
        const meses = getTodosMeses();
        delete meses[mes];
        salvarTodosMeses(meses);
        mostrarMeses();
    }
}

function mostrarMeses() {
    const container = document.getElementById("listaMeses");
    const meses = getTodosMeses();
    container.innerHTML = "";

    if (Object.keys(meses).length === 0) {
        container.innerHTML = "<p>Nenhum mês salvo.</p>";
        return;
    }

    Object.entries(meses).forEach(([mes, lancamentos]) => {
        const divMes = document.createElement("div");
        divMes.className = "mes-bloco";
        divMes.innerHTML = `
            <h3>${mes} 
                <button class="apagar-mes" onclick="apagarMes('${mes}')">Apagar</button>
            </h3>
            <table>
                <thead>
                    <tr>
                        <th>Descrição</th>
                        <th>Valor</th>
                        <th>Tipo</th>
                    </tr>
                </thead>
                <tbody>
                    ${lancamentos.map(item => `
                        <tr>
                            <td>${item.desc}</td>
                            <td>R$ ${item.amount}</td>
                            <td>${item.type}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        `;
        container.appendChild(divMes);
    });
}

// Torna a função global para o onclick funcionar
window.apagarMes = apagarMes;

mostrarMeses();