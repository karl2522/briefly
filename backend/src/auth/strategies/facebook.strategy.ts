import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import { safeLog } from '../../common/utils/logger.util';
import { sanitizeName } from '../../common/utils/sanitize.util';
import { PrismaService } from '../../prisma/prisma.service';

import { OAuthStateUtil } from '../../auth/utils/state.util';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const appId = configService.get<string>('app.oauth.facebook.appId');
    const appSecret = configService.get<string>('app.oauth.facebook.appSecret');
    const callbackURL = configService.get<string>('app.oauth.facebook.callbackUrl');

    if (!appId || !appSecret || !callbackURL) {
      throw new Error('Facebook OAuth credentials are not configured');
    }

    super({
      clientID: appId,
      clientSecret: appSecret,
      callbackURL: callbackURL,
      scope: ['email'],
      profileFields: ['emails', 'name', 'picture.type(large)'],
      passReqToCallback: true, // Enable access to request in validate
      state: true, // Enable state parameter to pass mode (signup/signin)
      store: {
        store: (req, meta, cb) => {
          // We don't use sessions, so just return the generated state
          cb(null, meta);
        },
        verify: (req, state, cb) => {
          // Verify signature and expiration
          const payload = OAuthStateUtil.verifyState(state);
          if (payload) {
            cb(null, true, state);
          } else {
            cb(new Error('Invalid or expired OAuth state'), false);
          }
        }
      } as any,
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any) => void,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;
    const email = emails?.[0]?.value;
    // Facebook profile name structure: { givenName, familyName, middleName }
    const rawDisplayName = name ? `${name.givenName || ''} ${name.familyName || ''}`.trim() || null : null;
    const rawPhoto = photos?.[0]?.value || null;

    if (!email) {
      return done(new Error('No email found in Facebook profile'), false);
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
      // Decode and verify state to get mode
      const statePayload = OAuthStateUtil.verifyState(req.query.state as string);
      if (!statePayload) {
        return done(new Error('Invalid or expired OAuth state'), false);
      }

      const mode = statePayload.mode;
      const isSignup = mode === 'signup';

      // Ensure Prisma connection is active (reconnect if needed)
      try {
        await this.prisma.$connect();
      } catch (connectError) {
        safeLog.warn('[FacebookStrategy] Connection check failed, continuing anyway:', connectError);
      }

      // Find user by email or facebookId (with retry on connection error)
      let user;
      try {
        user = await this.prisma.user.findFirst({
          where: {
            OR: [
              { email },
              { facebookId: id },
            ],
          },
        });
      } catch (findError: any) {
        // If connection error, reconnect and retry once
        if (findError?.code === 'P1001' || findError?.message?.includes('Closed')) {
          safeLog.warn('[FacebookStrategy] Connection closed during findFirst, reconnecting...');
          await this.prisma.$connect();
          user = await this.prisma.user.findFirst({
            where: {
              OR: [
                { email },
                { facebookId: id },
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
                facebookId: id,
              },
            });
          } catch (createError: any) {
            // If connection error, reconnect and retry once
            if (createError?.code === 'P1001' || createError?.message?.includes('Closed')) {
              safeLog.warn('[FacebookStrategy] Connection closed during user creation, reconnecting...');
              await this.prisma.$connect();
              user = await this.prisma.user.create({
                data: {
                  email,
                  name: displayName,
                  avatar: photo,
                  facebookId: id,
                },
              });
            } else {
              throw createError;
            }
          }
        } else {
          // SIGN-IN: User doesn't exist - they must sign up first
          return done(
            new Error('No account found with this Facebook account. Please sign up first to create your account.'),
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

        if (user.googleId && !user.facebookId) {
          // User signed up with Google, not Facebook
          return done(
            new Error('This account was created with Google. Please sign in with Google.'),
            false,
          );
        }

        // User has facebookId - allow sign-in
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
              safeLog.warn('[FacebookStrategy] Connection closed during avatar update, reconnecting...');
              await this.prisma.$connect();
              user = await this.prisma.user.update({
                where: { id: user.id },
                data: { avatar: photo },
              });
            } else {
              // Log but don't fail - avatar update is optional
              safeLog.warn('[FacebookStrategy] Failed to update avatar:', updateError);
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







