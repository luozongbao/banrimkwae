# Issue #01: Mobile App Core Architecture and Framework

## Overview
Establish the core architecture and cross-platform framework foundation for both Guest and Staff mobile applications using Flutter, with comprehensive authentication, state management, and offline capabilities.

## Priority
**Critical** - Foundation for all subsequent mobile features

## Estimated Timeline
**6 days** (Week 1 of Phase 6)

## Requirements

### 1.1 Cross-Platform Framework Setup
- **Flutter Framework**: Latest stable version with cross-platform support
- **Platform Support**: iOS 12+ and Android 8.0+
- **Screen Responsiveness**: Phone and tablet optimization
- **Performance**: Native-like performance with smooth animations
- **Architecture Pattern**: Clean Architecture with BLoC state management

### 1.2 Authentication & Security
- **Multi-Authentication**: Email/password, biometric, social login
- **Role-Based Access**: Guest and Staff role differentiation
- **Token Management**: JWT token handling with refresh logic
- **Session Security**: Secure session management with timeout
- **Device Security**: Device registration and remote logout

### 1.3 Offline Capabilities
- **Data Caching**: Intelligent local data storage
- **Offline Mode**: Essential features work without internet
- **Data Synchronization**: Background sync with conflict resolution
- **Cache Management**: Automatic cache invalidation and cleanup

### 1.4 State Management
- **BLoC Pattern**: Business Logic Component architecture
- **State Persistence**: User preferences and session state
- **Error Handling**: Comprehensive error state management
- **Loading States**: Progressive loading with skeleton screens

## Technical Specifications

### 1.5 Database Schema

#### Mobile Authentication Tables
```sql
-- Mobile app sessions
CREATE TABLE mobile_sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    device_type ENUM('ios', 'android') NOT NULL,
    device_model VARCHAR(255),
    os_version VARCHAR(50),
    app_version VARCHAR(50) NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_device (user_id, device_id),
    INDEX idx_token_expiry (expires_at),
    INDEX idx_last_activity (last_activity),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Device registrations for push notifications
CREATE TABLE mobile_devices (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    device_id VARCHAR(255) UNIQUE NOT NULL,
    push_token VARCHAR(512),
    device_type ENUM('ios', 'android') NOT NULL,
    device_model VARCHAR(255),
    os_version VARCHAR(50),
    app_version VARCHAR(50) NOT NULL,
    timezone VARCHAR(100),
    language VARCHAR(10) DEFAULT 'en',
    notification_enabled BOOLEAN DEFAULT TRUE,
    biometric_enabled BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_device (user_id),
    INDEX idx_push_token (push_token),
    INDEX idx_last_seen (last_seen),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Mobile app cache management
CREATE TABLE mobile_cache_management (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    cache_key VARCHAR(255) UNIQUE NOT NULL,
    data_type VARCHAR(100) NOT NULL,
    version_hash VARCHAR(64) NOT NULL,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cache_key (cache_key),
    INDEX idx_data_type (data_type),
    INDEX idx_expires (expires_at)
);

-- Mobile app configurations
CREATE TABLE mobile_app_configs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    config_key VARCHAR(255) UNIQUE NOT NULL,
    config_value JSON NOT NULL,
    platform ENUM('ios', 'android', 'both') DEFAULT 'both',
    min_app_version VARCHAR(50),
    max_app_version VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_config_key (config_key),
    INDEX idx_platform (platform),
    INDEX idx_active (is_active)
);

-- API usage tracking for mobile
CREATE TABLE mobile_api_usage (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    device_id VARCHAR(255),
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    response_time_ms INT,
    status_code INT NOT NULL,
    error_message TEXT,
    request_size_bytes INT,
    response_size_bytes INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_endpoint (user_id, endpoint),
    INDEX idx_device_endpoint (device_id, endpoint),
    INDEX idx_created_at (created_at),
    INDEX idx_status_code (status_code),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

### 1.6 Backend Implementation (Laravel)

#### Authentication Service
```php
<?php

namespace App\Services\Mobile;

