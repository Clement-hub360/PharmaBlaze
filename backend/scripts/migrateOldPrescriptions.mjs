import "dotenv/config";

import { readFile } from "node:fs/promises";
import path from "node:path";

import prisma from "../dist/config/database.js";
import { uploadPrescriptionFile } from "../dist/services/supabaseStorageService.js";

const prescriptions = [
{
id: "cmu9385450000p4k6z14ie9tb",
userId: "cmu7295l700001veyub4zfatb",
filename: "66a4b579-59c7-4f7f-b04f-66d7aabd8a47.jpg",
},
{
id: "cmueniosg0000v4k6j0glr9tv",
userId: "cmu7295l700001veyub4zfatb",
filename: "ead7784e-5549-4e34-9949-45c20d6f3e69.jpg",
},
];

const uploadsDirectory = path.resolve(
process.cwd(),
"uploads",
"prescriptions",
);

try {
console.log("");
console.log("============================================================");
console.log("PHARMABLAZE OLD PRESCRIPTION MIGRATION");
console.log("============================================================");
console.log("");

for (const prescription of prescriptions) {
console.log("Processing file: " + prescription.filename);
console.log("Prescription ID: " + prescription.id);

const localPath = path.join(
  uploadsDirectory,
  prescription.filename,
);

const storagePath =
  "prescriptions/" +
  prescription.userId +
  "/" +
  prescription.filename;

console.log("Local file: " + localPath);
console.log("Supabase path: " + storagePath);

console.log("Checking database record...");

const existingRecord =
  await prisma.prescription.findUnique({
    where: {
      id: prescription.id,
    },
    select: {
      id: true,
      fileUrl: true,
      userId: true,
    },
  });

console.log("Database record found.");

if (!existingRecord) {
  throw new Error(
    "Prescription " +
      prescription.id +
      " was not found in the database.",
  );
}

console.log(
  "Database fileUrl: " + existingRecord.fileUrl,
);

console.log("Checking user ID...");

if (existingRecord.userId !== prescription.userId) {
  throw new Error(
    "User ID mismatch for prescription " +
      prescription.id +
      ".",
  );
}

const expectedOldPath =
  "/uploads/prescriptions/" +
  prescription.filename;

console.log(
  "Expected old path: " + expectedOldPath,
);

if (existingRecord.fileUrl !== expectedOldPath) {
  throw new Error(
    "Unexpected current fileUrl for " +
      prescription.id +
      ": " +
      existingRecord.fileUrl,
  );
}

console.log("Reading local file...");

const fileBuffer = await readFile(localPath);

console.log(
  "Read " +
    fileBuffer.length.toLocaleString() +
    " bytes from local file.",
);

console.log("Uploading to Supabase Storage...");

await uploadPrescriptionFile(
  storagePath,
  fileBuffer,
  "image/jpeg",
);

console.log("Uploaded to Supabase Storage.");

console.log("Updating database record...");

const updatedRecord =
  await prisma.prescription.update({
    where: {
      id: prescription.id,
    },
    data: {
      fileUrl: storagePath,
    },
    select: {
      id: true,
      fileUrl: true,
      status: true,
    },
  });

console.log("Database record updated.");
console.table([updatedRecord]);
console.log("");

}

console.log("============================================================");
console.log("MIGRATION COMPLETED SUCCESSFULLY");
console.log("============================================================");
console.log("");
} catch (error) {
console.error("");
console.error("============================================================");
console.error("MIGRATION FAILED");
console.error("============================================================");
console.error("");

console.error("FULL ERROR:");
console.error(error);

if (error instanceof Error) {
console.error("");
console.error("ERROR NAME: " + error.name);
console.error("ERROR MESSAGE: " + error.message);
console.error("");
console.error("STACK TRACE:");
console.error(error.stack);
}

process.exitCode = 1;
} finally {
await prisma.$disconnect();
}
