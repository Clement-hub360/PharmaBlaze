import api from "./api";

export type PrescriptionStatus =
  | "PENDING"
  | "REVIEWING"
  | "APPROVED"
  | "REJECTED"
  | "FULFILLED";

export type Prescription = {
  id: string;
  userId: string;
  fileUrl: string;
  notes?: string | null;
  status: PrescriptionStatus;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SubmitPrescriptionInput = {
  file?: File | null;
  fileUrl?: string;
  notes?: string;
};

export async function getMyPrescriptions(): Promise<Prescription[]> {
  const response = await api.get("/prescriptions/my");
  return response.data.data as Prescription[];
}

export async function getMyPrescription(
  prescriptionId: string,
): Promise<Prescription> {
  const response = await api.get(`/prescriptions/my/${prescriptionId}`);
  return response.data.data as Prescription;
}

export async function submitPrescription(
  input: SubmitPrescriptionInput,
): Promise<Prescription> {
  if (input.file) {
    const formData = new FormData();

    formData.append("file", input.file);

    if (input.notes) {
      formData.append("notes", input.notes);
    }

    const response = await api.post("/prescriptions", formData);

    return response.data.data as Prescription;
  }

  const response = await api.post("/prescriptions", {
    fileUrl: input.fileUrl,
    notes: input.notes,
  });

  return response.data.data as Prescription;
}
