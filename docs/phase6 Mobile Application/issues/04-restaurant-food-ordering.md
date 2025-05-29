# Issue #04: Restaurant & Food Ordering System

## Overview
Implement a comprehensive mobile-based restaurant and food ordering system that allows guests to browse menus, place orders, track delivery status, and manage dining reservations directly from their mobile devices, while providing staff with order management and kitchen display capabilities.

## Priority: High
## Estimated Time: 5 days
## Dependencies: Issue #01 (Core Architecture), Issue #02 (Guest App), Issue #03 (Staff App)

## Technical Requirements

### Core Features
1. **Digital Menu System**
   - Multi-language menu display (Thai/English)
   - High-quality food images with zoom capability
   - Detailed ingredient lists and allergen information
   - Nutritional information display
   - Real-time price updates and availability status

2. **Advanced Ordering System**
   - In-room dining orders with room service delivery
   - Restaurant table reservations with time slots
   - Poolside/beach bar mobile ordering
   - Group ordering capabilities for families
   - Special dietary requirement specifications

3. **Order Tracking & Management**
   - Real-time order status updates
   - Estimated delivery/preparation times
   - Kitchen display system integration
   - Order modification before preparation
   - Cancellation policies and refund handling

4. **Payment Integration**
   - Multiple payment methods (room charge, credit card, digital wallets)
   - Split bill functionality for groups
   - Tip calculation and processing
   - Automatic tax calculation
   - Receipt generation and email delivery

## Database Schema

### Tables to Create/Modify

```sql
-- Mobile Menu Categories
CREATE TABLE mobile_menu_categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    restaurant_id BIGINT UNSIGNED NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_th VARCHAR(255) NOT NULL,
    description_en TEXT,
    description_th TEXT,
    image_url VARCHAR(500),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_restaurant_category (restaurant_id, is_active),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mobile Menu Items with Enhanced Details
CREATE TABLE mobile_menu_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT UNSIGNED NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_th VARCHAR(255) NOT NULL,
    description_en TEXT,
    description_th TEXT,
    price DECIMAL(10,2) NOT NULL,
    preparation_time INT DEFAULT 0, -- minutes
    calories INT DEFAULT NULL,
    allergens JSON DEFAULT NULL, -- ['nuts', 'dairy', 'gluten']
    dietary_tags JSON DEFAULT NULL, -- ['vegetarian', 'vegan', 'halal']
    ingredients_en TEXT,
    ingredients_th TEXT,
    is_spicy BOOLEAN DEFAULT FALSE,
    spice_level ENUM('mild', 'medium', 'hot', 'very_hot') DEFAULT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    is_popular BOOLEAN DEFAULT FALSE,
    is_chef_special BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES mobile_menu_categories(id) ON DELETE CASCADE,
    INDEX idx_category_available (category_id, is_available),
    INDEX idx_popular_items (is_popular, is_available),
    INDEX idx_chef_special (is_chef_special, is_available),
    FULLTEXT idx_search_en (name_en, description_en, ingredients_en),
    FULLTEXT idx_search_th (name_th, description_th, ingredients_th)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mobile Menu Item Images
CREATE TABLE mobile_menu_item_images (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    menu_item_id BIGINT UNSIGNED NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    alt_text_en VARCHAR(255),
    alt_text_th VARCHAR(255),
    display_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (menu_item_id) REFERENCES mobile_menu_items(id) ON DELETE CASCADE,
    INDEX idx_menu_item_order (menu_item_id, display_order),
    INDEX idx_primary_image (menu_item_id, is_primary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mobile Food Orders
CREATE TABLE mobile_food_orders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    guest_id BIGINT UNSIGNED NOT NULL,
    restaurant_id BIGINT UNSIGNED NOT NULL,
    room_number VARCHAR(20) DEFAULT NULL,
    delivery_location ENUM('room', 'restaurant', 'pool', 'beach', 'lobby') NOT NULL,
    delivery_address TEXT DEFAULT NULL,
    order_type ENUM('dine_in', 'room_service', 'takeaway', 'poolside') NOT NULL,
    status ENUM('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled') DEFAULT 'pending',
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    tip_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('room_charge', 'credit_card', 'cash', 'digital_wallet') NOT NULL,
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    special_instructions TEXT,
    estimated_delivery_time TIMESTAMP NULL,
    confirmed_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_guest_orders (guest_id, created_at DESC),
    INDEX idx_restaurant_status (restaurant_id, status),
    INDEX idx_order_number (order_number),
    INDEX idx_status_delivery (status, estimated_delivery_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mobile Food Order Items
CREATE TABLE mobile_food_order_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    menu_item_id BIGINT UNSIGNED NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    customizations JSON DEFAULT NULL, -- special requests, modifications
    special_instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES mobile_food_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES mobile_menu_items(id) ON DELETE CASCADE,
    INDEX idx_order_items (order_id),
    INDEX idx_menu_item_orders (menu_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Restaurant Table Reservations
CREATE TABLE mobile_table_reservations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    reservation_number VARCHAR(50) UNIQUE NOT NULL,
    guest_id BIGINT UNSIGNED NOT NULL,
    restaurant_id BIGINT UNSIGNED NOT NULL,
    party_size INT NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    status ENUM('pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show') DEFAULT 'pending',
    table_preference ENUM('indoor', 'outdoor', 'window', 'private', 'any') DEFAULT 'any',
    special_occasion VARCHAR(100) DEFAULT NULL, -- birthday, anniversary, etc.
    special_requests TEXT,
    guest_notes TEXT,
    staff_notes TEXT,
    confirmed_at TIMESTAMP NULL,
    seated_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_guest_reservations (guest_id, reservation_date DESC),
    INDEX idx_restaurant_date (restaurant_id, reservation_date, status),
    INDEX idx_reservation_number (reservation_number),
    INDEX idx_date_time (reservation_date, reservation_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Backend Implementation

### Laravel Services

```php
<?php
// app/Services/Mobile/MobileMenuService.php

