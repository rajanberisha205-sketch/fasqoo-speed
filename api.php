<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode([
        "error" => "Only POST requests are allowed."
    ]);
    exit;
}

/*
|--------------------------------------------------------------------------
| GEMINI API KEY
|--------------------------------------------------------------------------
| Besser: als Server-Environment-Variable hinterlegen.
| Falls du deinen Key bereits in api.php hast, kannst du ihn hier einsetzen.
*/

$GEMINI_API_KEY = getenv("GEMINI_API_KEY");

/*
|--------------------------------------------------------------------------
| Falls dein Hosting keine Environment Variable verwendet:
|
| $GEMINI_API_KEY = "DEIN_API_KEY";
|
| NICHT den API-Key in die HTML-Datei schreiben!
|--------------------------------------------------------------------------
*/

if (!$GEMINI_API_KEY) {
    http_response_code(500);

    echo json_encode([
        "error" => "Gemini API key is not configured on the server."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| INPUT
|--------------------------------------------------------------------------
*/

$rawInput = file_get_contents("php://input");

$data = json_decode($rawInput, true);

if (!is_array($data)) {
    http_response_code(400);

    echo json_encode([
        "error" => "Invalid JSON request."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Conversation
|--------------------------------------------------------------------------
*/

$messages = [];

if (isset($data["messages"]) && is_array($data["messages"])) {

    foreach ($data["messages"] as $message) {

        if (
            !isset($message["role"]) ||
            !isset($message["content"])
        ) {
            continue;
        }

        $role = $message["role"];

        /*
         * Gemini verwendet "user" und "model".
         */

        if ($role === "assistant") {
            $role = "model";
        }

        if ($role !== "user" && $role !== "model") {
            continue;
        }

        $content = trim((string)$message["content"]);

        if ($content === "") {
            continue;
        }

        $messages[] = [
            "role" => $role,
            "parts" => [
                [
                    "text" => $content
                ]
            ]
        ];
    }
}


/*
|--------------------------------------------------------------------------
| Fallback für einfache prompt-Anfragen
|--------------------------------------------------------------------------
*/

if (
    empty($messages) &&
    isset($data["prompt"])
) {

    $prompt = trim((string)$data["prompt"]);

    if ($prompt !== "") {

        $messages[] = [
            "role" => "user",
            "parts" => [
                [
                    "text" => $prompt
                ]
            ]
        ];
    }
}


/*
|--------------------------------------------------------------------------
| Keine Frage
|--------------------------------------------------------------------------
*/

if (empty($messages)) {

    http_response_code(400);

    echo json_encode([
        "error" => "Please enter a question."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| System Instruction
|--------------------------------------------------------------------------
*/

$systemInstruction = [
    "parts" => [
        [
            "text" =>
                "You are the Fasqoo AI Technician Assistant.

"
                . "You are a professional Internet and network troubleshooting assistant.

"
                . "Help users with:
"
                . "- Internet connection problems
"
                . "- Wi-Fi problems
"
                . "- Download speed
"
                . "- Upload speed
"
                . "- Ping and latency
"
                . "- Jitter
"
                . "- Packet loss
"
                . "- DNS
"
                . "- Router problems
"
                . "- Gaming latency
"
                . "- Network stability
"
                . "- Speed test results

"
                . "Give practical step-by-step solutions.

"
                . "Do not invent measurements.

"
                . "If information is missing, ask the user for the relevant information.

"
                . "Keep answers clear and easy to understand.

"
                . "Answer in the same language as the user."
        ]
    ]
];


/*
|--------------------------------------------------------------------------
| Gemini API
|--------------------------------------------------------------------------
*/

$model = "gemini-3.7-flash";

$url =
    "https://generativelanguage.googleapis.com/v1beta/models/"
    . $model
    . ":generateContent";


$requestBody = [
    "systemInstruction" => $systemInstruction,
    "contents" => $messages,
    "generationConfig" => [
        "temperature" => 0.4,
        "maxOutputTokens" => 1200
    ]
];


$jsonBody = json_encode(
    $requestBody,
    JSON_UNESCAPED_UNICODE
);


$ch = curl_init($url);

curl_setopt_array($ch, [

    CURLOPT_POST => true,

    CURLOPT_RETURNTRANSFER => true,

    CURLOPT_TIMEOUT => 60,

    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "x-goog-api-key: " . $GEMINI_API_KEY
    ],

    CURLOPT_POSTFIELDS => $jsonBody

]);


$response = curl_exec($ch);

$httpCode = curl_getinfo(
    $ch,
    CURLINFO_HTTP_CODE
);

$curlError = curl_error($ch);

curl_close($ch);


/*
|--------------------------------------------------------------------------
| cURL Fehler
|--------------------------------------------------------------------------
*/

if ($response === false || $curlError) {

    http_response_code(502);

    echo json_encode([
        "error" => "Could not connect to Gemini API.",
        "details" => $curlError
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Gemini Response
|--------------------------------------------------------------------------
*/

$result = json_decode($response, true);


/*
|--------------------------------------------------------------------------
| Gemini API Fehler
|--------------------------------------------------------------------------
*/

if ($httpCode < 200 || $httpCode >= 300) {

    http_response_code($httpCode);

    $errorMessage =
        $result["error"]["message"]
        ?? "Gemini API request failed.";

    echo json_encode([
        "error" => $errorMessage
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Antwort extrahieren
|--------------------------------------------------------------------------
*/

$answer =
    $result["candidates"][0]["content"]["parts"][0]["text"]
    ?? null;


if (!$answer) {

    http_response_code(502);

    echo json_encode([
        "error" => "Gemini returned no answer."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Erfolgreiche Antwort
|--------------------------------------------------------------------------
*/

echo json_encode([
    "answer" => $answer
], JSON_UNESCAPED_UNICODE);

exit;
?>
