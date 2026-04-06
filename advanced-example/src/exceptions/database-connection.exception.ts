/**
 * A plain Error (NOT an HttpException) that simulates a database connectivity
 * failure. Because it does not extend HttpException, NestJS would normally
 * produce an unhandled-exception response. The module's catchAllExceptions
 * option intercepts it, and the exceptionMapper maps it to a 503 Problem
 * Detail with the retryAfter extension member.
 */
export class DatabaseConnectionException extends Error {
  constructor(message: string = 'Cannot connect to the database') {
    super(message);
    this.name = 'DatabaseConnectionException';
  }
}
