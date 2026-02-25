import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../strategies/jwt.strategy';

jest.mock('jwks-rsa', () => ({
  passportJwtSecret: jest.fn().mockReturnValue(jest.fn()),
}));

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: { getOrThrow: jest.fn().mockReturnValue('https://test.supabase.co') },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should return user data from valid payload', () => {
    const result = strategy.validate({ sub: 'user-123', email: 'test@test.com', role: 'authenticated' });
    expect(result).toEqual({ userId: 'user-123', email: 'test@test.com' });
  });

  it('should throw UnauthorizedException for missing sub', () => {
    expect(() => strategy.validate({ sub: '', email: '', role: '' })).toThrow(
      UnauthorizedException,
    );
  });
});
