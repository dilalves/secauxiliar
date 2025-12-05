<?php
// /aprovados/auth_login.php
declare(strict_types=1);

require_once __DIR__ . '/config.php';

// ==== CORS (ajuste se o front estiver em outro domínio) ====
header('Access-Control-Allow-Origin: https://secauxiliar.com.br');
header('Vary: Origin');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ==== Lê JSON enviado pelo index.html ====
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

    // Confere se achou a unidade e se está ativa
    if (!$row || (int)$row['ativo'] !== 1) {
        json_error('Login ou senha inválidos.', 401);
    }

    // Confere a senha com password_verify (assumindo que você usou password_hash)
    if (!password_verify($senha, $row['hash_senha'])) {
        json_error('Login ou senha inválidos.', 401);
    }

    // Aqui você pode abrir sessão ou gerar um token; vou usar sessão simples:
    session_start();
    $_SESSION['aprov_unidade_id']   = (int)$row['id'];
    $_SESSION['aprov_unidade_nome'] = $row['unidade'];
    $_SESSION['aprov_unidade_login']= $row['login'];

    // PHP vai mandar o cookie de sessão (PHPSESSID) automaticamente.
    // O front só precisa de um ok + informações básicas da unidade.
    json_ok([
        'id'      => (int)$row['id'],
        'unidade' => $row['unidade'],
        'login'   => $row['login'],
    ]);

} catch (Throwable $e) {
    error_log('Erro no auth_login: ' . $e->getMessage());
    json_error('Erro interno ao fazer login.', 500);
}
