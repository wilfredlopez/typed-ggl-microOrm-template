import { GraphQLError, GraphQLFormattedError } from "graphql";
import { ValidationError } from "class-validator";

export interface FormatedErrors {
  value?: string;
  errors: string[];
}

export function formatArgumentValidationErrors(
  error: GraphQLError
): GraphQLFormattedError<Record<string, any>> {
  if (error) {
    const errorMap: GraphQLFormattedError<Record<string, FormatedErrors>> & {
      code?: string;
      stacktrace?: any[];
    } = {
      message: error.message,
      extensions: {},
      locations: error.locations,
      path: error.path,
    };
    if (error.message === "Argument Validation Error") {
      if (error.extensions) {
        errorMap.code = error.extensions.code;
        if ("exception" in error.extensions) {
          errorMap.stacktrace = error.extensions.exception.stacktrace;
          const validationErrs = error.extensions.exception.validationErrors as
            | ValidationError[]
            | undefined;
          if (Array.isArray(validationErrs)) {
            for (let ve of validationErrs) {
              const formated: FormatedErrors = {
                errors: [],
                value: ve.value,
              };
              if (!errorMap.extensions![ve.property]) {
                errorMap.extensions![ve.property] = formated;
              }
              if (ve.constraints) {
                errorMap.extensions![ve.property]!.errors!.push(
                  ve.constraints as any
                );
              }
            }
          }
          return errorMap;
        }
      }
    }
    return error;
  }
  return error;
}
