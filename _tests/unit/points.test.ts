import { describe, it, expect, vi, beforeEach } from 'vitest';
import { awardPoints } from '@/lib/points';
import { supabase } from '@/lib/supabase';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
    })),
  },
}));

describe('awardPoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns failure if no userId is provided', async () => {
    const result = await awardPoints('', 10);
    expect(result.success).toBe(false);
    expect(result.message).toBe('No user ID');
  });

  it('awards points and detects rank up with bonus', async () => {
    const mockUser = { money_score: 100 };
    
    // Mock sequential Supabase calls
    const fromMock = vi.mocked(supabase.from);
    
    // 1. Get current score
    fromMock.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockUser, error: null }),
    } as any);

    // 2. Get old rank (users ahead: 5 -> Rank 6)
    fromMock.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      gt: vi.fn().mockResolvedValue({ count: 5, error: null }),
    } as any);

    // 3. Update score
    fromMock.mockReturnValueOnce({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    } as any);

    // 4. Get new rank (users ahead: 3 -> Rank 4)
    fromMock.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      gt: vi.fn().mockResolvedValue({ count: 3, error: null }),
    } as any);

    // 5. Award bonus update
    fromMock.mockReturnValueOnce({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    } as any);

    const result = await awardPoints('user-123', 50);

    expect(result.success).toBe(true);
    expect(result.bonusAwarded).toBe(true);
    expect(result.message).toContain('Rank UP!');
  });

  it('awards points without bonus if rank does not change', async () => {
    const mockUser = { money_score: 100 };
    const fromMock = vi.mocked(supabase.from);
    
    fromMock.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockUser, error: null }),
    } as any);

    fromMock.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      gt: vi.fn().mockResolvedValue({ count: 5, error: null }),
    } as any);

    fromMock.mockReturnValueOnce({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    } as any);

    fromMock.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      gt: vi.fn().mockResolvedValue({ count: 5, error: null }),
    } as any);

    const result = await awardPoints('user-123', 1);

    expect(result.success).toBe(true);
    expect(result.bonusAwarded).toBe(false);
  });
});
