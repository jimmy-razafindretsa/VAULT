<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Find and fix duplicate names before adding the unique constraint
        $duplicates = DB::table('users')
            ->select('name')
            ->groupBy('name')
            ->havingRaw('COUNT(*) > 1')
            ->get();

        foreach ($duplicates as $duplicate) {
            $users = DB::table('users')->where('name', $duplicate->name)->get();

            // Keep the first one, rename the rest
            $users->shift();

            foreach ($users as $index => $user) {
                // E.g. "Jimmy" becomes "Jimmy2"
                $newName = $user->name.($index + 2);

                // Keep incrementing if the new name somehow already exists
                $counter = $index + 2;
                while (DB::table('users')->where('name', $newName)->exists()) {
                    $counter++;
                    $newName = $user->name.$counter;
                }

                DB::table('users')
                    ->where('id', $user->id)
                    ->update(['name' => $newName]);
            }
        }

        Schema::table('users', function (Blueprint $table) {
            $table->unique('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['name']);
        });
    }
};
