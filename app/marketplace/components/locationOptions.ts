import type { SelectOption } from "@/app/components/ui/FormSelect";

export const NIGERIAN_STATES: SelectOption[] = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
].map((s) => ({ value: s, label: s }));

export const COUNTRIES: SelectOption[] = [
  { value: "NG", label: "Nigeria" },
  { value: "GH", label: "Ghana" },
  { value: "CI", label: "Côte d'Ivoire" },
  { value: "BJ", label: "Benin" },
  { value: "TG", label: "Togo" },
  { value: "CM", label: "Cameroon" },
  { value: "SN", label: "Senegal" },
];