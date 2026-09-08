<?php
// Sicherheits-Header setzen
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Nur POST-Anfragen verarbeiten
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method Not Allowed"]);
    exit;
}

// JSON-Eingabe von der Website einlesen
$inputData = json_decode(file_get_contents("php://input"), true);
$userQuestion = isset($inputData['question']) ? trim($inputData['question']) : '';

if (empty($userQuestion)) {
    http_response_code(400);
    echo json_encode(["error" => "No question provided"]);
    exit;
}

// Dein Google Gemini API-Schlüssel (Hier im PHP-Code ist er absolut diebstahlsicher!)
$apiKey = "AQ.Ab8RN6K7E6eva75oqge95FrpVOTyJaygrpd2fePPfBfXTMA8KA";

// Offizielle Google Gemini API Schnittstelle aufrufen (Modell: gemini-1.5-flash)
$url = "https://googleapis.com" . $apiKey;

// System-Anweisung und Nutzerfrage für die KI strukturieren
$prompt = "You are the Fasqoo AI Technician, a professional internet and network troubleshooting assistant. Help the user with this network issue and keep your answer short and structured: " . $userQuestion;

$postData = [
    "contents" => [
        [
            "parts" => [
                ["text" => $prompt]
            ]
        ]
    ]
];

// cURL-Verbindung zu Google aufbauen
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Fehlerprüfung, falls Google nicht erreichbar ist
if ($httpCode !== 200) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to connect to AI Service. Code: " . $httpCode]);
    exit;
}

// Antwort von Google dekodieren und an die Website zurückschicken
$resultData = json_decode($response, true);
$aiText = $resultData['candidates'][0]['content']['parts'][0]['text'] ?? 'Sorry, I could not generate an answer.';

echo json_encode(["answer" => $aiText]);
?>
