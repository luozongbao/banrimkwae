# Issue #05: API Controllers and Routes for User Management

## Title
Create REST API Controllers and Routes for User and Role Management

## Priority
**High** - Required for frontend integration

## Estimated Time
4-5 hours

## Description
Implement complete REST API controllers for user management, role management, and system settings with proper validation, authorization, and error handling.

## Acceptance Criteria
- [ ] User management API endpoints implemented
- [ ] Role management API endpoints implemented
- [ ] Settings management API endpoints implemented
- [ ] Proper validation and authorization implemented
- [ ] API resource transformers created
- [ ] Error handling and logging implemented
- [ ] API tests created

## Implementation Details

### 1. User Management Controller

#### User Controller
```php
<?php
// app/Http/Controllers/Api/UserController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Http\Resources\UserCollection;
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
```

### 2. Role Management Controller

#### Role Controller
```php
<?php
// app/Http/Controllers/Api/RoleController.php

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
```

### 3. Settings Controller

#### Settings Controller
```php
<?php
// app/Http/Controllers/Api/SettingController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Setting\UpdateSettingsRequest;
use App\Http\Resources\SettingResource;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SettingController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('permission:settings.view')->only(['index', 'show', 'public']);
        $this->middleware('permission:settings.edit')->only(['update', 'updateBatch']);
    }

    public function index(Request $request): JsonResponse
    {
        $category = $request->get('category');
        $group = $request->get('group');

        $query = Setting::query();

        if ($category) {
            $query->byCategory($category);
        }

        if ($group) {
            $query->byGroup($group);
        }

        $settings = $query->ordered()->get();

        $grouped = $settings->groupBy('category');

        return response()->json([
            'data' => $grouped->map(function ($categorySettings) {
                return SettingResource::collection($categorySettings);
            }),
            'categories' => Setting::distinct()->pluck('category')->sort()->values(),
            'groups' => Setting::distinct()->whereNotNull('group')->pluck('group')->sort()->values(),
        ]);
    }

    public function show(Setting $setting): JsonResponse
    {
        return response()->json([
            'data' => new SettingResource($setting),
        ]);
    }

    public function public(): JsonResponse
    {
        $settings = Setting::getPublic();

        return response()->json([
            'data' => $settings,
        ]);
    }

    public function update(UpdateSettingsRequest $request, Setting $setting): JsonResponse
    {
        if (!$setting->is_editable) {
            return response()->json([
                'message' => 'This setting is not editable',
            ], 403);
        }

        $value = $request->value;

        // Validate value against rules if specified
        if ($setting->validation_rules && !$setting->validateValue($value)) {
            return response()->json([
                'message' => 'Invalid value for this setting',
                'errors' => ['value' => ['The value does not meet the validation requirements']],
            ], 422);
        }

        $oldValue = $setting->getCastedValue();
        $setting->setValue($value)->save();

        activity()
            ->performedOn($setting)
            ->withProperties([
                'key' => $setting->key,
                'old_value' => $oldValue,
                'new_value' => $setting->getCastedValue(),
            ])
            ->log('Setting updated');

        return response()->json([
            'message' => 'Setting updated successfully',
            'data' => new SettingResource($setting),
        ]);
    }

    public function updateBatch(Request $request): JsonResponse
    {
        $request->validate([
            'settings' => ['required', 'array'],
            'settings.*.key' => ['required', 'string', 'exists:settings,key'],
            'settings.*.value' => ['required'],
        ]);

        $updated = [];
        $errors = [];

        foreach ($request->settings as $settingData) {
            $setting = Setting::where('key', $settingData['key'])->first();

            if (!$setting->is_editable) {
                $errors[] = "Setting '{$setting->key}' is not editable";
                continue;
            }

            if ($setting->validation_rules && !$setting->validateValue($settingData['value'])) {
                $errors[] = "Invalid value for setting '{$setting->key}'";
                continue;
            }

            $oldValue = $setting->getCastedValue();
            $setting->setValue($settingData['value'])->save();

            $updated[] = [
                'key' => $setting->key,
                'old_value' => $oldValue,
                'new_value' => $setting->getCastedValue(),
            ];
        }

        if (!empty($updated)) {
            activity()
                ->withProperties(['updated_settings' => $updated])
                ->log('Settings batch updated');
        }

        return response()->json([
            'message' => 'Settings updated successfully',
            'updated' => count($updated),
            'errors' => $errors,
        ]);
    }
}
```

### 4. API Resources

#### User Resource
```php
<?php
// app/Http/Resources/UserResource.php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => $this->full_name,
            'initials' => $this->initials,
            'email' => $this->email,
            'username' => $this->username,
            'phone' => $this->phone,
            'department' => $this->department,
            'position' => $this->position,
            'avatar' => $this->avatar,
            'avatar_url' => $this->avatar_url,
            'status' => $this->status,
            'is_active' => $this->is_active,
            'start_date' => $this->start_date?->toDateString(),
            'end_date' => $this->end_date?->toDateString(),
            'last_login_at' => $this->last_login_at,
            'email_verified_at' => $this->email_verified_at,
            'force_password_change' => $this->force_password_change,
            'roles' => $this->whenLoaded('roles', function () {
                return $this->roles->map(function ($role) {
                    return [
                        'id' => $role->id,
                        'name' => $role->name,
                        'guard_name' => $role->guard_name,
                    ];
                });
            }),
            'permissions' => $this->whenLoaded('permissions', function () {
                return $this->getAllPermissions()->map(function ($permission) {
                    return [
                        'id' => $permission->id,
                        'name' => $permission->name,
                        'guard_name' => $permission->guard_name,
                    ];
                });
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
```

