# Issue #07: Mobile Inventory Application

## Overview
Develop a comprehensive mobile application for inventory management that enables barcode scanning, real-time stock taking, mobile workflows, offline capabilities, and seamless integration with the main inventory system for the Banrimkwae Resort.

## Priority
Medium-High

## Estimated Duration
7-8 days

## Dependencies
- Issue #01: Database Schema Design
- Issue #02: Core Inventory Management Backend System
- Issue #05: Stock Movement and Transaction Tracking
- Mobile development framework setup

## Technical Requirements

### Mobile App Architecture

#### 1. Technology Stack
**Frontend Framework:**
- React Native / Flutter for cross-platform development
- Native iOS/Android modules for barcode scanning
- Offline-first architecture with local SQLite database
- Background synchronization capabilities

**State Management:**
- Redux/MobX for state management
- Local storage for offline data persistence
- Conflict resolution for data synchronization

#### 2. Core Mobile Components

**Main Navigation Structure:**
```
- Dashboard
- Stock Taking
- Inventory Search
- Barcode Scanner
- Stock Movements
- Quick Actions
- Reports
- Settings
- Sync Status
```

### Backend API Enhancements

#### 1. MobileInventoryController
Create `app/Http/Controllers/MobileInventoryController.php`:

**Mobile-Optimized Endpoints:**
- `GET /api/mobile/dashboard` - Mobile dashboard data
- `POST /api/mobile/barcode-scan` - Barcode lookup and actions
- `GET /api/mobile/items/search` - Fast item search
- `POST /api/mobile/stock-count` - Submit stock count data
- `POST /api/mobile/quick-movement` - Quick stock movements
- `GET /api/mobile/sync/download` - Download sync data
- `POST /api/mobile/sync/upload` - Upload offline changes
- `GET /api/mobile/offline-data` - Get offline dataset
- `POST /api/mobile/photo-upload` - Upload item photos

**Methods:**
```php
public function getMobileDashboard(Request $request)
public function processBarcodeSccan(BarcodeScanRequest $request)
public function searchItems(MobileSearchRequest $request)
public function submitStockCount(StockCountRequest $request)
public function quickMovement(QuickMovementRequest $request)
public function downloadSyncData(Request $request)
public function uploadOfflineChanges(OfflineSyncRequest $request)
public function getOfflineDataset(Request $request)
public function uploadItemPhoto(PhotoUploadRequest $request)
```

#### 2. MobileSyncService
Create `app/Services/MobileSyncService.php`:

**Synchronization Logic:**
```php
public function generateSyncPackage($userId, $lastSyncTimestamp)
public function processOfflineChanges($userId, $offlineData)
public function resolveDataConflicts($serverData, $clientData)
public function validateOfflineData($data)
public function createSyncLog($userId, $syncDetails)
public function optimizeMobileDataset($criteria)
public function handleIncrementalSync($userId, $changes)
```

### Mobile App Features

#### 1. Barcode Scanning Module
**Scanning Capabilities:**
```javascript
class BarcodeScanner {
    constructor() {
        this.scanner = new BarcodeReader();
        this.scanHistory = [];
    }

    async scanBarcode() {
        try {
            const result = await this.scanner.scan();
            const itemData = await this.lookupItem(result.code);
            
            this.addToScanHistory(result);
            return this.processScanResult(itemData);
        } catch (error) {
            this.handleScanError(error);
        }
    }

    async lookupItem(barcode) {
        // Try offline lookup first
        let item = await this.offlineService.findItemByBarcode(barcode);
        
        if (!item && this.networkService.isOnline()) {
            item = await this.apiService.lookupBarcode(barcode);
        }
        
        return item;
    }

    processScanResult(item) {
        return {
            item: item,
            actions: this.getAvailableActions(item),
            quickActions: this.getQuickActions(item)
        };
    }
}
```

