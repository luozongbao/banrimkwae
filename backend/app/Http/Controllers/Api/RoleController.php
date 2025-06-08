<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Role\StoreRoleRequest;
use App\Http\Requests\Role\UpdateRoleRequest;
use App\Http\Resources\RoleResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RoleController extends Controller
{
    // Middleware is handled in routes

    public function index(Request $request): JsonResponse
    {
        $query = Role::with(['permissions']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }

        $roles = $query->orderBy('name')->get();

        // Add users count to each role
        $roles->each(function ($role) {
            $role->users_count = \DB::table('model_has_roles')
                ->where('role_id', $role->id)
                ->where('model_type', 'App\\Models\\User')
                ->count();
        });

        return response()->json([
            'data' => RoleResource::collection($roles),
            'permissions' => Permission::all(['id', 'name']),
        ]);
    }

    public function show(Role $role): JsonResponse
    {
        $role->load(['permissions']);
        
        // Manually get users to avoid relationship issues
        $users = \DB::table('model_has_roles')
            ->join('users', 'model_has_roles.model_id', '=', 'users.id')
            ->where('model_has_roles.role_id', $role->id)
            ->where('model_has_roles.model_type', 'App\\Models\\User')
            ->select('users.id', 'users.first_name', 'users.last_name', 'users.email')
            ->get();
        
        return response()->json([
            'data' => array_merge((new RoleResource($role))->toArray(request()), [
                'users' => $users
            ]),
        ]);
    }

    public function store(StoreRoleRequest $request): JsonResponse
    {
        $data = $request->validated();
        
        // Set the guard based on the current authentication guard
        if (!isset($data['guard_name'])) {
            // For API routes, default to 'api' guard name for compatibility with permissions
            $data['guard_name'] = 'api';
        }
        
        $role = Role::create($data);

        if ($request->filled('permissions')) {
            $role->syncPermissions($request->permissions);
        }

        activity()
            ->performedOn($role)
            ->withProperties(['permissions' => $request->permissions ?? []])
            ->log('Role created');

        $role->load(['permissions']);

        return response()->json([
            'message' => 'Role created successfully',
            'data' => new RoleResource($role),
        ], 201);
    }

    public function update(UpdateRoleRequest $request, Role $role): JsonResponse
    {
        // Prevent modification of default roles
        if (in_array($role->name, ['admin', 'manager', 'staff'])) {
            return response()->json([
                'message' => 'Default roles cannot be modified',
            ], 403);
        }

        $role->update($request->validated());

        if ($request->filled('permissions')) {
            $role->syncPermissions($request->permissions);
        }

        activity()
            ->performedOn($role)
            ->withProperties(['permissions' => $request->permissions ?? []])
            ->log('Role updated');

        $role->load(['permissions']);

        return response()->json([
            'message' => 'Role updated successfully',
            'data' => new RoleResource($role),
        ]);
    }

    public function destroy(Role $role): JsonResponse
    {
        // Prevent deletion of default roles
        if (in_array($role->name, ['admin', 'manager', 'staff', 'guest'])) {
            return response()->json([
                'message' => 'Cannot delete system role',
            ], 403);
        }

        // Check if role has users using the model_has_roles table directly
        $usersCount = \DB::table('model_has_roles')
            ->where('role_id', $role->id)
            ->count();
        
        if ($usersCount > 0) {
            return response()->json([
                'message' => 'Cannot delete role that has assigned users',
            ], 403);
        }

        activity()
            ->performedOn($role)
            ->withProperties(['deleted_role' => $role->name])
            ->log('Role deleted');

        // Delete without triggering model events to avoid relationship issues
        $role->deleteQuietly();

        return response()->json([], 204);
    }

    /**
     * Get all permissions, optionally grouped by category
     */
    public function permissions(Request $request): JsonResponse
    {
        $grouped = $request->boolean('grouped', false);
        
        $permissions = Permission::all();
        
        if ($grouped) {
            // Group permissions by their prefix (e.g., 'users.view' -> 'users')
            $grouped = $permissions->groupBy(function ($permission) {
                return explode('.', $permission->name)[0];
            });
            
            return response()->json([
                'data' => $grouped->toArray()
            ]);
        }
        
        // Add group field to each permission
        $permissionsWithGroup = $permissions->map(function ($permission) {
            return [
                'id' => $permission->id,
                'name' => $permission->name,
                'group' => explode('.', $permission->name)[0],
                'guard_name' => $permission->guard_name,
                'created_at' => $permission->created_at,
                'updated_at' => $permission->updated_at,
            ];
        });
        
        return response()->json([
            'data' => $permissionsWithGroup->toArray()
        ]);
    }

    /**
     * Assign users to a role
     */
    public function assignUsers(Request $request, Role $role): JsonResponse
    {
        $request->validate([
            'user_ids' => ['required', 'array'],
            'user_ids.*' => ['integer', 'exists:users,id'],
        ]);

        $users = User::whereIn('id', $request->user_ids)->get();
        
        foreach ($users as $user) {
            $user->assignRole($role);
        }

        activity()
            ->performedOn($role)
            ->withProperties(['assigned_users' => $request->user_ids])
            ->log('Users assigned to role');

        return response()->json([
            'message' => 'Users assigned to role successfully',
        ]);
    }

    /**
     * Remove users from a role
     */
    public function removeUsers(Request $request, Role $role): JsonResponse
    {
        $request->validate([
            'user_ids' => ['required', 'array'],
            'user_ids.*' => ['integer', 'exists:users,id'],
        ]);

        $users = User::whereIn('id', $request->user_ids)->get();
        
        foreach ($users as $user) {
            $user->removeRole($role);
        }

        activity()
            ->performedOn($role)
            ->withProperties(['removed_users' => $request->user_ids])
            ->log('Users removed from role');

        return response()->json([
            'message' => 'Users removed from role successfully',
        ]);
    }

    /**
     * Clone a role with a new name
     */
    public function clone(Request $request, Role $role): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles,name'],
        ]);

        $clonedRole = Role::create([
            'name' => $request->name,
            'guard_name' => $role->guard_name,
        ]);

        // Copy all permissions from the original role
        $clonedRole->syncPermissions($role->permissions);

        activity()
            ->performedOn($clonedRole)
            ->withProperties([
                'original_role' => $role->name,
                'cloned_role' => $clonedRole->name,
                'permissions_count' => $role->permissions->count()
            ])
            ->log('Role cloned');

        $clonedRole->load(['permissions']);

        return response()->json([
            'message' => 'Role cloned successfully',
            'data' => new RoleResource($clonedRole),
        ], 201);
    }
}
