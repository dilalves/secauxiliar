<?php
/**
 * Mapa de Salas UNIP - Versão PHP
 * 
 * Consome a API: https://apisec.secauxiliar.com.br/unip/api_salas.php
 * Parâmetros: curso, turma e origem (andar)
 */

// Inicia sessão (usada para token CSRF)
session_start();

// Configuração da API
$API_URL = 'https://apisec.secauxiliar.com.br/unip/api_salas.php';

// Token CSRF (protege o formulário contra requisições forçadas)
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}
$csrfToken = $_SESSION['csrf_token'];

// Valida o token CSRF em requisições POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_POST['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])) {
        http_response_code(403);
        exit('Token CSRF inválido.');
    }
}

// ============================================
// CONFIGURAÇÃO DE ANDARES
// Cada andar tem: nome, svg, ponto de partida (SVG x, y)
// ============================================
$andares = [
    '2A' => [
        'nome' => '2º Andar',
        'svg'  => file_exists(__DIR__ . '/planta_2_andar.svg') ? 'planta_2_andar.svg' : 'planta_simulada.svg',
        'partida' => [905, 500], // [svg_x, svg_y] do "Você está aqui"
    ],
    '1A' => [
        'nome' => '1º Andar',
        'svg'  => file_exists(__DIR__ . '/planta_1_andar.svg') ? 'planta_1_andar.svg' : 'planta_simulada.svg',
        'partida' => [905, 500],
    ],
    'TA' => [
        'nome' => 'Térreo Alto',
        'svg'  => file_exists(__DIR__ . '/planta_ta.svg') ? 'planta_ta.svg' : 'planta_simulada.svg',
        'partida' => [860, 500],
    ],
    'TB' => [
        'nome' => 'Térreo Baixo',
        'svg'  => file_exists(__DIR__ . '/planta_tb.svg') ? 'planta_tb.svg' : 'planta_simulada.svg',
        'partida' => [100, 500],
    ],
    '1S' => [
        'nome' => 'Integrado - 1º Subsolo',
        'svg'  => file_exists(__DIR__ . '/planta_1s.svg') ? 'planta_1s.svg' : 'planta_simulada.svg',
        'partida' => [500, 900],
    ],
    'PP' => [
        'nome' => 'Praça Paulista',
        'svg'  => file_exists(__DIR__ . '/planta_pp.svg') ? 'planta_pp.svg' : 'planta_simulada.svg',
        'partida' => [500, 100],
    ],
];

// ============================================
// ROTAS POR ANDAR
// Cada andar tem suas rotas por turma.
// Formato: [[partida_leaflet_y, partida_leaflet_x], [destino_leaflet_y, destino_leaflet_x]]
// Leaflet usa [y, x] com y invertido (leaflet_y = 1000 - svg_y)
// ============================================
$rotasPorAndar = [
    '2A' => [
        'CC1A - 1º Semestre' => [[500, 905], [775, 830]],   // Lab 205
        'CC3B - 3º Semestre' => [[500, 905], [775, 360]],   // Sala 102
        'ADM1'               => [[500, 905], [220, 140]],   // Sala 104
        'ADM2'               => [[500, 905], [220, 360]],   // Sala 105
        'A'                  => [[500, 905], [775, 360]],
        'B'                  => [[500, 905], [580, 830]],
        'C'                  => [[500, 905], [420, 140]],
        'default'            => [[500, 905], [775, 360]],
    ],
    '1A' => [
        'CC1A - 1º Semestre' => [[500, 905], [775, 830]],
        'CC3B - 3º Semestre' => [[500, 905], [775, 360]],
        'ADM1'               => [[500, 905], [220, 140]],
        'ADM2'               => [[500, 905], [220, 360]],
        'A'                  => [[500, 905], [775, 360]],
        'B'                  => [[500, 905], [580, 830]],
        'C'                  => [[500, 905], [420, 140]],
        'default'            => [[500, 905], [775, 360]],
    ],
    'TA' => [
        'CC1A - 1º Semestre' => [[500, 140], [775, 830]],
        'CC3B - 3º Semestre' => [[500, 140], [775, 360]],
        'ADM1'               => [[500, 140], [220, 140]],
        'ADM2'               => [[500, 140], [220, 360]],
        'A'                  => [[500, 140], [775, 360]],
        'B'                  => [[500, 140], [580, 830]],
        'C'                  => [[500, 140], [420, 140]],
        'default'            => [[500, 140], [775, 360]],
    ],
    'TB' => [
        'CC1A - 1º Semestre' => [[500, 860], [775, 830]],
        'CC3B - 3º Semestre' => [[500, 860], [775, 360]],
        'ADM1'               => [[500, 860], [220, 140]],
        'ADM2'               => [[500, 860], [220, 360]],
        'A'                  => [[500, 860], [775, 360]],
        'B'                  => [[500, 860], [580, 830]],
        'C'                  => [[500, 860], [420, 140]],
        'default'            => [[500, 860], [775, 360]],
    ],
    '1S' => [
        'CC1A - 1º Semestre' => [[100, 500], [775, 830]],
        'CC3B - 3º Semestre' => [[100, 500], [775, 360]],
        'ADM1'               => [[100, 500], [220, 140]],
        'ADM2'               => [[100, 500], [220, 360]],
        'A'                  => [[100, 500], [775, 360]],
        'B'                  => [[100, 500], [580, 830]],
        'C'                  => [[100, 500], [420, 140]],
        'default'            => [[100, 500], [775, 360]],
    ],
    'PP' => [
        'CC1A - 1º Semestre' => [[900, 500], [775, 830]],
        'CC3B - 3º Semestre' => [[900, 500], [775, 360]],
        'ADM1'               => [[900, 500], [220, 140]],
        'ADM2'               => [[900, 500], [220, 360]],
        'A'                  => [[900, 500], [775, 360]],
        'B'                  => [[900, 500], [580, 830]],
        'C'                  => [[900, 500], [420, 140]],
        'default'            => [[900, 500], [775, 360]],
    ],
];