use App\Models\User;
use App\Models\MobileSession;
use App\Models\MobileDevice;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class MobileAuthService
{
    public function authenticateUser($credentials, $deviceInfo)
    {
        try {
            DB::beginTransaction();
            
            $user = User::where('email', $credentials['email'])->first();
            
            if (!$user || !Hash::check($credentials['password'], $user->password)) {
                throw new \Exception('Invalid credentials');
            }
            
            // Register or update device
            $device = $this->registerDevice($user->id, $deviceInfo);
            
            // Create mobile session
            $session = $this->createMobileSession($user, $device);
            
            DB::commit();
            
            return [
                'user' => $user->makeHidden(['password']),
                'access_token' => $session->access_token,
                'refresh_token' => $session->refresh_token,
                'expires_at' => $session->expires_at,
                'device_id' => $device->device_id
            ];
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
    
    public function refreshToken($refreshToken, $deviceId)
    {
        $session = MobileSession::where('refresh_token', $refreshToken)
            ->where('device_id', $deviceId)
            ->where('is_active', true)
            ->first();
            
        if (!$session || $session->expires_at < now()) {
            throw new \Exception('Invalid refresh token');
        }
        
        $newTokens = $this->generateTokens($session->user);
        
        $session->update([
            'access_token' => $newTokens['access_token'],
            'refresh_token' => $newTokens['refresh_token'],
            'expires_at' => now()->addDays(30),
            'last_activity' => now()
        ]);
        
        return $newTokens;
    }
    
    public function biometricAuth($userId, $deviceId, $biometricData)
    {
        $device = MobileDevice::where('user_id', $userId)
            ->where('device_id', $deviceId)
            ->where('biometric_enabled', true)
            ->first();
            
        if (!$device) {
            throw new \Exception('Biometric authentication not enabled');
        }
        
        // Verify biometric data with stored hash
        if (!$this->verifyBiometricData($device, $biometricData)) {
            throw new \Exception('Biometric verification failed');
        }
        
        $user = User::find($userId);
        $session = $this->createMobileSession($user, $device);
        
        return [
            'access_token' => $session->access_token,
            'expires_at' => $session->expires_at
        ];
    }
    
    public function socialLogin($provider, $socialToken, $deviceInfo)
    {
        $socialUser = $this->validateSocialToken($provider, $socialToken);
        
        $user = User::where('email', $socialUser->email)->first();
        
        if (!$user) {
            $user = User::create([
                'name' => $socialUser->name,
                'email' => $socialUser->email,
                'role' => 'guest',
                'email_verified_at' => now(),
                'social_provider' => $provider,
                'social_id' => $socialUser->id
            ]);
        }
        
        $device = $this->registerDevice($user->id, $deviceInfo);
        $session = $this->createMobileSession($user, $device);
        
        return [
            'user' => $user->makeHidden(['password']),
            'access_token' => $session->access_token,
            'refresh_token' => $session->refresh_token,
            'expires_at' => $session->expires_at,
            'device_id' => $device->device_id
        ];
    }
    
    public function logout($userId, $deviceId)
    {
        MobileSession::where('user_id', $userId)
            ->where('device_id', $deviceId)
            ->update(['is_active' => false]);
            
        return ['message' => 'Logged out successfully'];
    }
    
    public function logoutAllDevices($userId)
    {
        MobileSession::where('user_id', $userId)
            ->update(['is_active' => false]);
            
        return ['message' => 'Logged out from all devices'];
    }
    
    private function registerDevice($userId, $deviceInfo)
    {
        return MobileDevice::updateOrCreate(
            [
                'user_id' => $userId,
                'device_id' => $deviceInfo['device_id']
            ],
            [
                'push_token' => $deviceInfo['push_token'] ?? null,
                'device_type' => $deviceInfo['device_type'],
                'device_model' => $deviceInfo['device_model'] ?? null,
                'os_version' => $deviceInfo['os_version'] ?? null,
                'app_version' => $deviceInfo['app_version'],
                'timezone' => $deviceInfo['timezone'] ?? 'UTC',
                'language' => $deviceInfo['language'] ?? 'en',
                'last_seen' => now()
            ]
        );
    }
    
    private function createMobileSession($user, $device)
    {
        $tokens = $this->generateTokens($user);
        
        return MobileSession::create([
            'user_id' => $user->id,
            'device_id' => $device->device_id,
            'device_type' => $device->device_type,
            'device_model' => $device->device_model,
            'os_version' => $device->os_version,
            'app_version' => $device->app_version,
            'access_token' => $tokens['access_token'],
            'refresh_token' => $tokens['refresh_token'],
            'expires_at' => now()->addDays(30),
            'last_activity' => now()
        ]);
    }
    
    private function generateTokens($user)
    {
        $payload = [
            'user_id' => $user->id,
            'role' => $user->role,
            'iat' => time(),
            'exp' => time() + (24 * 60 * 60) // 24 hours for access token
        ];
        
        $accessToken = JWT::encode($payload, config('app.jwt_secret'), 'HS256');
        
        $refreshPayload = [
            'user_id' => $user->id,
            'type' => 'refresh',
            'iat' => time(),
            'exp' => time() + (30 * 24 * 60 * 60) // 30 days for refresh token
        ];
        
        $refreshToken = JWT::encode($refreshPayload, config('app.jwt_secret'), 'HS256');
        
        return [
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken
        ];
    }
}
```

#### Mobile Cache Service
```php
<?php

namespace App\Services\Mobile;

use App\Models\MobileCacheManagement;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class MobileCacheService
{
    public function getCacheData($cacheKey, $version = null)
    {
        $cacheInfo = MobileCacheManagement::where('cache_key', $cacheKey)->first();
        
        if (!$cacheInfo || ($cacheInfo->expires_at && $cacheInfo->expires_at < now())) {
            return null;
        }
        
        if ($version && $cacheInfo->version_hash !== $version) {
            return ['needs_update' => true, 'version' => $cacheInfo->version_hash];
        }
        
        $data = Cache::get($cacheKey);
        
        return [
            'data' => $data,
            'version' => $cacheInfo->version_hash,
            'expires_at' => $cacheInfo->expires_at
        ];
    }
    
    public function setCacheData($cacheKey, $data, $dataType, $expiresInHours = 24)
    {
        $versionHash = hash('sha256', serialize($data) . time());
        
        MobileCacheManagement::updateOrCreate(
            ['cache_key' => $cacheKey],
            [
                'data_type' => $dataType,
                'version_hash' => $versionHash,
                'expires_at' => now()->addHours($expiresInHours)
            ]
        );
        
        Cache::put($cacheKey, $data, now()->addHours($expiresInHours));
        
        return $versionHash;
    }
    
    public function invalidateCache($cacheKey = null)
    {
        if ($cacheKey) {
            Cache::forget($cacheKey);
            MobileCacheManagement::where('cache_key', $cacheKey)->delete();
        } else {
            Cache::flush();
            MobileCacheManagement::truncate();
        }
    }
    
    public function getAppConfig($platform, $appVersion)
    {
        $configs = MobileCacheManagement::where('config_key', 'LIKE', 'app_config_%')
            ->where(function($query) use ($platform) {
                $query->where('platform', $platform)
                      ->orWhere('platform', 'both');
            })
            ->where('is_active', true)
            ->get();
            
        return $configs->mapWithKeys(function($config) {
            return [str_replace('app_config_', '', $config->config_key) => $config->config_value];
        });
    }
}
```

### 1.7 Flutter Implementation

#### Main App Architecture
```dart
// lib/main.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:get_it/get_it.dart';
import 'core/injection/injection_container.dart' as di;
import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/presentation/bloc/auth_bloc.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await di.init();
  runApp(BanrimkwaeApp());
}

class BanrimkwaeApp extends StatelessWidget {
  final AppRouter _appRouter = GetIt.instance<AppRouter>();

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (_) => GetIt.instance<AuthBloc>()),
      ],
      child: MaterialApp.router(
        title: 'Banrimkwae Resort',
        theme: AppTheme.lightTheme,
        routerConfig: _appRouter.router,
        localizationsDelegates: [
          // Localization delegates
        ],
        supportedLocales: [
          Locale('en', 'US'),
          Locale('th', 'TH'),
        ],
      ),
    );
  }
}
```

#### Authentication BLoC
```dart
// lib/features/auth/presentation/bloc/auth_bloc.dart
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../domain/entities/user.dart';
import '../../domain/usecases/login_usecase.dart';
import '../../domain/usecases/biometric_auth_usecase.dart';
import '../../domain/usecases/logout_usecase.dart';

