# nestjs-rfc9457 Basic Example

This example demonstrates the three main feature tiers of
[`@camcima/nestjs-rfc9457`](https://www.npmjs.com/package/@camcima/nestjs-rfc9457):

1. **Zero-config defaults** — standard NestJS HTTP exceptions are automatically
   converted to RFC 9457 Problem Details with `about:blank` type.
2. **`@ProblemType()` decorator** — custom exception classes carry their own
   `type` URI and `title`, producing domain-specific problem types.
3. **Automatic validation errors** — NestJS `ValidationPipe` output is
   normalized into a Problem Details body with a flat `errors` array.

---

## Running the example

```bash
npm install
npm run build
npm start
```

The server starts on `http://localhost:3000` (override with the `PORT`
environment variable).

---

## Endpoints and expected responses

### 1. Zero-config defaults (`about:blank` type)

All standard NestJS HTTP exceptions are handled automatically when you add
`Rfc9457Module.forRoot()` to your module — no extra configuration needed.

#### `GET /items/:id` — NotFoundException with custom message

```bash
curl http://localhost:3000/items/42
```

```json
{
  "status": 404,
  "title": "Not Found",
  "detail": "Item with id 42 was not found",
  "type": "about:blank"
}
```

The `detail` field carries the message passed to `NotFoundException`.

#### `GET /items` — ForbiddenException with no message

```bash
curl http://localhost:3000/items
```

```json
{
  "status": 403,
  "title": "Forbidden",
  "type": "about:blank"
}
```

When no message is provided (or the message is just the default HTTP phrase),
`detail` is omitted entirely — no boilerplate in the response.

#### `POST /items` — BadRequestException with string message

```bash
curl -X POST http://localhost:3000/items
```

```json
{
  "status": 400,
  "title": "Bad Request",
  "detail": "Invalid item data",
  "type": "about:blank"
}
```

---

### 2. `@ProblemType()` decorator on custom exceptions

Custom exception classes decorated with `@ProblemType()` produce responses with
a specific `type` URI and `title` instead of `about:blank`.

#### `POST /payments` — InsufficientFundsException

```bash
curl -X POST http://localhost:3000/payments
```

```json
{
  "type": "https://api.example.com/problems/insufficient-funds",
  "title": "Insufficient Funds",
  "status": 422,
  "detail": "Account balance 50 is less than required amount 100"
}
```

The `type` and `title` come from the `@ProblemType()` decorator on the class.
The `detail` is derived from the exception message at runtime.

#### `GET /rate-limited` — RateLimitExceededException

```bash
curl http://localhost:3000/rate-limited
```

```json
{
  "type": "https://api.example.com/problems/rate-limit-exceeded",
  "title": "Rate Limit Exceeded",
  "status": 429,
  "detail": "Rate limit exceeded. Retry after 30 seconds"
}
```

---

### 3. Validation errors (automatic with ValidationPipe)

When `ValidationPipe` is registered globally and a request body fails
`class-validator` constraints, the library automatically detects the
`BadRequestException` shape that `ValidationPipe` produces and formats it as
a Problem Details response with an `errors` array.

#### `POST /users` — body with multiple validation failures

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"","email":"not-an-email","age":200}'
```

```json
{
  "status": 400,
  "title": "Bad Request",
  "detail": "Request validation failed",
  "errors": [
    "name should not be empty",
    "email must be an email",
    "age must not be greater than 150"
  ],
  "type": "about:blank"
}
```

`errors` is a flat array of human-readable constraint messages — no nested
`ValidationError` objects to unwrap.

#### `POST /users` — valid body (success path)

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","age":30}'
```

```json
{
  "message": "User created successfully",
  "user": {
    "name": "Alice",
    "email": "alice@example.com",
    "age": 30
  }
}
```

---

## Project structure

```
src/
  main.ts                          # Bootstrap with global ValidationPipe
  app.module.ts                    # Rfc9457Module.forRoot() — zero config
  controllers/
    items.controller.ts            # Standard NestJS exceptions (feature 1)
    payments.controller.ts         # @ProblemType() exceptions (feature 2)
    users.controller.ts            # ValidationPipe endpoint (feature 3)
  dto/
    create-user.dto.ts             # class-validator decorators
  exceptions/
    insufficient-funds.exception.ts
    rate-limit.exception.ts
```

## Key points

- `Rfc9457Module.forRoot()` registers the global exception filter with zero
  configuration. Every HTTP exception in the application is automatically
  converted to RFC 9457 format.
- The `Content-Type` header on error responses is
  `application/problem+json` as required by the spec.
- The `@ProblemType()` decorator is the only code change needed to upgrade an
  existing custom exception to a named problem type.
- Validation tier 1 (default `ValidationPipe`) works automatically — no custom
  `exceptionFactory` required.
