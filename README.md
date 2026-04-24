# @camcima/nestjs-rfc9457 Examples

Example NestJS applications demonstrating [`@camcima/nestjs-rfc9457`](https://github.com/camcima/nestjs-rfc9457) — a library for [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457) Problem Details HTTP error responses.

## Examples

### [basic-example/](./basic-example/)

Zero-config setup demonstrating:

- **Default behavior** — `about:blank` type, HTTP reason phrase as title, boilerplate detail suppression
- **`@ProblemType()` decorator** — custom exception classes with problem type URIs
- **Tier 1 validation** — automatic mapping of NestJS `ValidationPipe` errors to flat error arrays
- **Swagger integration** — `applyProblemDetailResponses()` auto-applies `ProblemDetailDto` error schemas to all routes under `application/problem+json`

### [advanced-example/](./advanced-example/)

Full-featured setup demonstrating:

- **`forRootAsync()`** — async module configuration with `ConfigService`
- **`typeBaseUri`** — auto-generated type URIs (e.g., `https://api.example.com/problems/not-found`)
- **`instanceStrategy: 'uuid'`** — correlation IDs on every error response
- **`catchAllExceptions`** — non-`HttpException` errors become generic 500 problem details
- **`onUnhandled`** — redirect unmapped exception logging to a custom sink (Sentry/Datadog pattern)
- **`exceptionMapper`** — custom mapping with extension members (`retryAfter`, `conflictingOrderId`)
- **Tier 2 validation** — structured errors with `property`, `constraints`, and nested `children`
- **`ProblemDetailsFactory` direct usage** — injecting the factory for manual problem details construction
- **Swagger integration** — auto-applied error schemas with `validationStatuses: [400]` for Tier 2 validation, custom extension DTOs (`OrderConflictProblemDto`, `ServiceUnavailableProblemDto`), and per-route `@ApiResponse` overrides

## Demo Scripts

Run the automated demo scripts to see all features in action. Each script starts the app, runs curl commands, and displays the RFC 9457 responses:

```bash
# Run both demos
./scripts/demo-all.sh

# Or run individually
./scripts/demo-basic.sh      # Basic features on port 3457
./scripts/demo-advanced.sh   # Advanced features on port 3459
```

The scripts handle installation, building, starting the app, and cleanup automatically.

## Manual Quick Start

```bash
# Basic example
cd basic-example
npm install
npm start
# Visit http://localhost:3000 (API) and http://localhost:3000/api (Swagger UI)

# Advanced example
cd advanced-example
npm install
npm start
# Visit http://localhost:3000 (API) and http://localhost:3000/api (Swagger UI)
```

See each example's README for detailed curl commands and expected responses.

## License

MIT
