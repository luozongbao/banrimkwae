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

class RoleController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('permission:roles.view')->only(['index', 'show']);
        $this->middleware('permission:roles.create')->only(['store']);
        $this->middleware('permission:roles.edit')->only(['update']);
        $this->middleware('permission:roles.delete')->only(['destroy']);
    }

    public function index(Request $request): JsonResponse
    {
        $query = Role::with(['permissions', 'users']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }

        $roles = $query->orderBy('name')->get();

        return response()->json([
            'data' => RoleResource::collection($roles),
            'permissions' => Permission::all(['id', 'name']),
        ]);
    }

    public function show(Role $role): JsonResponse
    {
        $role->load(['permissions', 'users']);
        
        return response()->json([
            'data' => new RoleResource($role),
        ]);
    }

    public function store(StoreRoleRequest $request): JsonResponse
    {
        $role = Role::create($request->validated());

        if ($request->filled('permissions')) {
            $role->syncPermissions($request->permissions);
        }

        activity()
            ->performedOn($role)
            ->withProperties(['permissions' => $request->permissions ?? []])
            ->log('Role created');

        $role->load(['permissions', 'users']);

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

        $role->load(['permissions', 'users']);

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
                'message' => 'Default roles cannot be deleted',
            ], 403);
        }

        // Check if role has users
        if ($role->users()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete role that has assigned users',
            ], 403);
        }

        activity()
            ->performedOn($role)
            ->withProperties(['deleted_role' => $role->name])
            ->log('Role deleted');

        $role->delete();

        return response()->json([
            'message' => 'Role deleted successfully',
        ]);
    }
}
