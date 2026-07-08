import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabaseService = inject(SupabaseService);

  async checkAuth(): Promise<boolean> {
    // getSession() checks local storage and is fast
    const { data: { session } } = await this.supabaseService.client.auth.getSession();
    
    if (!session) {
      return false;
    }

    // getUser() reaches out to the server to guarantee the token is still valid
    // This is crucial to avoid issues on F5 if the token expired locally
    const { data: { user }, error } = await this.supabaseService.client.auth.getUser();

    if (error || !user) {
      return false;
    }

    return true;
  }
}
