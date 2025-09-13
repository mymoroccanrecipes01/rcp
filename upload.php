<?php
header('Content-Type: application/json');

// ensure file uploaded
if (!isset($_FILES['file'])) {
    echo json_encode(['ok'=>false,'error'=>'No file uploaded']);
    exit;
}


// create uploads folder if not exists
$uploadDir = __DIR__.'/uploads';
if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
chmod($uploadDir, 0755);
// save file
$filename = basename($_FILES['file']['name']);
$dst = $uploadDir.'/'.$filename;

if (move_uploaded_file($_FILES['file']['tmp_name'], $dst)) {
    echo json_encode([
        'ok'=>true,
        'filename'=>$filename,
        'path'=>'/uploads/'.$filename
    ]);
} else {
    echo json_encode(['ok'=>false,'error'=>'Failed to move uploaded file']);
}
