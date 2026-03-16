import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class MasterGuard implements CanActivate {
    constructor(private readonly supabase: SupabaseService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request['user'];

        if (!user?.id) {
            throw new ForbiddenException('User not authenticated');
        }

        const { data } = await this.supabase.getClient()
            .from('restaurants')
            .select('is_master')
            .eq('owner_id', user.id)
            .eq('is_master', true)
            .maybeSingle();

        if (!data) {
            throw new ForbiddenException('Only master admins can perform this action');
        }

        return true;
    }
}