// Events
abstract class AuthEvent extends Equatable {
  const AuthEvent();
  @override
  List<Object> get props => [];
}

class LoginRequested extends AuthEvent {
  final String email;
  final String password;
  final bool rememberMe;
  
  const LoginRequested({
    required this.email,
    required this.password,
    this.rememberMe = false,
  });
  
  @override
  List<Object> get props => [email, password, rememberMe];
}

class BiometricLoginRequested extends AuthEvent {}

class SocialLoginRequested extends AuthEvent {
  final String provider;
  
  const SocialLoginRequested({required this.provider});
  
  @override
  List<Object> get props => [provider];
}

class LogoutRequested extends AuthEvent {}

class TokenRefreshRequested extends AuthEvent {}

// States
abstract class AuthState extends Equatable {
  const AuthState();
  @override
  List<Object?> get props => [];
}

class AuthInitial extends AuthState {}

class AuthLoading extends AuthState {}

class AuthAuthenticated extends AuthState {
  final User user;
  final String accessToken;
  
  const AuthAuthenticated({
    required this.user,
    required this.accessToken,
  });
  
  @override
  List<Object> get props => [user, accessToken];
}

class AuthUnauthenticated extends AuthState {}

class AuthError extends AuthState {
  final String message;
  
  const AuthError({required this.message});
  
