<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\PageController;
use App\Http\Controllers\Api\MediaController;
use App\Http\Controllers\Api\AgendaController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\VideoController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\PublicController;
use App\Http\Controllers\Api\ContactMessageController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::get('/public/settings', [PublicController::class, 'getSettings']);
Route::get('/public/home', [PublicController::class, 'getHomeData']);
Route::get('/public/posts', [PublicController::class, 'getPosts']);
Route::get('/public/posts/{slug}', [PublicController::class, 'getPostBySlug']);
Route::get('/public/pages/{slug}', [PublicController::class, 'getPageBySlug']);
Route::get('/public/agendas', [PublicController::class, 'getAgendas']);
Route::get('/public/agendas/{slug}', [PublicController::class, 'getAgendaBySlug']);
Route::get('/public/announcements', [PublicController::class, 'getAnnouncements']);
Route::get('/public/announcements/{slug}', [PublicController::class, 'getAnnouncementBySlug']);
Route::get('/public/categories', [PublicController::class, 'getCategories']);
Route::get('/public/gallery', [PublicController::class, 'getGallery']);
Route::get('/public/videos', [PublicController::class, 'getVideos']);
Route::get('/public/search', [PublicController::class, 'globalSearch']);

// Public Contact Form (no auth needed)
Route::post('/public/contact', [ContactMessageController::class, 'store']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Resource CRUDs
    Route::apiResource('posts', PostController::class);
    Route::get('/pages/slug/{slug}', [PageController::class, 'getBySlug']);
    Route::apiResource('pages', PageController::class);
    Route::post('/media/bulk-update', [MediaController::class, 'bulkUpdate']);
    Route::apiResource('media', MediaController::class);
    Route::apiResource('agendas', AgendaController::class);
    Route::apiResource('announcements', AnnouncementController::class);
    Route::apiResource('videos', VideoController::class);
    Route::apiResource('banners', BannerController::class);
    Route::apiResource('categories', CategoryController::class);
    
    // Settings & System
    Route::get('/settings', [SettingController::class, 'index']);
    Route::post('/settings', [SettingController::class, 'update']);
    Route::post('/settings/upload-logo', [SettingController::class, 'uploadLogo']);
    Route::put('/profile', [UserController::class, 'updateProfile']);
    Route::apiResource('users', UserController::class);
    Route::get('/permissions', [PermissionController::class, 'index']);
    Route::post('/permissions', [PermissionController::class, 'update']);

    // Contact Messages (Admin)
    Route::get('/contact-messages', [ContactMessageController::class, 'index']);
    Route::get('/contact-messages/unread-count', [ContactMessageController::class, 'unreadCount']);
    Route::get('/contact-messages/{contactMessage}', [ContactMessageController::class, 'show']);
    Route::patch('/contact-messages/{contactMessage}/status', [ContactMessageController::class, 'updateStatus']);
    Route::delete('/contact-messages/{contactMessage}', [ContactMessageController::class, 'destroy']);
});
