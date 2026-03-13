import { ScheduleService } from './schedule.service';

/**
 * @fileOverview Schedule Module Registry.
 * 
 * Provides singleton access to the scheduling service. The init() method
 * serves as the application-wide entry point for registering repeatable jobs,
 * similar to ScheduleModule.forRoot() in other frameworks.
 */
export class ScheduleModule {
  private static service: ScheduleService;

  /**
   * Returns the singleton instance of the Schedule service.
   */
  static getService(): ScheduleService {
    if (!this.service) {
      this.service = new ScheduleService();
    }
    return this.service;
  }

  /**
   * Initializes all system-wide background schedules.
   * This should be called once during the application bootstrap process.
   */
  static async init() {
    const service = this.getService();
    await service.registerJobs();
  }
}
