import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonError(
  status: number,
  code: string,
  message: string,
  details?: unknown,
) {
  const requestId = crypto.randomUUID();
  return NextResponse.json(
    {
      error: { code, message, ...(details ? { details } : {}) },
      requestId,
    },
    { status, headers: { "X-Request-Id": requestId } },
  );
}

export function validationError(error: ZodError) {
  const details = error.issues.map((issue) => ({
    path: issue.path.join("."),
    code: issue.code,
    message: issue.message,
  }));
  return jsonError(422, "VALIDATION_ERROR", "Revise os dados enviados.", details);
}
