import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class SupabaseGuard implements CanActivate {
    private readonly logger = new Logger(SupabaseGuard.name);

    constructor(private readonly supabase: SupabaseService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('Missing or invalid bearer token');
        }

        try {
            const { data: { user }, error } = await this.supabase.getClient().auth.getUser(token);
            if (error || !user) {
                throw new UnauthorizedException('Invalid or expired token');
            }
            request['user'] = user;
        } catch (error) {
            if (error instanceof UnauthorizedException) throw error;
            this.logger.warn(`Auth verification failed: ${error.message}`);
            throw new UnauthorizedException('Authentication failed');
        }
        return true;
    }

    private extractTokenFromHeader(request: any): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
