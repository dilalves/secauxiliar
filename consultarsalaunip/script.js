/* ============================================
   MAPA DE SALAS UNIP - JavaScript (HTML/CSS/JS puro)
   Consome: https://apisec.secauxiliar.com.br/unip/api_salas.php
   ============================================ */

(function () {
    'use strict';

    // ============================================
    // CONFIGURAÇÃO DA API
    // ============================================
    var API_URL = 'https://apisec.secauxiliar.com.br/unip/api_salas.php';
    var API_LISTAR_CURSOS = API_URL + '?acao=listar_cursos';

    // ============================================
    // ANDARES (nome, SVG, ponto de partida [svg_x, svg_y])
    // ============================================
    var andares = {
        '2A': { nome: '2º Andar',              svg: 'planta_simulada.svg', partida: [905, 500] },
        '1A': { nome: '1º Andar',              svg: 'planta_simulada.svg', partida: [905, 500] },
        'TA': { nome: 'Térreo Alto',           svg: 'planta_simulada.svg', partida: [860, 500] },
        'TB': { nome: 'Térreo Baixo',          svg: 'planta_simulada.svg', partida: [100, 500] },
        '1S': { nome: 'Integrado - 1º Subsolo', svg: 'planta_simulada.svg', partida: [500, 900] },
        'PP': { nome: 'Praça Paulista',        svg: 'planta_simulada.svg', partida: [500, 100] }
    };

    // ============================================
    // ROTAS POR ANDAR (fallback quando API não tem coordenadas)
    // Formato: [[partida_y, partida_x], [destino_y, destino_x]] (Leaflet: [y, x])
    // ============================================
    var rotasPorAndar = {
        '2A': {
            'default': [[500, 905], [775, 360]]
        },
        '1A': {
            'default': [[500, 905], [775, 360]]
        },
        'TA': {
            'default': [[500, 140], [775, 360]]
        },
        'TB': {
            'default': [[500, 860], [775, 360]]
        },
        '1S': {
            'default': [[100, 500], [775, 360]]
        },
        'PP': {
            'default': [[900, 500], [775, 360]]
        }
    };

    // ============================================
    // CURSOS E TURMAS (fallback caso API não responda)
    // ============================================
    var cursosDisponiveis = [];
    var turmasPorCurso = {};
    var dadosDaAPI = false; // true quando a API retornou os cursos

    var cursosFallback = [
        'Ciência da Computação', 'Administração', 'Direito', 'Engenharia Civil', 'Extensivo'
    ];
    var turmasFallback = {
        'Ciência da Computação': ['CC1A - 1º Semestre', 'CC3B - 3º Semestre'],
        'Administração': ['ADM1', 'ADM2'],
        'Direito': ['Direito Único'],
        'Engenharia Civil': ['Engenharia Única'],
        'Extensivo': ['A', 'B', 'C']
    };

    // ============================================
    // ESTADO
    // ============================================
    var andarAtual = null;
    var map = null;
    var polyline = null;
    var markerStart = null;
    var markerEnd = null;
    var imageBounds = [[0, 0], [1000, 1000]];
    var svgAtual = 'planta_simulada.svg';

    // ============================================
    // UTILITÁRIOS
    // ============================================
    function obterUrlEmbedYouTube(url) {
        if (!url) return '';
        if (url.indexOf('/embed/') !== -1) return url;
        var m = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/) || url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
        return m ? 'https://www.youtube.com/embed/' + m[1] : '';
    }

    function mostrar(el) { document.getElementById(el).style.display = 'block'; }
    function ocultar(el) { document.getElementById(el).style.display = 'none'; }

    function limparResultado() {
        ocultar('result-card');
        ocultar('state-loading');
        ocultar('state-error');
        ocultar('result-success');
    }

    function mostrarErro(msg) {
        ocultar('state-loading');
        ocultar('result-success');
        document.getElementById('erro-msg').textContent = msg;
        mostrar('state-error');
        mostrar('result-card');
    }

    // ============================================
    // CARREGAR CURSOS E TURMAS DA API
    // ============================================
    function carregarCursos() {
        // Tenta buscar da API (endpoint público, sem login)
        return fetch(API_LISTAR_CURSOS, { headers: { 'Accept': 'application/json' } })
            .then(function (resp) {
                if (!resp.ok) throw new Error('http');
                return resp.json();
            })
            .then(function (dados) {
                if (dados && dados.sucesso && dados.cursos && dados.cursos.length > 0) {
                    // API respondeu — usa os dados reais
                    cursosDisponiveis = [];
                    turmasPorCurso = {};

                    dados.cursos.forEach(function (c) {
                        if (c.curso) {
                            cursosDisponiveis.push(c.curso);
                            turmasPorCurso[c.curso] = (c.turmas || []).map(function (t) {
                                return typeof t === 'string' ? t : t.turma;
                            });
                        }
                    });

                    dadosDaAPI = true;
                    // Cacheia por 1 hora
                    try {
                        localStorage.setItem('unip_cursos_cache', JSON.stringify({
                            timestamp: Date.now(),
                            cursos: cursosDisponiveis,
                            turmas: turmasPorCurso
                        }));
                    } catch (e) { /* sem storage */ }

                } else {
                    usarFallback();
                }
            })
            .catch(function () {
                // Endpoint não existe ou erro de rede/CORS — usa fallback
                usarFallback();
            });
    }

    function usarFallback() {
        cursosDisponiveis = cursosFallback.slice();
        turmasPorCurso = turmasFallback;
        dadosDaAPI = false;
    }

    function tentarCache() {
        try {
            var cache = JSON.parse(localStorage.getItem('unip_cursos_cache'));
            if (cache && cache.timestamp && (Date.now() - cache.timestamp) < 3600000) {
                cursosDisponiveis = cache.cursos;
                turmasPorCurso = cache.turmas;
                dadosDaAPI = true;
                return true;
            }
        } catch (e) { /* sem storage */ }
        return false;
    }

    // ============================================
    // QR CODES POR ANDAR
    // ============================================
    function montarQRCodes() {
        var grid = document.getElementById('andar-grid');
        grid.innerHTML = '';
        var baseUrl = window.location.origin + window.location.pathname;

        Object.keys(andares).forEach(function (sigla) {
            var info = andares[sigla];
            var urlQr = baseUrl + '?Origem=' + sigla;

            var div = document.createElement('div');
            div.className = 'andar-item';

            var qrDiv = document.createElement('div');
            qrDiv.className = 'andar-qr';
            div.appendChild(qrDiv);

            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'andar-btn';
            btn.textContent = info.nome;
            btn.addEventListener('click', function () { selecionarAndar(sigla); });
            div.appendChild(btn);

            var link = document.createElement('a');
            link.className = 'andar-link';
            link.href = urlQr;
            link.target = '_blank';
            link.rel = 'noopener';
            link.textContent = 'Abrir link direto ↗';
            div.appendChild(link);

            grid.appendChild(div);

            // Gera o QR client-side
            if (typeof QRCode !== 'undefined') {
                new QRCode(qrDiv, {
                    text: urlQr,
                    width: 140,
                    height: 140,
                    colorDark: '#1a1a2e',
                    colorLight: '#ffffff',
                    correctLevel: QRCode.CorrectLevel.M
                });
            }
        });
    }

    // ============================================
    // SELEÇÃO DE ANDAR
    // ============================================
    function selecionarAndar(sigla) {
        andarAtual = sigla;
        svgAtual = andares[sigla].svg;
        try { localStorage.setItem('unip_andar', sigla); } catch (e) { /* sem storage */ }

        ocultar('andar-card');
        mostrar('selection-card');

        var chip = document.getElementById('origin-chip');
        chip.style.display = 'block';
        chip.innerHTML = '📍 Você está em: <strong>' + andares[sigla].nome + '</strong>';

        document.getElementById('nome-origem').textContent = andares[sigla].nome;

        // Preenche cursos
        var selectCurso = document.getElementById('curso');
        selectCurso.innerHTML = '<option value="">-- Escolha o Curso --</option>';

        if (cursosDisponiveis.length === 0) {
            var opt = document.createElement('option');
            opt.value = '';
            opt.textContent = 'Carregando cursos...';
            opt.disabled = true;
            selectCurso.appendChild(opt);
        } else {
            cursosDisponiveis.forEach(function (curso) {
                var opt = document.createElement('option');
                opt.value = curso;
                opt.textContent = curso;
                selectCurso.appendChild(opt);
            });
        }
        selectCurso.value = '';

        ocultar('turma-group');
        limparResultado();
    }

    function trocarAndar() {
        andarAtual = null;
        try { localStorage.removeItem('unip_andar'); } catch (e) { /* sem storage */ }

        ocultar('selection-card');
        ocultar('origin-chip');
        mostrar('andar-card');
        limparResultado();

        document.getElementById('curso').value = '';
        document.getElementById('turma').value = '';
    }

    // ============================================
    // CURSO E TURMA
    // ============================================
    function aoSelecionarCurso() {
        var curso = document.getElementById('curso').value;
        var selectTurma = document.getElementById('turma');
        var turmaGroup = document.getElementById('turma-group');

        selectTurma.innerHTML = '<option value="">-- Escolha a Turma --</option>';

        if (curso && turmasPorCurso[curso]) {
            turmaGroup.style.display = 'block';
            turmasPorCurso[curso].forEach(function (turma) {
                var opt = document.createElement('option');
                opt.value = turma;
                opt.textContent = turma;
                selectTurma.appendChild(opt);
            });
        } else {
            turmaGroup.style.display = 'none';
        }

        limparResultado();
    }

    // ============================================
    // CONSULTA À API + RESULTADO
    // ============================================
    function aoSelecionarTurma() {
        var curso = document.getElementById('curso').value;
        var turma = document.getElementById('turma').value;

        if (!andarAtual || !curso || !turma) {
            limparResultado();
            return;
        }

        // Mostra loading
        ocultar('state-error');
        ocultar('result-success');
        mostrar('state-loading');
        mostrar('result-card');

        var url = API_URL + '?curso=' + encodeURIComponent(curso) + '&turma=' + encodeURIComponent(turma);

        fetch(url, { headers: { 'Accept': 'application/json' } })
            .then(function (resp) {
                if (resp.status === 404) throw new Error('404');
                if (!resp.ok) throw new Error('http');
                return resp.json();
            })
            .then(function (dados) {
                if (dados && dados.sucesso === true && dados.sala) {
                    exibirResultado(dados.sala, dados.link || '', turma);
                } else {
                    mostrarErro('Não foi possível encontrar a sala para este curso e turma.');
                }
            })
            .catch(function (err) {
                if (err && err.message === '404') {
                    mostrarErro('Não foi possível encontrar a sala para este curso e turma.');
                } else if (err instanceof TypeError) {
                    mostrarErro('Não foi possível conectar à API de salas. Verifique sua conexão e tente novamente.');
                } else {
                    mostrarErro('Erro ao consultar a API de salas. Tente novamente em instantes.');
                }
            });
    }

    function exibirResultado(sala, link, turma) {
        ocultar('state-loading');
        ocultar('state-error');

        document.getElementById('sala-nome').textContent = sala;

        // Vídeo
        var embed = obterUrlEmbedYouTube(link);
        var videoSection = document.getElementById('video-section');
        if (embed) {
            videoSection.style.display = 'block';
            document.getElementById('video-iframe').src = embed;
        } else {
            videoSection.style.display = 'none';
            document.getElementById('video-iframe').src = '';
        }

        // Rota por andar (fallback local)
        var andarRotas = rotasPorAndar[andarAtual] || {};
        var rota = andarRotas[turma] || andarRotas['default'] || [[500, 905], [775, 360]];

        mostrar('result-success');
        mostrar('result-card');

        renderizarMapa(rota, andares[andarAtual].partida);
        document.getElementById('nome-origem').textContent = andares[andarAtual].nome;
    }

    // ============================================
    // MAPA (LEAFLET)
    // ============================================
    function renderizarMapa(rota, partidaSvg) {
        if (map === null) {
            map = L.map('leaflet-map', {
                crs: L.CRS.Simple,
                minZoom: -2,
                maxZoom: 2,
                zoomControl: true,
                attributionControl: false
            });
            L.imageOverlay(svgAtual, imageBounds).addTo(map);
        }

        if (polyline !== null) map.removeLayer(polyline);
        if (markerStart !== null) map.removeLayer(markerStart);
        if (markerEnd !== null) map.removeLayer(markerEnd);

        polyline = L.polyline(rota, {
            color: '#FFED00',
            weight: 7,
            opacity: 1,
            dashArray: '12, 14',
            lineJoin: 'round',
            lineCap: 'round'
        }).addTo(map);

        var startPoint = [1000 - partidaSvg[1], partidaSvg[0]];
        var endPoint = rota[rota.length - 1];

        markerStart = L.circleMarker(startPoint, {
            color: '#FFED00',
            fillColor: '#075EBD',
            fillOpacity: 1,
            radius: 10,
            weight: 3
        }).addTo(map).bindTooltip('📍 Você está aqui', { permanent: true, direction: 'left', className: 'map-tooltip' });

        markerEnd = L.circleMarker(endPoint, {
            color: '#075EBD',
            fillColor: '#FFED00',
            fillOpacity: 1,
            radius: 10,
            weight: 3
        }).addTo(map).bindTooltip('🏁 Destino', { permanent: true, direction: 'right', className: 'map-tooltip' });

        map.invalidateSize();
        map.fitBounds(imageBounds, { padding: [10, 10] });
    }

    // ============================================
    // INICIALIZAÇÃO
    // ============================================
    function init() {
        montarQRCodes();

        // Botão trocar andar
        document.getElementById('btn-trocar-andar').addEventListener('click', trocarAndar);

        // Selects
        document.getElementById('curso').addEventListener('change', aoSelecionarCurso);
        document.getElementById('turma').addEventListener('change', aoSelecionarTurma);

        // Tenta cache primeiro, senão busca da API
        if (!tentarCache()) {
            carregarCursos();
        }

        // ?Origem=XX no URL (QR code escaneado)
        var params = new URLSearchParams(window.location.search);
        var origem = (params.get('Origem') || '').toUpperCase();

        if (andares[origem]) {
            selecionarAndar(origem);
            return;
        }

        // Andar salvo no localStorage
        var salvo = null;
        try { salvo = localStorage.getItem('unip_andar'); } catch (e) { /* sem storage */ }
        if (salvo && andares[salvo]) {
            selecionarAndar(salvo);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
