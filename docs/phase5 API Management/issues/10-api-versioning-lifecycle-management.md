# Issue #10: API Versioning and Lifecycle Management

## Overview
Implement comprehensive API versioning and lifecycle management system for the Banrimkwae Resort Management System to ensure backward compatibility, smooth migrations, and systematic deprecation of API endpoints while maintaining service continuity.

## Requirements

### Functional Requirements
1. **Version Management System**
   - Support multiple API versions simultaneously
   - Semantic versioning (v1.0.0, v1.1.0, v2.0.0)
   - Version routing and request handling
   - Backward compatibility maintenance

2. **Lifecycle Management**
   - API endpoint lifecycle tracking
   - Deprecation warnings and timelines
   - Sunset notifications and enforcement
   - Migration path documentation

3. **Version Documentation**
   - Version-specific documentation
   - Change logs and migration guides
   - Breaking changes notifications
   - API compatibility matrix

4. **Client Version Tracking**
   - Client version usage analytics
   - Version adoption monitoring
   - Migration progress tracking
   - Client notification system

### Technical Requirements
1. **Version Routing**
   - URL-based versioning (/api/v1/, /api/v2/)
   - Header-based versioning (API-Version: 1.0)
   - Accept header versioning (Accept: application/vnd.api+json;version=1)
   - Query parameter versioning (?version=1.0)

2. **Database Versioning**
   - Schema version management
   - Migration tracking
   - Rollback capabilities
   - Data transformation scripts

3. **Response Transformation**
   - Version-specific response formats
   - Field mapping between versions
   - Data type conversion
   - Nested object restructuring

## Database Schema

```sql
-- API Versions table
CREATE TABLE api_versions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    version VARCHAR(20) NOT NULL UNIQUE,
    major_version INT NOT NULL,
    minor_version INT NOT NULL,
    patch_version INT NOT NULL,
    status ENUM('development', 'active', 'deprecated', 'sunset') NOT NULL DEFAULT 'development',
    release_date TIMESTAMP NULL,
    deprecation_date TIMESTAMP NULL,
    sunset_date TIMESTAMP NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT,
    changelog TEXT,
    breaking_changes TEXT,
    migration_guide TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_version_status (status),
    INDEX idx_version_dates (release_date, deprecation_date, sunset_date),
    INDEX idx_version_major_minor (major_version, minor_version)
);

-- API Endpoints versions mapping
CREATE TABLE api_endpoint_versions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    endpoint_id BIGINT UNSIGNED NOT NULL,
    version_id BIGINT UNSIGNED NOT NULL,
    endpoint_path VARCHAR(255) NOT NULL,
    http_method ENUM('GET', 'POST', 'PUT', 'PATCH', 'DELETE') NOT NULL,
    controller_class VARCHAR(255) NOT NULL,
    controller_method VARCHAR(100) NOT NULL,
    request_schema JSON,
    response_schema JSON,
    status ENUM('active', 'deprecated', 'removed') NOT NULL DEFAULT 'active',
    deprecation_date TIMESTAMP NULL,
    removal_date TIMESTAMP NULL,
    migration_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (version_id) REFERENCES api_versions(id) ON DELETE CASCADE,
    UNIQUE KEY uk_endpoint_version (endpoint_id, version_id),
    INDEX idx_endpoint_path_method (endpoint_path, http_method),
    INDEX idx_endpoint_status (status)
);

-- Version usage tracking
CREATE TABLE api_version_usage (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    version_id BIGINT UNSIGNED NOT NULL,
    client_id BIGINT UNSIGNED,
    user_id BIGINT UNSIGNED,
    endpoint_path VARCHAR(255) NOT NULL,
    http_method VARCHAR(10) NOT NULL,
    request_count INT NOT NULL DEFAULT 1,
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (version_id) REFERENCES api_versions(id) ON DELETE CASCADE,
    INDEX idx_version_usage_date (version_id, last_used_at),
    INDEX idx_client_version_usage (client_id, version_id),
    INDEX idx_endpoint_usage (endpoint_path, http_method)
);

-- Migration tracking
CREATE TABLE api_migrations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    from_version_id BIGINT UNSIGNED NOT NULL,
    to_version_id BIGINT UNSIGNED NOT NULL,
    migration_type ENUM('automatic', 'manual', 'breaking') NOT NULL,
    migration_script TEXT,
    rollback_script TEXT,
    executed_at TIMESTAMP NULL,
    execution_status ENUM('pending', 'running', 'completed', 'failed') NOT NULL DEFAULT 'pending',
    execution_log TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (from_version_id) REFERENCES api_versions(id) ON DELETE CASCADE,
    FOREIGN KEY (to_version_id) REFERENCES api_versions(id) ON DELETE CASCADE,
    INDEX idx_migration_status (execution_status),
    INDEX idx_migration_versions (from_version_id, to_version_id)
);

-- Client version preferences
CREATE TABLE client_version_preferences (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    client_id BIGINT UNSIGNED NOT NULL,
    version_id BIGINT UNSIGNED NOT NULL,
    preference_type ENUM('preferred', 'fallback', 'blocked') NOT NULL DEFAULT 'preferred',
    auto_upgrade BOOLEAN NOT NULL DEFAULT FALSE,
    migration_deadline TIMESTAMP NULL,
    notification_sent BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (version_id) REFERENCES api_versions(id) ON DELETE CASCADE,
    UNIQUE KEY uk_client_version (client_id, version_id),
    INDEX idx_preference_type (preference_type),
    INDEX idx_migration_deadline (migration_deadline)
);

-- Version compatibility matrix
CREATE TABLE version_compatibility (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    version_id BIGINT UNSIGNED NOT NULL,
    compatible_version_id BIGINT UNSIGNED NOT NULL,
    compatibility_level ENUM('full', 'partial', 'none') NOT NULL,
    breaking_changes JSON,
    migration_required BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (version_id) REFERENCES api_versions(id) ON DELETE CASCADE,
    FOREIGN KEY (compatible_version_id) REFERENCES api_versions(id) ON DELETE CASCADE,
    UNIQUE KEY uk_version_compatibility (version_id, compatible_version_id),
    INDEX idx_compatibility_level (compatibility_level)
);
```

