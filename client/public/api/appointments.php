<?php
// Appointments API for static hosting
// Stores bookings in a JSON file so admin can see them across devices

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dataFile = __DIR__ . '/appointments-data.json';

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

// GET - return all appointments
if ($method === 'GET') {
    $data = readData($dataFile);
    usort($data, function($a, $b) {
        $dateA = ($a['date'] ?? '') . ' ' . ($a['startTime'] ?? '');
        $dateB = ($b['date'] ?? '') . ' ' . ($b['startTime'] ?? '');
        return strcmp($dateB, $dateA);
    });
    echo json_encode($data);
    exit;
}

// POST - create new appointment booking
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $appointment = [
        'id' => 'appt-' . time() . '-' . rand(1000, 9999),
        'serviceId' => $input['serviceId'] ?? null,
        'serviceName' => $input['serviceName'] ?? 'Unknown Service',
        'date' => $input['date'] ?? null,
        'startTime' => $input['startTime'] ?? null,
        'firstName' => $input['firstName'] ?? '',
        'lastName' => $input['lastName'] ?? '',
        'email' => $input['email'] ?? null,
        'phone' => $input['phone'] ?? null,
        'notes' => $input['notes'] ?? null,
        'status' => 'pending',
        'createdAt' => date('c'),
    ];
    
    $data = readData($dataFile);
    array_unshift($data, $appointment);
    writeData($dataFile, $data);
    
    echo json_encode($appointment);
    exit;
}

// PATCH - update appointment status
if ($method === 'PATCH') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? null;
    $status = $input['status'] ?? null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID is required']);
        exit;
    }
    
    $data = readData($dataFile);
    $found = false;
    foreach ($data as &$item) {
        if ($item['id'] === $id) {
            if ($status) $item['status'] = $status;
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
