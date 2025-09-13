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

// Traitement des uploads d'images
if (isset($_POST['upload_action']) && $_POST['upload_action'] === 'upload_image') {
    header('Content-Type: application/json');
    
    try {
        if (!isset($_FILES['file']) || !isset($_POST['category_id']) || !isset($_POST['category_slug'])) {
            echo json_encode(['ok' => false, 'error' => 'Données manquantes']);
            exit;
        }
        
        $categoryId = $_POST['category_id'];
        $categorySlug = $_POST['category_slug'];
        $uploadedFile = $_FILES['file'];
        
        if ($uploadedFile['error'] !== UPLOAD_ERR_OK) {
            echo json_encode(['ok' => false, 'error' => 'Erreur lors du téléchargement']);
            exit;
        }
        
        // Créer le dossier de catégorie
        $categoryDir = './categories/' . $categorySlug;
        if (!is_dir($categoryDir)) {
            mkdir($categoryDir, 0755, true);
        }
        
        $webpPath = $categoryDir . '/image.webp';
        
        // Fonction simple de conversion WebP
        function simpleWebPConvert($sourcePath, $destinationPath) {
            $imageInfo = getimagesize($sourcePath);
            if (!$imageInfo) return false;
            
            switch ($imageInfo[2]) {
                case IMAGETYPE_JPEG:
                    $image = imagecreatefromjpeg($sourcePath);
                    break;
                case IMAGETYPE_PNG:
                    $image = imagecreatefrompng($sourcePath);
                    break;
                case IMAGETYPE_GIF:
                    $image = imagecreatefromgif($sourcePath);
                    break;
                default:
                    return false;
            }
            
            if (!$image) return false;
            
            $result = imagewebp($image, $destinationPath, 80);
            imagedestroy($image);
            
            return $result;
        }
        
        if (simpleWebPConvert($uploadedFile['tmp_name'], $webpPath)) {
            // Mettre à jour la session
            foreach ($_SESSION['categories'] as &$category) {
                if ($category['id'] === $categoryId) {
                    $category['image'] = 'image.webp';
                    $category['image_url'] = './categories/' . $categorySlug . '/image.webp';
                    break;
                }
            }
            
            echo json_encode([
                'ok' => true,
                'filename' => 'image.webp',
                'path' => './categories/' . $categorySlug . '/image.webp',
                'size' => filesize($webpPath)
            ]);
        } else {
            echo json_encode(['ok' => false, 'error' => 'Échec de la conversion']);
        }
        
    } catch (Exception $e) {
        echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

// Fonction pour télécharger et convertir une image depuis URL vers WebP
function downloadAndConvertToWebP($imageUrl, $destinationPath, $quality = 80) {
    // Configuration pour téléchargement
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => [
                'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept: image/webp,image/apng,image/*,*/*;q=0.8',
            ],
            'timeout' => 30,
            'follow_location' => true,
            'max_redirects' => 5
        ]
    ]);
    
    $imageData = @file_get_contents($imageUrl, false, $context);
    
    if ($imageData === false || strlen($imageData) === 0) {
        return ['success' => false, 'error' => 'Impossible de télécharger l\'image'];
    }
    
    $tempFile = sys_get_temp_dir() . '/temp_image_' . uniqid() . '.tmp';
    file_put_contents($tempFile, $imageData);
    
    $imageInfo = @getimagesize($tempFile);
    if ($imageInfo === false) {
        unlink($tempFile);
        return ['success' => false, 'error' => 'Format d\'image non valide'];
    }
    
    $originalSize = strlen($imageData);
    
    switch ($imageInfo[2]) {
        case IMAGETYPE_JPEG:
            $image = imagecreatefromjpeg($tempFile);
            break;
        case IMAGETYPE_PNG:
            $image = imagecreatefrompng($tempFile);
            imagealphablending($image, false);
            imagesavealpha($image, true);
            break;
        case IMAGETYPE_GIF:
            $image = imagecreatefromgif($tempFile);
            break;
        case IMAGETYPE_WEBP:
            copy($tempFile, $destinationPath);
            unlink($tempFile);
            return [
                'success' => true,
                'originalSize' => $originalSize,
                'webpSize' => filesize($destinationPath),
                'format' => 'WebP',
                'dimensions' => $imageInfo[0] . 'x' . $imageInfo[1],
                'compression' => 0
            ];
        default:
            unlink($tempFile);
            return ['success' => false, 'error' => 'Format non supporté'];
    }
    
    if ($image === false) {
        unlink($tempFile);
        return ['success' => false, 'error' => 'Impossible de traiter l\'image'];
    }
    
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
    
    if (!file_exists($baseDir)) {
        mkdir($baseDir, 0755, true);
    }
    
    if (!file_exists($categoryPath)) {
        if (!mkdir($categoryPath, 0755, true)) {
            return ['success' => false, 'message' => 'Impossible de créer le dossier'];
        }
    }
    
    $categoryData = array_merge($category, [
        'folderPath' => $categoryPath,
        'createdAt' => date('c'),
        'updatedAt' => date('c')
    ]);
    
    $jsonContent = json_encode($categoryData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    file_put_contents($categoryPath . '/category.json', $jsonContent);
    
    $imageInfo = '';
    if (!empty($imageUrl)) {
        $webpPath = $categoryPath . '/image.webp';
        $result = downloadAndConvertToWebP($imageUrl, $webpPath);
        
        if ($result['success']) {
            $imageInfo = "✅ Image téléchargée et convertie avec succès\n";
            $imageInfo .= "Taille WebP: " . number_format($result['webpSize']) . " bytes\n";
            $imageInfo .= "Compression: {$result['compression']}%\n";
            file_put_contents($categoryPath . '/image_info.txt', $imageInfo);
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
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !isset($_POST['upload_action'])) {
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
                
                if ($createFolder) {
                    $result = createCategoryFolder($newCategory, $imageUrl);
                    if ($result['success']) {
                        $message = "✅ Catégorie '$name' ajoutée et dossier créé !";
                        $messageType = 'success';
                    }
                } else {
                    $message = "✅ Catégorie '$name' ajoutée !";
                    $messageType = 'success';
                }
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
                    $message = "✅ {$result['message']} !";
                    $messageType = 'success';
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
                    
                    if (!empty($imageUrl)) {
                        $category['image_url'] = $imageUrl;
                        $category['image'] = 'image.webp';
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
            
            if (!file_exists($baseDir)) {
                mkdir($baseDir, 0755, true);
            }
            
            $jsonContent = json_encode($_SESSION['categories'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            file_put_contents($baseDir . '/categories.json', $jsonContent);
            
            $createdCount = 0;
            
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
            
            $readmeContent = "# Categories Project\n\n";
            $readmeContent .= "Structure créée le: " . date('Y-m-d H:i:s') . "\n\n";
            $readmeContent .= "## Catégories (" . count($_SESSION['categories']) . ")\n\n";
            
            foreach ($_SESSION['categories'] as $category) {
                $readmeContent .= "### {$category['name']}\n";
                $readmeContent .= "- **Slug**: `{$category['slug']}`\n";
                $readmeContent .= "- **Description**: " . ($category['description'] ?: 'Aucune') . "\n";
                if (!empty($category['image_url'])) {
                    $readmeContent .= "- **Image**: image.webp\n";
                }
                $readmeContent .= "\n";
            }
            
            file_put_contents($baseDir . '/README.md', $readmeContent);
            
            $message = "🎉 Structure complète créée ! Nouveaux dossiers: $createdCount";
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
    <title>🗂️ Category Manager avec Upload</title>
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

        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
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
            max-width: 600px;
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

        .checkbox-group {
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 15px 0;
        }

        .upload-section {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            border: 2px dashed #dee2e6;
        }

        .upload-options {
            display: flex;
            gap: 20px;
            margin-bottom: 15px;
        }

        .upload-option {
            flex: 1;
        }

        .upload-status {
            padding: 10px;
            margin: 10px 0;
            border-radius: 5px;
            font-size: 14px;
        }

        .status-success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }

        .status-error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }

        .status-info {
            background: #cce7ff;
            color: #004085;
            border: 1px solid #99d6ff;
        }

        .preview-container {
            text-align: center;
            margin-top: 15px;
        }

        .preview-image {
            max-width: 200px;
            max-height: 150px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            object-fit: cover;
        }

        .hidden {
            display: none;
        }

        @media (max-width: 768px) {
            .categories-grid {
                grid-template-columns: 1fr;
            }
            
            .controls {
                flex-direction: column;
                align-items: stretch;
            }
            
            .upload-options {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🗂️ Category Manager avec Upload</h1>
            <p>Téléchargement depuis URL ou fichier local avec conversion WebP automatique</p>
        </div>

        <div class="main-content">
            <?php if ($message): ?>
                <div class="alert alert-<?= $messageType ?>">
                    <?= htmlspecialchars($message) ?>
                </div>
            <?php endif; ?>

            <div class="controls">
                <button class="btn btn-primary" onclick="showAddModal()">
                    ➕ Ajouter Catégorie
                </button>
                <button class="btn btn-success" onclick="showCreateAllModal()">
                    📁 Créer Tous les Dossiers
                </button>
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
                    <label for="image_url">URL de l'image (optionnel)</label>
                    <input type="url" name="image_url" id="image_url" class="form-control" 
                           placeholder="https://images.unsplash.com/photo-...">
                </div>

                <!-- Section Upload -->
                <div class="upload-section">
                    <h4>🖼️ Ou Upload Image Directement</h4>
                    
                    <div class="upload-options">
                        <div class="upload-option">
                            <label>Fichier Local</label>
                            <input type="file" id="fileInput" class="form-control" 
                                   accept="image/jpeg,image/jpg,image/png,image/gif,image/webp">
                        </div>
                        <div class="upload-option">
                            <button type="button" class="btn btn-warning" id="uploadFileBtn" style="margin-top: 25px;">
                                📁 Upload Fichier
                            </button>
                        </div>
                    </div>
                    
                    <div id="uploadStatus"></div>
                    
                    <div id="previewContainer" class="preview-container hidden">
                        <img id="previewImage" class="preview-image" alt="Preview">
                        <div style="font-size: 12px; color: #666; margin-top: 8px;" id="fileInfo"></div>
                    </div>
                </div>

                <div class="checkbox-group" id="create-folder-option">
                    <input type="checkbox" name="create_folder" id="create_folder" checked>
                    <label for="create_folder">Créer le dossier immédiatement</label>
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

        // Functions utilitaires
        function createSlug(name) {
            return name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
        }

        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        // Upload d'image
        async function uploadCategoryImage(file, categoryId, categorySlug) {
            const statusDiv = document.getElementById('uploadStatus');
            const uploadBtn = document.getElementById('uploadFileBtn');
            
            try {
                statusDiv.innerHTML = '<div class="upload-status status-info">📤 Upload en cours...</div>';
                uploadBtn.disabled = true;
                
                if (!file.type.startsWith('image/')) {
                    throw new Error('Le fichier sélectionné n\'est pas une image');
                }
                
                if (file.size > 5 * 1024 * 1024) {
                    throw new Error('Fichier trop volumineux (max 5MB)');
                }
                
                const formData = new FormData();
                formData.append('file', file);
                formData.append('category_id', categoryId);
                formData.append('category_slug', categorySlug);
                formData.append('upload_action', 'upload_image');
                
                const response = await fetch(window.location.href, {
                    method: 'POST',
                    body: formData
                });
                
                const responseText = await response.text();
                
                let result;
                try {
                    result = JSON.parse(responseText);
                } catch (parseError) {
                    console.error('Response was:', responseText);
                    throw new Error('Erreur serveur: réponse invalide');
                }
                
                if (result.ok) {
                    statusDiv.innerHTML = `
                        <div class="upload-status status-success">✅ Upload réussi !<br>
                        📁 Chemin: ${result.path}<br>
                        📊 Taille: ${formatFileSize(result.size)}</div>
                    `;
                    
                    // Mettre à jour le champ URL
                    const imageUrlField = document.getElementById('image_url');
                    if (imageUrlField) {
                        imageUrlField.value = result.path;
                    }
                    
                    // Afficher l'aperçu
                    const previewContainer = document.getElementById('previewContainer');
                    const previewImage = document.getElementById('previewImage');
                    if (previewContainer && previewImage) {
                        previewImage.src = result.path + '?t=' + Date.now();
                        previewContainer.classList.remove('hidden');
                    }
                    
                    return result;
                    
                } else {
                    throw new Error(result.error || 'Échec de l\'upload');
                }
                
            } catch (error) {
                console.error('Upload error:', error);
                statusDiv.innerHTML = `<div class="upload-status status-error">❌ Erreur: ${error.message}</div>`;
                throw error;
            } finally {
                uploadBtn.disabled = false;
            }
        }

        // Initialisation du système d'upload
        function initImageUploadForModal() {
            const fileInput = document.getElementById('fileInput');
            const uploadBtn = document.getElementById('uploadFileBtn');
            
            if (!fileInput || !uploadBtn) return;
            
            // Upload au clic
            uploadBtn.addEventListener('click', async () => {
                const file = fileInput.files[0];
                if (!file) {
                    alert('Sélectionnez un fichier d\'abord');
                    return;
                }
                
                const categoryId = document.getElementById('categoryId')?.value || 'new_' + Date.now();
                const categoryName = document.getElementById('name')?.value?.trim();
                
                if (!categoryName) {
                    alert('Entrez le nom de la catégorie d\'abord');
                    return;
                }
                
                const categorySlug = createSlug(categoryName);
                
                try {
                    await uploadCategoryImage(file, categoryId, categorySlug);
                } catch (error) {
                    console.error('Upload failed:', error);
                }
            });
            
            // Aperçu lors de la sélection
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file && file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        let previewContainer = document.getElementById('previewContainer');
                        let previewImage = document.getElementById('previewImage');
                        let fileInfo = document.getElementById('fileInfo');
                        
                        if (previewContainer && previewImage) {
                            previewImage.src = e.target.result;
                            fileInfo.innerHTML = `📄 ${file.name}<br>📊 ${formatFileSize(file.size)}`;
                            previewContainer.classList.remove('hidden');
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        // Validation URL en temps réel
        document.addEventListener('DOMContentLoaded', function() {
            const imageUrlInput = document.getElementById('image_url');
            if (imageUrlInput) {
                imageUrlInput.addEventListener('input', function(e) {
                    const url = e.target.value;
                    if (url) {
                        const imageExtensions = /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;
                        const isImageService = url.includes('unsplash.com') || url.includes('pexels.com') || url.includes('pixabay.com');
                        const isValid = imageExtensions.test(url) || isImageService;
                        
                        e.target.style.borderColor = isValid ? '#28a745' : '#dc3545';
                    } else {
                        e.target.style.borderColor = '#e0e0e0';
                    }
                });
            }
        });

        // Functions pour les modals
        function showAddModal() {
            document.getElementById('modalTitle').textContent = 'Ajouter Catégorie';
            document.getElementById('formAction').value = 'add_category';
            document.getElementById('categoryForm').reset();
            document.getElementById('categoryId').value = '';
            document.getElementById('create-folder-option').style.display = 'flex';
            
            // Réinitialiser l'upload
            const uploadStatus = document.getElementById('uploadStatus');
            const previewContainer = document.getElementById('previewContainer');
            if (uploadStatus) uploadStatus.innerHTML = '';
            if (previewContainer) previewContainer.classList.add('hidden');
            
            document.getElementById('categoryModal').classList.add('show');
            
            setTimeout(initImageUploadForModal, 100);
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
            
            // Réinitialiser l'upload
            const uploadStatus = document.getElementById('uploadStatus');
            const previewContainer = document.getElementById('previewContainer');
            if (uploadStatus) uploadStatus.innerHTML = '';
            if (previewContainer) previewContainer.classList.add('hidden');
            
            document.getElementById('categoryModal').classList.add('show');
            
            setTimeout(initImageUploadForModal, 100);
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

            if (confirm(`Créer le dossier pour "${category.name}" ?`)) {
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
    </script>
</body>
</html>