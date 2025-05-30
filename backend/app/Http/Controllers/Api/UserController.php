<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('permission:users.view')->only(['index', 'show']);
        $this->middleware('permission:users.create')->only(['store']);
        $this->middleware('permission:users.edit')->only(['update']);
        $this->middleware('permission:users.delete')->only(['destroy']);
    }

    public function index(Request $request): JsonResponse
    {
        $query = User::with(['roles', 'permissions']);

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%")
                  ->orWhere('department', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by department
        if ($request->filled('department')) {
            $query->where('department', $request->department);
        }

        // Filter by role
        if ($request->filled('role')) {
            $query->role($request->role);
        }

        // Sorting
        $sortField = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        
        $allowedSortFields = ['first_name', 'last_name', 'email', 'department', 'status', 'created_at'];
        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortDirection);
        }

        // Pagination
        $perPage = min($request->get('per_page', 15), 50);
        $users = $query->paginate($perPage);

        return response()->json([
            'data' => UserResource::collection($users->items()),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
            'filters' => [
                'departments' => User::distinct()->pluck('department')->filter()->sort()->values(),
                'roles' => Role::all(['id', 'name']),
            ],
        ]);
    }

    public function show(User $user): JsonResponse
    {
        $user->load(['roles', 'permissions']);
        
        return response()->json([
            'data' => new UserResource($user),
        ]);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $userData = $request->validated();
        
        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            $userData['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        // Hash password
        $userData['password'] = Hash::make($userData['password']);
        
        // Set force password change if specified
        $userData['force_password_change'] = $request->boolean('force_password_change', true);

        $user = User::create($userData);

        // Assign roles
        if ($request->filled('roles')) {
            $user->assignRole($request->roles);
        }

        // Send welcome email if requested
        if ($request->boolean('send_welcome_email')) {
            // TODO: Implement welcome email notification
        }

        // Log activity
        activity()
            ->performedOn($user)
            ->withProperties($request->only(['roles', 'send_welcome_email']))
            ->log('User created');

        $user->load(['roles', 'permissions']);

        return response()->json([
            'message' => 'User created successfully',
            'data' => new UserResource($user),
        ], 201);
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $userData = $request->validated();

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            $userData['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        // Handle password update
        if ($request->filled('password')) {
            $userData['password'] = Hash::make($userData['password']);
        } else {
            unset($userData['password']);
        }

        $user->update($userData);

        // Update roles
        if ($request->filled('roles')) {
            $user->syncRoles($request->roles);
        }

        // Log activity
        activity()
            ->performedOn($user)
            ->withProperties([
                'updated_fields' => array_keys($userData),
                'roles' => $request->roles ?? [],
            ])
            ->log('User updated');

        $user->load(['roles', 'permissions']);

        return response()->json([
            'message' => 'User updated successfully',
            'data' => new UserResource($user),
        ]);
    }

    public function destroy(User $user): JsonResponse
    {
        // Prevent self-deletion
        if ($user->id === auth()->id()) {
            return response()->json([
                'message' => 'You cannot delete your own account',
            ], 403);
        }

        // Prevent deletion of admin users by non-admin users
        if ($user->hasRole('admin') && !auth()->user()->hasRole('admin')) {
            return response()->json([
                'message' => 'You cannot delete admin users',
            ], 403);
        }

        // Delete avatar
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        // Log activity before deletion
        activity()
            ->performedOn($user)
            ->withProperties([
                'deleted_user' => [
                    'name' => $user->full_name,
                    'email' => $user->email,
                    'roles' => $user->getRoleNames(),
                ],
            ])
            ->log('User deleted');

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully',
        ]);
    }

    public function activate(User $user): JsonResponse
    {
        $this->authorize('update', $user);
        
        $user->activate();

        return response()->json([
            'message' => 'User activated successfully',
            'data' => new UserResource($user),
        ]);
    }

    public function deactivate(User $user): JsonResponse
    {
        $this->authorize('update', $user);
        
        // Prevent self-deactivation
        if ($user->id === auth()->id()) {
            return response()->json([
                'message' => 'You cannot deactivate your own account',
            ], 403);
        }

        $user->deactivate();

        return response()->json([
            'message' => 'User deactivated successfully',
            'data' => new UserResource($user),
        ]);
    }

    public function uploadAvatar(Request $request, User $user): JsonResponse
    {
        $this->authorize('update', $user);
        
        $request->validate([
            'avatar' => ['required', 'image', 'max:2048'], // 2MB max
        ]);

        // Delete old avatar
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        // Store new avatar
        $avatarPath = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar' => $avatarPath]);

        return response()->json([
            'message' => 'Avatar uploaded successfully',
            'avatar_url' => $user->avatar_url,
        ]);
    }

    public function removeAvatar(User $user): JsonResponse
    {
        $this->authorize('update', $user);
        
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
            $user->update(['avatar' => null]);
        }

        return response()->json([
            'message' => 'Avatar removed successfully',
            'avatar_url' => $user->avatar_url,
        ]);
    }
}
