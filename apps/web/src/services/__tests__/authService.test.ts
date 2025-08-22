import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as auth from '../authService';

// Mock the apiClient module itself
vi.mock('../apiClient', () => ({
  default: {
    post: vi.fn(() => Promise.resolve({ data: {} })),
    get: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

// Import the mocked apiClient after the mock definition
import apiClient from '../apiClient';

describe('authService', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('login calls /auth/login and returns data', async () => {
    const mockUser = { id: '1', email: 'test@example.com', role: 'STUDENT' };
    (apiClient.post as vi.Mock).mockResolvedValueOnce({ data: mockUser });
    
    const res = await auth.login({ email: 'test@example.com', password: 'password123' });
    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', { email: 'test@example.com', password: 'password123' });
    expect(res).toEqual(mockUser);
  });

  it('getMe calls /auth/me', async () => {
    const mockUser = { id: '1', email: 'test@example.com', role: 'STUDENT' };
    (apiClient.get as vi.Mock).mockResolvedValueOnce({ data: mockUser });
    
    const res = await auth.getMe();
    expect(apiClient.get).toHaveBeenCalledWith('/auth/me');
    expect(res).toEqual(mockUser);
  });
});