  @override
  List<Object> get props => [message];
}

// BLoC
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final LoginUseCase _loginUseCase;
  final BiometricAuthUseCase _biometricAuthUseCase;
  final LogoutUseCase _logoutUseCase;
  
  AuthBloc({
    required LoginUseCase loginUseCase,
    required BiometricAuthUseCase biometricAuthUseCase,
    required LogoutUseCase logoutUseCase,
  }) : _loginUseCase = loginUseCase,
       _biometricAuthUseCase = biometricAuthUseCase,
       _logoutUseCase = logoutUseCase,
       super(AuthInitial()) {
    
    on<LoginRequested>(_onLoginRequested);
    on<BiometricLoginRequested>(_onBiometricLoginRequested);
    on<LogoutRequested>(_onLogoutRequested);
    on<TokenRefreshRequested>(_onTokenRefreshRequested);
  }
  
  Future<void> _onLoginRequested(
    LoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    
    final result = await _loginUseCase(LoginParams(
      email: event.email,
      password: event.password,
      rememberMe: event.rememberMe,
    ));
    
    result.fold(
      (failure) => emit(AuthError(message: failure.message)),
      (authResult) => emit(AuthAuthenticated(
        user: authResult.user,
        accessToken: authResult.accessToken,
      )),
    );
  }
  
  Future<void> _onBiometricLoginRequested(
    BiometricLoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    
    final result = await _biometricAuthUseCase(NoParams());
    
    result.fold(
      (failure) => emit(AuthError(message: failure.message)),
      (authResult) => emit(AuthAuthenticated(
        user: authResult.user,
        accessToken: authResult.accessToken,
      )),
    );
  }
  
  Future<void> _onLogoutRequested(
    LogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    await _logoutUseCase(NoParams());
    emit(AuthUnauthenticated());
  }
}
```

#### Offline Storage Service
```dart
// lib/core/services/offline_storage_service.dart
import 'dart:convert';
import 'package:hive/hive.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

class OfflineStorageService {
  static const String _userDataBox = 'user_data';
  static const String _cacheBox = 'cache_data';
  static const String _syncQueueBox = 'sync_queue';
  
  late Box _userBox;
  late Box _cacheBox;
  late Box _syncBox;
  
  Future<void> init() async {
    _userBox = await Hive.openBox(_userDataBox);
    _cacheBox = await Hive.openBox(_cacheBox);
    _syncBox = await Hive.openBox(_syncQueueBox);
  }
  
  // User Data Storage
  Future<void> storeUserData(String key, dynamic data) async {
    await _userBox.put(key, jsonEncode(data));
  }
  
  T? getUserData<T>(String key, T Function(Map<String, dynamic>) fromJson) {
    final data = _userBox.get(key);
    if (data != null) {
      return fromJson(jsonDecode(data));
    }
    return null;
  }
  
  // Cache Management
  Future<void> cacheData(String key, dynamic data, {Duration? expiry}) async {
    final cacheItem = {
      'data': data,
      'timestamp': DateTime.now().millisecondsSinceEpoch,
      'expiry': expiry?.inMilliseconds,
    };
    await _cacheBox.put(key, jsonEncode(cacheItem));
  }
  
