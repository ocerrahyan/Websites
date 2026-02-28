<?php
// Simple prayer request API for static hosting
// Stores data in a JSON file on the server

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dataFile = __DIR__ . '/prayer-data.json';

// Ensure data file exists
if (!file_exists($dataFile)) {
    file_put_contents($dataFile, json_encode([]));
}

function readData($file) {
    $content = file_get_contents($file);
    $data = json_decode($content, true);
    return is_array($data) ? $data : [];
}

function writeData($file, $data) {
    file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
}

$method = $_SERVER['REQUEST_METHOD'];

// GET - return all prayer requests
if ($method === 'GET') {
    $data = readData($dataFile);
    // Sort by date descending
    usort($data, function($a, $b) {
        return strtotime($b['createdAt'] ?? '0') - strtotime($a['createdAt'] ?? '0');
    });
    echo json_encode($data);
    exit;
}

// POST - create new prayer request
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (empty($input['content'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Content is required']);
        exit;
    }
    
    $request = [
        'id' => 'pr-' . time() . '-' . rand(1000, 9999),
        'name' => $input['name'] ?? 'Anonymous',
        'email' => $input['email'] ?? null,
        'phone' => $input['phone'] ?? null,
        'content' => $input['content'],
        'isRead' => false,
        'createdAt' => date('c'),
    ];
    
    $data = readData($dataFile);
    array_unshift($data, $request);
    writeData($dataFile, $data);
    
    echo json_encode($request);
    exit;
}

// PATCH - mark as read
if ($method === 'PATCH') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? null;
    
    if (!$id) {
        // Try to get ID from URL
        $uri = $_SERVER['REQUEST_URI'];
        if (preg_match('/id=([^&]+)/', $uri, $matches)) {
            $id = $matches[1];
        }
    }
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID is required']);
        exit;
    }
    
    $data = readData($dataFile);
    $found = false;
    foreach ($data as &$item) {
        if ($item['id'] === $id) {
            $item['isRead'] = true;
            $found = true;
            break;
        }
    }
    
    if ($found) {
        writeData($dataFile, $data);
        echo json_encode(['ok' => true]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Not found']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
