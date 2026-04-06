---
name: error-handling-patterns
description: Master error handling patterns across languages including exceptions, Result types, error propagation, and graceful degradation to build resilient applications. Use when implementing error handling, designing APIs, or improving application reliability.
---

# Error Handling Patterns

Master error handling patterns across languages including exceptions, Result types, error propagation, and graceful degradation to build resilient applications.

## When to Use This Skill
- Implementing error handling in new features
- Designing error-resilient APIs
- Debugging production issues
- Improving application reliability
- Creating better error messages for users and developers
- Implementing retry and circuit breaker patterns
- Handling async/concurrent errors
- Building fault-tolerant distributed systems

## Workflow
1. [ ] Identify the type of error (Recoverable vs Unrecoverable).
2. [ ] Choose the appropriate philosophy (Exceptions vs Result Types).
3. [ ] Apply language-specific patterns (Python, TS, Rust, Go).
4. [ ] Implement universal patterns if needed (Circuit Breaker, Aggregator, Fallback).
5. [ ] Validate against best practices (Fail fast, Preserve context).

## Core Concepts

### 1. Error Handling Philosophies
- **Exceptions**: Traditional try-catch, disrupts control flow. Use for unexpected errors or exceptional conditions.
- **Result Types**: Explicit success/failure (functional approach). Use for expected errors and validation failures.
- **Error Codes**: C-style, requires discipline.
- **Option/Maybe Types**: For nullable values or simple absence of data.
- **Panics/Crashes**: Use only for unrecoverable errors and programming bugs.

### 2. Error Categories
- **Recoverable**: Network timeouts, missing files (sometimes), invalid user input, API rate limits.
- **Unrecoverable**: Out of memory, stack overflow, programming bugs (null pointer, index out of bounds).

## Language-Specific Patterns

### Python
Use Custom Exception Hierarchies and Context Managers.

```python
class ApplicationError(Exception):
    """Base exception for all application errors."""
    def __init__(self, message: str, code: str = None, details: dict = None):
        super().__init__(message)
        self.code = code
        self.details = details or {}
        self.timestamp = datetime.utcnow()

# Usage
def get_user(user_id: str) -> User:
    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        raise NotFoundError("User not found", code="USER_NOT_FOUND", details={"user_id": user_id})
    return user
```

### TypeScript/JavaScript
Use Custom Error Classes or the Result Type Pattern.

```typescript
// Result type for explicit error handling
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

function parseJSON<T>(json: string): Result<T, SyntaxError> {
  try {
    const value = JSON.parse(json) as T;
    return { ok: true, value };
  } catch (error) {
    return { ok: false, error: error as SyntaxError };
  }
}
```

### Rust
Leverage `Result` and `Option` types with the `?` operator.

```rust
fn read_file(path: &str) -> Result<String, io::Error> {
    let mut file = File::open(path)?;  // ? operator propagates errors
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    Ok(contents)
}
```

### Go
Explicit error returns and error wrapping.

```go
func getUser(id string) (*User, error) {
    user, err := db.QueryUser(id)
    if err != nil {
        return nil, fmt.Errorf("failed to query user: %w", err)
    }
    return user, nil
}
```

## Universal Patterns

### Pattern 1: Circuit Breaker
Prevent cascading failures by rejecting requests when a service is failing.

### Pattern 2: Error Aggregation
Collect multiple errors (e.g., in forms) instead of failing on the first one.

### Pattern 3: Graceful Degradation (Fallback)
Provide fallback functionality (cache, default values) when primary operations fail.

## Best Practices
- **Fail Fast**: Validate input early.
- **Preserve Context**: Include stack traces and metadata.
- **Meaningful Messages**: Explain what happened and how to fix it.
- **Clean Up**: Use `try-finally`, context managers, or `defer`.
- **Don't Swallow Errors**: Log or re-throw; never silently ignore.