  T? getCachedData<T>(String key, T Function(dynamic) fromJson) {
    final cached = _cacheBox.get(key);
    if (cached != null) {
      final cacheItem = jsonDecode(cached);
      final timestamp = cacheItem['timestamp'] as int;
      final expiry = cacheItem['expiry'] as int?;
      
      if (expiry == null || 
          DateTime.now().millisecondsSinceEpoch - timestamp < expiry) {
        return fromJson(cacheItem['data']);
      }
    }
    return null;
  }
  
  // Sync Queue Management
  Future<void> addToSyncQueue(Map<String, dynamic> operation) async {
    final operations = getSyncQueue();
    operations.add({
      ...operation,
      'timestamp': DateTime.now().millisecondsSinceEpoch,
      'id': DateTime.now().millisecondsSinceEpoch.toString(),
    });
    await _syncBox.put('pending_operations', jsonEncode(operations));
  }
  
  List<Map<String, dynamic>> getSyncQueue() {
    final data = _syncBox.get('pending_operations');
    if (data != null) {
      return List<Map<String, dynamic>>.from(jsonDecode(data));
    }
    return [];
  }
  
  Future<void> clearSyncQueue() async {
    await _syncBox.delete('pending_operations');
  }
  
  Future<void> removeFromSyncQueue(String operationId) async {
    final operations = getSyncQueue();
    operations.removeWhere((op) => op['id'] == operationId);
    await _syncBox.put('pending_operations', jsonEncode(operations));
  }
  
  // Connectivity-based sync
  Future<void> syncWhenOnline() async {
    final connectivityResult = await Connectivity().checkConnectivity();
    if (connectivityResult != ConnectivityResult.none) {
      await _processSyncQueue();
    }
  }
  
  Future<void> _processSyncQueue() async {
    final operations = getSyncQueue();
    for (final operation in operations) {
      try {
        // Process each operation
        await _processOperation(operation);
        await removeFromSyncQueue(operation['id']);
      } catch (e) {
        // Log error and continue with next operation
        print('Sync error for operation ${operation['id']}: $e');
      }
    }
  }
  
  Future<void> _processOperation(Map<String, dynamic> operation) async {
    // Implementation depends on operation type
    switch (operation['type']) {
      case 'booking':
        // Process booking sync
        break;
      case 'order':
        // Process order sync
        break;
      case 'profile_update':
        // Process profile update sync
        break;
    }
  }
}
```

## Implementation Phases

### Phase 1: Core Framework Setup (Days 1-2)
- Flutter project initialization with clean architecture
- Dependency injection setup with GetIt
- Basic routing with GoRouter
- Theme and design system implementation
- Platform-specific configuration (iOS/Android)

### Phase 2: Authentication System (Days 3-4)
- JWT token management implementation
- Biometric authentication integration
- Social login setup (Google, Facebook, Apple)
- Role-based access control
- Secure storage implementation

### Phase 3: Offline & Caching (Days 5-6)
- Hive database setup for offline storage
- Cache management system
- Sync queue implementation
- Connectivity monitoring
- Background sync service

## Quality Assurance

### Testing Requirements
- **Unit Tests**: 90%+ coverage for business logic
- **Widget Tests**: All UI components tested
- **Integration Tests**: Authentication and sync flows
- **Platform Tests**: iOS and Android compatibility
- **Performance Tests**: Memory usage and battery optimization

### Security Validation
- **Token Security**: JWT handling and refresh logic
- **Biometric Security**: Secure enclave usage
- **Data Encryption**: Sensitive data encryption at rest
- **Network Security**: Certificate pinning and TLS validation

## Success Metrics
- App launches within 2 seconds
- Authentication completes within 3 seconds
- Offline functionality maintains 95% feature availability
- Zero critical security vulnerabilities
- 99% crash-free sessions

## Risk Mitigation
- **Platform Fragmentation**: Comprehensive device testing
- **Performance Issues**: Memory profiling and optimization
- **Security Vulnerabilities**: Regular security audits
- **Sync Conflicts**: Robust conflict resolution algorithms
- **Network Issues**: Graceful offline/online transitions

## Dependencies
- Backend API endpoints from Phase 5
- User management system from Phase 1
- Database schema from all previous phases
- Push notification service setup
- App store developer accounts

## Deliverables
- Flutter mobile app framework with cross-platform support
- Complete authentication system with multiple auth methods
- Offline-first architecture with automatic sync
- Comprehensive state management with BLoC pattern
- Security-hardened token and session management
- Performance-optimized caching and storage system