// Variáveis da página
$origem = isset($_GET['Origem']) ? strtoupper(trim($_GET['Origem'])) : '';
$cursoSelecionado = isset($_POST['curso']) ? trim($_POST['curso']) : '';
$turmaSelecionada = isset($_POST['turma']) ? trim($_POST['turma']) : '';

// Valida se o andar enviado existe
$andarSelecionado = '';
if (!empty($origem) && isset($andares[$origem])) {
    $andarSelecionado = $origem;
}

if (empty($andarSelecionado) && isset($_POST['andar'])) {
    $andarTmp = strtoupper(trim($_POST['andar']));
    if (isset($andares[$andarTmp])) {
        $andarSelecionado = $andarTmp;
    }
}

// Nome da origem (para exibição)
function obterNomeOrigem($sigla) {
    global $andares;
    return isset($andares[$sigla]) ? $andares[$sigla]['nome'] : $sigla;
}

// URL base para QR Code
$baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://') . $_SERVER['HTTP_HOST'] . $_SERVER['PHP_SELF'];

// Lista de cursos disponíveis (mock - pode ser expandido com outra API)
$cursosDisponiveis = [
    'Ciência da Computação',
    'Administração', 
    'Direito',
    'Engenharia Civil',
    'Extensivo'
];

// Turmas por curso (mock)
$turmasPorCurso = [
    'Ciência da Computação' => ['CC1A - 1º Semestre', 'CC3B - 3º Semestre'],
    'Administração' => ['ADM1', 'ADM2'],
    'Direito' => ['Direito Único'],
    'Engenharia Civil' => ['Engenharia Única'],
    'Extensivo' => ['A', 'B', 'C']
];

$salaDestino = '';
$linkDaSala = '';
$erroApi = '';
$consultandoApi = false;
$rota = [];
$turmasDisponiveis = [];
$svgAtual = 'planta_simulada.svg';
$pontoPartida = [905, 500];

// Se escolheu um andar, define a planta e o ponto de partida
if (!empty($andarSelecionado)) {
    $svgAtual = $andares[$andarSelecionado]['svg'];
    $pontoPartida = $andares[$andarSelecionado]['partida'];
    
    if (!empty($cursoSelecionado) && isset($turmasPorCurso[$cursoSelecionado])) {
        $turmasDisponiveis = $turmasPorCurso[$cursoSelecionado];
    }
} elseif (!empty($cursoSelecionado) && isset($turmasPorCurso[$cursoSelecionado])) {
    $turmasDisponiveis = $turmasPorCurso[$cursoSelecionado];
}