namespace App\Services\Mobile;

use App\Models\MobileMenuCategory;
use App\Models\MobileMenuItem;
use App\Models\MobileMenuItemImage;
use App\Models\Restaurant;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class MobileMenuService
{
    public function getRestaurantMenu($restaurantId, $language = 'en')
    {
        $cacheKey = "mobile_menu_{$restaurantId}_{$language}";
        
        return Cache::remember($cacheKey, 3600, function () use ($restaurantId, $language) {
            $categories = MobileMenuCategory::where('restaurant_id', $restaurantId)
                ->where('is_active', true)
                ->orderBy('display_order')
                ->get();
            
            $menu = [];
            foreach ($categories as $category) {
                $items = MobileMenuItem::where('category_id', $category->id)
                    ->where('is_available', true)
                    ->with('images')
                    ->orderBy('display_order')
                    ->get();
                
                $categoryData = [
                    'id' => $category->id,
                    'name' => $language === 'th' ? $category->name_th : $category->name_en,
                    'description' => $language === 'th' ? $category->description_th : $category->description_en,
                    'image_url' => $category->image_url,
                    'items' => $this->formatMenuItems($items, $language)
                ];
                
                $menu[] = $categoryData;
            }
            
            return $menu;
        });
    }
    
    private function formatMenuItems($items, $language)
    {
        return $items->map(function ($item) use ($language) {
            return [
                'id' => $item->id,
                'name' => $language === 'th' ? $item->name_th : $item->name_en,
                'description' => $language === 'th' ? $item->description_th : $item->description_en,
                'price' => $item->price,
                'preparation_time' => $item->preparation_time,
                'calories' => $item->calories,
                'allergens' => $item->allergens,
                'dietary_tags' => $item->dietary_tags,
                'ingredients' => $language === 'th' ? $item->ingredients_th : $item->ingredients_en,
                'is_spicy' => $item->is_spicy,
                'spice_level' => $item->spice_level,
                'is_popular' => $item->is_popular,
                'is_chef_special' => $item->is_chef_special,
                'images' => $item->images->map(function ($image) {
                    return [
                        'url' => $image->image_url,
                        'alt_text' => $image->alt_text_en,
                        'is_primary' => $image->is_primary
                    ];
                })
            ];
        });
    }
    
    public function searchMenuItems($restaurantId, $query, $filters = [], $language = 'en')
    {
        $searchQuery = MobileMenuItem::whereHas('category', function ($q) use ($restaurantId) {
            $q->where('restaurant_id', $restaurantId);
        })->where('is_available', true);
        
        // Text search
        if ($query) {
            if ($language === 'th') {
                $searchQuery->whereRaw("MATCH(name_th, description_th, ingredients_th) AGAINST(? IN BOOLEAN MODE)", [$query]);
            } else {
                $searchQuery->whereRaw("MATCH(name_en, description_en, ingredients_en) AGAINST(? IN BOOLEAN MODE)", [$query]);
            }
        }
        
        // Apply filters
        if (isset($filters['dietary_tags'])) {
            $searchQuery->whereJsonContains('dietary_tags', $filters['dietary_tags']);
        }
        
        if (isset($filters['max_price'])) {
            $searchQuery->where('price', '<=', $filters['max_price']);
        }
        
        if (isset($filters['is_spicy'])) {
            $searchQuery->where('is_spicy', $filters['is_spicy']);
        }
        
        if (isset($filters['max_preparation_time'])) {
            $searchQuery->where('preparation_time', '<=', $filters['max_preparation_time']);
        }
        
        return $searchQuery->with('images', 'category')->get();
    }
}

