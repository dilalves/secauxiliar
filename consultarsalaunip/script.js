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
    // ROTAS POR ANDAR
    // Formato: [[partida_y, partida_x], [destino_y, destino_x]] (Leaflet: [y, x])
    // ============================================
    var rotasPorAndar = {
        '2A': {
            'CC1A - 1º Semestre': [[500, 905], [775, 830]],
            'CC3B - 3º Semestre': [[500, 905], [775, 360]],
            'ADM1':               [[500, 905], [220, 140]],
            'ADM2':               [[500, 905], [220, 360]],
            'A':                  [[500, 905], [775, 360]],
            'B':                  [[500, 905], [580, 830]],
            'C':                  [[500, 905], [420, 140]],
            'default':            [[500, 905], [775, 360]]
        },
        '1A': {
            'CC1A - 1º Semestre': [[500, 905], [775, 830]],
            'CC3B - 3º Semestre': [[500, 905], [775, 360]],
            'ADM1':               [[500, 905], [220, 140]],
            'ADM2':               [[500, 905], [220, 360]],
            'A':                  [[500, 905], [775, 360]],
            'B':                  [[500, 905], [580, 830]],
            'C':                  [[500, 905], [420, 140]],
            'default':            [[500, 905], [775, 360]]
        },
        'TA': {
            'CC1A - 1º Semestre': [[500, 140], [775, 830]],
            'CC3B - 3º Semestre': [[500, 140], [775, 360]],
            'ADM1':               [[500, 140], [220, 140]],
            'ADM2':               [[500, 140], [220, 360]],
            'A':                  [[500, 140], [775, 360]],
            'B':                  [[500, 140], [580, 830]],
            'C':                  [[500, 140], [420, 140]],
            'default':            [[500, 140], [775, 360]]
        },
        'TB': {
            'CC1A - 1º Semestre': [[500, 860], [775, 830]],
            'CC3B - 3º Semestre': [[500, 860], [775, 360]],
            'ADM1':               [[500, 860], [220, 140]],
            'ADM2':               [[500, 860], [220, 360]],
            'A':                  [[500, 860], [775, 360]],
            'B':                  [[500, 860], [580, 830]],
            'C':                  [[500, 860], [420, 140]],
            'default':            [[500, 860], [775, 360]]
        },
        '1S': {
            'CC1A - 1º Semestre': [[100, 500], [775, 830]],
            'CC3B - 3º Semestre': [[100, 500], [775, 360]],
            'ADM1':               [[100, 500], [220, 140]],
            'ADM2':               [[100, 500], [220, 360]],
            'A':                  [[100, 500], [775, 360]],
            'B':                  [[100, 500], [580, 830]],
            'C':                  [[100, 500], [420, 140]],
            'default':            [[100, 500], [775, 360]]
        },
        'PP': {
            'CC1A - 1º Semestre': [[900, 500], [775, 830]],
            'CC3B - 3º Semestre': [[900, 500], [775, 360]],
            'ADM1':               [[900, 500], [220, 140]],
            'ADM2':               [[900, 500], [220, 360]],
            'A':                  [[900, 500], [775, 360]],
            'B':                  [[900, 500], [580, 830]],
            'C':                  [[900, 500], [420, 140]],
            'default':            [[900, 500], [775, 360]]
        }
    };

    // ============================================
    // CURSOS E TURMAS (mock)
    // ============================================
    var cursosDisponiveis = [
        'Ciência da Computação', 'Administração', 'Direito', 'Engenharia Civil', 'Extensivo'
    ];
    var turmasPorCurso = {
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
    // UTILIDADES
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
        cursosDisponiveis.forEach(function (curso) {
            var opt = document.createElement('option');
            opt.value = curso;
            opt.textContent = curso;
            selectCurso.appendChild(opt);
        });
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
                if (resp.status === 404) {
                    throw new Error('404');
                }
                if (!resp.ok) {
                    throw new Error('http');
                }
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
                    // Falha de rede ou CORS bloqueado pelo navegador
                    mostrarErro('Não foi possível conectar à API de salas (rede ou CORS bloqueado). Verifique sua conexão e tente novamente.');
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

        // Rota por andar
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

        // Linha tracejada amarela
        polyline = L.polyline(rota, {
            color: '#FFED00',
            weight: 7,
            opacity: 1,
            dashArray: '12, 14',
            lineJoin: 'round',
            lineCap: 'round'
        }).addTo(map);

        // Converte SVG [x, y] para Leaflet [1000 - y, x]
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
