import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import { PrismaService } from '../../prisma/prisma.service';

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
    const displayName = name ? `${name.givenName || ''} ${name.familyName || ''}`.trim() || null : null;
    const photo = photos?.[0]?.value || null;

    if (!email) {
      return done(new Error('No email found in Facebook profile'), false);
    }

    try {
      // Get mode from cookie (set before OAuth redirect)
      const mode = req.cookies?.oauth_mode as string;
      const isSignup = mode === 'signup';
      
      // Find user by email or facebookId
      let user = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { facebookId: id },
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
              facebookId: id,
            },
          });
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


