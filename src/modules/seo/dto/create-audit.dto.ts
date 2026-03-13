
import { IsString, IsUrl } from 'class-validator';

/**
 * @fileOverview Data Transfer Object for triggering a new SEO content audit.
 */
export class CreateAuditDto {
  @IsString()
  html!: string;

  @IsUrl()
  url!: string;
}
