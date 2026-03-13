import { UsageService } from './usage.service';

/**
 * Usage Module Controller.
 */
export class UsageController {
  constructor(private readonly usageService: UsageService) {}

  async recordUsage(input: any) {
    return this.usageService.record(input);
  }
}