<?php
// app/Services/Mobile/MobileFoodOrderService.php

namespace App\Services\Mobile;

use App\Models\MobileFoodOrder;
use App\Models\MobileFoodOrderItem;
use App\Models\Guest;
use App\Models\Restaurant;
use App\Services\NotificationService;
use App\Services\PaymentService;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class MobileFoodOrderService
{
    protected $notificationService;
    protected $paymentService;
    
    public function __construct(NotificationService $notificationService, PaymentService $paymentService)
    {
        $this->notificationService = $notificationService;
        $this->paymentService = $paymentService;
    }
    
    public function createOrder($guestId, $orderData)
    {
        return DB::transaction(function () use ($guestId, $orderData) {
            // Create order
            $order = MobileFoodOrder::create([
                'order_number' => $this->generateOrderNumber(),
                'guest_id' => $guestId,
                'restaurant_id' => $orderData['restaurant_id'],
                'room_number' => $orderData['room_number'] ?? null,
                'delivery_location' => $orderData['delivery_location'],
                'delivery_address' => $orderData['delivery_address'] ?? null,
                'order_type' => $orderData['order_type'],
                'subtotal' => $orderData['subtotal'],
                'tax_amount' => $orderData['tax_amount'],
                'delivery_fee' => $orderData['delivery_fee'] ?? 0,
                'tip_amount' => $orderData['tip_amount'] ?? 0,
                'total_amount' => $orderData['total_amount'],
                'payment_method' => $orderData['payment_method'],
                'special_instructions' => $orderData['special_instructions'] ?? null,
            ]);
            
            // Add order items
            foreach ($orderData['items'] as $itemData) {
                MobileFoodOrderItem::create([
                    'order_id' => $order->id,
                    'menu_item_id' => $itemData['menu_item_id'],
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $itemData['unit_price'],
                    'total_price' => $itemData['total_price'],
                    'customizations' => $itemData['customizations'] ?? null,
                    'special_instructions' => $itemData['special_instructions'] ?? null,
                ]);
            }
            
            // Calculate estimated delivery time
            $this->calculateDeliveryTime($order);
            
            // Send notifications
            $this->notificationService->sendOrderConfirmation($order);
            $this->notificationService->notifyRestaurantStaff($order);
            
            return $order->load('items.menuItem', 'restaurant');
        });
    }
    
    public function updateOrderStatus($orderId, $status, $staffId = null)
    {
        $order = MobileFoodOrder::findOrFail($orderId);
        $oldStatus = $order->status;
        
        $order->update(['status' => $status]);
        
        // Update timestamps based on status
        switch ($status) {
            case 'confirmed':
                $order->update(['confirmed_at' => now()]);
                break;
            case 'delivered':
                $order->update(['delivered_at' => now()]);
                break;
            case 'cancelled':
                $order->update(['cancelled_at' => now()]);
                break;
        }
        
        // Send status update notification
        $this->notificationService->sendOrderStatusUpdate($order, $oldStatus);
        
        return $order;
    }
    
    public function getOrderTracking($orderId)
    {
        $order = MobileFoodOrder::with(['items.menuItem', 'restaurant', 'guest'])
            ->findOrFail($orderId);
        
        $statusTimeline = [
            'pending' => $order->created_at,
            'confirmed' => $order->confirmed_at,
            'preparing' => null, // Would be set when kitchen starts
            'ready' => null,     // Would be set when ready for pickup/delivery
            'delivered' => $order->delivered_at,
        ];
        
        return [
            'order' => $order,
            'status_timeline' => $statusTimeline,
            'estimated_delivery' => $order->estimated_delivery_time,
            'can_cancel' => $this->canCancelOrder($order),
            'can_modify' => $this->canModifyOrder($order)
        ];
    }
    
    private function generateOrderNumber()
    {
        do {
            $number = 'FO' . date('Ymd') . Str::random(4);
        } while (MobileFoodOrder::where('order_number', $number)->exists());
        
        return $number;
    }
    
    private function calculateDeliveryTime($order)
    {
        $baseTime = 30; // Base preparation time in minutes
        $itemsCount = $order->items->sum('quantity');
        $additionalTime = ceil($itemsCount / 5) * 10; // 10 minutes per 5 items
        
        if ($order->order_type === 'room_service') {
            $additionalTime += 15; // Additional delivery time
        }
        
        $estimatedTime = now()->addMinutes($baseTime + $additionalTime);
        $order->update(['estimated_delivery_time' => $estimatedTime]);
    }
    
    private function canCancelOrder($order)
    {
        return in_array($order->status, ['pending', 'confirmed']) && 
               $order->created_at->diffInMinutes(now()) <= 15;
    }
    
    private function canModifyOrder($order)
    {
        return $order->status === 'pending' && 
               $order->created_at->diffInMinutes(now()) <= 5;
    }
}

