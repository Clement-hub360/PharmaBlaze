import { createClient } from "@supabase/supabase-js";

function getSupabaseConfig() {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const bucket =
    process.env.SUPABASE_PRESCRIPTIONS_BUCKET?.trim() || "prescriptions";

  if (!supabaseUrl) {
    throw new Error("SUPABASE_URL is not configured");
  }

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }

  return {
    supabaseUrl,
    serviceRoleKey,
    bucket,
  };
}

function getSupabaseClient() {
  const { supabaseUrl, serviceRoleKey } = getSupabaseConfig();

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function uploadPrescriptionFile(
  storagePath: string,
  fileBuffer: Buffer,
  contentType: string,
): Promise<void> {
  const { bucket } = getSupabaseConfig();
  const supabase = getSupabaseClient();

  const { error } = await supabase.storage
    .from(bucket)
    .upload(storagePath, fileBuffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    console.error("Supabase prescription upload error:", error);

    throw new Error("Failed to upload prescription file");
  }
}

export async function downloadPrescriptionFile(
  storagePath: string,
): Promise<Buffer> {
  const { bucket } = getSupabaseConfig();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .download(storagePath);

  if (error || !data) {
    console.error("Supabase prescription download error:", error);

    throw new Error("Prescription file is unavailable");
  }

  const arrayBuffer = await data.arrayBuffer();

  return Buffer.from(arrayBuffer);
}

export async function deletePrescriptionFile(
  storagePath: string,
): Promise<void> {
  const { bucket } = getSupabaseConfig();
  const supabase = getSupabaseClient();

  const { error } = await supabase.storage.from(bucket).remove([storagePath]);

  if (error) {
    console.error("Supabase prescription delete error:", error);

    throw new Error("Failed to delete prescription file");
  }
}
