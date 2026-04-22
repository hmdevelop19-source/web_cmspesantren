<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->unsignedBigInteger('cover_image_id')->nullable()->after('content');
            $table->foreign('cover_image_id')->references('id')->on('media')->nullOnDelete();
        });

        Schema::table('pages', function (Blueprint $table) {
            $table->unsignedBigInteger('image_id')->nullable()->after('content');
            $table->foreign('image_id')->references('id')->on('media')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropForeign(['cover_image_id']);
            $table->dropColumn('cover_image_id');
        });

        Schema::table('pages', function (Blueprint $table) {
            $table->dropForeign(['image_id']);
            $table->dropColumn('image_id');
        });
    }
};
