
import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OAuthStateUtil } from '../utils/state.util';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
    getAuthenticateOptions(context: ExecutionContext) {
        const req = context.switchToHttp().getRequest();
        const mode = (req.query.mode as string) || 'signin';

        // Generate signed state containing the mode
        // This protects against CSRF and ensures the mode hasn't been tampered with
        return {
            state: OAuthStateUtil.generateState(mode),
        };
    }
}
