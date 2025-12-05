<?php
// /aprovados/auth_login.php
declare(strict_types=1);

require_once __DIR__ . '/config.php';

// CORS
header('Access-Control-Allow-Origin: https://secauxiliar.com.br');
header('Vary: Origin');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$raw  = file_get_contents('php://input');
$data = json_decode($raw, true) ?? [];

$login = trim($data['login'] ?? '');
$senha = trim($data['senha'] ?? '');

if ($login === '' || $senha === '') {
    json_error('Informe login e senha.');
}

try {
    $pdo = pdo_login(); // banco u813951513_sim_aberto

    $sql = "
        SELECT 
            id,
            login,
            hash_senha,
            unidade,
            ativo
        FROM unidades
        WHERE login = :login
        LIMIT 1
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':login' => $login]);
    $row = $stmt->fetch();

    // ===== DEBUG PASSO A PASSO =====
    if (!$row) {
        json_error('Login não encontrado: ' . $login, 401);
    }

    if ((int)$row['ativo'] !== 1) {
        json_error('Unidade encontrada, mas não está ativa.', 401);
    }

    if (empty($row['hash_senha'])) {
        json_error('Unidade sem hash_senha cadastrado.', 401);
    }

    if (!password_verify($senha, $row['hash_senha'])) {
        json_error('Senha não confere para este login.', 401);
    }
    // ===== FIM DEBUG =====

    session_start();
    $_SESSION['aprov_unidade_id']    = (int)$row['id'];
    $_SESSION['aprov_unidade_nome']  = $row['unidade'];
    $_SESSION['aprov_unidade_login'] = $row['login'];

    json_ok([
        'id'      => (int)$row['id'],
        'unidade' => $row['unidade'],
        'login'   => $row['login'],
    ]);

} catch (Throwable $e) {
    error_log('Erro no auth_login: ' . $e->getMessage());
    json_error('Erro interno ao fazer login.', 500);
}
