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
        Schema::create('menus', function (Blueprint $col) {
            $col->id();
            $col->string('label');
            $col->string('url');
            $col->integer('order')->default(0);
            $col->boolean('is_active')->default(true);
            $col->foreignId('parent_id')->nullable()->constrained('menus')->onDelete('cascade');
            $col->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menus');
    }
};