## Backend Implementation

### Version Management Service

```php
<?php

namespace App\Services\API;

use App\Models\APIVersion;
use App\Models\APIEndpointVersion;
use App\Models\APIVersionUsage;
use App\Models\APIMigration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class VersionManagementService
{
    private $cachePrefix = 'api_version:';
    private $cacheTtl = 3600; // 1 hour

    public function resolveVersion(Request $request): APIVersion
    {
        $version = $this->extractVersionFromRequest($request);
        
        if (!$version) {
            return $this->getDefaultVersion();
        }

        $apiVersion = $this->findVersion($version);
        
        if (!$apiVersion || $this->isVersionSunset($apiVersion)) {
            throw new \Exception("API version {$version} is not available");
        }

        $this->trackVersionUsage($apiVersion, $request);
        
        return $apiVersion;
    }

    private function extractVersionFromRequest(Request $request): ?string
    {
        // URL-based versioning (highest priority)
        if (preg_match('/\/api\/v(\d+(?:\.\d+)?)\//', $request->path(), $matches)) {
            return $matches[1];
        }

        // Header-based versioning
        if ($request->hasHeader('API-Version')) {
            return $request->header('API-Version');
        }

        // Accept header versioning
        $accept = $request->header('Accept');
        if (preg_match('/version=(\d+(?:\.\d+)?)/', $accept, $matches)) {
            return $matches[1];
        }

        // Query parameter versioning
        if ($request->has('version')) {
            return $request->get('version');
        }

        return null;
    }

    public function getDefaultVersion(): APIVersion
    {
        $cacheKey = $this->cachePrefix . 'default';
        
        return Cache::remember($cacheKey, $this->cacheTtl, function () {
            return APIVersion::where('is_default', true)
                ->where('status', 'active')
                ->first();
        });
    }

    public function findVersion(string $version): ?APIVersion
    {
        $cacheKey = $this->cachePrefix . "version:{$version}";
        
        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($version) {
            return APIVersion::where('version', $version)
                ->whereIn('status', ['active', 'deprecated'])
                ->first();
        });
    }

    public function isVersionSunset(APIVersion $version): bool
    {
        return $version->status === 'sunset' || 
               ($version->sunset_date && $version->sunset_date <= now());
    }

    public function createVersion(array $data): APIVersion
    {
        $version = APIVersion::create([
            'version' => $data['version'],
            'major_version' => $data['major_version'],
            'minor_version' => $data['minor_version'],
            'patch_version' => $data['patch_version'],
            'description' => $data['description'] ?? null,
            'changelog' => $data['changelog'] ?? null,
            'breaking_changes' => $data['breaking_changes'] ?? null,
            'migration_guide' => $data['migration_guide'] ?? null,
            'release_date' => $data['release_date'] ?? now(),
        ]);

        $this->clearVersionCache();
        
        return $version;
    }

    public function deprecateVersion(int $versionId, Carbon $deprecationDate, Carbon $sunsetDate): bool
    {
        $version = APIVersion::findOrFail($versionId);
        
        $version->update([
            'status' => 'deprecated',
            'deprecation_date' => $deprecationDate,
            'sunset_date' => $sunsetDate
        ]);

        $this->notifyClientsOfDeprecation($version);
        $this->clearVersionCache();
        
        return true;
    }

    public function getVersionUsageStatistics(int $versionId, string $period = '30d'): array
    {
        $startDate = Carbon::now()->sub($this->parsePeriod($period));
        
        $usage = APIVersionUsage::where('version_id', $versionId)
            ->where('last_used_at', '>=', $startDate)
            ->selectRaw('
                DATE(last_used_at) as date,
                COUNT(*) as requests,
                COUNT(DISTINCT client_id) as unique_clients,
                COUNT(DISTINCT user_id) as unique_users
            ')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'version_id' => $versionId,
            'period' => $period,
            'usage_data' => $usage,
            'total_requests' => $usage->sum('requests'),
            'total_clients' => APIVersionUsage::where('version_id', $versionId)
                ->where('last_used_at', '>=', $startDate)
                ->distinct('client_id')
                ->count(),
        ];
    }

    private function trackVersionUsage(APIVersion $version, Request $request): void
    {
        $clientId = $request->attributes->get('client_id');
        $userId = auth()->id();
        $endpoint = $request->path();
        $method = $request->method();

        APIVersionUsage::updateOrCreate(
            [
                'version_id' => $version->id,
                'client_id' => $clientId,
                'user_id' => $userId,
                'endpoint_path' => $endpoint,
                'http_method' => $method,
            ],
            [
                'request_count' => \DB::raw('request_count + 1'),
                'last_used_at' => now(),
                'user_agent' => $request->userAgent(),
                'ip_address' => $request->ip(),
            ]
        );
    }

    private function notifyClientsOfDeprecation(APIVersion $version): void
    {
        // Implementation for notifying clients about deprecation
        Log::info("API version {$version->version} has been deprecated", [
            'version_id' => $version->id,
            'deprecation_date' => $version->deprecation_date,
            'sunset_date' => $version->sunset_date
        ]);
    }

    private function clearVersionCache(): void
    {
        Cache::tags(['api_versions'])->flush();
    }

    private function parsePeriod(string $period): string
    {
        $map = [
            '7d' => '7 days',
            '30d' => '30 days',
            '90d' => '90 days',
            '1y' => '1 year',
        ];

        return $map[$period] ?? '30 days';
    }
}
```

