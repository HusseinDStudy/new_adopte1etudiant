import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as messages from '../messageService';

// Mock the apiClient module itself
vi.mock('../apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Import the mocked apiClient after the mock definition
import apiClient from '../apiClient';

describe('messageService', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('getMyConversations passes params', async () => {
    const mockConversations = { conversations: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
    (apiClient.get as vi.Mock).mockResolvedValueOnce({ data: mockConversations });
    
    const res = await messages.getMyConversations({ page: 1, limit: 10, search: 'a', status: 'OPEN' });
    expect(apiClient.get).toHaveBeenCalledWith('/messages/conversations', expect.any(Object));
    expect(res).toEqual(mockConversations);
  });

  it('getMessagesForConversation and createMessageInConversation call endpoints', async () => {
    const mockMessages = { messages: [], conversation: { id: 'c1' } };
    (apiClient.get as vi.Mock).mockResolvedValueOnce({ data: mockMessages });
    (apiClient.post as vi.Mock).mockResolvedValueOnce({ data: { id: 'm1' } });

    const resMessages = await messages.getMessagesForConversation('c1');
    expect(apiClient.get).toHaveBeenCalledWith('/messages/conversations/c1');
    expect(resMessages).toEqual(mockMessages);

    await messages.createMessageInConversation('c1', 'hello');
    expect(apiClient.post).toHaveBeenCalledWith('/messages/conversations/c1', { content: 'hello' });
  });
});


