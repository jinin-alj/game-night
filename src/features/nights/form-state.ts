export type NightFormState = {
  values: { name: string; nightDate: string; availableMinutes: string };
  fieldErrors: { name?: string; nightDate?: string; availableMinutes?: string };
  formError?: string;
};