#### Role Resource
```php
<?php
// app/Http/Resources/RoleResource.php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class RoleResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'guard_name' => $this->guard_name,
            'users_count' => $this->whenLoaded('users', function () {
                return $this->users->count();
            }),
            'permissions' => $this->whenLoaded('permissions', function () {
                return $this->permissions->map(function ($permission) {
                    return [
                        'id' => $permission->id,
                        'name' => $permission->name,
                        'guard_name' => $permission->guard_name,
                    ];
                });
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
```

#### Setting Resource
```php
<?php
// app/Http/Resources/SettingResource.php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SettingResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'key' => $this->key,
            'value' => $this->getCastedValue(),
            'raw_value' => $this->value,
            'type' => $this->type,
            'category' => $this->category,
            'group' => $this->group,
            'description' => $this->description,
            'is_public' => $this->is_public,
            'is_editable' => $this->is_editable,
            'validation_rules' => $this->validation_rules,
            'sort_order' => $this->sort_order,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
```

### 5. Form Requests

#### Store User Request
```php
<?php
// app/Http/Requests/User/StoreUserRequest.php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('users.create');
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'username' => ['nullable', 'string', 'max:255', 'unique:users', 'alpha_dash'],
            'phone' => ['nullable', 'string', 'max:20'],
            'department' => ['nullable', 'string', 'max:255'],
            'position' => ['nullable', 'string', 'max:255'],
            'password' => ['required', 'string', Password::defaults()],
            'avatar' => ['nullable', 'image', 'max:2048'],
            'status' => ['sometimes', 'in:active,inactive'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after:start_date'],
            'roles' => ['sometimes', 'array'],
            'roles.*' => ['string', 'exists:roles,name'],
            'force_password_change' => ['sometimes', 'boolean'],
            'send_welcome_email' => ['sometimes', 'boolean'],
        ];
    }
}
```

#### Update User Request
```php
<?php
// app/Http/Requests/User/UpdateUserRequest.php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('users.edit');
    }

    public function rules(): array
    {
        $userId = $this->route('user')->id;

        return [
            'first_name' => ['sometimes', 'string', 'max:255'],
            'last_name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'string', 'email', 'max:255', Rule::unique('users')->ignore($userId)],
            'username' => ['nullable', 'string', 'max:255', Rule::unique('users')->ignore($userId), 'alpha_dash'],
            'phone' => ['nullable', 'string', 'max:20'],
            'department' => ['nullable', 'string', 'max:255'],
            'position' => ['nullable', 'string', 'max:255'],
            'password' => ['nullable', 'string', Password::defaults()],
            'avatar' => ['nullable', 'image', 'max:2048'],
            'status' => ['sometimes', 'in:active,inactive,suspended'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after:start_date'],
            'roles' => ['sometimes', 'array'],
            'roles.*' => ['string', 'exists:roles,name'],
            'force_password_change' => ['sometimes', 'boolean'],
        ];
    }
}
```

### 6. API Routes

#### User Management Routes
```php
<?php
// routes/api.php (additional routes)

use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\SettingController;

// Protected routes
Route::middleware(['auth:sanctum', 'force.password.change'])->group(function () {
    
    // User Management
    Route::apiResource('users', UserController::class);
    Route::patch('users/{user}/activate', [UserController::class, 'activate'])->name('users.activate');
    Route::patch('users/{user}/deactivate', [UserController::class, 'deactivate'])->name('users.deactivate');
    Route::post('users/{user}/avatar', [UserController::class, 'uploadAvatar'])->name('users.upload-avatar');
    Route::delete('users/{user}/avatar', [UserController::class, 'removeAvatar'])->name('users.remove-avatar');

    // Role Management
    Route::apiResource('roles', RoleController::class);

    // Settings Management
    Route::get('settings/public', [SettingController::class, 'public'])->name('settings.public');
    Route::apiResource('settings', SettingController::class)->except(['store', 'destroy']);
    Route::patch('settings/batch', [SettingController::class, 'updateBatch'])->name('settings.batch-update');
});
```

## Commands to Run
```bash
# Create controllers
php artisan make:controller Api/UserController --api
php artisan make:controller Api/RoleController --api
php artisan make:controller Api/SettingController --api

# Create form requests
php artisan make:request User/StoreUserRequest
php artisan make:request User/UpdateUserRequest
php artisan make:request Role/StoreRoleRequest
php artisan make:request Role/UpdateRoleRequest
php artisan make:request Setting/UpdateSettingsRequest

# Create resources
php artisan make:resource UserResource
php artisan make:resource RoleResource
php artisan make:resource SettingResource

# Create storage link for file uploads
php artisan storage:link

# Run tests
php artisan test --filter UserControllerTest
php artisan test --filter RoleControllerTest
php artisan test --filter SettingControllerTest
```

## Testing Criteria
- [ ] All CRUD operations work correctly
- [ ] Proper validation and authorization
- [ ] File upload functionality works
- [ ] Pagination and filtering work
- [ ] API resources format data correctly
- [ ] Error handling works properly
- [ ] Activity logging functions correctly
- [ ] All tests pass

## Dependencies
- Issue #04: Authentication System Implementation

## Related Issues
- #06: Frontend Authentication Implementation
- #07: User Management Frontend Components

## Files to Create/Modify
- `app/Http/Controllers/Api/` - API controllers
- `app/Http/Requests/` - Form request classes
- `app/Http/Resources/` - API resource classes
- `routes/api.php` - API routes
- `tests/Feature/Api/` - API controller tests
