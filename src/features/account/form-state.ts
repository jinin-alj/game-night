export type AuthFormState = {
  values: { email: string; displayName: string };
  fieldErrors: { email?: string; password?: string; displayName?: string };
  formError?: string;
};

export const emptyAuthFormState: AuthFormState = {
  values: { email: "", displayName: "" },
  fieldErrors: {},
};