#### 2. Stock Taking Module
**Stock Count Interface:**
```javascript
class StockTaking {
    constructor() {
        this.currentCount = new Map();
        this.countSession = null;
        this.photos = [];
    }

    startCountSession(location, countType = 'full') {
        this.countSession = {
            id: this.generateSessionId(),
            location: location,
            type: countType,
            startTime: new Date(),
            items: new Map(),
            status: 'in_progress'
        };
        
        return this.countSession;
    }

    addItemCount(barcode, quantity, notes = null) {
        const item = this.currentCount.get(barcode) || {
            barcode: barcode,
            counts: [],
            finalQuantity: 0,
            notes: notes
        };
        
        item.counts.push({
            quantity: quantity,
            timestamp: new Date(),
            countedBy: this.userService.getCurrentUser().id
        });
        
        item.finalQuantity = this.calculateFinalQuantity(item.counts);
        this.currentCount.set(barcode, item);
        
        this.autoSave();
    }

    async submitStockCount() {
        const countData = {
            sessionId: this.countSession.id,
            location: this.countSession.location,
            items: Array.from(this.currentCount.values()),
            photos: this.photos,
            submittedAt: new Date(),
            submittedBy: this.userService.getCurrentUser().id
        };

        if (this.networkService.isOnline()) {
            return await this.apiService.submitStockCount(countData);
        } else {
            return await this.offlineService.queueStockCount(countData);
        }
    }
}
```

#### 3. Quick Actions Module
**Rapid Operations:**
```javascript
class QuickActions {
    getAvailableActions(item) {
        return [
            {
                id: 'quick_count',
                label: 'Quick Count',
                icon: 'count',
                action: () => this.performQuickCount(item)
            },
            {
                id: 'add_stock',
                label: 'Add Stock',
                icon: 'plus',
                action: () => this.performQuickAddition(item)
            },
            {
                id: 'remove_stock',
                label: 'Remove Stock',
                icon: 'minus',
                action: () => this.performQuickRemoval(item)
            },
            {
                id: 'transfer',
                label: 'Transfer',
                icon: 'transfer',
                action: () => this.performQuickTransfer(item)
            },
            {
                id: 'report_issue',
                label: 'Report Issue',
                icon: 'warning',
                action: () => this.reportItemIssue(item)
            }
        ];
    }

    async performQuickCount(item) {
        const modal = new QuickCountModal(item);
        const result = await modal.show();
        
        if (result.confirmed) {
            return await this.stockService.updateStockCount(
                item.id,
                result.quantity,
                result.notes
            );
        }
    }
}
```

#### 4. Offline Capability
**Offline Data Management:**
```javascript
class OfflineService {
    constructor() {
        this.db = new LocalDatabase();
        this.syncQueue = [];
        this.lastSyncTimestamp = null;
    }

    async initializeOfflineData() {
        // Download essential data for offline operations
        const offlineData = await this.apiService.getOfflineDataset();
        
        await this.db.bulkInsert('items', offlineData.items);
        await this.db.bulkInsert('locations', offlineData.locations);
        await this.db.bulkInsert('categories', offlineData.categories);
        
        this.lastSyncTimestamp = offlineData.timestamp;
    }

    async queueAction(action) {
        action.queuedAt = new Date();
        action.id = this.generateActionId();
        
        this.syncQueue.push(action);
        await this.db.insert('sync_queue', action);
        
        // Attempt immediate sync if online
        if (this.networkService.isOnline()) {
            this.attemptSync();
        }
    }

    async syncWithServer() {
        if (!this.networkService.isOnline()) {
            throw new Error('No network connection available');
        }

        const queuedActions = await this.db.getAll('sync_queue');
        
        if (queuedActions.length === 0) {
            return { message: 'No actions to sync' };
        }

        try {
            const syncResult = await this.apiService.uploadOfflineChanges({
                actions: queuedActions,
                lastSyncTimestamp: this.lastSyncTimestamp
            });

            // Clear synced actions
            await this.db.clear('sync_queue');
            
            // Apply server updates
            await this.applyServerUpdates(syncResult.serverUpdates);
            
            this.lastSyncTimestamp = syncResult.timestamp;
            
            return syncResult;
        } catch (error) {
            this.handleSyncError(error);
            throw error;
        }
    }
}
```

### Mobile UI Components

