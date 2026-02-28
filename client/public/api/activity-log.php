<?php
// Activity Log API — records every user action on the site
// Only Osheen (osheenadmin) can view logs

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Admin-Auth');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dataFile = __DIR__ . '/activity-log-data.json';
$indexFile = __DIR__ . '/activity-log-index.txt'; // tracks file count

// Use daily log files to prevent one massive file
function getLogFile($date = null) {
    $dir = __DIR__ . '/logs';
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    $d = $date ?: date('Y-m-d');
    return $dir . '/log-' . $d . '.json';
}

function readLog($file) {
    if (!file_exists($file)) return [];
    $content = file_get_contents($file);
    $data = json_decode($content, true);
    return is_array($data) ? $data : [];
}

function writeLog($file, $data) {
    file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
}

// Auth check for viewing logs — only osheenadmin
function isOsheen() {
    $auth = $_SERVER['HTTP_X_ADMIN_AUTH'] ?? '';
    // Expected format: "osheenadmin:Turbohyetrident1!"
    return $auth === 'osheenadmin:Turbohyetrident1!';
}

$method = $_SERVER['REQUEST_METHOD'];

// GET - view activity logs (osheenadmin only)
if ($method === 'GET') {
    if (!isOsheen()) {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied. Only Osheen can view activity logs.']);
        exit;
    }

    $date = $_GET['date'] ?? date('Y-m-d');
    $page = max(1, intval($_GET['page'] ?? 1));
    $perPage = min(200, max(10, intval($_GET['perPage'] ?? 50)));
    $userFilter = $_GET['user'] ?? '';
    $actionFilter = $_GET['action'] ?? '';
    $search = strtolower($_GET['search'] ?? '');

    $logFile = getLogFile($date);
    $entries = readLog($logFile);

    // Apply filters
    if ($userFilter) {
        $entries = array_filter($entries, function($e) use ($userFilter) {
            return ($e['userId'] ?? '') === $userFilter || 
                   stripos($e['userName'] ?? '', $userFilter) !== false;
        });
    }
    if ($actionFilter) {
        $entries = array_filter($entries, function($e) use ($actionFilter) {
            return ($e['action'] ?? '') === $actionFilter;
        });
    }
    if ($search) {
        $entries = array_filter($entries, function($e) use ($search) {
            $haystack = strtolower(json_encode($e));
            return strpos($haystack, $search) !== false;
        });
    }

    $entries = array_values($entries);

    // Sort newest first
    usort($entries, function($a, $b) {
        return strcmp($b['timestamp'] ?? '', $a['timestamp'] ?? '');
    });

    $total = count($entries);
    $totalPages = max(1, ceil($total / $perPage));
    $offset = ($page - 1) * $perPage;
    $pageEntries = array_slice($entries, $offset, $perPage);

    // Get list of available log dates
    $logDir = __DIR__ . '/logs';
    $dates = [];
    if (is_dir($logDir)) {
        foreach (scandir($logDir) as $f) {
            if (preg_match('/^log-(\d{4}-\d{2}-\d{2})\.json$/', $f, $m)) {
                $dates[] = $m[1];
            }
        }
    }
    rsort($dates);

    echo json_encode([
        'entries' => $pageEntries,
        'total' => $total,
        'page' => $page,
        'perPage' => $perPage,
        'totalPages' => $totalPages,
        'date' => $date,
        'availableDates' => $dates,
    ]);
    exit;
}

// POST - log an action (no auth needed — everyone's actions are logged)
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $entry = [
        'id' => 'log-' . microtime(true) . '-' . rand(100, 999),
        'timestamp' => date('c'),
        'userId' => $input['userId'] ?? 'anonymous',
        'userName' => $input['userName'] ?? 'Anonymous',
        'userType' => $input['userType'] ?? 'visitor', // visitor, client, admin
        'action' => $input['action'] ?? 'unknown',
        'category' => $input['category'] ?? 'general',
        'details' => $input['details'] ?? null,
        'page' => $input['page'] ?? null,
        'ip' => $_SERVER['REMOTE_ADDR'] ?? null,
        'userAgent' => substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 200),
    ];

    $logFile = getLogFile();
    $entries = readLog($logFile);
    $entries[] = $entry;
    writeLog($logFile, $entries);

    echo json_encode(['ok' => true, 'id' => $entry['id']]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
