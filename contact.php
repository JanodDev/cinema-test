<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

function send_email($to, $subject, $message, $from) {
    $headers = "From: $from\r\n" .
               "Reply-To: $from\r\n" .
               "Content-Type: text/html; charset=UTF-8\r\n";
    return @mail($to, $subject, $message, $headers); // Add @ here
}

$required = ['first-name', 'last-name', 'email', 'comments'];
foreach ($required as $field) {
    if (empty($_POST[$field])) {
        echo json_encode(['success' => false, 'error' => 'Missing required field: ' . $field]);
        exit;
    }
}

$firstName = htmlspecialchars(trim($_POST['first-name']));
$lastName = htmlspecialchars(trim($_POST['last-name']));
$email = htmlspecialchars(trim($_POST['email']));
$phone = htmlspecialchars(trim($_POST['phone'] ?? ''));
$comments = htmlspecialchars(trim($_POST['comments']));
$date = date('Y-m-d H:i:s');

// Save to JSON file
$entry = [
    'first_name' => $firstName,
    'last_name' => $lastName,
    'email' => $email,
    'phone' => $phone,
    'comments' => $comments,
    'date' => $date
];
$file = 'submissions.json';
$all = [];
if (file_exists($file)) {
    $all = json_decode(file_get_contents($file), true) ?: [];
}
$all[] = $entry;
file_put_contents($file, json_encode($all, JSON_PRETTY_PRINT));

// Send auto-response to user
$user_subject = "Thank you for contacting us";
$user_message = "<p>Dear $firstName $lastName,</p><p>Thank you for reaching out. We have received your message and will get back to you soon.</p><p>Best regards,<br>eBEYONDS Team</p>";
send_email($email, $user_subject, $user_message, 'noreply@ebeyonds.com');

// Send admin email
$admin_subject = "New Contact Form Submission";
$admin_message = "<p>New submission received:</p>"
    . "<ul>"
    . "<li><strong>First Name:</strong> $firstName</li>"
    . "<li><strong>Last Name:</strong> $lastName</li>"
    . "<li><strong>Email:</strong> $email</li>"
    . "<li><strong>Phone:</strong> $phone</li>"
    . "<li><strong>Message:</strong> $comments</li>"
    . "<li><strong>Date:</strong> $date</li>"
    . "</ul>";
$admin_emails = [
    'dumidu.kodithuwakku@ebeyonds.com',
    'prabhath.senadheera@ebeyonds.com'
];
foreach ($admin_emails as $admin_email) {
    send_email($admin_email, $admin_subject, $admin_message, 'noreply@ebeyonds.com');
}

echo json_encode(['success' => true]); 