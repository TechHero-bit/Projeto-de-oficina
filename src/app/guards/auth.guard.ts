import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  const { data: { session } } = await supabaseService.client.auth.getSession();

  if (session) {
    return true;
  }

  // Not logged in, redirect to login
  router.navigate(['/login']);
  return false;
};