<?php
// app/Services/Mobile/TableReservationService.php

namespace App\Services\Mobile;

use App\Models\MobileTableReservation;
use App\Models\Restaurant;
use App\Services\NotificationService;
use Illuminate\Support\Str;
use Carbon\Carbon;

class TableReservationService
{
    protected $notificationService;
    
    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }
    
    public function getAvailableSlots($restaurantId, $date, $partySize)
    {
        $restaurant = Restaurant::findOrFail($restaurantId);
        $requestDate = Carbon::parse($date);
        
        // Get restaurant operating hours and capacity
        $operatingHours = $this->getOperatingHours($restaurant, $requestDate);
        $capacity = $restaurant->capacity ?? 50;
        
        // Generate time slots (every 30 minutes)
        $slots = [];
        $currentTime = $operatingHours['open'];
        
        while ($currentTime->isBefore($operatingHours['close'])) {
            $reservationCount = MobileTableReservation::where('restaurant_id', $restaurantId)
                ->where('reservation_date', $requestDate->toDateString())
                ->where('reservation_time', $currentTime->toTimeString())
                ->whereIn('status', ['confirmed', 'pending'])
                ->sum('party_size');
            
            $availableCapacity = $capacity - $reservationCount;
            
            if ($availableCapacity >= $partySize) {
                $slots[] = [
                    'time' => $currentTime->format('H:i'),
                    'available_spots' => $availableCapacity,
                    'is_popular' => $this->isPopularTimeSlot($currentTime),
                ];
            }
            
            $currentTime->addMinutes(30);
        }
        
        return $slots;
    }
    
    public function createReservation($guestId, $reservationData)
    {
        // Check availability
        $isAvailable = $this->checkAvailability(
            $reservationData['restaurant_id'],
            $reservationData['reservation_date'],
            $reservationData['reservation_time'],
            $reservationData['party_size']
        );
        
        if (!$isAvailable) {
            throw new \Exception('Selected time slot is no longer available');
        }
        
        $reservation = MobileTableReservation::create([
            'reservation_number' => $this->generateReservationNumber(),
            'guest_id' => $guestId,
            'restaurant_id' => $reservationData['restaurant_id'],
            'party_size' => $reservationData['party_size'],
            'reservation_date' => $reservationData['reservation_date'],
            'reservation_time' => $reservationData['reservation_time'],
            'table_preference' => $reservationData['table_preference'] ?? 'any',
            'special_occasion' => $reservationData['special_occasion'] ?? null,
            'special_requests' => $reservationData['special_requests'] ?? null,
            'guest_notes' => $reservationData['guest_notes'] ?? null,
        ]);
        
        // Send confirmation
        $this->notificationService->sendReservationConfirmation($reservation);
        
        return $reservation->load('restaurant', 'guest');
    }
    
    public function confirmReservation($reservationId, $staffId)
    {
        $reservation = MobileTableReservation::findOrFail($reservationId);
        
        $reservation->update([
            'status' => 'confirmed',
            'confirmed_at' => now(),
        ]);
        
        $this->notificationService->sendReservationStatusUpdate($reservation);
        
        return $reservation;
    }
    
    private function generateReservationNumber()
    {
        do {
            $number = 'TR' . date('Ymd') . Str::random(4);
        } while (MobileTableReservation::where('reservation_number', $number)->exists());
        
        return $number;
    }
    
    private function getOperatingHours($restaurant, $date)
    {
        // Default hours - would typically come from restaurant settings
        return [
            'open' => Carbon::createFromTime(11, 0),
            'close' => Carbon::createFromTime(22, 0),
        ];
    }
    
    private function isPopularTimeSlot($time)
    {
        // Peak dinner hours
        return $time->hour >= 18 && $time->hour <= 20;
    }
    
    private function checkAvailability($restaurantId, $date, $time, $partySize)
    {
        $restaurant = Restaurant::findOrFail($restaurantId);
        $capacity = $restaurant->capacity ?? 50;
        
        $reservedCount = MobileTableReservation::where('restaurant_id', $restaurantId)
            ->where('reservation_date', $date)
            ->where('reservation_time', $time)
            ->whereIn('status', ['confirmed', 'pending'])
            ->sum('party_size');
        
        return ($capacity - $reservedCount) >= $partySize;
    }
}
```

## Frontend Implementation (Flutter)

### Flutter Widgets and Screens

```dart
// lib/features/restaurant/screens/menu_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/widgets/cached_network_image.dart';
import '../../../core/widgets/search_bar.dart';
import '../bloc/menu_bloc.dart';
import '../widgets/menu_category_list.dart';
import '../widgets/menu_item_card.dart';
import '../widgets/menu_filter_drawer.dart';

