document.getElementById('loginTab').onclick = function () {
    document.getElementById('loginTab').classList.add('active');
    document.getElementById('registerTab').classList.remove('active');
    document.getElementById('loginForm').style.display = '';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginMessage').textContent = '';
};

document.getElementById('registerTab').onclick = function () {
    document.getElementById('registerTab').classList.add('active');
    document.getElementById('loginTab').classList.remove('active');
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = '';
    document.getElementById('loginMessage').textContent = '';
};

// Cadastro
document.getElementById('registerForm').onsubmit = function (e) {
    e.preventDefault();
    const user = document.getElementById('newUsername').value;
    const pass = document.getElementById('newPassword').value;
    const confirm = document.getElementById('confirmPassword').value;
    const msg = document.getElementById('loginMessage');

    if (pass !== confirm) {
        msg.textContent = 'As senhas não coincidem.';
        return;
    }

    let users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[user]) {
        msg.textContent = 'Usuário já existe.';
        return;
    }

    users[user] = pass;
    localStorage.setItem('users', JSON.stringify(users));
    msg.style.color = 'green';
    msg.textContent = 'Cadastro realizado com sucesso! Faça login.';
    document.getElementById('registerForm').reset();
};

// Login
document.getElementById('loginForm').onsubmit = function (e) {
    e.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const msg = document.getElementById('loginMessage');

    let users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[user] && users[user] === pass) {
        msg.style.color = 'green';
        msg.textContent = 'Login realizado com sucesso!';
        localStorage.setItem('loggedUser', user); // Salva usuário logado
        setTimeout(function () {
            window.location.href = '../index.html';
        }, 1000); // Aguarda 1 segundo antes de redirecionar
    } else {
        msg.style.color = '#d32f2f';
        msg.textContent = 'Usuário ou senha inválidos.';
    }
};