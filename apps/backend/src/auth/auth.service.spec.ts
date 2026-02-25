import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SupabaseService } from '../supabase/supabase.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockSupabaseClient = {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      refreshSession: jest.fn(),
    },
  };

  const mockSupabaseAdminClient = {
    auth: {
      admin: { signOut: jest.fn() },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: () => mockSupabaseClient,
            getAdminClient: () => mockSupabaseAdminClient,
          },
        },
        {
          provide: ConfigService,
          useValue: { getOrThrow: jest.fn().mockReturnValue('http://localhost') },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('should return tokens on successful registration', async () => {
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: {
          session: { access_token: 'at', refresh_token: 'rt' },
          user: { id: '1', email: 'test@test.com' },
        },
        error: null,
      });

      const result = await service.register('test@test.com', 'password', 'Test');
      expect(result.accessToken).toBe('at');
      expect(result.refreshToken).toBe('rt');
    });

    it('should throw BadRequestException on Supabase error', async () => {
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: {},
        error: { message: 'User already registered' },
      });

      await expect(service.register('test@test.com', 'pw', 'Test')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    it('should return tokens on successful login', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: {
          session: { access_token: 'at', refresh_token: 'rt' },
          user: { id: '1' },
        },
        error: null,
      });

      const result = await service.login('test@test.com', 'password');
      expect(result.accessToken).toBe('at');
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: {},
        error: { message: 'Invalid login credentials' },
      });

      await expect(service.login('test@test.com', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refresh', () => {
    it('should return new tokens', async () => {
      mockSupabaseClient.auth.refreshSession.mockResolvedValue({
        data: { session: { access_token: 'new-at', refresh_token: 'new-rt' } },
        error: null,
      });

      const result = await service.refresh('old-rt');
      expect(result.accessToken).toBe('new-at');
    });
  });
});
