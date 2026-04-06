# @camcima/nestjs-rfc9457 Examples

Example NestJS applications demonstrating [`@camcima/nestjs-rfc9457`](https://github.com/camcima/nestjs-rfc9457) — a library for [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457) Problem Details HTTP error responses.

## Examples

### [basic-example/](./basic-example/)

Zero-config setup demonstrating:

- **Default behavior** — `about:blank` type, HTTP reason phrase as title, boilerplate detail suppression
- **`@ProblemType()` decorator** — custom exception classes with problem type URIs
- **Tier 1 validation** — automatic mapping of NestJS `ValidationPipe` errors to flat error arrays

### [advanced-example/](./advanced-example/)

Full-featured setup demonstrating:

- **`forRootAsync()`** — async module configuration with `ConfigService`
- **`typeBaseUri`** — auto-generated type URIs (e.g., `https://api.example.com/problems/not-found`)
- **`instanceStrategy: 'uuid'`** — correlation IDs on every error response
- **`catchAllExceptions`** — non-`HttpException` errors become generic 500 problem details
- **`exceptionMapper`** — custom mapping with extension members (`retryAfter`, `conflictingOrderId`)
- **Tier 2 validation** — structured errors with `property`, `constraints`, and nested `children`
- **`ProblemDetailsFactory` direct usage** — injecting the factory for manual problem details construction

## Quick Start

```bash
# Basic example
cd basic-example
npm install
npm start
# Visit http://localhost:3000

# Advanced example
cd advanced-example
npm install
npm start
# Visit http://localhost:3001
```

See each example's README for detailed curl commands and expected responses.

## License

MIT
