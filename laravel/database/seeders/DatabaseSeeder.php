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


        $roles = [
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
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role['name']], $role);
        }
        User::firstOrCreate(
            ['email' => 'datkt.novaedu@gmail.com'],
            [
                'name' => 'Khuất Tiến Đạt',
                'password' => bcrypt('123456'),
                'role_id' => 1,
            ]
        );
    }
}