### Response Transformation Service

```php
<?php

namespace App\Services\API;

use App\Models\APIVersion;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class ResponseTransformationService
{
    private $transformers = [];
    private $cachePrefix = 'api_transform:';

    public function transformResponse($data, APIVersion $fromVersion, APIVersion $toVersion): array
    {
        if ($fromVersion->id === $toVersion->id) {
            return $data;
        }

        $cacheKey = $this->cachePrefix . "transform:{$fromVersion->id}:{$toVersion->id}";
        
        $transformer = Cache::remember($cacheKey, 3600, function () use ($fromVersion, $toVersion) {
            return $this->getTransformer($fromVersion, $toVersion);
        });

        return $transformer ? $transformer($data) : $data;
    }

    public function registerTransformer(string $fromVersion, string $toVersion, callable $transformer): void
    {
        $key = "{$fromVersion}:{$toVersion}";
        $this->transformers[$key] = $transformer;
    }

    private function getTransformer(APIVersion $fromVersion, APIVersion $toVersion): ?callable
    {
        $key = "{$fromVersion->version}:{$toVersion->version}";
        
        return $this->transformers[$key] ?? $this->getDefaultTransformer($fromVersion, $toVersion);
    }

    private function getDefaultTransformer(APIVersion $fromVersion, APIVersion $toVersion): ?callable
    {
        // Load transformation rules from database or config
        $transformationRules = $this->getTransformationRules($fromVersion, $toVersion);
        
        if (empty($transformationRules)) {
            return null;
        }

        return function ($data) use ($transformationRules) {
            return $this->applyTransformationRules($data, $transformationRules);
        };
    }

    private function getTransformationRules(APIVersion $fromVersion, APIVersion $toVersion): array
    {
        // Example transformation rules - in practice, these would be stored in database
        $rules = [
            '1.0:2.0' => [
                'field_mappings' => [
                    'user_id' => 'id',
                    'user_name' => 'name',
                    'user_email' => 'email'
                ],
                'removed_fields' => ['legacy_field'],
                'added_fields' => [
                    'created_at' => 'now()',
                    'version' => '2.0'
                ]
            ]
        ];

        $key = "{$fromVersion->version}:{$toVersion->version}";
        return $rules[$key] ?? [];
    }

    private function applyTransformationRules(array $data, array $rules): array
    {
        $transformed = $data;

        // Apply field mappings
        if (isset($rules['field_mappings'])) {
            foreach ($rules['field_mappings'] as $oldField => $newField) {
                if (isset($transformed[$oldField])) {
                    $transformed[$newField] = $transformed[$oldField];
                    unset($transformed[$oldField]);
                }
            }
        }

        // Remove deprecated fields
        if (isset($rules['removed_fields'])) {
            foreach ($rules['removed_fields'] as $field) {
                unset($transformed[$field]);
            }
        }

        // Add new fields
        if (isset($rules['added_fields'])) {
            foreach ($rules['added_fields'] as $field => $value) {
                $transformed[$field] = $this->evaluateValue($value);
            }
        }

        return $transformed;
    }

    private function evaluateValue($value)
    {
        if ($value === 'now()') {
            return now()->toISOString();
        }
        
        return $value;
    }
}
```

