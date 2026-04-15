import { pino } from 'pino';
import { CONFIG } from './config.js';

export const LOGGER = pino({ level: CONFIG().log_level });
