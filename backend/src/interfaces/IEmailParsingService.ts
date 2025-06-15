import { ParsedOrder } from '../../../shared/types';

export interface IEmailParsingService {
  parseEmail(emailContent: string): Promise<ParsedOrder>;
} 