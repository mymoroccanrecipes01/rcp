<?php
session_start();

// Initialiser les catégories par défaut si pas en session
if (!isset($_SESSION['categories'])) {
    $_SESSION['categories'] = [
        [
            "id" => "cat1",
            "slug" => "appetizers",
            "name" => "Appetizers",
            "image" => "",
            "image_url" => "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=400&h=300&fit=crop",
            "description" => "Small bites to start your meal."
        ],
        [
            "id" => "cat2",
            "slug" => "main-courses",
            "name" => "Main Courses", 
            "image" => "",
            "image_url" => "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop",
            "description" => "Hearty dishes for your main meal."
        ],
        [
            "id" => "cat3",
            "slug" => "desserts",
            "name" => "Desserts",
            "image" => "",
            "image_url" => "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop",
            "description" => "Sweet treats to end your meal."
        ]
    ];
}

$categories = $_SESSION['categories'];
$message = '';
$messageType = '';

// Fonction pour créer un slug
function createSlug($name) {
    $slug = strtolower($name);
    $slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
    $slug = trim($slug, '-');
    return $slug;
}

// Fonction pour télécharger et convertir une image depuis URL vers WebP
function downloadAndConvertToWebP($imageUrl, $destinationPath, $quality = 80) {
    // Configuration pour téléchargement
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => [
                'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept: image/webp,image/apng,image/*,*/*;q=0.8',
                'Accept-Language: en-US,en;q=0.9',
                'Accept-Encoding: gzip, deflate, br',
                'Connection: keep-alive'
            ],
            'timeout' => 30,
            'follow_location' => true,
            'max_redirects' => 5
        ],
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false
        ]
    ]);
    
    // Télécharger l'image
    $imageData = @file_get_contents($imageUrl, false, $context);
    
    if ($imageData === false || strlen($imageData) === 0) {
        return ['success' => false, 'error' => 'Impossible de télécharger l\'image depuis l\'URL'];
    }
    
    // Créer une image temporaire
    $tempFile = sys_get_temp_dir() . '/temp_image_' . uniqid() . '.tmp';
    file_put_contents($tempFile, $imageData);
    
    // Détecter le type d'image
    $imageInfo = @getimagesize($tempFile);
    if ($imageInfo === false) {
        unlink($tempFile);
        return ['success' => false, 'error' => 'Format d\'image non valide ou corrompu'];
    }
    
    $originalSize = strlen($imageData);
    
    // Créer l'image selon le type
    switch ($imageInfo[2]) {
        case IMAGETYPE_JPEG:
            $image = imagecreatefromjpeg($tempFile);
            break;
        case IMAGETYPE_PNG:
            $image = imagecreatefrompng($tempFile);
            // Préserver la transparence pour PNG
            imagealphablending($image, false);
            imagesavealpha($image, true);
            break;
        case IMAGETYPE_GIF:
            $image = imagecreatefromgif($tempFile);
            break;
        case IMAGETYPE_WEBP:
            // Déjà en WebP, juste copier
            $result = copy($tempFile, $destinationPath);
            unlink($tempFile);
            if ($result) {
                return [
                    'success' => true,
                    'originalSize' => $originalSize,
                    'webpSize' => filesize($destinationPath),
                    'format' => 'WebP (déjà optimisé)',
                    'dimensions' => $imageInfo[0] . 'x' . $imageInfo[1],
                    'compression' => 0
                ];
            }
            return ['success' => false, 'error' => 'Erreur lors de la copie du fichier WebP'];
        default:
            unlink($tempFile);
            return ['success' => false, 'error' => 'Format d\'image non supporté. Utilisez JPG, PNG, GIF ou WebP'];
    }
    
    if ($image === false) {
        unlink($tempFile);
        return ['success' => false, 'error' => 'Impossible de traiter l\'image téléchargée'];
    }
    
    // Convertir en WebP
    $success = imagewebp($image, $destinationPath, $quality);
    imagedestroy($image);
    unlink($tempFile);
    
    if ($success) {
        $webpSize = filesize($destinationPath);
        return [
            'success' => true,
            'originalSize' => $originalSize,
            'webpSize' => $webpSize,
            'format' => image_type_to_mime_type($imageInfo[2]),
            'dimensions' => $imageInfo[0] . 'x' . $imageInfo[1],
            'compression' => round((1 - $webpSize / $originalSize) * 100, 1)
        ];
    }
    
    return ['success' => false, 'error' => 'Échec de la conversion en WebP'];
}

