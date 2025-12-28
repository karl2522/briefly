
import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { OAuthStateUtil } from '../utils/state.util';

@Injectable()
export class FacebookAuthGuard extends AuthGuard('facebook') {
    getAuthenticateOptions(context: ExecutionContext) {
        const req = context.switchToHttp().getRequest();
        const mode = (req.query.mode as string) || 'signin';

        // Generate signed state containing the mode
        return {
            state: OAuthStateUtil.generateState(mode),
        };
    }
}
