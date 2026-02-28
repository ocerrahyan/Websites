<?php
// Client Users API for persistent storage on GoDaddy static hosting
// Stores client accounts in a JSON file so they survive builds

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Admin-Auth');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dataFile = __DIR__ . '/clients-data.json';

if (!file_exists($dataFile)) {
    file_put_contents($dataFile, json_encode([]));
}

function readClients($file) {
    $content = file_get_contents($file);
    $data = json_decode($content, true);
    return is_array($data) ? $data : [];
}

function writeClients($file, $data) {
    file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
}

// Simple password hashing (SHA-256 with salt)
function hashPassword($password, $salt = null) {
    if (!$salt) {
        $salt = bin2hex(random_bytes(16));
    }
    $hash = hash('sha256', $salt . $password);
    return $salt . ':' . $hash;
}

function verifyPassword($password, $stored) {
    $parts = explode(':', $stored);
    if (count($parts) !== 2) return false;
    $salt = $parts[0];
    $expected = hashPassword($password, $salt);
    return $expected === $stored;
}

$method = $_SERVER['REQUEST_METHOD'];

// GET - return all clients (admin only, no passwords)
if ($method === 'GET') {
    $clients = readClients($dataFile);
    $safe = array_map(function($c) {
        unset($c['passwordHash']);
        return $c;
    }, $clients);
    // Sort by most recent first
    usort($safe, function($a, $b) {
        return strcmp($b['createdAt'] ?? '', $a['createdAt'] ?? '');
    });
    echo json_encode(array_values($safe));
    exit;
}

// POST - register or login
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';

    // REGISTER
    if ($action === 'register') {
        $email = strtolower(trim($input['email'] ?? ''));
        $password = $input['password'] ?? '';
        $firstName = trim($input['firstName'] ?? '');
        $lastName = trim($input['lastName'] ?? '');
        $phone = trim($input['phone'] ?? '');
        $birthday = $input['birthday'] ?? null;

        if (!$email || !$password || !$firstName || !$lastName) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            exit;
        }

        if (strlen($password) < 6) {
            http_response_code(400);
            echo json_encode(['error' => 'Password must be at least 6 characters']);
            exit;
        }

        $clients = readClients($dataFile);

        // Check duplicate email
        foreach ($clients as $c) {
            if (strtolower($c['email']) === $email) {
                http_response_code(409);
                echo json_encode(['error' => 'An account with this email already exists']);
                exit;
            }
        }

        $newClient = [
            'id' => 'client-' . time() . '-' . rand(1000, 9999),
            'firstName' => $firstName,
            'lastName' => $lastName,
            'email' => $email,
            'phone' => $phone,
            'birthday' => $birthday,
            'memberTier' => 'standard',
            'passwordHash' => hashPassword($password),
            'createdAt' => date('c'),
            'lastLoginAt' => date('c'),
        ];

        $clients[] = $newClient;
        writeClients($dataFile, $clients);

        // Return user without password hash
        $user = $newClient;
        unset($user['passwordHash']);
        echo json_encode($user);
        exit;
    }

    // LOGIN
    if ($action === 'login') {
        $email = strtolower(trim($input['email'] ?? ''));
        $password = $input['password'] ?? '';

        if (!$email || !$password) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password are required']);
            exit;
        }

        $clients = readClients($dataFile);
        foreach ($clients as &$c) {
            if (strtolower($c['email']) === $email) {
                if (verifyPassword($password, $c['passwordHash'])) {
                    // Update last login
                    $c['lastLoginAt'] = date('c');
                    writeClients($dataFile, $clients);

                    $user = $c;
                    unset($user['passwordHash']);
                    echo json_encode($user);
                    exit;
                } else {
                    http_response_code(401);
                    echo json_encode(['error' => 'Invalid email or password']);
                    exit;
                }
            }
        }

        http_response_code(401);
        echo json_encode(['error' => 'Invalid email or password']);
        exit;
    }

    http_response_code(400);
    echo json_encode(['error' => 'Invalid action. Use "register" or "login"']);
    exit;
}

// PATCH - update profile
if ($method === 'PATCH') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? null;

    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Client ID is required']);
        exit;
    }

    $clients = readClients($dataFile);
    $found = false;
    foreach ($clients as &$c) {
        if ($c['id'] === $id) {
            // Update allowed fields only
            $allowed = ['firstName', 'lastName', 'phone', 'birthday'];
            foreach ($allowed as $field) {
                if (isset($input[$field])) {
                    $c[$field] = $input[$field];
                }
            }
            // Email change requires duplicate check
            if (isset($input['email']) && strtolower($input['email']) !== strtolower($c['email'])) {
                $newEmail = strtolower(trim($input['email']));
                foreach ($clients as $other) {
                    if ($other['id'] !== $id && strtolower($other['email']) === $newEmail) {
                        http_response_code(409);
                        echo json_encode(['error' => 'Email already in use']);
                        exit;
                    }
                }
                $c['email'] = $newEmail;
            }
            $found = true;
            writeClients($dataFile, $clients);

            $user = $c;
            unset($user['passwordHash']);
            echo json_encode($user);
            exit;
        }
    }

    if (!$found) {
        http_response_code(404);
        echo json_encode(['error' => 'Client not found']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
