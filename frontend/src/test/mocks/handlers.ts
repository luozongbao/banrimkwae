import { http, HttpResponse } from 'msw';

const API_BASE = 'http://localhost:8000/api';

export const handlers = [
  // Authentication endpoints
  http.post(`${API_BASE}/auth/login`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        user: {
          id: 1,
          name: 'Test Admin',
          email: 'admin@banrimkwae.com',
          role: {
            id: 1,
            name: 'Admin',
            permissions: ['view_users', 'create_users', 'edit_users', 'delete_users']
          }
        },
        token: 'mock-jwt-token'
      }
    });
  }),

  http.post(`${API_BASE}/auth/logout`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
  }),

  http.get(`${API_BASE}/auth/me`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: 1,
        name: 'Test Admin',
        email: 'admin@banrimkwae.com',
        role: {
          id: 1,
          name: 'Admin',
          permissions: ['view_users', 'create_users', 'edit_users', 'delete_users']
        }
      }
    });
  }),

  // Users endpoints
  http.get(`${API_BASE}/users`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: 1,
          name: 'John Smith',
          email: 'john@banrimkwae.com',
          phone: '+66123456789',
          role: { name: 'Admin' },
          status: 'active',
          created_at: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 2,
          name: 'Jane Doe',
          email: 'jane@banrimkwae.com',
          phone: '+66987654321',
          role: { name: 'Staff' },
          status: 'active',
          created_at: '2024-01-02T00:00:00.000Z'
        }
      ],
      meta: {
        current_page: 1,
        total: 2,
        per_page: 10,
        last_page: 1
      }
    });
  }),

  http.post(`${API_BASE}/users`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: 3,
        name: 'New User',
        email: 'newuser@banrimkwae.com',
        phone: '+66555666777',
        role: { name: 'Staff' },
        status: 'active',
        created_at: new Date().toISOString()
      }
    }, { status: 201 });
  }),

  http.put(`${API_BASE}/users/:id`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: 1,
        name: 'Updated User Name',
        email: 'updated@banrimkwae.com',
        phone: '+66123456789',
        role: { name: 'Admin' },
        status: 'active',
        created_at: '2024-01-01T00:00:00.000Z'
      }
    });
  }),

  http.delete(`${API_BASE}/users/:id`, () => {
    return HttpResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
  }),

  // Roles endpoints
  http.get(`${API_BASE}/roles`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        { id: 1, name: 'Admin', permissions: ['view_users', 'create_users', 'edit_users', 'delete_users'] },
        { id: 2, name: 'Staff', permissions: ['view_users'] },
        { id: 3, name: 'Manager', permissions: ['view_users', 'edit_users'] }
      ]
    });
  }),

  // Dashboard endpoints
  http.get(`${API_BASE}/dashboard/summary`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        total_users: 25,
        active_users: 22,
        total_bookings: 150,
        revenue: 850000,
        occupancy_rate: 78.5
      }
    });
  }),

  // Settings endpoints
  http.get(`${API_BASE}/settings`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        site_name: 'Banrimkwae Resort',
        site_description: 'Luxury Resort Management System',
        timezone: 'Asia/Bangkok',
        language: 'th',
        currency: 'THB'
      }
    });
  }),

  // Health check
  http.get(`${API_BASE}/health`, () => {
    return HttpResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: 'test'
    });
  }),
];
