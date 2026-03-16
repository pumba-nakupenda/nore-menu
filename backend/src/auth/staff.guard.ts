import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class StaffGuard implements CanActivate {
    constructor(private readonly supabase: SupabaseService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        // Staff ID must come from the x-staff-id header (not from body to prevent spoofing)
        const staffId = request.headers['x-staff-id'];
        const restaurantId = request.params.restaurantId || request.body?.restaurantId;

        if (!staffId) {
            throw new UnauthorizedException('Staff ID required via x-staff-id header');
        }

        // Validate UUID format to prevent injection
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(staffId)) {
            throw new UnauthorizedException('Invalid staff ID format');
        }

        // Verify the staff account exists in the database
        const { data: staff, error } = await this.supabase.getClient()
            .from('staff_accounts')
            .select('id, restaurant_id')
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
