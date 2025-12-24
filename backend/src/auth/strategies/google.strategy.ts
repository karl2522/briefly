import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { sanitizeName } from '../../common/utils/sanitize.util';
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
    const rawDisplayName = name?.displayName || name?.givenName || name?.familyName || null;
    const rawPhoto = photos?.[0]?.value || null;

    if (!email) {
      return done(new Error('No email found in Google profile'), false);
    }

    // Sanitize OAuth profile data before storing
    const displayName = rawDisplayName ? sanitizeName(rawDisplayName) : null;
    // Validate and sanitize avatar URL
    let photo: string | null = null;
    if (rawPhoto) {
      try {
        // Validate URL format
        const url = new URL(rawPhoto);
        // Only allow http/https protocols
        if (url.protocol === 'http:' || url.protocol === 'https:') {
          // Limit URL length
          if (rawPhoto.length <= 500) {
            photo = rawPhoto;
          }
        }
      } catch (e) {
        // Invalid URL, skip avatar
        photo = null;
      }
    }

    try {
      // Get mode from cookie (set before OAuth redirect)
      const mode = req.cookies?.oauth_mode as string;
      const isSignup = mode === 'signup';
      
      // Ensure Prisma connection is active (reconnect if needed)
      try {
        await this.prisma.$connect();
      } catch (connectError) {
        console.warn('[GoogleStrategy] Connection check failed, continuing anyway:', connectError);
      }
      
      // Find user by email or googleId (with retry on connection error)
      let user;
      try {
        user = await this.prisma.user.findFirst({
          where: {
            OR: [
              { email },
              { googleId: id },
            ],
          },
        });
      } catch (findError: any) {
        // If connection error, reconnect and retry once
        if (findError?.code === 'P1001' || findError?.message?.includes('Closed')) {
          console.warn('[GoogleStrategy] Connection closed during findFirst, reconnecting...');
          await this.prisma.$connect();
          user = await this.prisma.user.findFirst({
            where: {
              OR: [
                { email },
                { googleId: id },
              ],
            },
          });
        } else {
          throw findError;
        }
      }

      if (!user) {
        if (isSignup) {
          // SIGN-UP: User doesn't exist - create new user with OAuth
          // Retry on connection error
          try {
            user = await this.prisma.user.create({
              data: {
                email,
                name: displayName,
                avatar: photo,
                googleId: id,
              },
            });
          } catch (createError: any) {
            // If connection error, reconnect and retry once
            if (createError?.code === 'P1001' || createError?.message?.includes('Closed')) {
              console.warn('[GoogleStrategy] Connection closed during user creation, reconnecting...');
              await this.prisma.$connect();
              user = await this.prisma.user.create({
                data: {
                  email,
                  name: displayName,
                  avatar: photo,
                  googleId: id,
                },
              });
            } else {
              throw createError;
            }
          }
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
          try {
            user = await this.prisma.user.update({
              where: { id: user.id },
              data: { avatar: photo },
            });
          } catch (updateError: any) {
            // If connection error, reconnect and retry once
            if (updateError?.code === 'P1001' || updateError?.message?.includes('Closed')) {
              console.warn('[GoogleStrategy] Connection closed during avatar update, reconnecting...');
              await this.prisma.$connect();
              user = await this.prisma.user.update({
                where: { id: user.id },
                data: { avatar: photo },
              });
            } else {
              // Log but don't fail - avatar update is optional
              console.warn('[GoogleStrategy] Failed to update avatar:', updateError);
            }
          }
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




