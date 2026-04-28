<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate($request->per_page ?? 10);

        return UserResource::collection($users);
    }

    public function store(StoreUserRequest $request)
    {
        $validated = $request->validated();
        $validated['password'] = Hash::make($validated['password']);
        
        $user = User::create($validated);

        return (new UserResource($user))
            ->additional(['message' => 'Akun pengguna berhasil dibuat.']);
    }

    public function show(User $user)
    {
        return new UserResource($user);
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $validated = $request->validated();

        if (empty($validated['password'])) {
            unset($validated['password']);
        } else {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        return (new UserResource($user))
            ->additional(['message' => 'Data pengguna berhasil diperbarui.']);
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Anda tidak bisa menghapus akun sendiri.'], 403);
        }

        $user->delete();

        return response()->json([
            'message' => 'Akun pengguna berhasil dihapus.'
        ]);
    }

    public function updateProfile(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|min:8|confirmed',
        ]);

        if (empty($validated['password'])) {
            unset($validated['password']);
        } else {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'Profil berhasil diperbarui.',
            'user' => new UserResource($user)
        ]);
    }
}