// Consome a API da UNIP (só se tiver curso, turma E andar)
if ($andarSelecionado && $cursoSelecionado && $turmaSelecionada) {
    $consultandoApi = true;
    
    try {
        $url = $API_URL . '?curso=' . urlencode($cursoSelecionado) . '&turma=' . urlencode($turmaSelecionada);
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Accept: application/json',
            'User-Agent: MapaDeSalaUNIP/1.0'
        ]);
        
        $resposta = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);
        
        if ($httpCode === 404) {
            $erroApi = 'Não foi possível encontrar a sala para este curso e turma.';
        } elseif ($resposta === false) {
            $erroApi = 'Erro ao consultar a API: ' . $curlError;
        } else {
            $dados = json_decode($resposta, true);
            
            if ($dados && isset($dados['sucesso']) && $dados['sucesso'] === true && !empty($dados['sala'])) {
                $salaDestino = $dados['sala'];
                $linkDaSala = $dados['link'] ?? '';
                
                // MONTAGEM DA ROTA ESPECÍFICA POR ANDAR
                if (isset($rotasPorAndar[$andarSelecionado][$turmaSelecionada])) {
                    $rota = $rotasPorAndar[$andarSelecionado][$turmaSelecionada];
                } elseif (isset($rotasPorAndar[$andarSelecionado]['default'])) {
                    $rota = $rotasPorAndar[$andarSelecionado]['default'];
                } else {
                    // Fallback: usa ponto de partida do andar + destino padrão
                    $rota = [
                        [$pontoPartida[1], $pontoPartida[0]],
                        [775, 360]
                    ];
                }
            } else {
                $erroApi = 'Não foi possível encontrar a sala para este curso e turma.';
            }
        }
    } catch (Exception $e) {
        $erroApi = 'Erro inesperado: ' . $e->getMessage();
    }
    
    $consultandoApi = false;
}

// Converte link do YouTube para embed
function obterUrlEmbedYouTube($url) {
    if (empty($url)) {
        return '';
    }
    
    // Já é URL de embed
    if (strpos($url, '/embed/') !== false) {
        return $url;
    }
    
    // youtu.be/VIDEO_ID
    if (preg_match('@youtu\.be/([a-zA-Z0-9_-]{11})@', $url, $match)) {
        return 'https://www.youtube.com/embed/' . $match[1];
    }
    
    // youtube.com/watch?v=VIDEO_ID
    if (preg_match('@[?&]v=([a-zA-Z0-9_-]{11})@', $url, $match)) {
        return 'https://www.youtube.com/embed/' . $match[1];
    }
    
    // Não é uma URL do YouTube reconhecida - não exibe por segurança (evita XSS via javascript:/data:)
    return '';
}
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mapa de Salas - UNIP</title>
    <link rel="stylesheet" href="style.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" 
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
    <link rel="icon" type="image/png" href="favicon.png">
</head>
<body>