// Fonction pour créer un dossier de catégorie individuellement
function createCategoryFolder($category, $imageUrl = null) {
    $baseDir = './categories';
    $categoryPath = $baseDir . '/' . $category['slug'];
    
    // Créer le dossier principal si nécessaire
    if (!file_exists($baseDir)) {
        mkdir($baseDir, 0755, true);
    }
    
    // Créer le dossier de catégorie
    if (!file_exists($categoryPath)) {
        if (!mkdir($categoryPath, 0755, true)) {
            return ['success' => false, 'message' => 'Impossible de créer le dossier'];
        }
    }
    
    // Créer le fichier JSON individuel
    $categoryData = array_merge($category, [
        'folderPath' => $categoryPath,
        'createdAt' => date('c'),
        'updatedAt' => date('c')
    ]);
    
    $jsonContent = json_encode($categoryData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    file_put_contents($categoryPath . '/category.json', $jsonContent);
    
    // Traiter l'image depuis URL si fournie
    $imageInfo = '';
    if (!empty($imageUrl)) {
        $webpPath = $categoryPath . '/image.webp';
        
        $result = downloadAndConvertToWebP($imageUrl, $webpPath);
        
        if ($result['success']) {
            $imageInfo = "✅ Image téléchargée et convertie avec succès\n";
            $imageInfo .= "URL originale: $imageUrl\n";
            $imageInfo .= "Format original: {$result['format']}\n";
            $imageInfo .= "Dimensions: {$result['dimensions']}\n";
            $imageInfo .= "Taille originale: " . number_format($result['originalSize']) . " bytes\n";
            $imageInfo .= "Taille WebP: " . number_format($result['webpSize']) . " bytes\n";
            $imageInfo .= "Compression: {$result['compression']}% d'économie\n";
            $imageInfo .= "Date: " . date('Y-m-d H:i:s') . "\n";
            
            file_put_contents($categoryPath . '/image_info.txt', $imageInfo);
        } else {
            $imageInfo = "❌ Erreur lors du téléchargement/conversion\n";
            $imageInfo .= "URL: $imageUrl\n";
            $imageInfo .= "Erreur: {$result['error']}\n";
            $imageInfo .= "Date: " . date('Y-m-d H:i:s') . "\n";
            
            file_put_contents($categoryPath . '/image_error.txt', $imageInfo);
        }
    }
    
    return [
        'success' => true, 
        'message' => "Dossier '{$category['slug']}' créé avec succès",
        'path' => $categoryPath,
        'imageInfo' => $imageInfo
    ];
}

// Traitement des actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    switch ($action) {
        case 'add_category':
            $name = trim($_POST['name'] ?? '');
            $description = trim($_POST['description'] ?? '');
            $imageUrl = trim($_POST['image_url'] ?? '');
            $createFolder = isset($_POST['create_folder']);
            
            if (!empty($name)) {
                $slug = createSlug($name);
                $id = 'cat_' . time() . '_' . rand(100, 999);
                
                $newCategory = [
                    'id' => $id,
                    'slug' => $slug,
                    'name' => $name,
                    'image' => !empty($imageUrl) ? 'image.webp' : '',
                    'image_url' => $imageUrl,
                    'description' => $description
                ];
                
                $_SESSION['categories'][] = $newCategory;
                $categories = $_SESSION['categories'];
                
                // Créer le dossier immédiatement si demandé
                if ($createFolder) {
                    $result = createCategoryFolder($newCategory, $imageUrl);
                    if ($result['success']) {
                        $message = "✅ Catégorie '$name' ajoutée et dossier créé !\n";
                        $message .= "📁 Emplacement: {$result['path']}\n";
                        if ($result['imageInfo'] && strpos($result['imageInfo'], '✅') !== false) {
                            $message .= "🖼️ Image téléchargée et convertie en WebP";
                        } elseif ($result['imageInfo']) {
                            $message .= "⚠️ Problème avec l'image (voir image_error.txt)";
                        }
                    } else {
                        $message = "⚠️ Catégorie ajoutée mais erreur: {$result['message']}";
                    }
                } else {
                    $message = "✅ Catégorie '$name' ajoutée ! Utilisez 'Créer Dossier' pour générer les fichiers.";
                }
                
                $messageType = 'success';
            } else {
                $message = "❌ Le nom de la catégorie est obligatoire.";
                $messageType = 'error';
            }
            break;
            
        case 'create_single_folder':
            $id = $_POST['id'] ?? '';
            $category = null;
            
            foreach ($_SESSION['categories'] as $cat) {
                if ($cat['id'] === $id) {
                    $category = $cat;
                    break;
                }
            }
            
            if ($category) {
                $imageUrl = $category['image_url'] ?? '';
                $result = createCategoryFolder($category, $imageUrl);
                if ($result['success']) {
                    $message = "✅ {$result['message']} !\n📁 Emplacement: {$result['path']}";
                    
                    // Vérifier si l'image a été téléchargée
                    if (!empty($imageUrl)) {
                        $webpFile = $result['path'] . '/image.webp';
                        if (file_exists($webpFile)) {
                            $fileSize = filesize($webpFile);
                            $message .= "\n🖼️ Image WebP téléchargée ($fileSize bytes)";
                        } else {
                            $message .= "\n⚠️ Échec du téléchargement de l'image (voir image_error.txt)";
                        }
                    }
                    $messageType = 'success';
                } else {
                    $message = "❌ Erreur: {$result['message']}";
                    $messageType = 'error';
                }
            }
            break;
            
        case 'delete_category':
            $id = $_POST['id'] ?? '';
            $categories = array_filter($_SESSION['categories'], function($cat) use ($id) {
                return $cat['id'] !== $id;
            });
            $_SESSION['categories'] = array_values($categories);
            $categories = $_SESSION['categories'];
            
            $message = "✅ Catégorie supprimée !";
            $messageType = 'success';
            break;
            
        case 'update_category':
            $id = $_POST['id'] ?? '';
            $name = trim($_POST['name'] ?? '');
            $description = trim($_POST['description'] ?? '');
            $imageUrl = trim($_POST['image_url'] ?? '');
            
            foreach ($_SESSION['categories'] as &$category) {
                if ($category['id'] === $id) {
                    $category['name'] = $name;
                    $category['slug'] = createSlug($name);
                    $category['description'] = $description;
                    
                    // Mettre à jour l'URL de l'image
                    if (!empty($imageUrl)) {
                        $category['image_url'] = $imageUrl;
                        $category['image'] = 'image.webp';
                        
                        // Si le dossier existe, télécharger et convertir l'image immédiatement
                        $categoryPath = './categories/' . $category['slug'];
                        if (file_exists($categoryPath)) {
                            $webpPath = $categoryPath . '/image.webp';
                            $result = downloadAndConvertToWebP($imageUrl, $webpPath);
                            
                            if ($result['success']) {
                                $imageInfo = "Image mise à jour avec succès\n";
                                $imageInfo .= "URL: $imageUrl\n";
                                $imageInfo .= "Format original: {$result['format']}\n";
                                $imageInfo .= "Dimensions: {$result['dimensions']}\n";
                                $imageInfo .= "Taille WebP: " . number_format($result['webpSize']) . " bytes\n";
                                $imageInfo .= "Compression: {$result['compression']}%\n";
                                $imageInfo .= "Date mise à jour: " . date('Y-m-d H:i:s') . "\n";
                                
                                file_put_contents($categoryPath . '/image_info.txt', $imageInfo);
                            }
                        }
                    }
                    break;
                }
            }
            $categories = $_SESSION['categories'];
            
            $message = "✅ Catégorie '$name' mise à jour !";
            $messageType = 'success';
            break;
            
        case 'create_all_structure':
            $baseDir = './categories';
            
            // Créer le dossier principal
            if (!file_exists($baseDir)) {
                mkdir($baseDir, 0755, true);
            }
            
            // Créer le fichier categories.json principal
            $jsonContent = json_encode($_SESSION['categories'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            file_put_contents($baseDir . '/categories.json', $jsonContent);
            
            $createdCount = 0;
            
            // Créer tous les dossiers manquants
            foreach ($_SESSION['categories'] as $category) {
                $categoryPath = $baseDir . '/' . $category['slug'];
                if (!file_exists($categoryPath)) {
                    $imageUrl = $category['image_url'] ?? '';
                    $result = createCategoryFolder($category, $imageUrl);
                    if ($result['success']) {
                        $createdCount++;
                    }
                }
            }
            
            // Créer un README
            $readmeContent = "# Categories Project\n\n";
            $readmeContent .= "Structure créée le: " . date('Y-m-d H:i:s') . "\n\n";
            $readmeContent .= "## Catégories (" . count($_SESSION['categories']) . ")\n\n";
            
            foreach ($_SESSION['categories'] as $category) {
                $readmeContent .= "### {$category['name']}\n";
                $readmeContent .= "- **Slug**: `{$category['slug']}`\n";
                $readmeContent .= "- **Description**: " . ($category['description'] ?: 'Aucune') . "\n";
                if (!empty($category['image_url'])) {
                    $readmeContent .= "- **Image URL**: {$category['image_url']}\n";
                    $readmeContent .= "- **Image WebP**: image.webp\n";
                }
                $readmeContent .= "\n";
            }
            
            file_put_contents($baseDir . '/README.md', $readmeContent);
            
            $message = "🎉 Structure complète créée !\n📁 Nouveaux dossiers: $createdCount\n🖼️ Images converties en WebP";
            $messageType = 'success';
            break;
    }
}

// Fonction pour vérifier si un dossier existe
function folderExists($slug) {
    return file_exists('./categories/' . $slug);
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🗂️ Category Manager avec URL vers WebP</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }

        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }

        .header p {
            opacity: 0.9;
            font-size: 1.1rem;
        }

        .main-content {
            padding: 30px;
        }

        .controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            flex-wrap: wrap;
            gap: 20px;
        }

        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 50px;
            cursor: pointer;
            font-weight: 600;
            font-size: 14px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
            text-decoration: none;
        }

        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }

        .btn-success {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            color: white;
        }

        .btn-danger {
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
            color: white;
        }

        .btn-warning {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
        }

        .btn-small {
            padding: 8px 16px;
            font-size: 12px;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }

        .alert {
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            font-weight: 600;
            white-space: pre-line;
        }

        .alert-success {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
        }

        .alert-error {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
        }

        .categories-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 25px;
            margin-bottom: 30px;
        }

        .category-card {
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            overflow: hidden;
            transition: all 0.3s ease;
            border: 1px solid #e0e0e0;
            position: relative;
        }

        .category-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }

        .category-image {
            width: 100%;
            height: 200px;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 3rem;
            overflow: hidden;
            position: relative;
        }

        .category-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .webp-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.8);
            color: #00ff00;
            padding: 4px 8px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: 600;
        }

        .folder-status {
            position: absolute;
            top: 10px;
            left: 10px;
            padding: 4px 8px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: 600;
        }

        .folder-exists {
            background: #28a745;
            color: white;
        }

        .folder-missing {
            background: #ffc107;
            color: #333;
        }

        .category-content {
            padding: 25px;
        }

        .category-name {
            font-size: 1.4rem;
            font-weight: 700;
            color: #333;
            margin-bottom: 8px;
        }

        .category-slug {
            font-size: 0.9rem;
            color: #666;
            background: #f8f9fa;
            padding: 4px 8px;
            border-radius: 15px;
            display: inline-block;
            margin-bottom: 12px;
            font-family: 'Courier New', monospace;
        }

        .category-description {
            color: #666;
            line-height: 1.6;
            margin-bottom: 20px;
        }

        .category-actions {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }

        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            z-index: 1000;
        }

        .modal.show {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .modal-content {
            background: white;
            border-radius: 20px;
            padding: 40px;
            width: 90%;
            max-width: 500px;
            max-height: 90vh;
            overflow-y: auto;
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
        }

        .close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #666;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #333;
        }

        .form-control {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.3s ease;
        }

        .form-control:focus {
            outline: none;
            border-color: #667eea;
        }

        .url-input {
            background: #f8f9fa;
        }

        .url-input.valid {
            border-color: #28a745;
            background: #f8fff9;
        }

        .url-input.warning {
            border-color: #ffc107;
            background: #fffbf0;
        }

        .checkbox-group {
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 15px 0;
        }

        .creation-section {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 30px;
            border: 1px solid #e0e0e0;
        }

        .creation-info {
            background: #e3f2fd;
            border: 1px solid #2196f3;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
            color: #1976d2;
        }

        .stats {
            display: flex;
            gap: 20px;
            margin: 20px 0;
            flex-wrap: wrap;
        }

        .stat-item {
            background: white;
            padding: 15px;
            border-radius: 10px;
            text-align: center;
            min-width: 120px;
            border: 1px solid #e0e0e0;
        }

        .stat-number {
            font-size: 2rem;
            font-weight: 700;
            color: #667eea;
        }

        .stat-label {
            color: #666;
            font-size: 0.9rem;
        }

        @media (max-width: 768px) {
            .categories-grid {
                grid-template-columns: 1fr;
            }
            
            .controls {
                flex-direction: column;
                align-items: stretch;
            }
            
            .header h1 {
                font-size: 2rem;
            }
            
            .stats {
                justify-content: center;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🗂️ Category Manager avec URL vers WebP</h1>
            <p>Téléchargement automatique depuis URL et conversion en WebP optimisé</p>
        </div>

        <div class="main-content">
            <?php if ($message): ?>
                <div class="alert alert-<?= $messageType ?>">
                    <?= htmlspecialchars($message) ?>
                </div>
            <?php endif; ?>

            <div class="controls">
                <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                    <button class="btn btn-primary" onclick="showAddModal()">
                        ➕ Ajouter Catégorie
                    </button>
                </div>
                <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                    <button class="btn btn-success" onclick="showCreateAllModal()">
                        📁 Créer Tous les Dossiers
                    </button>
                </div>
            </div>

            <div class="creation-section">
                <div class="creation-info">
                    <h3>🎯 Fonctionnement</h3>
                    <p><strong>• URL vers WebP:</strong> Collez une URL d'image, elle sera automatiquement téléchargée et convertie</p>
                    <p><strong>• Formats supportés:</strong> JPG, PNG, GIF, WebP depuis n'importe quelle URL</p>
                    <p><strong>• Création flexible:</strong> Dossier immédiat ou création ultérieure</p>
                    <p><strong>• Optimisation:</strong> Compression WebP pour des tailles minimales</p>
                </div>
                
                <div class="stats">
                    <div class="stat-item">
                        <div class="stat-number">
                            <?php 
                            $folderCount = 0;
                            foreach ($categories as $cat) {
                                if (folderExists($cat['slug'])) $folderCount++;
                            }
                            echo $folderCount;
                            ?>
                        </div>
                        <div class="stat-label">Dossiers créés</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">WebP</div>
                        <div class="stat-label">Format optimal</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">
                            <?php 
                            $withImages = 0;
                            foreach ($categories as $cat) {
                                if (!empty($cat['image_url'])) $withImages++;
                            }
                            echo $withImages;
                            ?>
                        </div>
                        <div class="stat-label">Avec images</div>
                    </div>
                </div>
            </div>

            <div class="categories-grid">
                <?php foreach ($categories as $category): ?>
                    <div class="category-card">
                        <div class="category-image">
                            <?php if (!empty($category['image_url'])): ?>
                                <?php if (folderExists($category['slug']) && file_exists("./categories/{$category['slug']}/image.webp")): ?>
                                    <img src="./categories/<?= $category['slug'] ?>/image.webp" 
                                         alt="<?= htmlspecialchars($category['name']) ?>"
                                         onerror="this.parentNode.innerHTML='🗂️';">
                                    <div class="webp-badge">WebP</div>
                                <?php else: ?>
                                    <img src="<?= htmlspecialchars($category['image_url']) ?>" 
                                         alt="<?= htmlspecialchars($category['name']) ?>"
                                         onerror="this.parentNode.innerHTML='🗂️';">
                                <?php endif; ?>
                            <?php else: ?>
                                🗂️
                            <?php endif; ?>
                            
                            <div class="folder-status <?= folderExists($category['slug']) ? 'folder-exists' : 'folder-missing' ?>">
                                <?= folderExists($category['slug']) ? '✅ Créé' : '⏳ Pending' ?>
                            </div>
                        </div>
                        <div class="category-content">
                            <div class="category-name"><?= htmlspecialchars($category['name']) ?></div>
                            <div class="category-slug"><?= htmlspecialchars($category['slug']) ?></div>
                            <div class="category-description"><?= htmlspecialchars($category['description'] ?: 'Pas de description.') ?></div>
                            <div class="category-actions">
                                <?php if (!folderExists($category['slug'])): ?>
                                    <button class="btn btn-success btn-small" onclick="createSingleFolder('<?= $category['id'] ?>')">
                                        📁 Créer Dossier
                                    </button>
                                <?php endif; ?>
                                <button class="btn btn-primary btn-small" onclick="editCategory('<?= $category['id'] ?>')">
                                    ✏️ Modifier
                                </button>
                                <button class="btn btn-danger btn-small" onclick="deleteCategory('<?= $category['id'] ?>')">
                                    🗑️ Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>

            <?php if (count($categories) > 0): ?>
                <div style="text-align: center; margin: 30px 0;">
                    <p style="color: #666; margin-bottom: 15px;">
                        Vous avez <?= count($categories) ?> catégorie(s) prête(s)
                    </p>
                    <button class="btn btn-success" onclick="showCreateAllModal()" style="font-size: 16px; padding: 15px 30px;">
                        🚀 Créer Toute la Structure
                    </button>
                </div>
            <?php endif; ?>
        </div>
    </div>

    <!-- Modal Ajouter/Modifier -->
    <div id="categoryModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="modalTitle">Ajouter Catégorie</h2>
                <button class="close" onclick="closeModal()">&times;</button>
            </div>
            <form id="categoryForm" method="post">
                <input type="hidden" name="action" id="formAction" value="add_category">
                <input type="hidden" name="id" id="categoryId">
                
                <div class="form-group">
                    <label for="name">Nom de la catégorie *</label>
                    <input type="text" name="name" id="name" class="form-control" required>
                </div>

                <div class="form-group">
                    <label for="description">Description</label>
                    <textarea name="description" id="description" class="form-control" rows="3"></textarea>
                </div>

                <div class="form-group">
                    <label for="image_url">URL de l'image (JPG, PNG, GIF → WebP)</label>
                    <input type="url" name="image_url" id="image_url" class="form-control url-input" 
                           placeholder="https://images.unsplash.com/photo-123... ou toute URL d'image">
                    <small style="color: #666; margin-top: 5px; display: block;">
                        🔄 L'image sera automatiquement téléchargée et convertie en WebP pour une taille optimale
                    </small>
                </div>

                <div class="checkbox-group" id="create-folder-option">
                    <input type="checkbox" name="create_folder" id="create_folder" checked>
                    <label for="create_folder">Créer le dossier et télécharger l'image immédiatement</label>
                </div>

                <div style="display: flex; gap: 15px; justify-content: flex-end; margin-top: 30px;">
                    <button type="button" class="btn" onclick="closeModal()">Annuler</button>
                    <button type="submit" class="btn btn-success">💾 Sauvegarder</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal Créer Tous les Dossiers -->
    <div id="createAllModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Créer Tous les Dossiers</h2>
                <button class="close" onclick="closeCreateAllModal()">&times;</button>
            </div>
            <form method="post">
                <input type="hidden" name="action" value="create_all_structure">
                
                <p style="margin-bottom: 20px;">
                    Créer les dossiers manquants et télécharger les images en WebP pour toutes vos catégories :
                </p>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <?php 
                    $pendingCount = 0;
                    foreach ($categories as $cat) {
                        if (!folderExists($cat['slug'])) {
                            echo "📁 " . htmlspecialchars($cat['name']) . " (" . htmlspecialchars($cat['slug']) . ")";
                            if (!empty($cat['image_url'])) {
                                echo " + 🖼️ Image WebP";
                            }
                            echo "<br>";
                            $pendingCount++;
                        }
                    }
                    if ($pendingCount === 0) {
                        echo "✅ Tous les dossiers sont déjà créés !";
                    }
                    ?>
                </div>
                
                <?php if ($pendingCount > 0): ?>
                    <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0; color: #1976d2;">
                        <strong>🔄 Actions à effectuer :</strong><br>
                        • Création de <?= $pendingCount ?> dossier(s)<br>
                        • Téléchargement et conversion des images en WebP<br>
                        • Génération des fichiers JSON<br>
                        • Création du README.md
                    </div>
                    
                    <div style="display: flex; gap: 15px; justify-content: flex-end; margin-top: 30px;">
                        <button type="button" class="btn" onclick="closeCreateAllModal()">Annuler</button>
                        <button type="submit" class="btn btn-success">🚀 Créer <?= $pendingCount ?> Dossier(s)</button>
                    </div>
                <?php else: ?>
                    <div style="display: flex; gap: 15px; justify-content: flex-end; margin-top: 30px;">
                        <button type="button" class="btn btn-success" onclick="closeCreateAllModal()">Fermer</button>
                    </div>
                <?php endif; ?>
            </form>
        </div>
    </div>

    <script>
        const categories = <?= json_encode($categories) ?>;

        // Validation d'URL d'image en temps réel
        document.getElementById('image_url').addEventListener('input', function(e) {
            const url = e.target.value;
            if (url) {
                // Vérifier si l'URL semble être une image
                const imageExtensions = /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;
                const isUnsplash = url.includes('unsplash.com');
                const isPexels = url.includes('pexels.com');
                const isPixabay = url.includes('pixabay.com');
                const isImageUrl = imageExtensions.test(url) || isUnsplash || isPexels || isPixabay;
                
                if (isImageUrl) {
                    e.target.classList.remove('warning');
                    e.target.classList.add('valid');
                } else {
                    e.target.classList.remove('valid');
                    e.target.classList.add('warning');
                }
            } else {
                e.target.classList.remove('valid', 'warning');
            }
        });

        function showAddModal() {
            document.getElementById('modalTitle').textContent = 'Ajouter Catégorie';
            document.getElementById('formAction').value = 'add_category';
            document.getElementById('categoryForm').reset();
            document.getElementById('categoryId').value = '';
            document.getElementById('create-folder-option').style.display = 'flex';
            document.getElementById('image_url').classList.remove('valid', 'warning');
            document.getElementById('categoryModal').classList.add('show');
        }

        function showCreateAllModal() {
            document.getElementById('createAllModal').classList.add('show');
        }

        function closeModal() {
            document.getElementById('categoryModal').classList.remove('show');
        }

        function closeCreateAllModal() {
            document.getElementById('createAllModal').classList.remove('show');
        }

        function editCategory(id) {
            const category = categories.find(cat => cat.id === id);
            if (!category) return;

            document.getElementById('modalTitle').textContent = 'Modifier Catégorie';
            document.getElementById('formAction').value = 'update_category';
            document.getElementById('categoryId').value = id;
            document.getElementById('name').value = category.name;
            document.getElementById('description').value = category.description || '';
            document.getElementById('image_url').value = category.image_url || '';
            document.getElementById('create-folder-option').style.display = 'none';
            
            // Trigger validation
            const event = new Event('input');
            document.getElementById('image_url').dispatchEvent(event);
            
            document.getElementById('categoryModal').classList.add('show');
        }

        function deleteCategory(id) {
            const category = categories.find(cat => cat.id === id);
            if (!category) return;

            if (confirm(`Supprimer "${category.name}" ?`)) {
                const form = document.createElement('form');
                form.method = 'post';
                form.innerHTML = `
                    <input type="hidden" name="action" value="delete_category">
                    <input type="hidden" name="id" value="${id}">
                `;
                document.body.appendChild(form);
                form.submit();
            }
        }

        function createSingleFolder(id) {
            const category = categories.find(cat => cat.id === id);
            if (!category) return;

            let confirmMessage = `Créer le dossier pour "${category.name}" ?`;
            if (category.image_url) {
                confirmMessage += '\n\nL\'image sera téléchargée et convertie en WebP.';
            }

            if (confirm(confirmMessage)) {
                const form = document.createElement('form');
                form.method = 'post';
                form.innerHTML = `
                    <input type="hidden" name="action" value="create_single_folder">
                    <input type="hidden" name="id" value="${id}">
                `;
                document.body.appendChild(form);
                form.submit();
            }
        }

        // Fermer modals en cliquant outside
        window.onclick = function(event) {
            const categoryModal = document.getElementById('categoryModal');
            const createAllModal = document.getElementById('createAllModal');
            
            if (event.target === categoryModal) {
                closeModal();
            }
            if (event.target === createAllModal) {
                closeCreateAllModal();
            }
        }

        // Auto-complétion pour URLs d'images populaires
        document.getElementById('image_url').addEventListener('focus', function() {
            if (!this.value) {
                this.placeholder = 'Exemples: unsplash.com, pexels.com, pixabay.com, ou toute URL d\'image';
            }
        });

        document.getElementById('image_url').addEventListener('blur', function() {
            this.placeholder = 'https://images.unsplash.com/photo-123... ou toute URL d\'image';
        });

        // Vérifier le support WebP du navigateur
        function checkWebPSupport() {
            const canvas = document.createElement('canvas');
            canvas.width = 1;
            canvas.height = 1;
            return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        }

        // Afficher un avertissement si WebP n'est pas supporté
        if (!checkWebPSupport()) {
            console.warn('⚠️ WebP n\'est pas supporté par ce navigateur. Les images converties fonctionneront quand même sur les navigateurs modernes.');
        }

        // Suggestion d'URLs d'exemple
        function insertExampleUrl(type) {
            const examples = {
                unsplash: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
                pexels: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
                pixabay: 'https://pixabay.com/get/gb32f4d2c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c_1920.jpg'
            };
            
            document.getElementById('image_url').value = examples[type] || '';
            const event = new Event('input');
            document.getElementById('image_url').dispatchEvent(event);
        }
    </script>
</body>
</html>