class MenuScreen extends StatefulWidget {
  final String restaurantId;
  
  const MenuScreen({Key? key, required this.restaurantId}) : super(key: key);
  
  @override
  _MenuScreenState createState() => _MenuScreenState();
}

class _MenuScreenState extends State<MenuScreen> {
  final ScrollController _scrollController = ScrollController();
  String _searchQuery = '';
  Map<String, dynamic> _filters = {};
  
  @override
  void initState() {
    super.initState();
    context.read<MenuBloc>().add(LoadMenuEvent(widget.restaurantId));
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('เมนูอาหาร'),
        actions: [
          IconButton(
            icon: Icon(Icons.filter_list),
            onPressed: () => _showFilterDrawer(),
          ),
          IconButton(
            icon: Icon(Icons.shopping_cart),
            onPressed: () => _goToCart(),
          ),
        ],
      ),
      body: Column(
        children: [
          _buildSearchBar(),
          Expanded(
            child: BlocBuilder<MenuBloc, MenuState>(
              builder: (context, state) {
                if (state is MenuLoading) {
                  return Center(child: CircularProgressIndicator());
                }
                
                if (state is MenuError) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.error_outline, size: 64, color: Colors.grey),
                        SizedBox(height: 16),
                        Text(state.message),
                        ElevatedButton(
                          onPressed: () => context.read<MenuBloc>()
                              .add(LoadMenuEvent(widget.restaurantId)),
                          child: Text('ลองใหม่'),
                        ),
                      ],
                    ),
                  );
                }
                
                if (state is MenuLoaded) {
                  return _buildMenuContent(state);
                }
                
