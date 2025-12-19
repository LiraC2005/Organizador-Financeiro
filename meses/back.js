auth.onAuthStateChanged((user) => {
    if (user) { mostrarMeses(); }
    else { window.location.href = "../login.html"; }
});

async function mostrarMeses() {
    const container = document.getElementById("listaMeses");
    const user = auth.currentUser;
    const snapshot = await db.collection("transacoes").where("userId", "==", user.uid).get();

    container.innerHTML = "";
    const agrupado = {};

    snapshot.forEach(doc => {
        const d = doc.data();
        if (!agrupado[d.mesReferencia]) agrupado[d.mesReferencia] = [];
        agrupado[d.mesReferencia].push({ id: doc.id, ...d });
    });

    Object.keys(agrupado).sort().reverse().forEach(mes => {
        const div = document.createElement("div");
        div.className = "mes-bloco";
        div.innerHTML = `
            <h3>${mes} <button onclick="apagarMes('${mes}')" style="background:red; color:white; border:none; padding:4px; border-radius:4px; cursor:pointer;">Apagar Mês</button></h3>
            <table>
                ${agrupado[mes].map(i => `<tr><td>${i.desc}</td><td>R$ ${i.amount}</td><td>${i.type}</td></tr>`).join("")}
            </table>`;
        container.appendChild(div);
    });
}

async function apagarMes(mes) {
    if (!confirm("Apagar todos os dados deste mês?")) return;
    const snapshot = await db.collection("transacoes")
        .where("userId", "==", auth.currentUser.uid)
        .where("mesReferencia", "==", mes).get();

    const batch = db.batch();
    snapshot.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    mostrarMeses();
}