#### 1. Dashboard Component
```javascript
const MobileDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const refreshDashboard = async () => {
        setRefreshing(true);
        try {
            const data = await apiService.getMobileDashboard();
            setDashboardData(data);
        } catch (error) {
            // Fall back to offline data
            const offlineData = await offlineService.getOfflineDashboard();
            setDashboardData(offlineData);
        }
        setRefreshing(false);
    };

    return (
        <ScrollView refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refreshDashboard} />
        }>
            <StatusCard title="Stock Value" value={dashboardData?.stockValue} />
            <StatusCard title="Low Stock Items" value={dashboardData?.lowStockCount} />
            <StatusCard title="Pending Counts" value={dashboardData?.pendingCounts} />
            <QuickActionGrid actions={dashboardData?.quickActions} />
            <RecentActivity activities={dashboardData?.recentActivities} />
        </ScrollView>
    );
};
```

#### 2. Barcode Scanner Component
```javascript
const BarcodeScannerScreen = () => {
    const [scanning, setScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);

    const handleBarcodeScan = async (data) => {
        setScanning(false);
        
        try {
            const result = await apiService.processBarcodeShcan({
                barcode: data.data,
                scanType: 'inventory_lookup'
            });
            setScanResult(result);
        } catch (error) {
            Alert.alert('Scan Error', error.message);
        }
    };

    return (
        <View style={styles.container}>
            {scanning ? (
                <BarcodeReader
                    onRead={handleBarcodeScan}
                    style={styles.scanner}
                />
            ) : (
                <View style={styles.resultContainer}>
                    {scanResult && (
                        <ItemResultCard
                            item={scanResult.item}
                            actions={scanResult.actions}
                        />
                    )}
                    <TouchableOpacity
                        style={styles.scanButton}
                        onPress={() => setScanning(true)}
                    >
                        <Text>Scan Barcode</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};
```

### Database Schema for Mobile

#### 1. Local Database Tables
**Items Table (Offline):**
```sql
CREATE TABLE items (
    id INTEGER PRIMARY KEY,
    server_id INTEGER,
    name TEXT NOT NULL,
    sku TEXT,
    barcode TEXT,
    category_id INTEGER,
    current_stock REAL,
    unit_of_measure TEXT,
    location_id INTEGER,
    last_updated TIMESTAMP,
    sync_status TEXT DEFAULT 'synced'
);
```

**Sync Queue Table:**
```sql
CREATE TABLE sync_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action_type TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id INTEGER,
    action_data TEXT, -- JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attempts INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending'
);
```

### Request Validation

#### 1. BarcodeScanRequest
Create `app/Http/Requests/BarcodeScanRequest.php`:

```php
public function rules()
{
    return [
        'barcode' => 'required|string|max:100',
        'scan_type' => 'required|in:inventory_lookup,stock_count,transfer,adjustment',
        'location_id' => 'nullable|exists:storage_locations,id',
        'context' => 'nullable|array',
        'timestamp' => 'nullable|date'
    ];
}
```

#### 2. StockCountRequest
Create `app/Http/Requests/StockCountRequest.php`:

```php
public function rules()
{
    return [
        'session_id' => 'required|string|max:50',
        'location_id' => 'required|exists:storage_locations,id',
        'count_type' => 'required|in:full,partial,cycle',
        'items' => 'required|array|min:1',
        'items.*.inventory_item_id' => 'required|exists:inventory_items,id',
        'items.*.counted_quantity' => 'required|numeric|min:0',
        'items.*.notes' => 'nullable|string|max:500',
        'photos' => 'nullable|array',
        'photos.*' => 'image|max:5120', // 5MB max
        'submitted_at' => 'required|date',
        'device_info' => 'nullable|array'
    ];
}
```

### Mobile-Specific Services

#### 1. Mobile Authentication
```php
public function authenticateMobileDevice(Request $request)
{
    $credentials = $request->validate([
        'username' => 'required|string',
        'password' => 'required|string',
        'device_id' => 'required|string',
        'device_info' => 'required|array'
    ]);

    if (Auth::attempt($credentials)) {
        $user = Auth::user();
        $token = $user->createToken('mobile-app', ['mobile-inventory'])->plainTextToken;
        
        // Register device
        $this->registerMobileDevice($user, $request->device_info);
        
        return response()->json([
            'token' => $token,
            'user' => $user,
            'permissions' => $this->getMobilePermissions($user),
            'offline_data' => $this->getInitialOfflineData($user)
        ]);
    }

    return response()->json(['error' => 'Invalid credentials'], 401);
}
```

