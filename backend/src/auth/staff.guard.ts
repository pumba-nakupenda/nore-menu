import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class StaffGuard implements CanActivate {
    constructor(private readonly supabase: SupabaseService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        // In this architecture, staff sessions are simplified for the MVP.
        // We expect a x-staff-id header or staffId/processedBy in body for sensitive operations.
        const staffId = request.headers['x-staff-id'] || request.body?.staffId || request.body?.processedBy;
        const restaurantId = request.params.restaurantId || request.body?.restaurantId;

        if (!staffId) {
            throw new UnauthorizedException('Staff ID required');
        }

        const { data: staff, error } = await this.supabase.getClient()
            .from('staff_accounts')
            .select('restaurant_id')
            .eq('id', staffId)
            .single();

        if (error || !staff) {
            throw new UnauthorizedException('Invalid staff account');
        }

        // If a restaurantId is involved in the request, verify the staff belongs to it
        if (restaurantId && staff.restaurant_id !== restaurantId) {
            throw new ForbiddenException('You do not have access to this restaurant');
        }

        request['staff'] = staff;
        return true;
    }
}