                return Container();
              },
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildSearchBar() {
    return Container(
      padding: EdgeInsets.all(16),
      child: CustomSearchBar(
        hintText: 'ค้นหาเมนู...',
        onChanged: (query) {
          setState(() => _searchQuery = query);
          _performSearch();
        },
      ),
    );
  }
  
  Widget _buildMenuContent(MenuLoaded state) {
    if (_searchQuery.isNotEmpty || _filters.isNotEmpty) {
      return _buildSearchResults(state.searchResults);
    }
    
    return Row(
      children: [
        // Category sidebar
        Container(
          width: 120,
          child: MenuCategoryList(
            categories: state.categories,
            onCategorySelected: (categoryId) => _scrollToCategory(categoryId),
          ),
        ),
        // Menu items
        Expanded(
          child: ListView.builder(
            controller: _scrollController,
            itemCount: state.categories.length,
            itemBuilder: (context, index) {
              final category = state.categories[index];
              return _buildCategorySection(category);
            },
          ),
        ),
      ],
    );
  }
  
  Widget _buildCategorySection(MenuCategory category) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: EdgeInsets.all(16),
          child: Row(
            children: [
              if (category.imageUrl != null)
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: CachedNetworkImageWidget(
                    imageUrl: category.imageUrl!,
                    width: 40,
                    height: 40,
                    fit: BoxFit.cover,
                  ),
                ),
              SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      category.name,
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                    if (category.description != null)
                      Text(
                        category.description!,
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                  ],
                ),
              ),
            ],
          ),
        ),
        ...category.items.map((item) => MenuItemCard(
          item: item,
          onTap: () => _showItemDetails(item),
          onAddToCart: () => _addToCart(item),
        )),
        SizedBox(height: 24),
      ],
    );
  }
  
  Widget _buildSearchResults(List<MenuItem> results) {
    if (results.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.search_off, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('ไม่พบผลการค้นหา'),
          ],
        ),
      );
    }
    
    return ListView.builder(
      itemCount: results.length,
      itemBuilder: (context, index) {
        return MenuItemCard(
          item: results[index],
          onTap: () => _showItemDetails(results[index]),
          onAddToCart: () => _addToCart(results[index]),
        );
      },
    );
  }
  
  void _performSearch() {
    context.read<MenuBloc>().add(SearchMenuEvent(
      widget.restaurantId,
      _searchQuery,
      _filters,
    ));
  }
  
  void _showFilterDrawer() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => MenuFilterDrawer(
        currentFilters: _filters,
        onFiltersChanged: (filters) {
          setState(() => _filters = filters);
          _performSearch();
        },
      ),
    );
  }
  
  void _showItemDetails(MenuItem item) {
    Navigator.pushNamed(
      context,
      '/menu-item-details',
      arguments: item,
    );
  }
  
  void _addToCart(MenuItem item) {
    context.read<MenuBloc>().add(AddToCartEvent(item));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('เพิ่ม ${item.name} ลงในตะกร้าแล้ว'),
        action: SnackBarAction(
          label: 'ดูตะกร้า',
          onPressed: _goToCart,
        ),
      ),
    );
  }
  
  void _goToCart() {
    Navigator.pushNamed(context, '/cart');
  }
  
  void _scrollToCategory(String categoryId) {
    // Implementation for smooth scrolling to category
  }
}

// lib/features/restaurant/widgets/menu_item_card.dart

import 'package:flutter/material.dart';
import '../../../core/widgets/cached_network_image.dart';
import '../models/menu_item.dart';

class MenuItemCard extends StatelessWidget {
  final MenuItem item;
  final VoidCallback onTap;
  final VoidCallback onAddToCart;
  
