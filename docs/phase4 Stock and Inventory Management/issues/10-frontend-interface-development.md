# Issue #10: Frontend Interface Development

## Overview
Develop a comprehensive React-based frontend interface for the inventory management system including dashboard components, forms, reports, mobile-responsive design, and real-time updates for the Banrimkwae Resort inventory system.

## Priority
High

## Estimated Duration
6-7 days

## Dependencies
- Issue #02: Core Inventory Management Backend System
- Issue #06: Inventory Analytics and Reporting System
- Frontend design system framework
- API endpoints from all backend issues

## Technical Requirements

### Frontend Architecture

#### 1. Component Structure
```
src/
├── components/
│   ├── inventory/
│   │   ├── Dashboard/
│   │   ├── ItemManagement/
│   │   ├── StockMovements/
│   │   ├── PurchaseOrders/
│   │   ├── Suppliers/
│   │   ├── Reports/
│   │   └── Analytics/
│   ├── common/
│   │   ├── DataTable/
│   │   ├── Charts/
│   │   ├── Forms/
│   │   └── Modals/
│   └── layout/
├── hooks/
│   ├── useInventory.js
│   ├── useSuppliers.js
│   └── useAnalytics.js
├── services/
│   ├── inventoryApi.js
│   ├── supplierApi.js
│   └── analyticsApi.js
├── store/
│   ├── inventorySlice.js
│   ├── supplierSlice.js
│   └── alertSlice.js
└── utils/
    ├── formatters.js
    ├── validators.js
    └── constants.js
```

### Dashboard Components

#### 1. Main Inventory Dashboard
Create `src/components/inventory/Dashboard/InventoryDashboard.jsx`:

```jsx
import React, { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { useInventoryDashboard } from '../../../hooks/useInventory';
import StockValueCard from './StockValueCard';
import LowStockAlerts from './LowStockAlerts';
import RecentMovements from './RecentMovements';
import TopConsumers from './TopConsumers';
import QuickActions from './QuickActions';
import StockLevelChart from './StockLevelChart';
import LoadingSpinner from '../../common/LoadingSpinner';

const InventoryDashboard = () => {
    const { dashboardData, loading, error, refreshDashboard } = useInventoryDashboard();
    const [refreshInterval, setRefreshInterval] = useState(null);

    useEffect(() => {
        refreshDashboard();
        
        // Set up auto-refresh every 5 minutes
        const interval = setInterval(refreshDashboard, 5 * 60 * 1000);
        setRefreshInterval(interval);
        
        return () => clearInterval(interval);
    }, []);

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorAlert error={error} onRetry={refreshDashboard} />;

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Inventory Dashboard
            </Typography>
            
            <Grid container spacing={3}>
                {/* Key Metrics */}
                <Grid item xs={12} sm={6} md={3}>
                    <StockValueCard
                        title="Total Stock Value"
                        value={dashboardData.totalStockValue}
                        trend={dashboardData.stockValueTrend}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StockValueCard
                        title="Low Stock Items"
                        value={dashboardData.lowStockCount}
                        color="warning"
                        onClick={() => navigateToLowStock()}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StockValueCard
                        title="Pending Orders"
                        value={dashboardData.pendingOrdersCount}
                        color="info"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StockValueCard
                        title="Today's Movements"
                        value={dashboardData.todayMovementsCount}
                        color="success"
                    />
                </Grid>

                {/* Quick Actions */}
                <Grid item xs={12}>
                    <QuickActions
                        actions={[
                            { label: 'Add Stock', icon: 'add', action: 'add_stock' },
                            { label: 'Create Purchase Order', icon: 'shopping_cart', action: 'create_po' },
                            { label: 'Stock Count', icon: 'inventory', action: 'stock_count' },
                            { label: 'Generate Report', icon: 'assessment', action: 'generate_report' }
                        ]}
                        onAction={handleQuickAction}
                    />
                </Grid>

                {/* Charts */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Stock Levels Overview
                        </Typography>
                        <StockLevelChart data={dashboardData.stockLevelData} />
                    </Paper>
                </Grid>

                {/* Alerts */}
                <Grid item xs={12} md={4}>
                    <LowStockAlerts
                        alerts={dashboardData.lowStockAlerts}
                        maxDisplay={5}
                        onViewAll={() => navigateToAlerts()}
                    />
                </Grid>

                {/* Recent Activity */}
                <Grid item xs={12} md={6}>
                    <RecentMovements
                        movements={dashboardData.recentMovements}
                        maxDisplay={10}
                    />
                </Grid>

                {/* Top Consumers */}
                <Grid item xs={12} md={6}>
                    <TopConsumers
                        items={dashboardData.topConsumers}
                        period="7days"
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default InventoryDashboard;
```

