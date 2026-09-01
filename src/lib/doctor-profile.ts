export function calculateProfileCompletion(data: {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  avatar?: string | null;
  qualification?: string | null;
  degree?: string | null;
  specialization?: string | null;
  registrationNumber?: string | null;
  yearsOfPractice?: number | null;
  languages?: string | null;
  clinicName?: string | null;
  clinicAddress?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  clinicPhone?: string | null;
  clinicEmail?: string | null;
  shortBio?: string | null;
  areasOfPractice?: string | null;
  consultationDays?: string | null;
}) {
  const fields = [
    { key: "name", weight: 5 },
    { key: "email", weight: 5 },
    { key: "phone", weight: 5 },
    { key: "qualification", weight: 10 },
    { key: "specialization", weight: 10 },
    { key: "registrationNumber", weight: 15 },
    { key: "yearsOfPractice", weight: 5 },
    { key: "clinicName", weight: 10 },
    { key: "city", weight: 5 },
    { key: "state", weight: 5 },
    { key: "shortBio", weight: 5 },
    { key: "areasOfPractice", weight: 5 },
    { key: "consultationDays", weight: 5 },
    { key: "avatar", weight: 5 },
    { key: "languages", weight: 5 },
  ];

  let completedWeight = 0;
  const totalWeight = fields.reduce((acc, f) => acc + f.weight, 0);

  const missingFields: string[] = [];

  fields.forEach((f) => {
    const val = (data as any)[f.key];
    if (val !== undefined && val !== null && val !== "" && val !== 0) {
      completedWeight += f.weight;
    } else {
      missingFields.push(f.key);
    }
  });

  const percentage = Math.round((completedWeight / totalWeight) * 100);

  return {
    percentage,
    isComplete: percentage >= 80,
    missingFields,
  };
}
