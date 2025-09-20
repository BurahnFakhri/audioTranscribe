import logger from '../src/utils/logger';
if (logger && typeof (logger as any).level !== 'undefined') {
  (logger as any).level = 'silent';
}