#### 2. Stock Level Chart Component
Create `src/components/inventory/Dashboard/StockLevelChart.jsx`:

```jsx
import React from 'react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Cell
} from 'recharts';
import { useTheme } from '@mui/material/styles';

const StockLevelChart = ({ data }) => {
    const theme = useTheme();

    const getBarColor = (level) => {
        if (level < 20) return theme.palette.error.main;
        if (level < 50) return theme.palette.warning.main;
        return theme.palette.success.main;
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="custom-tooltip" style={{
                    backgroundColor: 'white',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                }}>
                    <p>{`${label}`}</p>
                    <p>{`Current Stock: ${data.currentStock}`}</p>
                    <p>{`Stock Level: ${data.stockLevel}%`}</p>
                    <p>{`Status: ${data.status}`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="stockLevel" name="Stock Level %">
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBarColor(entry.stockLevel)} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default StockLevelChart;
```

### Item Management Components

#### 1. Item List Component
Create `src/components/inventory/ItemManagement/ItemList.jsx`:

```jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    TextField,
    MenuItem,
    Chip,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Visibility as ViewIcon,
    Warning as WarningIcon
} from '@mui/icons-material';
import DataTable from '../../common/DataTable';
import { useInventoryItems } from '../../../hooks/useInventory';
import ItemFormDialog from './ItemFormDialog';
import ItemDetailDialog from './ItemDetailDialog';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const ItemList = () => {
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        location: '',
        status: 'all'
    });
    const [pagination, setPagination] = useState({
        page: 0,
        rowsPerPage: 25
    });
    const [selectedItem, setSelectedItem] = useState(null);
    const [formOpen, setFormOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);

    const {
        items,
        loading,
        totalCount,
        categories,
        locations,
        refetch
    } = useInventoryItems(filters, pagination);

    const columns = [
        {
            field: 'sku',
            headerName: 'SKU',
            width: 120,
            renderCell: (params) => (
                <Typography variant="body2" fontFamily="monospace">
                    {params.value}
                </Typography>
            )
        },
        {
            field: 'name',
            headerName: 'Item Name',
            width: 200,
            renderCell: (params) => (
                <Box>
                    <Typography variant="body2" fontWeight="medium">
                        {params.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {params.row.category}
                    </Typography>
                </Box>
            )
        },
        {
            field: 'currentStock',
            headerName: 'Current Stock',
            width: 130,
            renderCell: (params) => {
                const { currentStock, minimumStock, unitOfMeasure } = params.row;
                const isLow = currentStock <= minimumStock;
                
                return (
                    <Box display="flex" alignItems="center" gap={1}>
                        <Typography
                            variant="body2"
                            color={isLow ? 'error.main' : 'text.primary'}
                        >
                            {currentStock} {unitOfMeasure}
                        </Typography>
                        {isLow && (
                            <Tooltip title="Low Stock">
                                <WarningIcon color="error" fontSize="small" />
                            </Tooltip>
                        )}
                    </Box>
                );
            }
        },
        {
            field: 'stockValue',
            headerName: 'Stock Value',
            width: 120,
            renderCell: (params) => (
                <Typography variant="body2">
                    {formatCurrency(params.value)}
                </Typography>
            )
        },
        {
            field: 'lastMovement',
            headerName: 'Last Movement',
            width: 140,
            renderCell: (params) => (
                <Typography variant="body2" color="text.secondary">
                    {formatDate(params.value)}
                </Typography>
            )
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 100,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    size="small"
                    color={params.value === 'active' ? 'success' : 'default'}
                />
            )
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            renderCell: (params) => (
                <Box>
                    <Tooltip title="View Details">
                        <IconButton
                            size="small"
                            onClick={() => handleViewItem(params.row)}
                        >
                            <ViewIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Item">
                        <IconButton
                            size="small"
                            onClick={() => handleEditItem(params.row)}
                        >
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        }
    ];

    const handleViewItem = (item) => {
        setSelectedItem(item);
        setDetailOpen(true);
    };

    const handleEditItem = (item) => {
        setSelectedItem(item);
        setFormOpen(true);
    };

    const handleAddItem = () => {
        setSelectedItem(null);
        setFormOpen(true);
    };

    const handleFormClose = (shouldRefetch = false) => {
        setFormOpen(false);
        setSelectedItem(null);
        if (shouldRefetch) {
            refetch();
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
                <Typography variant="h4">
                    Inventory Items
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddItem}
                >
                    Add Item
                </Button>
            </Box>

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Box display="flex" gap={2} flexWrap="wrap">
                    <TextField
                        label="Search"
                        variant="outlined"
                        size="small"
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        sx={{ minWidth: 200 }}
                    />
                    <TextField
                        label="Category"
                        variant="outlined"
                        size="small"
                        select
                        value={filters.category}
                        onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                        sx={{ minWidth: 150 }}
                    >
                        <MenuItem value="">All Categories</MenuItem>
                        {categories.map(cat => (
                            <MenuItem key={cat.id} value={cat.id}>
                                {cat.name}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="Location"
                        variant="outlined"
                        size="small"
                        select
                        value={filters.location}
                        onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                        sx={{ minWidth: 150 }}
                    >
                        <MenuItem value="">All Locations</MenuItem>
                        {locations.map(loc => (
                            <MenuItem key={loc.id} value={loc.id}>
                                {loc.name}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="Status"
                        variant="outlined"
                        size="small"
                        select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        sx={{ minWidth: 120 }}
                    >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                        <MenuItem value="low_stock">Low Stock</MenuItem>
                    </TextField>
                </Box>
            </Paper>

            {/* Data Table */}
            <DataTable
                columns={columns}
                rows={items}
                loading={loading}
                totalCount={totalCount}
                pagination={pagination}
                onPaginationChange={setPagination}
                onRowClick={handleViewItem}
            />

            {/* Dialogs */}
            <ItemFormDialog
                open={formOpen}
                item={selectedItem}
                onClose={handleFormClose}
            />
            <ItemDetailDialog
                open={detailOpen}
                item={selectedItem}
                onClose={() => setDetailOpen(false)}
                onEdit={() => {
                    setDetailOpen(false);
                    setFormOpen(true);
                }}
            />
        </Box>
    );
};

export default ItemList;
```

