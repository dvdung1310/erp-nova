<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();


        Role::factory()->createMany([
            [
                'name' => 'admin',
                'description' => 'Super Admin',
            ],
            [
                'name' => 'ceo',
                'description' => 'Tổng Giám Đốc',
            ],
            [
                'name' => 'manager',
                'description' => 'Giám đốc',
            ],
            [
                'name' => 'leader',
                'description' => 'Trưởng phòng',
            ],
            [
                'name' => 'employee',
                'description' => 'Nhân viên',
            ],
        ]);
    }
}
