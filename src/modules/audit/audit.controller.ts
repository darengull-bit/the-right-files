
import { AuditService } from './audit.service';

/**
 * Audit Module Controller.
 */
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  async writeLog(entry: any) {
    return this.auditService.log(entry);
  }
}