### Stock Movement Components

#### 1. Stock Movement Form
Create `src/components/inventory/StockMovements/MovementForm.jsx`:

```jsx
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    TextField,
    MenuItem,
    Typography,
    Box,
    Autocomplete,
    IconButton,
    Alert
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useInventoryItems, useLocations } from '../../../hooks/useInventory';
import { useStockMovements } from '../../../hooks/useStockMovements';

const MovementForm = ({ open, onClose, movementType = 'transfer' }) => {
    const [formData, setFormData] = useState({
        type: movementType,
        fromLocation: null,
        toLocation: null,
        reason: '',
        notes: '',
        items: [{ item: null, quantity: '', currentStock: 0 }]
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const { items } = useInventoryItems();
    const { locations } = useLocations();
    const { createMovement } = useStockMovements();

    const movementTypes = [
        { value: 'transfer', label: 'Transfer' },
        { value: 'adjustment', label: 'Adjustment' },
        { value: 'consumption', label: 'Consumption' },
        { value: 'return', label: 'Return' }
    ];

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { item: null, quantity: '', currentStock: 0 }]
        }));
    };

    const removeItem = (index) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const updateItem = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.map((item, i) => 
                i === index ? { ...item, [field]: value } : item
            )
        }));

        // Update current stock when item is selected
        if (field === 'item' && value) {
            const stockInfo = getItemStock(value.id, formData.fromLocation?.id);
            updateItem(index, 'currentStock', stockInfo.quantity);
        }
    };

    const getItemStock = (itemId, locationId) => {
        // This would call an API to get current stock for item at location
        return { quantity: 0 }; // Placeholder
    };

    const validateForm = () => {
        const newErrors = {};

        if (formData.type === 'transfer') {
            if (!formData.fromLocation) newErrors.fromLocation = 'From location is required';
            if (!formData.toLocation) newErrors.toLocation = 'To location is required';
            if (formData.fromLocation?.id === formData.toLocation?.id) {
                newErrors.toLocation = 'To location must be different from from location';
            }
        } else if (formData.type === 'adjustment') {
            if (!formData.fromLocation) newErrors.fromLocation = 'Location is required';
        }

        if (!formData.reason.trim()) newErrors.reason = 'Reason is required';

        formData.items.forEach((item, index) => {
            if (!item.item) newErrors[`item_${index}`] = 'Item is required';
            if (!item.quantity || item.quantity <= 0) {
                newErrors[`quantity_${index}`] = 'Quantity must be greater than 0';
            }
            if (formData.type === 'transfer' && item.quantity > item.currentStock) {
                newErrors[`quantity_${index}`] = 'Quantity exceeds available stock';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            await createMovement(formData);
            onClose(true); // Signal successful creation
        } catch (error) {
            setErrors({ submit: error.message });
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData({
            type: movementType,
            fromLocation: null,
            toLocation: null,
            reason: '',
            notes: '',
            items: [{ item: null, quantity: '', currentStock: 0 }]
        });
        setErrors({});
        onClose(false);
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>
                Create Stock {formData.type}
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Movement Type"
                            select
                            value={formData.type}
                            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                        >
                            {movementTypes.map(type => (
                                <MenuItem key={type.value} value={type.value}>
                                    {type.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {(formData.type === 'transfer' || formData.type === 'adjustment') && (
                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                options={locations}
                                getOptionLabel={(option) => option.name}
                                value={formData.fromLocation}
                                onChange={(_, value) => setFormData(prev => ({ ...prev, fromLocation: value }))}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label={formData.type === 'transfer' ? 'From Location' : 'Location'}
                                        error={!!errors.fromLocation}
                                        helperText={errors.fromLocation}
                                    />
                                )}
                            />
                        </Grid>
                    )}

                    {formData.type === 'transfer' && (
                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                options={locations}
                                getOptionLabel={(option) => option.name}
                                value={formData.toLocation}
                                onChange={(_, value) => setFormData(prev => ({ ...prev, toLocation: value }))}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="To Location"
                                        error={!!errors.toLocation}
                                        helperText={errors.toLocation}
                                    />
                                )}
                            />
                        </Grid>
                    )}

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Reason"
                            value={formData.reason}
                            onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                            error={!!errors.reason}
                            helperText={errors.reason}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Notes"
                            multiline
                            rows={2}
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        />
                    </Grid>

                    {/* Items Section */}
                    <Grid item xs={12}>
                        <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
                            <Typography variant="h6">Items</Typography>
                            <Button
                                startIcon={<AddIcon />}
                                onClick={addItem}
                                variant="outlined"
                                size="small"
                            >
                                Add Item
                            </Button>
                        </Box>

                        {formData.items.map((item, index) => (
                            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                                <Grid item xs={5}>
                                    <Autocomplete
                                        options={items}
                                        getOptionLabel={(option) => `${option.name} (${option.sku})`}
                                        value={item.item}
                                        onChange={(_, value) => updateItem(index, 'item', value)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Item"
                                                error={!!errors[`item_${index}`]}
                                                helperText={errors[`item_${index}`]}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={2}>
                                    <TextField
                                        fullWidth
                                        label="Quantity"
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                        error={!!errors[`quantity_${index}`]}
                                        helperText={errors[`quantity_${index}`]}
                                    />
                                </Grid>
                                <Grid item xs={2}>
                                    <TextField
                                        fullWidth
                                        label="Available"
                                        value={item.currentStock}
                                        disabled
                                    />
                                </Grid>
                                <Grid item xs={2}>
                                    <TextField
                                        fullWidth
                                        label="Unit"
                                        value={item.item?.unitOfMeasure || ''}
                                        disabled
                                    />
                                </Grid>
                                <Grid item xs={1}>
                                    {formData.items.length > 1 && (
                                        <IconButton
                                            onClick={() => removeItem(index)}
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    )}
                                </Grid>
                            </Grid>
                        ))}
                    </Grid>

                    {errors.submit && (
                        <Grid item xs={12}>
                            <Alert severity="error">{errors.submit}</Alert>
                        </Grid>
                    )}
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={submitting}
                >
                    {submitting ? 'Creating...' : 'Create Movement'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default MovementForm;
```