#### 2. Photo Management
```php
public function handleItemPhotoUpload(Request $request)
{
    $request->validate([
        'photo' => 'required|image|max:5120',
        'item_id' => 'required|exists:inventory_items,id',
        'photo_type' => 'required|in:item,barcode,damage,count_verification'
    ]);

    $photo = $request->file('photo');
    $path = $photo->store('inventory/mobile-photos', 'public');
    
    $photoRecord = ItemPhoto::create([
        'inventory_item_id' => $request->item_id,
        'photo_path' => $path,
        'photo_type' => $request->photo_type,
        'uploaded_from' => 'mobile',
        'uploaded_by' => auth()->id(),
        'metadata' => $request->metadata ?? []
    ]);

    return response()->json([
        'photo_id' => $photoRecord->id,
        'photo_url' => Storage::url($path)
    ]);
}
```

### Testing Requirements

#### 1. Mobile Unit Tests
Create mobile-specific test suites:
- Offline synchronization logic
- Barcode scanning functionality
- Data validation and conflicts
- Network connectivity handling

#### 2. Integration Tests
- API endpoint compatibility
- Data synchronization accuracy
- Photo upload and processing
- Offline-to-online transitions

### Performance Optimization

#### 1. Data Compression
```javascript
class DataCompression {
    compressOfflineData(data) {
        return LZ4.compress(JSON.stringify(data));
    }

    decompressData(compressedData) {
        return JSON.parse(LZ4.decompress(compressedData));
    }
}
```

#### 2. Efficient Synchronization
```php
public function getIncrementalSyncData($userId, $lastSyncTimestamp)
{
    return [
        'items' => InventoryItem::where('updated_at', '>', $lastSyncTimestamp)
            ->select(['id', 'name', 'sku', 'barcode', 'current_stock', 'updated_at'])
            ->get(),
        'movements' => StockMovement::where('created_at', '>', $lastSyncTimestamp)
            ->with(['inventoryItem:id,name,sku'])
            ->get(),
        'timestamp' => now()->toISOString()
    ];
}
```

## Acceptance Criteria

1. **Mobile App Functionality:**
   - ✅ Cross-platform mobile application (iOS/Android)
   - ✅ Barcode scanning with camera integration
   - ✅ Offline-first architecture with local data storage

2. **Stock Management:**
   - ✅ Real-time stock taking and counting
   - ✅ Quick stock movements and adjustments
   - ✅ Item search and lookup functionality

3. **Synchronization:**
   - ✅ Seamless online/offline data synchronization
   - ✅ Conflict resolution for concurrent changes
   - ✅ Background sync when connectivity restored

4. **User Experience:**
   - ✅ Intuitive mobile-optimized interface
   - ✅ Fast response times and smooth interactions
   - ✅ Comprehensive error handling and feedback

5. **Integration:**
   - ✅ Full integration with main inventory system
   - ✅ Real-time updates and notifications
   - ✅ Consistent data across all platforms

## Implementation Notes

1. **Platform Strategy:**
   - Start with React Native for faster development
   - Consider native modules for advanced barcode scanning
   - Ensure consistent UI/UX across platforms

2. **Offline Strategy:**
   - Download critical data for offline use
   - Queue actions for later synchronization
   - Handle conflicts gracefully with user input

3. **Performance:**
   - Optimize for low-end mobile devices
   - Implement efficient data caching
   - Minimize battery usage

4. **Security:**
   - Secure local data storage
   - Implement proper authentication
   - Encrypt sensitive offline data

## Related Issues
- Issue #02: Core Inventory Management Backend System
- Issue #05: Stock Movement and Transaction Tracking
- Issue #10: Frontend Interface Development
- Issue #11: Testing and Quality Assurance
