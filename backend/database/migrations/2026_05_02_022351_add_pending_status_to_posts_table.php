<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Using raw SQL because changing enum columns can be tricky with standard migrations
        DB::statement("ALTER TABLE posts MODIFY COLUMN status ENUM('published', 'draft', 'pending') NOT NULL DEFAULT 'draft'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE posts MODIFY COLUMN status ENUM('published', 'draft') NOT NULL DEFAULT 'draft'");
    }
};