### API Services

#### 1. Inventory API Service
Create `src/services/inventoryApi.js`:

```javascript
import axios from 'axios';

const BASE_URL = '/api/inventory';

class InventoryApi {
    // Dashboard
    async getDashboardData() {
        const response = await axios.get(`${BASE_URL}/dashboard`);
        return response.data;
    }

    // Items
    async getItems(params = {}) {
        const response = await axios.get(`${BASE_URL}/items`, { params });
        return response.data;
    }

    async getItem(id) {
        const response = await axios.get(`${BASE_URL}/items/${id}`);
        return response.data;
    }

    async createItem(data) {
        const response = await axios.post(`${BASE_URL}/items`, data);
        return response.data;
    }

    async updateItem(id, data) {
        const response = await axios.put(`${BASE_URL}/items/${id}`, data);
        return response.data;
    }

    async deleteItem(id) {
        const response = await axios.delete(`${BASE_URL}/items/${id}`);
        return response.data;
    }

    // Stock Movements
    async getMovements(params = {}) {
        const response = await axios.get(`${BASE_URL}/movements`, { params });
        return response.data;
    }

    async createMovement(data) {
        const response = await axios.post(`${BASE_URL}/movements`, data);
        return response.data;
    }

    async approveMovement(id, data = {}) {
        const response = await axios.put(`${BASE_URL}/movements/${id}/approve`, data);
        return response.data;
    }

    // Stock Levels
    async getStockLevels(params = {}) {
        const response = await axios.get(`${BASE_URL}/stock-levels`, { params });
        return response.data;
    }

    async updateStockLevel(itemId, locationId, data) {
        const response = await axios.put(
            `${BASE_URL}/stock-levels/${itemId}/${locationId}`,
            data
        );
        return response.data;
    }

    // Categories
    async getCategories() {
        const response = await axios.get(`${BASE_URL}/categories`);
        return response.data;
    }

    // Locations
    async getLocations() {
        const response = await axios.get(`${BASE_URL}/locations`);
        return response.data;
    }

    // Alerts
    async getAlerts(params = {}) {
        const response = await axios.get(`${BASE_URL}/alerts`, { params });
        return response.data;
    }

    async acknowledgeAlert(id) {
        const response = await axios.put(`${BASE_URL}/alerts/${id}/acknowledge`);
        return response.data;
    }

    // Barcode lookup
    async lookupBarcode(barcode) {
        const response = await axios.get(`${BASE_URL}/barcode/${barcode}`);
        return response.data;
    }
}

export default new InventoryApi();
```