<div class="app-shell">
    <!-- Header -->
    <header class="app-header">
        <div class="header-container">
            <div class="brand">
                <img src="wwwroot/unip-logo.png" alt="UNIP" class="unip-logo" 
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="logo-fallback" style="display:none;">UNIP</div>
                <div class="brand-text">
                    <h1 class="app-title">Mapa de Salas</h1>
                    <p class="app-subtitle">Localize sua sala e veja como chegar pelo campus</p>
                </div>
            </div>
            <?php if (!empty($andarSelecionado)): ?>
                <div class="origin-chip">
                    📍 Você está em: <strong><?= htmlspecialchars(obterNomeOrigem($andarSelecionado)) ?></strong>
                </div>
            <?php endif; ?>
        </div>
    </header>

    <div class="container-app">
        
        <!-- ============================================
             QR CODES POR ANDAR
             ============================================ -->
        <?php if (empty($andarSelecionado)): ?>
        <div class="selection-card andar-card">
            <div class="card-header">
                <span class="card-icon">🏢</span>
                <h2 class="card-title">Escolha o Andar</h2>
                <p style="margin:0.5rem 0 0; font-size:0.9rem; color:var(--text-muted);">
                    Escaneie o QR Code do seu andar ou selecione abaixo:
                </p>
            </div>

            <div class="andar-grid">
                <?php foreach ($andares as $sigla => $info): ?>
                    <?php
                    $urlQr = $baseUrl . '?Origem=' . $sigla;
                    $qrUrl = 'https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=' . urlencode($urlQr);
                    ?>
                    <div class="andar-item">
                        <div class="andar-qr">
                            <img src="<?= $qrUrl ?>" alt="QR Code <?= $info['nome'] ?>" width="140" height="140">
                        </div>
                        <form method="POST" action="index.php" style="margin:0;">
                            <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrfToken) ?>">
                            <input type="hidden" name="andar" value="<?= htmlspecialchars($sigla) ?>">
                            <button type="submit" class="andar-btn"><?= htmlspecialchars($info['nome']) ?></button>
                        </form>
                        <a href="<?= htmlspecialchars($urlQr) ?>" class="andar-link" target="_blank" rel="noopener">
                            Abrir link direto ↗
                        </a>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
        <?php endif; ?>

        <!-- ============================================
             SELEÇÃO DE CURSO E TURMA
             ============================================ -->
        <?php if (!empty($andarSelecionado)): ?>
        <div class="selection-card">
            <div class="card-header">
                <span class="card-icon">🎓</span>
                <h2 class="card-title">Sua Turma</h2>
            </div>

            <form method="POST" action="index.php">
                <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrfToken) ?>">
                <input type="hidden" name="andar" value="<?= htmlspecialchars($andarSelecionado) ?>">

                <div class="form-group">
                    <label class="form-label">Curso</label>
                    <select id="curso" name="curso" class="form-select" 
                            onchange="this.form.submit()"
                            <?= empty($cursoSelecionado) ? 'autofocus' : '' ?>>
                        <option value="">-- Escolha o Curso --</option>
                        <?php foreach ($cursosDisponiveis as $curso): ?>
                            <option value="<?= htmlspecialchars($curso) ?>" 
                                    <?= ($curso === $cursoSelecionado) ? 'selected' : '' ?>>
                                <?= htmlspecialchars($curso) ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>

                <?php if (!empty($cursoSelecionado) && !empty($turmasDisponiveis)): ?>
                <div class="form-group">
                    <label class="form-label">Turma</label>
                    <select id="turma" name="turma" class="form-select" 
                            onchange="this.form.submit()">
                        <option value="">-- Escolha a Turma --</option>
                        <?php foreach ($turmasDisponiveis as $turma): ?>
                            <option value="<?= htmlspecialchars($turma) ?>" 
                                    <?= ($turma === $turmaSelecionada) ? 'selected' : '' ?>>
                                <?= htmlspecialchars($turma) ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <?php endif; ?>
            </form>
        </div>

        <!-- ============================================
             RESULTADO
             ============================================ -->
        <?php if (!empty($turmaSelecionada)): ?>
        <div class="result-card">
            <?php if ($consultandoApi): ?>
                <div class="state-loading">
                    <div class="spinner"></div>
                    <p>Consultando a sala no servidor...</p>
                </div>
            <?php elseif (!empty($erroApi)): ?>
                <div class="state-error">
                    <span class="state-icon">⚠️</span>
                    <p><?= htmlspecialchars($erroApi) ?></p>
                </div>
            <?php elseif (!empty($salaDestino)): ?>
                <div class="result-success">
                    <div class="sala-badge">
                        🏫 Sua sala é a: 
                        <span class="sala-nome"><?= htmlspecialchars($salaDestino) ?></span>
                    </div>

                    <?php if (!empty($linkDaSala)): ?>
                    <div class="video-section">
                        <div class="video-header">
                            <span class="video-icon">📹</span>
                            <h3 class="video-title">Aula / Vídeo da Sala</h3>
                        </div>
                        <div class="video-wrapper">
                            <iframe 
                                width="100%" 
                                height="220" 
                                src="<?= htmlspecialchars(obterUrlEmbedYouTube($linkDaSala)) ?>" 
                                title="Vídeo da sala" 
                                frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen>
                            </iframe>
                        </div>
                    </div>
                    <?php endif; ?>

                    <div class="mapa-section">
                        <div class="mapa-header">
                            <span class="mapa-icon">🗺️</span>
                            <h3 class="mapa-title">Como chegar</h3>
                        </div>
                        <div id="leaflet-map" class="leaflet-map"></div>

                        <div class="route-steps">
                            <h4 class="steps-title">Passo a passo:</h4>
                            <ul>
                                <?php
                                $nomeOrigem = !empty($andarSelecionado) ? obterNomeOrigem($andarSelecionado) : 'local desconhecido';
                                ?>
                                <li class="step-item">Você está no <?= htmlspecialchars($nomeOrigem) ?>.</li>
                                <li class="step-item">Siga a linha amarela tracejada no mapa acima.</li>
                                <li class="step-item">Destino alcançado!</li>
                            </ul>
                        </div>
                    </div>

                    <!-- Dados ocultos para o JavaScript inicializar o mapa -->
                    <div id="data-rota" style="display:none;"><?= json_encode($rota) ?></div>
                    <div id="data-turma" style="display:none;"><?= htmlspecialchars($turmaSelecionada) ?></div>
                    <div id="data-svg" style="display:none;"><?= htmlspecialchars($svgAtual) ?></div>
                    <div id="data-partida" style="display:none;"><?= json_encode($pontoPartida) ?></div>
                    <div id="data-andar" style="display:none;"><?= htmlspecialchars($andarSelecionado) ?></div>
                </div>
            <?php endif; ?>
        </div>
        <?php endif; ?>
        <?php endif; ?>
    </div>
</div>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" 
        integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
<script src="script.js"></script>

</body>
</html>
