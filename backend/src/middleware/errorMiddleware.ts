import type { ErrorRequestHandler } from "express";
import multer from "multer";

const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error("");
  console.error("============================================================");
  console.error("🔥 UNHANDLED APPLICATION ERROR");
  console.error("============================================================");
  console.error("Error:", error);

  if (error instanceof Error) {
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
  }

  console.error("============================================================");
  console.error("");

  if (res.headersSent) {
    return;
  }

  /*
   * ============================================================
   * MULTER ERRORS
   * ============================================================
   *
   * Upload-related errors happen before the controller runs.
   * Return a useful 400 response instead of hiding them behind
   * a generic 500 error.
   */

  if (error instanceof multer.MulterError) {
    let message = "Prescription upload failed.";

    switch (error.code) {
      case "LIMIT_FILE_SIZE":
        message = "Prescription file must not exceed 10MB.";
        break;

      case "LIMIT_FILE_COUNT":
        message = "Only one prescription file can be uploaded.";
        break;

      case "LIMIT_UNEXPECTED_FILE":
        message =
          "Unexpected file field. Please upload the prescription using the file field.";
        break;

      case "LIMIT_FIELD_COUNT":
        message = "Too many form fields were submitted.";
        break;

      case "LIMIT_FIELD_KEY":
        message = "A submitted form field name is too long.";
        break;

      case "LIMIT_FIELD_VALUE":
        message = "A submitted form field value is too large.";
        break;

      case "LIMIT_PART_COUNT":
        message = "Too many parts were submitted in the upload.";
        break;

      default:
        message = error.message || message;
        break;
    }

    res.status(400).json({
      success: false,
      message,
      error: error.code,
    });

    return;
  }

  /*
   * ============================================================
   * NORMAL APPLICATION ERRORS
   * ============================================================
   */

  if (error instanceof Error) {
    /*
     * Multer's fileFilter throws a normal Error rather than a
     * MulterError. Treat those as a bad upload request.
     */
    if (error.message === "Only JPG, PNG and PDF files are allowed.") {
      res.status(400).json({
        success: false,
        message: error.message,
      });

      return;
    }
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

export default errorMiddleware;