### Custom Hooks

#### 1. Inventory Items Hook
Create `src/hooks/useInventory.js`:

```javascript
import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import inventoryApi from '../services/inventoryApi';
import {
    setItems,
    setLoading,
    setError,
    setDashboardData,
    addItem,
    updateItem,
    removeItem
} from '../store/inventorySlice';

export const useInventoryItems = (filters = {}, pagination = {}) => {
    const dispatch = useDispatch();
    const { items, loading, error, totalCount } = useSelector(state => state.inventory);
    const [categories, setCategories] = useState([]);
    const [locations, setLocations] = useState([]);

    const fetchItems = useCallback(async () => {
        dispatch(setLoading(true));
        try {
            const data = await inventoryApi.getItems({ ...filters, ...pagination });
            dispatch(setItems(data));
        } catch (error) {
            dispatch(setError(error.message));
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch, filters, pagination]);

    const fetchCategories = useCallback(async () => {
        try {
            const data = await inventoryApi.getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    }, []);

    const fetchLocations = useCallback(async () => {
        try {
            const data = await inventoryApi.getLocations();
            setLocations(data);
        } catch (error) {
            console.error('Failed to fetch locations:', error);
        }
    }, []);

    useEffect(() => {
        fetchItems();
        fetchCategories();
        fetchLocations();
    }, [fetchItems, fetchCategories, fetchLocations]);

    return {
        items,
        loading,
        error,
        totalCount,
        categories,
        locations,
        refetch: fetchItems
    };
};

export const useInventoryDashboard = () => {
    const dispatch = useDispatch();
    const { dashboardData, loading, error } = useSelector(state => state.inventory);

    const refreshDashboard = useCallback(async () => {
        dispatch(setLoading(true));
        try {
            const data = await inventoryApi.getDashboardData();
            dispatch(setDashboardData(data));
        } catch (error) {
            dispatch(setError(error.message));
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    return {
        dashboardData,
        loading,
        error,
        refreshDashboard
    };
};

export const useInventoryItem = (id) => {
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchItem = useCallback(async () => {
        if (!id) return;
        
        setLoading(true);
        try {
            const data = await inventoryApi.getItem(id);
            setItem(data);
            setError(null);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [id]);

    const updateItemData = useCallback(async (updateData) => {
        setLoading(true);
        try {
            const data = await inventoryApi.updateItem(id, updateData);
            setItem(data);
            return data;
        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchItem();
    }, [fetchItem]);

    return {
        item,
        loading,
        error,
        refetch: fetchItem,
        updateItem: updateItemData
    };
};
```