  const MenuItemCard({
    Key? key,
    required this.item,
    required this.onTap,
    required this.onAddToCart,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Item image
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: CachedNetworkImageWidget(
                  imageUrl: item.images.isNotEmpty ? item.images.first.url : '',
                  width: 80,
                  height: 80,
                  fit: BoxFit.cover,
                  placeholder: Container(
                    width: 80,
                    height: 80,
                    color: Colors.grey[300],
                    child: Icon(Icons.restaurant),
                  ),
                ),
              ),
              SizedBox(width: 16),
              
              // Item details
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            item.name,
                            style: Theme.of(context).textTheme.titleMedium,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        _buildItemBadges(),
                      ],
                    ),
                    
                    if (item.description != null) ...[
                      SizedBox(height: 4),
                      Text(
                        item.description!,
                        style: Theme.of(context).textTheme.bodySmall,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                    
                    SizedBox(height: 8),
                    
                    // Dietary tags and allergens
                    if (item.dietaryTags.isNotEmpty || item.allergens.isNotEmpty)
                      Wrap(
                        spacing: 4,
                        runSpacing: 4,
                        children: [
                          ...item.dietaryTags.map((tag) => _buildTag(tag, Colors.green)),
                          ...item.allergens.map((allergen) => _buildTag(allergen, Colors.orange)),
                        ],
                      ),
                    
                    SizedBox(height: 8),
                    
                    // Price and add button
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '฿${item.price.toStringAsFixed(0)}',
                              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                color: Theme.of(context).primaryColor,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            if (item.preparationTime > 0)
                              Text(
                                '${item.preparationTime} นาที',
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                          ],
                        ),
                        ElevatedButton.icon(
                          onPressed: onAddToCart,
                          icon: Icon(Icons.add_shopping_cart, size: 16),
                          label: Text('เพิ่ม'),
                          style: ElevatedButton.styleFrom(
                            minimumSize: Size(80, 36),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
  
  Widget _buildItemBadges() {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (item.isPopular)
          Container(
            padding: EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: Colors.red,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              'ยอดนิยม',
              style: TextStyle(color: Colors.white, fontSize: 10),
            ),
          ),
        if (item.isChefSpecial) ...[
          SizedBox(width: 4),
          Container(
            padding: EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: Colors.purple,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              'เชฟแนะนำ',
              style: TextStyle(color: Colors.white, fontSize: 10),
            ),
          ),
        ],
        if (item.isSpicy) ...[
          SizedBox(width: 4),
          Icon(Icons.local_fire_department, color: Colors.red, size: 16),
        ],
      ],
    );
  }
  
  Widget _buildTag(String tag, Color color) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        border: Border.all(color: color.withOpacity(0.3)),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        tag,
        style: TextStyle(
          color: color,
          fontSize: 10,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }
}

// lib/features/restaurant/screens/cart_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/cart_bloc.dart';
import '../widgets/cart_item_widget.dart';
import '../widgets/order_summary_widget.dart';

class CartScreen extends StatefulWidget {
  @override
  _CartScreenState createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('ตะกร้าสินค้า'),
        actions: [
          IconButton(
            icon: Icon(Icons.delete_sweep),
            onPressed: () => _clearCart(),
          ),
        ],
      ),
      body: BlocBuilder<CartBloc, CartState>(
        builder: (context, state) {
          if (state.items.isEmpty) {
            return _buildEmptyCart();
          }
          
          return Column(
            children: [
              Expanded(
                child: ListView.builder(
                  itemCount: state.items.length,
                  itemBuilder: (context, index) {
                    final item = state.items[index];
                    return CartItemWidget(
                      item: item,
                      onQuantityChanged: (quantity) => _updateQuantity(item, quantity),
                      onRemove: () => _removeItem(item),
                    );
                  },
                ),
              ),
              OrderSummaryWidget(
                subtotal: state.subtotal,
                taxAmount: state.taxAmount,
                deliveryFee: state.deliveryFee,
                total: state.total,
                onCheckout: () => _proceedToCheckout(),
              ),
            ],
          );
        },
      ),
    );
  }
  
  Widget _buildEmptyCart() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.shopping_cart_outlined, size: 80, color: Colors.grey),
          SizedBox(height: 16),
          Text(
            'ตะกร้าว่างเปล่า',
            style: Theme.of(context).textTheme.headlineMedium,
          ),
          SizedBox(height: 8),
          Text('เพิ่มสินค้าลงในตะกร้าเพื่อสั่งซื้อ'),
          SizedBox(height: 24),
          ElevatedButton(
            onPressed: () => Navigator.pop(context),
            child: Text('เลือกเมนูอาหาร'),
          ),
        ],
      ),
    );
  }
  
  void _updateQuantity(CartItem item, int quantity) {
    context.read<CartBloc>().add(UpdateCartItemEvent(item.id, quantity));
  }
  
  void _removeItem(CartItem item) {
    context.read<CartBloc>().add(RemoveFromCartEvent(item.id));
  }
  
  void _clearCart() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('ล้างตะกร้า'),
        content: Text('คุณต้องการลบสินค้าทั้งหมดในตะกร้าหรือไม่?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('ยกเลิก'),
          ),
          TextButton(
            onPressed: () {
              context.read<CartBloc>().add(ClearCartEvent());
              Navigator.pop(context);
            },
            child: Text('ล้าง'),
          ),
        ],
      ),
    );
  }
  
  void _proceedToCheckout() {
    Navigator.pushNamed(context, '/checkout');
  }
}
```

## Testing Strategy

### Unit Tests
```dart
// test/features/restaurant/services/mobile_food_order_service_test.dart

