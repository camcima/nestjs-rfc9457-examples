# nestjs-rfc9457 — Advanced Example

This application demonstrates the advanced configuration surface of
`@camcima/nestjs-rfc9457`. Every feature is shown end-to-end with a real HTTP
endpoint.

## Features demonstrated

| Feature | Where |
|---|---|
| `forRootAsync()` with `ConfigService` | `src/app.module.ts` |
| `typeBaseUri` — type URIs from HTTP status slugs | all error responses |
| `instanceStrategy: 'uuid'` — `urn:uuid:…` correlation IDs | all error responses |
| `catchAllExceptions` — intercepts plain `Error` objects | `GET /health/db`, `GET /health/crash` |
| `onUnhandled` — redirect unhandled exceptions to a custom sink | `GET /health/crash` (see `src/app.module.ts`) |
| `exceptionMapper` — map domain exceptions + add extension members | `GET /health/db`, `POST /orders` |
| Tier 2 validation with nested `children` | `POST /orders/validate` |
| `ProblemDetailsFactory` injected directly | `GET /manual/build` |

---

## How to run

```bash
npm install
npm run build
npm start
```

The server listens on `http://localhost:3000`.

A `.env` file is included with:

```
PROBLEM_TYPE_BASE_URI=https://api.example.com/problems
```

---

## Endpoint reference

All error responses conform to RFC 9457 and carry:

- `type` — a URI derived from `typeBaseUri` + an HTTP-status slug (or an
  explicit URI set by the exceptionMapper)
- `instance` — a `urn:uuid:…` value unique to each occurrence
- `status` — the HTTP numeric status code
- `title` — the HTTP status phrase (or a custom title)

---

### 1. `forRootAsync` + `typeBaseUri` + `instanceStrategy: uuid`

#### GET /orders/:id — NotFoundException → type URI from typeBaseUri

```bash
curl -i http://localhost:3000/orders/xyz-999
```

Expected response (`404`):

```json
{
  "type": "https://api.example.com/problems/not-found",
  "title": "Not Found",
  "status": 404,
  "detail": "Order with id xyz-999 was not found",
  "instance": "urn:uuid:3f2504e0-4f89-11d3-9a0c-0305e82c3301"
}
```

---

### 2. `catchAllExceptions` + `exceptionMapper` — mapped domain error

#### GET /health/db — DatabaseConnectionException → 503 with retryAfter

`DatabaseConnectionException` extends plain `Error` (not `HttpException`).
NestJS would normally leave this unhandled. `catchAllExceptions: true` routes
it to the filter, and the `exceptionMapper` converts it to a 503 response with
the `retryAfter` extension member.

```bash
curl -i http://localhost:3000/health/db
```

Expected response (`503`):

```json
{
  "type": "https://api.example.com/problems/service-unavailable",
  "title": "Service Temporarily Unavailable",
  "status": 503,
  "detail": "The database is currently unreachable. Please try again later.",
  "retryAfter": 30,
  "instance": "urn:uuid:3f2504e0-4f89-11d3-9a0c-0305e82c3301"
}
```

---

### 3. `catchAllExceptions` — unmapped raw Error → generic 500 (no detail leak) + `onUnhandled` observability

#### GET /health/crash — raw Error, mapper returns null

The `exceptionMapper` returns `null` for this exception, so the factory falls
through to its built-in fallback: a 500 with no `detail` (internal messages are
never leaked).

```bash
curl -i http://localhost:3000/health/crash
```

Expected response (`500`):

```json
{
  "type": "https://api.example.com/problems/internal-server-error",
  "title": "Internal Server Error",
  "status": 500,
  "instance": "urn:uuid:3f2504e0-4f89-11d3-9a0c-0305e82c3301"
}
```

**Observability via `onUnhandled`.** The response body is intentionally bland, but
the exception must not be silently swallowed. The library logs every unmapped
non-`HttpException` that reaches the catch-all branch. By default that log is
emitted at `error` level via NestJS's built-in `Logger` with context
`Rfc9457ExceptionFilter`. This example replaces that default by passing
`onUnhandled` in `src/app.module.ts`, which forwards to a dedicated
`UnhandledExceptionSink` logger (stand-in for Sentry / Datadog in a real app).
When you hit `GET /health/crash`, watch the server's stderr — you'll see:

```
[Nest] … ERROR [UnhandledExceptionSink] Unhandled exception on GET /health/crash: Unexpected failure
Error: Unexpected failure
    at HealthController.crash (…/health.controller.ts:…)
```

`onUnhandled` never changes the HTTP response — it exists purely for
observability. Omit it and the library falls back to the default
`Rfc9457ExceptionFilter` logger.

