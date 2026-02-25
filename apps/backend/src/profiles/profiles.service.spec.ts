import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { SupabaseService } from '../supabase/supabase.service';

describe('ProfilesService', () => {
  let service: ProfilesService;

  const mockSingle = jest.fn();
  const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
  const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
  const mockUpdateEq = jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({ single: mockSingle }),
  });
  const mockUpdate = jest.fn().mockReturnValue({ eq: mockUpdateEq });

  const mockAdminClient = {
    from: jest.fn().mockReturnValue({
      select: mockSelect,
      update: mockUpdate,
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilesService,
        {
          provide: SupabaseService,
          useValue: { getAdminClient: () => mockAdminClient },
        },
      ],
    }).compile();

    service = module.get<ProfilesService>(ProfilesService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getProfile', () => {
    it('should return a mapped profile', async () => {
      mockSingle.mockResolvedValue({
        data: {
          id: '1',
          full_name: 'Test User',
          avatar_url: null,
          subscription_tier: 'free',
          streak_count: 0,
          last_activity_date: null,
          daily_goal: 5,
          created_at: '2026-01-01',
        },
        error: null,
      });

      const result = await service.getProfile('1');
      expect(result.fullName).toBe('Test User');
      expect(result.subscriptionTier).toBe('free');
    });

    it('should throw NotFoundException when profile not found', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { message: 'not found' } });
      await expect(service.getProfile('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