## Frontend Implementation

### Version Management Dashboard

```javascript
// Version Management Dashboard Component
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Form,
  Input,
  Textarea,
  Select,
  Alert,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  LineChart,
  BarChart,
} from '@/components/ui';

const VersionManagementDashboard = () => {
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [usageStats, setUsageStats] = useState({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeprecateModalOpen, setIsDeprecateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVersions();
  }, []);

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/versions');
      const data = await response.json();
      setVersions(data.versions);
      
      // Fetch usage stats for each version
      const statsPromises = data.versions.map(version => 
        fetch(`/api/admin/versions/${version.id}/usage?period=30d`)
          .then(res => res.json())
      );
      
      const stats = await Promise.all(statsPromises);
      const statsMap = {};
      stats.forEach((stat, index) => {
        statsMap[data.versions[index].id] = stat;
      });
      setUsageStats(statsMap);
    } catch (error) {
      console.error('Failed to fetch versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      development: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      deprecated: 'bg-yellow-100 text-yellow-800',
      sunset: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleCreateVersion = async (formData) => {
    try {
      const response = await fetch('/api/admin/versions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchVersions();
        setIsCreateModalOpen(false);
      }
    } catch (error) {
      console.error('Failed to create version:', error);
    }
  };

  const handleDeprecateVersion = async (versionId, deprecationData) => {
    try {
      const response = await fetch(`/api/admin/versions/${versionId}/deprecate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deprecationData),
      });

      if (response.ok) {
        await fetchVersions();
        setIsDeprecateModalOpen(false);
      }
    } catch (error) {
      console.error('Failed to deprecate version:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">API Version Management</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          Create New Version
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
          <TabsTrigger value="lifecycle">Lifecycle Management</TabsTrigger>
          <TabsTrigger value="compatibility">Compatibility Matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">API Versions Overview</h2>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Version</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Release Date</TableHead>
                    <TableHead>Usage (30d)</TableHead>
                    <TableHead>Clients</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {versions.map((version) => (
                    <TableRow key={version.id}>
                      <TableCell className="font-medium">
                        v{version.version}
                        {version.is_default && (
                          <Badge className="ml-2">Default</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(version.status)}>
                          {version.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(version.release_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {usageStats[version.id]?.total_requests || 0}
                      </TableCell>
                      <TableCell>
                        {usageStats[version.id]?.total_clients || 0}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedVersion(version)}
                          >
                            Details
                          </Button>
                          {version.status === 'active' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedVersion(version);
                                setIsDeprecateModalOpen(true);
                              }}
                            >
                              Deprecate
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage">
          <VersionUsageAnalytics versions={versions} usageStats={usageStats} />
        </TabsContent>

        <TabsContent value="lifecycle">
          <LifecycleManagement versions={versions} onUpdate={fetchVersions} />
        </TabsContent>

        <TabsContent value="compatibility">
          <CompatibilityMatrix versions={versions} />
        </TabsContent>
      </Tabs>

      {/* Create Version Modal */}
      <CreateVersionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateVersion}
      />

      {/* Deprecate Version Modal */}
      <DeprecateVersionModal
        isOpen={isDeprecateModalOpen}
        version={selectedVersion}
        onClose={() => setIsDeprecateModalOpen(false)}
        onSubmit={handleDeprecateVersion}
      />
    </div>
  );
};

// Usage Analytics Component
const VersionUsageAnalytics = ({ versions, usageStats }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    prepareChartData();
  }, [versions, usageStats, selectedPeriod]);

  const prepareChartData = () => {
    const data = versions.map(version => ({
      name: `v${version.version}`,
      requests: usageStats[version.id]?.total_requests || 0,
      clients: usageStats[version.id]?.total_clients || 0,
      status: version.status
    }));
    
    setChartData(data);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Version Usage Analytics</h2>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Requests by Version</h3>
              <BarChart
                data={chartData}
                xKey="name"
                yKey="requests"
                height={300}
              />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Active Clients by Version</h3>
              <BarChart
                data={chartData}
                xKey="name"
                yKey="clients"
                height={300}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Version Migration Progress</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {versions.filter(v => v.status === 'deprecated').map(version => (
              <div key={version.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">v{version.version}</h3>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    Deprecated
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Sunset Date:</span>
                    <span>{new Date(version.sunset_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Active Clients:</span>
                    <span>{usageStats[version.id]?.total_clients || 0}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-600 h-2 rounded-full"
                      style={{ 
                        width: `${Math.max(0, 100 - ((usageStats[version.id]?.total_clients || 0) * 10))}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VersionManagementDashboard;
```

## Implementation Phases

### Phase 1: Core Version Infrastructure (2 days)
- **Day 1**: Database schema setup and migration
- **Day 2**: Version resolution and routing logic

### Phase 2: Lifecycle Management (2 days)
- **Day 3**: Version creation and deprecation workflows
- **Day 4**: Usage tracking and analytics

### Phase 3: Response Transformation (1 day)
- **Day 5**: Transformation engine and rule system

### Phase 4: Management Interface (1 day)
- **Day 6**: Admin dashboard and monitoring tools

## Quality Assurance

### Testing Requirements
1. **Unit Tests**
   - Version resolution logic
   - Response transformation
   - Usage tracking accuracy
   - Migration scripts

2. **Integration Tests**
   - Multi-version endpoint access
   - Version routing behavior
   - Database consistency
   - Cache invalidation

3. **Performance Tests**
   - Version resolution latency
   - Transformation overhead
   - Database query optimization
   - Cache hit rates

### Security Requirements
1. **Access Control**
   - Version-specific permissions
   - Admin-only version management
   - Audit logging for changes
   - Client version restrictions

2. **Data Protection**
   - Usage data anonymization
   - Secure transformation rules
   - Version metadata protection
   - Migration rollback security

## Success Metrics

### Technical Metrics
- Version resolution time < 5ms
- Transformation overhead < 10ms
- 99.9% version availability
- Zero data corruption during migrations

### Business Metrics
- Smooth version transitions
- Reduced support tickets
- Improved developer experience
- Faster API evolution

## Risk Mitigation

### Technical Risks
1. **Version Conflicts**
   - Mitigation: Comprehensive compatibility testing
   - Fallback: Automated conflict detection

2. **Performance Degradation**
   - Mitigation: Efficient caching strategies
   - Fallback: Version-specific optimization

3. **Data Inconsistency**
   - Mitigation: Transactional migrations
   - Fallback: Rollback procedures

### Operational Risks
1. **Client Migration Delays**
   - Mitigation: Extended deprecation periods
   - Fallback: Selective sunset enforcement

2. **Breaking Changes**
   - Mitigation: Thorough impact analysis
   - Fallback: Hotfix deployment procedures

---

**Estimated Timeline**: 6 days
**Priority**: High
**Dependencies**: API Gateway Core Infrastructure, Authentication System
**Team**: Backend Developer, DevOps Engineer, QA Engineer
