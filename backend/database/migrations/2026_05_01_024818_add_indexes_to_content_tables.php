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
            $table->index('slug');
            $table->index('status');
            $table->index('published_at');
        });

        Schema::table('agendas', function (Blueprint $table) {
            $table->index('slug');
            $table->index('status');
            $table->index('event_date');
        });

        Schema::table('announcements', function (Blueprint $table) {
            $table->index('slug');
            $table->index('status');
        });

        Schema::table('pages', function (Blueprint $table) {
            $table->index('slug');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropIndex(['slug']);
            $table->dropIndex(['status']);
            $table->dropIndex(['published_at']);
        });

        Schema::table('agendas', function (Blueprint $table) {
            $table->dropIndex(['slug']);
            $table->dropIndex(['status']);
            $table->dropIndex(['event_date']);
        });

        Schema::table('announcements', function (Blueprint $table) {
            $table->dropIndex(['slug']);
            $table->dropIndex(['status']);
        });

        Schema::table('pages', function (Blueprint $table) {
            $table->dropIndex(['slug']);
            $table->dropIndex(['status']);
        });
    }
};
