<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    public function index()
    {
        $permissions = Permission::all();
        
        // Structure data for frontend matrix if needed
        $matrix = [];
        foreach ($permissions as $perm) {
            $matrix[$perm->menu][$perm->role] = $perm->can_access;
        }

        return response()->json([
            'permissions' => $permissions,
            'matrix' => $matrix
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'role' => 'required|string',
            'menu' => 'required|string',
            'can_access' => 'required|boolean',
        ]);

        if ($request->role === 'admin') {
            return response()->json(['message' => 'Izin administrator tidak dapat diubah.'], 403);
        }

        Permission::updateOrCreate(
            ['role' => $request->role, 'menu' => $request->menu],
            ['can_access' => $request->can_access]
        );

        return response()->json([
            'message' => 'Izin akses berhasil diperbarui.'
        ]);
    }
}
