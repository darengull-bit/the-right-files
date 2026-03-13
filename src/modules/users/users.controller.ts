
import { UsersService } from './users.service';

/**
 * Users Module Controller.
 */
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  async getUserProfile(userId: string) {
    return this.usersService.getProfile(userId);
  }

  async updateProfile(userId: string, data: any) {
    return this.usersService.updateProfile(userId, data);
  }
}