### Redux Store Slices

#### 1. Inventory Slice
Create `src/store/inventorySlice.js`:

```javascript
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    items: [],
    dashboardData: null,
    stockLevels: {},
    alerts: [],
    loading: false,
    error: null,
    totalCount: 0,
    filters: {},
    selectedItems: []
};

const inventorySlice = createSlice({
    name: 'inventory',
    initialState,
    reducers: {
        setItems: (state, action) => {
            state.items = action.payload.data || action.payload;
            state.totalCount = action.payload.total || action.payload.length;
            state.error = null;
        },
        setDashboardData: (state, action) => {
            state.dashboardData = action.payload;
            state.error = null;
        },
        setStockLevels: (state, action) => {
            state.stockLevels = action.payload;
            state.error = null;
        },
        setAlerts: (state, action) => {
            state.alerts = action.payload;
            state.error = null;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        addItem: (state, action) => {
            state.items.unshift(action.payload);
            state.totalCount += 1;
        },
        updateItem: (state, action) => {
            const index = state.items.findIndex(item => item.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = action.payload;
            }
        },
        removeItem: (state, action) => {
            state.items = state.items.filter(item => item.id !== action.payload);
            state.totalCount -= 1;
        },
        setFilters: (state, action) => {
            state.filters = action.payload;
        },
        setSelectedItems: (state, action) => {
            state.selectedItems = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        }
    }
});

export const {
    setItems,
    setDashboardData,
    setStockLevels,
    setAlerts,
    setLoading,
    setError,
    addItem,
    updateItem,
    removeItem,
    setFilters,
    setSelectedItems,
    clearError
} = inventorySlice.actions;

export default inventorySlice.reducer;
```

### Responsive Design

#### 1. Mobile Optimizations
Create responsive layouts for mobile devices:

```jsx
import { useMediaQuery, useTheme } from '@mui/material';

const InventoryMobileView = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    if (!isMobile) return <InventoryDesktopView />;

    return (
        <Box sx={{ p: 1 }}>
            {/* Mobile-optimized layout */}
            <MobileHeader />
            <MobileQuickActions />
            <MobileItemList />
            <MobileFloatingActionButton />
        </Box>
    );
};
```

### Real-time Updates

#### 1. WebSocket Integration
```javascript
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateItem, setAlert } from '../store/inventorySlice';

export const useInventoryWebSocket = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const ws = new WebSocket(`${process.env.REACT_APP_WS_URL}/inventory`);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            switch (data.type) {
                case 'stock_updated':
                    dispatch(updateItem(data.item));
                    break;
                case 'low_stock_alert':
                    dispatch(setAlert(data.alert));
                    break;
                case 'movement_approved':
                    // Refresh relevant data
                    break;
                default:
                    console.log('Unknown message type:', data.type);
            }
        };

        return () => {
            ws.close();
        };
    }, [dispatch]);
};
```

## Acceptance Criteria

1. **Dashboard Interface:**
   - ✅ Real-time inventory metrics display
   - ✅ Interactive charts and visualizations
   - ✅ Quick action buttons and navigation

2. **Item Management:**
   - ✅ Comprehensive item CRUD interface
   - ✅ Advanced filtering and search
   - ✅ Bulk operations support

3. **Stock Movement Interface:**
   - ✅ Intuitive movement creation forms
   - ✅ Movement approval workflows
   - ✅ Movement history and tracking

4. **Mobile Responsiveness:**
   - ✅ Mobile-optimized layouts
   - ✅ Touch-friendly interactions
   - ✅ Offline capability indicators

5. **Real-time Updates:**
   - ✅ WebSocket integration for live updates
   - ✅ Automatic data refreshing
   - ✅ Live alert notifications

## Implementation Notes

1. **Performance:**
   - Implement virtual scrolling for large datasets
   - Use React.memo for component optimization
   - Implement proper caching strategies

2. **User Experience:**
   - Provide loading states and error handling
   - Implement optimistic updates
   - Include helpful tooltips and guidance

3. **Accessibility:**
   - Follow WCAG guidelines
   - Implement keyboard navigation
   - Include screen reader support

4. **Testing:**
   - Write unit tests for components
   - Implement integration tests
   - Include visual regression tests

## Related Issues
- Issue #02: Core Inventory Management Backend System
- Issue #06: Inventory Analytics and Reporting System
- Issue #07: Mobile Inventory Application
- Issue #11: Testing and Quality Assurance
