import { describe, it, expect, vi } from "vitest";
import {
  ApiError,
  UnauthorizedError,
  BadRequestError,
  NotFoundError,
  RateLimitError,
  HttpStatus,
  errorResponse,
  handleApiError,
  isApiError,
} from "./api-errors";

describe("ApiError classes", () => {
  describe("ApiError", () => {
    it("should create error with default status code", () => {
      const error = new ApiError("Something went wrong");
      expect(error.message).toBe("Something went wrong");
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe("ApiError");
    });

    it("should create error with custom status code", () => {
      const error = new ApiError("Custom error", 418, "IM_A_TEAPOT");
      expect(error.statusCode).toBe(418);
      expect(error.code).toBe("IM_A_TEAPOT");
    });
  });

  describe("UnauthorizedError", () => {
    it("should have 401 status code", () => {
      const error = new UnauthorizedError();
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe("UNAUTHORIZED");
      expect(error.message).toBe("Unauthorized");
    });

    it("should accept custom message", () => {
      const error = new UnauthorizedError("Session expired");
      expect(error.message).toBe("Session expired");
    });
  });

  describe("BadRequestError", () => {
    it("should have 400 status code", () => {
      const error = new BadRequestError();
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe("BAD_REQUEST");
    });

    it("should store validation details", () => {
      const details = { field: "email", issue: "Invalid format" };
      const error = new BadRequestError("Invalid input", details);
      expect(error.details).toEqual(details);
    });
  });

  describe("NotFoundError", () => {
    it("should have 404 status code", () => {
      const error = new NotFoundError();
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe("NOT_FOUND");
    });
  });

  describe("RateLimitError", () => {
    it("should have 429 status code", () => {
      const error = new RateLimitError();
      expect(error.statusCode).toBe(429);
      expect(error.code).toBe("RATE_LIMITED");
    });

    it("should store resetIn value", () => {
      const error = new RateLimitError("Too fast!", 60);
      expect(error.resetIn).toBe(60);
    });
  });
});

describe("errorResponse", () => {
  it("should create response with error message", async () => {
    const error = new ApiError("Test error", 400);
    const response = errorResponse(error);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Test error");
  });

  it("should include error code when present", async () => {
    const error = new ApiError("Test", 400, "TEST_CODE");
    const response = errorResponse(error);
    const body = await response.json();
    expect(body.code).toBe("TEST_CODE");
  });

  it("should include details for BadRequestError", async () => {
    const details = { field: "name" };
    const error = new BadRequestError("Validation failed", details);
    const response = errorResponse(error);
    const body = await response.json();
    expect(body.details).toEqual(details);
  });

  it("should include Retry-After header for RateLimitError", () => {
    const error = new RateLimitError("Slow down", 120);
    const response = errorResponse(error);

    expect(response.headers.get("Retry-After")).toBe("120");
    expect(response.headers.get("X-RateLimit-Remaining")).toBe("0");
  });
});

describe("handleApiError", () => {
  it("should handle ApiError instances", async () => {
    const error = new BadRequestError("Invalid data");
    const response = handleApiError(error);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Invalid data");
  });

  it("should handle legacy Unauthorized error message", async () => {
    const error = new Error("Unauthorized");
    const response = handleApiError(error);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("should return 500 for unknown errors", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("Unknown error");
    const response = handleApiError(error, "test operation");

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe("Internal server error");

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("should handle non-Error objects", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const response = handleApiError("string error");

    expect(response.status).toBe(500);
    consoleSpy.mockRestore();
  });
});

describe("isApiError", () => {
  it("should return true for ApiError instances", () => {
    expect(isApiError(new ApiError("test"))).toBe(true);
    expect(isApiError(new UnauthorizedError())).toBe(true);
    expect(isApiError(new BadRequestError())).toBe(true);
  });

  it("should return false for regular errors", () => {
    expect(isApiError(new Error("test"))).toBe(false);
  });

  it("should return false for non-errors", () => {
    expect(isApiError("string")).toBe(false);
    expect(isApiError(null)).toBe(false);
    expect(isApiError(undefined)).toBe(false);
  });
});

describe("HttpStatus", () => {
  it("should have correct status codes", () => {
    expect(HttpStatus.BAD_REQUEST).toBe(400);
    expect(HttpStatus.UNAUTHORIZED).toBe(401);
    expect(HttpStatus.FORBIDDEN).toBe(403);
    expect(HttpStatus.NOT_FOUND).toBe(404);
    expect(HttpStatus.TOO_MANY_REQUESTS).toBe(429);
    expect(HttpStatus.INTERNAL_SERVER_ERROR).toBe(500);
  });
});
