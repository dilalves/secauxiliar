/* ============================================
   LOGIN - GESTÃO DE SALAS UNIP
   Consome: https://apisec.secauxiliar.com.br/unip/api_admin.php
   ============================================ */

(function () {
    'use strict';

    var API = 'https://apisec.secauxiliar.com.br/unip/api_admin.php';

    var form = document.getElementById('login-form');
    var inputUsuario = document.getElementById('usuario');
    var inputSenha = document.getElementById('senha');
    var divErro = document.getElementById('login-erro');
    var btnEntrar = document.getElementById('btn-entrar');
    var btnVisibilidade = document.getElementById('btn-visibilidade');

    // ============================================
    // MOSTRAR / ESCONDER SENHA
    // ============================================
    btnVisibilidade.addEventListener('click', function () {
        var tipo = inputSenha.type === 'password' ? 'text' : 'password';
        inputSenha.type = tipo;
        btnVisibilidade.textContent = tipo === 'password' ? '👁️' : '🙈';
    });

    // ============================================
    // UI
    // ============================================
    function mostrarErro(msg) {
        divErro.textContent = msg;
        divErro.style.display = 'block';
    }

    function limparErro() {
        divErro.style.display = 'none';
        divErro.textContent = '';
    }

    function carregando(sim) {
        btnEntrar.disabled = sim;
        var texto = btnEntrar.querySelector('.btn-texto');
        var spinner = btnEntrar.querySelector('.btn-spinner');
        texto.style.display = sim ? 'none' : 'inline';
        spinner.style.display = sim ? 'inline-block' : 'none';
    }

    // ============================================
    // SUBMIT
    // ============================================
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        limparErro();

        var usuario = inputUsuario.value.trim();
        var senha = inputSenha.value;

        if (!usuario || !senha) {
            mostrarErro('Preencha usuário e senha.');
            return;
        }

        carregando(true);

        fetch(API, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ acao: 'login', usuario: usuario, senha: senha })
        })
        .then(function (resp) {
            return resp.json().then(function (dados) {
                return { status: resp.status, dados: dados };
            });
        })
        .then(function (resultado) {
            carregando(false);

            if (resultado.status === 200 && resultado.dados.sucesso) {
                // Guarda token CSRF e dados do usuário
                sessionStorage.setItem('csrf_token', resultado.dados.csrf_token);
                sessionStorage.setItem('usuario_logado', JSON.stringify(resultado.dados.usuario));

                // Vai para o painel
                window.location.href = 'gestao.html';
            } else if (resultado.status === 401) {
                mostrarErro('Usuário ou senha inválidos.');
            } else if (resultado.status === 403) {
                mostrarErro(resultado.dados.mensagem || 'Acesso negado.');
            } else {
                mostrarErro(resultado.dados.mensagem || 'Erro ao fazer login. Tente novamente.');
            }
        })
        .catch(function () {
            carregando(false);
            mostrarErro('Não foi possível conectar ao servidor. Verifique sua conexão.');
        });
    });

    // ============================================
    // Se já estiver logado, pula direto
    // ============================================
    var token = sessionStorage.getItem('csrf_token');
    var usuario = sessionStorage.getItem('usuario_logado');
    if (token && usuario) {
        window.location.href = 'gestao.html';
    }
})();
