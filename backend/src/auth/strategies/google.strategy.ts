import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const clientId = configService.get<string>('app.oauth.google.clientId');
    const clientSecret = configService.get<string>('app.oauth.google.clientSecret');
    const callbackURL = configService.get<string>('app.oauth.google.callbackUrl');

    if (!clientId || !clientSecret || !callbackURL) {
      throw new Error('Google OAuth credentials are not configured');
    }

    super({
      clientID: clientId,
      clientSecret: clientSecret,
      callbackURL: callbackURL,
      scope: ['email', 'profile'],
      passReqToCallback: true, // Enable access to request in validate
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;
    const email = emails?.[0]?.value;
    const displayName = name?.displayName || name?.givenName || name?.familyName || null;
    const photo = photos?.[0]?.value || null;

    if (!email) {
      return done(new Error('No email found in Google profile'), false);
    }

    try {
      // Get mode from cookie (set before OAuth redirect)
      const mode = req.cookies?.oauth_mode as string;
      const isSignup = mode === 'signup';
      
      // Find user by email or googleId
      let user = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { googleId: id },
          ],
        },
      });

      if (!user) {
        if (isSignup) {
          // SIGN-UP: User doesn't exist - create new user with OAuth
          user = await this.prisma.user.create({
            data: {
              email,
              name: displayName,
              avatar: photo,
              googleId: id,
            },
          });
        } else {
          // SIGN-IN: User doesn't exist - they must sign up first
          return done(
            new Error('No account found with this Google account. Please sign up first to create your account.'),
            false,
          );
        }
      } else {
        // SIGN-IN: User exists - check if they have OAuth data
        if (!user.googleId && !user.facebookId) {
          // User signed up with email/password, not OAuth
          return done(
            new Error('This account was created with email/password. Please sign in with email/password.'),
            false,
          );
        }

        if (!user.googleId && user.facebookId) {
          // User signed up with Facebook, not Google
          return done(
            new Error('This account was created with Facebook. Please sign in with Facebook.'),
            false,
          );
        }

        // User has googleId - allow sign-in
        // Update avatar if needed
        if (photo && !user.avatar) {
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: { avatar: photo },
          });
        }
      }

      // Return user data - controller will generate tokens
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      };
    } catch (error) {
      return done(error, false);
    }
  }
}


