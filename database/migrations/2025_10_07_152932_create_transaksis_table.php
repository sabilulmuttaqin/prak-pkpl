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
        Schema::create('transaksis', function (Blueprint $table) {
            $table->id();
            $table->string('id_transaksi')->unique();
            $table->string('nama');
            $table->string('alamat');
            $table->string('no_telp');
            $table->json('daftar_barang');
            $table->integer('total');
            $table->string('bukti_transfer');
            $table->enum('validate', ['not yet', 'approved', 'rejected'])->default('not yet');


            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaksis');
    }
};