import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import '../../../lib/features/restaurant/services/mobile_food_order_service.dart';

void main() {
  group('MobileFoodOrderService', () {
    late MobileFoodOrderService service;
    
    setUp(() {
      service = MobileFoodOrderService();
    });
    
    test('should create order with correct data', () async {
      final orderData = {
        'restaurant_id': '1',
        'items': [
          {
            'menu_item_id': '1',
            'quantity': 2,
            'unit_price': 150.0,
            'total_price': 300.0,
          }
        ],
        'delivery_location': 'room',
        'room_number': '101',
        'subtotal': 300.0,
        'total_amount': 330.0,
      };
      
      final result = await service.createOrder('guest123', orderData);
      
      expect(result.orderNumber, isNotNull);
      expect(result.totalAmount, equals(330.0));
      expect(result.status, equals('pending'));
    });
    
    test('should calculate delivery time correctly', () async {
      final order = MockOrder();
      when(order.orderType).thenReturn('room_service');
      when(order.items).thenReturn([MockOrderItem(quantity: 3)]);
      
      final deliveryTime = service.calculateDeliveryTime(order);
      
      expect(deliveryTime.isAfter(DateTime.now()), isTrue);
    });
  });
}
```

### Integration Tests
```dart
// integration_test/restaurant_flow_test.dart

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:banrimkwae_mobile/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  
  group('Restaurant Flow Integration Tests', () {
    testWidgets('complete food ordering flow', (WidgetTester tester) async {
      app.main();
      await tester.pumpAndSettle();
      
      // Navigate to restaurant
      await tester.tap(find.byKey(Key('restaurant_tab')));
      await tester.pumpAndSettle();
      
      // Select a restaurant
      await tester.tap(find.text('Main Restaurant'));
      await tester.pumpAndSettle();
      
      // Add item to cart
      await tester.tap(find.byKey(Key('add_to_cart_1')));
      await tester.pumpAndSettle();
      
      // Go to cart
      await tester.tap(find.byIcon(Icons.shopping_cart));
      await tester.pumpAndSettle();
      
      // Proceed to checkout
      await tester.tap(find.text('สั่งซื้อ'));
      await tester.pumpAndSettle();
      
      // Verify order creation
      expect(find.text('คำสั่งซื้อสำเร็จ'), findsOneWidget);
    });
    
    testWidgets('table reservation flow', (WidgetTester tester) async {
      app.main();
      await tester.pumpAndSettle();
      
      // Navigate to reservations
      await tester.tap(find.text('จองโต๊ะ'));
      await tester.pumpAndSettle();
      
      // Select date and time
      await tester.tap(find.byType(DatePicker));
      await tester.pumpAndSettle();
      
      await tester.tap(find.text('19:00'));
      await tester.pumpAndSettle();
      
      // Complete reservation
      await tester.tap(find.text('จองโต๊ะ'));
      await tester.pumpAndSettle();
      
      expect(find.text('จองโต๊ะสำเร็จ'), findsOneWidget);
    });
  });
}
```

## Implementation Plan

### Day 1-2: Database and Backend Setup
- Create database tables for mobile menu system
- Implement menu service with caching
- Set up image upload and management
- Create food order management system

### Day 3: Menu Display and Search
- Implement Flutter menu screens
- Add search and filter functionality
- Create menu item detail views
- Implement shopping cart functionality

### Day 4: Order Management
- Build order creation and tracking
- Implement real-time status updates
- Add order modification and cancellation
- Create kitchen display integration

### Day 5: Reservations and Testing
- Implement table reservation system
- Add availability checking
- Create comprehensive test suites
- Performance optimization and bug fixes

## Success Metrics
- Order completion rate > 95%
- Average order processing time < 3 minutes
- Search response time < 500ms
- Guest satisfaction score > 4.5/5 for mobile ordering
- Staff efficiency improvement of 25% in order management