---

### 4. `exceptionMapper` with extension members — OrderConflictException

#### POST /orders — 409 Conflict with conflictingOrderId and existingOrderUrl

`OrderConflictException` is an `HttpException` (409). The `exceptionMapper`
intercepts it and enriches the response with domain-specific extension members.

```bash
curl -i -X POST http://localhost:3000/orders \
  -H 'Content-Type: application/json' \
  -d '{"productId":"prod-001","quantity":2,"shippingAddress":{"street":"123 Main St","city":"Springfield","zip":"12345"}}'
```

Expected response (`409`):

```json
{
  "type": "https://api.example.com/problems/order-conflict",
  "title": "Order Conflict",
  "status": 409,
  "detail": "An order with conflicting constraints already exists (id: ord-abc-123)",
  "conflictingOrderId": "ord-abc-123",
  "existingOrderUrl": "https://api.example.com/orders/ord-abc-123",
  "instance": "urn:uuid:3f2504e0-4f89-11d3-9a0c-0305e82c3301"
}
```

---

### 5. Tier 2 validation — nested structured errors

#### POST /orders/validate — nested DTO with invalid fields

The `ValidationPipe` is configured with
`createRfc9457ValidationPipeExceptionFactory()`. This produces Tier 2
`Rfc9457ValidationException` objects that carry the full class-validator
`ValidationError` tree, serialized as structured `errors` with `property`,
`constraints`, and nested `children`.

```bash
curl -i -X POST http://localhost:3000/orders/validate \
  -H 'Content-Type: application/json' \
  -d '{"productId":"","quantity":0,"shippingAddress":{"street":"","city":"","zip":"bad-zip"}}'
```

Expected response (`400`):

```json
{
  "type": "https://api.example.com/problems/bad-request",
  "title": "Bad Request",
  "status": 400,
  "detail": "Request validation failed",
  "instance": "urn:uuid:3f2504e0-4f89-11d3-9a0c-0305e82c3301",
  "errors": [
    {
      "property": "productId",
      "constraints": {
        "isNotEmpty": "productId should not be empty"
      }
    },
    {
      "property": "quantity",
      "constraints": {
        "min": "quantity must not be less than 1"
      }
    },
    {
      "property": "shippingAddress",
      "children": [
        {
          "property": "street",
          "constraints": {
            "isNotEmpty": "street should not be empty"
          }
        },
        {
          "property": "city",
          "constraints": {
            "isNotEmpty": "city should not be empty"
          }
        },
        {
          "property": "zip",
          "constraints": {
            "isPostalCode": "zip must be a valid postal code"
          }
        }
      ]
    }
  ]
}
```

A valid request passes straight through:

```bash
curl -i -X POST http://localhost:3000/orders/validate \
  -H 'Content-Type: application/json' \
  -d '{"productId":"prod-001","quantity":3,"shippingAddress":{"street":"123 Main St","city":"Springfield","zip":"12345"}}'
```

Expected response (`200`):

```json
{
  "message": "Order is valid",
  "order": {
    "productId": "prod-001",
    "quantity": 3,
    "shippingAddress": {
      "street": "123 Main St",
      "city": "Springfield",
      "zip": "12345"
    }
  }
}
```

---

### 6. `ProblemDetailsFactory` injected directly

#### GET /manual/build — factory used programmatically

`ManualController` injects `ProblemDetailsFactory` and calls `factory.create()`
directly. The result (`{ status, body }`) can be inspected or mutated before
the response is sent. In this example the body is returned as-is.

```bash
curl -i http://localhost:3000/manual/build
```

Expected response (`200` — controller returns the body directly, not as an exception):

```json
{
  "type": "https://api.example.com/problems/not-found",
  "title": "Not Found",
  "status": 404,
  "detail": "Manually built problem",
  "instance": "urn:uuid:3f2504e0-4f89-11d3-9a0c-0305e82c3301"
}
```

> Note: the HTTP status of the response itself is `200` here because the
> controller returns a value rather than throwing. The `status` field inside
> the body is `404` — this is intentional to show that you can inspect/modify
> the Problem Details object before deciding how to send it.

---

## Project structure

```
src/
  app.module.ts                          forRootAsync configuration
  main.ts                                ValidationPipe with Tier 2 factory
  controllers/
    health.controller.ts                 /health/db  /health/crash
    orders.controller.ts                 /orders  /orders/validate  /orders/:id
    manual.controller.ts                 /manual/build
  dto/
    create-order.dto.ts                  CreateOrderDto + nested AddressDto
  exceptions/
    database-connection.exception.ts     plain Error (not HttpException)
    order-conflict.exception.ts          HttpException with extra fields
```
