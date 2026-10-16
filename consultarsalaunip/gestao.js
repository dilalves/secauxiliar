/* ============================================
   PAINEL DE GESTÃO - SALAS, TURMAS, USUÁRIOS
   Consome: https://apisec.secauxiliar.com.br/unip/api_admin.php
   ============================================ */

(function () {
    'use strict';

    var API = 'https://apisec.secauxiliar.com.br/unip/api_admin.php';

    // ============================================
    // ESTADO
    // ============================================
    var usuarioAtual = null;
    var perfilAtual = null;
    var csrfToken = sessionStorage.getItem('csrf_token') || '';
    var listaSalas = [];
    var callbackConfirmacao = null;

    // ============================================
    // UTILITÁRIOS
    // ============================================
    function $(id) { return document.getElementById(id); }

    function mostrarToast(msg, tipo) {
        var toast = $('toast');
        toast.textContent = msg;
        toast.className = 'toast ' + (tipo || 'sucesso');
        toast.style.display = 'block';
        setTimeout(function () { toast.style.display = 'none'; }, 3000);
    }

    function confirmar(titulo, texto, callback) {
        $('modal-titulo').textContent = titulo;
        $('modal-texto').textContent = texto;
        callbackConfirmacao = callback;
        $('modal-confirmacao').style.display = 'flex';
    }

    function fecharModal() {
        $('modal-confirmacao').style.display = 'none';
        callbackConfirmacao = null;
    }

    function escapeHtml(str) {
        if (!str) return '';
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ============================================
    // CHAMADAS À API
    // ============================================
    function getAcao(acao) {
        return fetch(API + '?acao=' + encodeURIComponent(acao), {
            credentials: 'include'
        }).then(function (resp) {
            if (resp.status === 401) {
                // Sessão expirada
                window.location.href = 'login.html';
                throw new Error('Sessão expirada');
            }
            return resp.json().then(function (dados) {
                return { status: resp.status, dados: dados };
            });
        });
    }

    function postAcao(acao, dadosExtra) {
        var body = { acao: acao };
        if (dadosExtra) {
            Object.keys(dadosExtra).forEach(function (k) { body[k] = dadosExtra[k]; });
        }

        return fetch(API, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken || ''
            },
            body: JSON.stringify(body)
        }).then(function (resp) {
            if (resp.status === 401) {
                window.location.href = 'login.html';
                throw new Error('Sessão expirada');
            }
            return resp.json().then(function (dados) {
                return { status: resp.status, dados: dados };
            });
        });
    }

    // ============================================
    // VERIFICAR SESSÃO
    // ============================================
    function verificarSessao() {
        return getAcao('verificar_sessao').then(function (r) {
            if (r.status === 200 && r.dados.sucesso) {
                usuarioAtual = r.dados.usuario;
                perfilAtual = r.dados.usuario.perfil;
                csrfToken = r.dados.csrf_token || csrfToken;
                sessionStorage.setItem('csrf_token', csrfToken);
                sessionStorage.setItem('usuario_logado', JSON.stringify(usuarioAtual));

                // UI
                $('usuario-nome').textContent = usuarioAtual.nome || usuarioAtual.usuario || 'Usuário';
                $('usuario-perfil').textContent = perfilAtual;

                // Esconde aba usuários se não for ADMIN
                if (perfilAtual === 'ADMIN') {
                    $('nav-usuarios').style.display = 'inline-flex';
                }
            } else {
                window.location.href = 'login.html';
            }
        }).catch(function () {
            window.location.href = 'login.html';
        });
    }

    // ============================================
    // LOGOUT
    // ============================================
    function fazerLogout() {
        postAcao('logout').then(function () {
            sessionStorage.clear();
            window.location.href = 'login.html';
        }).catch(function () {
            sessionStorage.clear();
            window.location.href = 'login.html';
        });
    }

    // ============================================
    // NAVEGAÇÃO POR ABAS
    // ============================================
    function trocarAba(aba) {
        // Botões
        document.querySelectorAll('.nav-btn').forEach(function (btn) {
            btn.classList.remove('active');
        });
        document.querySelector('.nav-btn[data-aba="' + aba + '"]').classList.add('active');

        // Conteúdos
        document.querySelectorAll('.aba-conteudo').forEach(function (sec) {
            sec.classList.remove('active');
        });
        $('aba-' + aba).classList.add('active');

        // Fecha formulários abertos
        fecharFormularios();

        // Carrega dados da aba
        if (aba === 'salas') carregarSalas();
        else if (aba === 'turmas') carregarTurmas();
        else if (aba === 'usuarios') carregarUsuarios();
    }

    function fecharFormularios() {
        $('form-sala').style.display = 'none';
        $('form-turma').style.display = 'none';
        $('form-usuario').style.display = 'none';
    }

    // ============================================
    // SALAS
    // ============================================
    function carregarSalas() {
        getAcao('listar_salas').then(function (r) {
            if (r.status === 200 && r.dados.sucesso) {
                listaSalas = r.dados.dados || [];
                renderizarSalas();
                popularSelectSalas();
            } else {
                mostrarToast(r.dados.mensagem || 'Erro ao carregar salas.', 'erro');
            }
        }).catch(function () {
            mostrarToast('Erro de conexão ao carregar salas.', 'erro');
        });
    }

    function renderizarSalas() {
        var tbody = $('tabela-salas').querySelector('tbody');
        tbody.innerHTML = '';

        if (listaSalas.length === 0) {
            $('salas-vazio').style.display = 'block';
            $('tabela-salas').style.display = 'none';
            return;
        }
        $('salas-vazio').style.display = 'none';
        $('tabela-salas').style.display = 'table';

        listaSalas.forEach(function (sala) {
            var tr = document.createElement('tr');
            tr.innerHTML =
                '<td>' + escapeHtml(sala.id_link) + '</td>' +
                '<td>' + escapeHtml(sala.sala) + '</td>' +
                '<td>' + (sala.link ? '<a href="' + escapeHtml(sala.link) + '" target="_blank" rel="noopener" class="link-tabela">Abrir ↗</a>' : '<span class="sem-link">—</span>') + '</td>' +
                '<td class="acoes-col">' +
                    '<button class="btn-acao btn-editar" data-id="' + sala.id_link + '">Editar</button>' +
                    (perfilAtual === 'ADMIN' ? '<button class="btn-acao btn-excluir" data-id="' + sala.id_link + '" data-nome="' + escapeHtml(sala.sala) + '">Excluir</button>' : '') +
                '</td>';
            tbody.appendChild(tr);
        });

        // Eventos editar
        tbody.querySelectorAll('.btn-editar').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var id = parseInt(btn.getAttribute('data-id'));
                editarSala(id);
            });
        });

        // Eventos excluir (só ADMIN)
        tbody.querySelectorAll('.btn-excluir').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var id = parseInt(btn.getAttribute('data-id'));
                var nome = btn.getAttribute('data-nome');
                confirmar('Excluir Sala', 'Tem certeza que deseja excluir a sala "' + nome + '"?', function () {
                    excluirSala(id);
                });
            });
        });
    }

    function abrirFormSala(sala) {
        $('form-sala-titulo').textContent = sala ? 'Editar Sala' : 'Nova Sala';
        $('sala-id').value = sala ? sala.id_link : 0;
        $('sala-nome').value = sala ? sala.sala : '';
        $('sala-link').value = sala && sala.link ? sala.link : '';
        $('form-sala').style.display = 'block';
        $('sala-nome').focus();
    }

    function editarSala(id) {
        var sala = listaSalas.find(function (s) { return s.id_link === id; });
        if (sala) abrirFormSala(sala);
    }

    function salvarSala() {
        var id = parseInt($('sala-id').value) || 0;
        var sala = $('sala-nome').value.trim();
        var link = $('sala-link').value.trim();

        if (!sala) {
            mostrarToast('Informe o código da sala.', 'erro');
            return;
        }

        if (link && !link.startsWith('https://')) {
            mostrarToast('O link deve começar com https://', 'erro');
            return;
        }

        postAcao('salvar_sala', { id_link: id, sala: sala, link: link }).then(function (r) {
            if (r.status === 200 && r.dados.sucesso) {
                mostrarToast('Sala salva com sucesso!');
                fecharFormularios();
                carregarSalas();
            } else {
                mostrarToast(r.dados.mensagem || 'Erro ao salvar sala.', 'erro');
            }
        }).catch(function () {
            mostrarToast('Erro de conexão.', 'erro');
        });
    }

    function excluirSala(id) {
        postAcao('excluir_sala', { id_link: id }).then(function (r) {
            if (r.status === 200 && r.dados.sucesso) {
                mostrarToast('Sala excluída com sucesso!');
                carregarSalas();
            } else {
                mostrarToast(r.dados.mensagem || 'Erro ao excluir sala.', 'erro');
            }
        }).catch(function () {
            mostrarToast('Erro de conexão.', 'erro');
        });
    }

    function popularSelectSalas() {
        var select = $('turma-sala');
        select.innerHTML = '<option value="">-- Escolha a Sala --</option>';
        listaSalas.forEach(function (sala) {
            var opt = document.createElement('option');
            opt.value = sala.id_link;
            opt.textContent = sala.sala;
            select.appendChild(opt);
        });
    }

    // ============================================
    // TURMAS
    // ============================================
    var listaTurmas = [];

    function carregarTurmas() {
        getAcao('listar_turmas').then(function (r) {
            if (r.status === 200 && r.dados.sucesso) {
                listaTurmas = r.dados.dados || [];
                renderizarTurmas();
            } else {
                mostrarToast(r.dados.mensagem || 'Erro ao carregar turmas.', 'erro');
            }
        }).catch(function () {
            mostrarToast('Erro de conexão.', 'erro');
        });
    }

    function renderizarTurmas() {
        var tbody = $('tabela-turmas').querySelector('tbody');
        tbody.innerHTML = '';

        if (listaTurmas.length === 0) {
            $('turmas-vazio').style.display = 'block';
            $('tabela-turmas').style.display = 'none';
            return;
        }
        $('turmas-vazio').style.display = 'none';
        $('tabela-turmas').style.display = 'table';

        listaTurmas.forEach(function (turma) {
            var tr = document.createElement('tr');
            tr.innerHTML =
                '<td>' + escapeHtml(turma.id) + '</td>' +
                '<td>' + escapeHtml(turma.curso) + '</td>' +
                '<td>' + escapeHtml(turma.turma) + '</td>' +
                '<td>' + escapeHtml(turma.sala || '—') + '</td>' +
                '<td class="acoes-col">' +
                    '<button class="btn-acao btn-editar" data-id="' + turma.id + '">Editar</button>' +
                    (perfilAtual === 'ADMIN' ? '<button class="btn-acao btn-excluir" data-id="' + turma.id + '" data-nome="' + escapeHtml(turma.curso + ' - ' + turma.turma) + '">Excluir</button>' : '') +
                '</td>';
            tbody.appendChild(tr);
        });

        tbody.querySelectorAll('.btn-editar').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var id = parseInt(btn.getAttribute('data-id'));
                editarTurma(id);
            });
        });

        tbody.querySelectorAll('.btn-excluir').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var id = parseInt(btn.getAttribute('data-id'));
                var nome = btn.getAttribute('data-nome');
                confirmar('Excluir Turma', 'Tem certeza que deseja excluir "' + nome + '"?', function () {
                    excluirTurma(id);
                });
            });
        });
    }

    function abrirFormTurma(turma) {
        $('form-turma-titulo').textContent = turma ? 'Editar Turma' : 'Nova Turma';
        $('turma-id').value = turma ? turma.id : 0;
        $('turma-curso').value = turma ? turma.curso : '';
        $('turma-nome').value = turma ? turma.turma : '';

        // Select de sala
        var selectSala = $('turma-sala');
        selectSala.innerHTML = '<option value="">-- Escolha a Sala --</option>';
        listaSalas.forEach(function (sala) {
            var opt = document.createElement('option');
            opt.value = sala.id_link;
            opt.textContent = sala.sala;
            if (turma && turma.id_link === sala.id_link) {
                opt.selected = true;
            }
            selectSala.appendChild(opt);
        });

        $('form-turma').style.display = 'block';
        $('turma-curso').focus();
    }

    function editarTurma(id) {
        var turma = listaTurmas.find(function (t) { return t.id === id; });
        if (turma) abrirFormTurma(turma);
    }

    function salvarTurma() {
        var id = parseInt($('turma-id').value) || 0;
        var curso = $('turma-curso').value.trim();
        var turma = $('turma-nome').value.trim();
        var id_link = parseInt($('turma-sala').value) || 0;

        if (!curso || !turma || !id_link) {
            mostrarToast('Preencha curso, turma e sala.', 'erro');
            return;
        }

        postAcao('salvar_turma', { id: id, curso: curso, turma: turma, id_link: id_link }).then(function (r) {
            if (r.status === 200 && r.dados.sucesso) {
                mostrarToast('Turma salva com sucesso!');
                fecharFormularios();
                carregarTurmas();
            } else {
                mostrarToast(r.dados.mensagem || 'Erro ao salvar turma.', 'erro');
            }
        }).catch(function () {
            mostrarToast('Erro de conexão.', 'erro');
        });
    }

    function excluirTurma(id) {
        postAcao('excluir_turma', { id: id }).then(function (r) {
            if (r.status === 200 && r.dados.sucesso) {
                mostrarToast('Turma excluída com sucesso!');
                carregarTurmas();
            } else {
                mostrarToast(r.dados.mensagem || 'Erro ao excluir turma.', 'erro');
            }
        }).catch(function () {
            mostrarToast('Erro de conexão.', 'erro');
        });
    }

    // ============================================
    // USUÁRIOS (só ADMIN)
    // ============================================
    var listaUsuarios = [];

    function carregarUsuarios() {
        getAcao('listar_usuarios').then(function (r) {
            if (r.status === 200 && r.dados.sucesso) {
                listaUsuarios = r.dados.dados || [];
                renderizarUsuarios();
            } else {
                mostrarToast(r.dados.mensagem || 'Erro ao carregar usuários.', 'erro');
            }
        }).catch(function () {
            mostrarToast('Erro de conexão.', 'erro');
        });
    }

    function renderizarUsuarios() {
        var tbody = $('tabela-usuarios').querySelector('tbody');
        tbody.innerHTML = '';

        if (listaUsuarios.length === 0) {
            $('usuarios-vazio').style.display = 'block';
            $('tabela-usuarios').style.display = 'none';
            return;
        }
        $('usuarios-vazio').style.display = 'none';
        $('tabela-usuarios').style.display = 'table';

        listaUsuarios.forEach(function (user) {
            var tr = document.createElement('tr');
            var statusBadge = user.ativo == 1
                ? '<span class="badge badge-ativo">Ativo</span>'
                : '<span class="badge badge-inativo">Inativo</span>';
            tr.innerHTML =
                '<td>' + escapeHtml(user.id) + '</td>' +
                '<td>' + escapeHtml(user.nome) + '</td>' +
                '<td>' + escapeHtml(user.usuario) + '</td>' +
                '<td>' + escapeHtml(user.perfil) + '</td>' +
                '<td>' + statusBadge + '</td>' +
                '<td class="acoes-col">' +
                    '<button class="btn-acao btn-editar" data-id="' + user.id + '">Editar</button>' +
                    (user.id != usuarioAtual.id ? '<button class="btn-acao btn-excluir" data-id="' + user.id + '" data-nome="' + escapeHtml(user.nome) + '">Desativar</button>' : '') +
                '</td>';
            tbody.appendChild(tr);
        });

        tbody.querySelectorAll('.btn-editar').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var id = parseInt(btn.getAttribute('data-id'));
                editarUsuario(id);
            });
        });

        tbody.querySelectorAll('.btn-excluir').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var id = parseInt(btn.getAttribute('data-id'));
                var nome = btn.getAttribute('data-nome');
                confirmar('Desativar Usuário', 'Tem certeza que deseja desativar "' + nome + '"?', function () {
                    excluirUsuario(id);
                });
            });
        });
    }

    function abrirFormUsuario(user) {
        $('form-usuario-titulo').textContent = user ? 'Editar Usuário' : 'Novo Usuário';
        $('usuario-id').value = user ? user.id : 0;
        $('usuario-nome-input').value = user ? user.nome : '';
        $('usuario-login').value = user ? user.usuario : '';
        $('usuario-senha').value = '';
        $('senha-dica').style.display = user ? 'block' : 'none';

        var selectPerfil = $('usuario-perfil-select');
        selectPerfil.value = user ? user.perfil : 'OPERADOR';

        var selectAtivo = $('usuario-ativo');
        selectAtivo.value = user ? (user.ativo == 1 ? '1' : '0') : '1';

        $('form-usuario').style.display = 'block';
        $('usuario-nome-input').focus();
    }

    function editarUsuario(id) {
        var user = listaUsuarios.find(function (u) { return u.id === id; });
        if (user) abrirFormUsuario(user);
    }

    function salvarUsuario() {
        var id = parseInt($('usuario-id').value) || 0;
        var nome = $('usuario-nome-input').value.trim();
        var usuario = $('usuario-login').value.trim();
        var senha = $('usuario-senha').value;
        var perfil = $('usuario-perfil-select').value;
        var ativo = parseInt($('usuario-ativo').value);

        if (!nome || !usuario) {
            mostrarToast('Preencha nome e usuário.', 'erro');
            return;
        }

        // Senha: obrigatória no cadastro, opcional na edição (manter atual)
        if (id === 0 && (!senha || senha.length < 12)) {
            mostrarToast('A senha deve ter no mínimo 12 caracteres.', 'erro');
            return;
        }

        if (senha && senha.length < 12) {
            mostrarToast('A senha deve ter no mínimo 12 caracteres.', 'erro');
            return;
        }

        postAcao('salvar_usuario', {
            id: id,
            nome: nome,
            usuario: usuario,
            senha: senha || '',
            perfil: perfil,
            ativo: ativo
        }).then(function (r) {
            if (r.status === 200 && r.dados.sucesso) {
                mostrarToast('Usuário salvo com sucesso!');
                fecharFormularios();
                carregarUsuarios();
            } else {
                mostrarToast(r.dados.mensagem || 'Erro ao salvar usuário.', 'erro');
            }
        }).catch(function () {
            mostrarToast('Erro de conexão.', 'erro');
        });
    }

    function excluirUsuario(id) {
        postAcao('excluir_usuario', { id: id }).then(function (r) {
            if (r.status === 200 && r.dados.sucesso) {
                mostrarToast('Usuário desativado com sucesso!');
                carregarUsuarios();
            } else {
                mostrarToast(r.dados.mensagem || 'Erro ao desativar usuário.', 'erro');
            }
        }).catch(function () {
            mostrarToast('Erro de conexão.', 'erro');
        });
    }

    // ============================================
    // INICIALIZAÇÃO
    // ============================================
    function init() {
        // Verifica sessão antes de tudo
        verificarSessao().then(function () {
            // Navegação
            document.querySelectorAll('.nav-btn').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    trocarAba(btn.getAttribute('data-aba'));
                });
            });

            // Logout
            $('btn-sair').addEventListener('click', fazerLogout);

            // Salas
            $('btn-nova-sala').addEventListener('click', function () { abrirFormSala(null); });
            $('btn-salvar-sala').addEventListener('click', salvarSala);
            $('btn-cancelar-sala').addEventListener('click', fecharFormularios);

            // Turmas
            $('btn-nova-turma').addEventListener('click', function () { abrirFormTurma(null); });
            $('btn-salvar-turma').addEventListener('click', salvarTurma);
            $('btn-cancelar-turma').addEventListener('click', fecharFormularios);

            // Usuários
            $('btn-novo-usuario').addEventListener('click', function () { abrirFormUsuario(null); });
            $('btn-salvar-usuario').addEventListener('click', salvarUsuario);
            $('btn-cancelar-usuario').addEventListener('click', fecharFormularios);

            // Modal
            $('modal-confirmar').addEventListener('click', function () {
                if (callbackConfirmacao) callbackConfirmacao();
                fecharModal();
            });
            $('modal-cancelar').addEventListener('click', fecharModal);
            $('modal-confirmacao').addEventListener('click', function (e) {
                if (e.target === $('modal-confirmacao')) fecharModal();
            });

            // Carrega salas (aba padrão)
            carregarSalas();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
