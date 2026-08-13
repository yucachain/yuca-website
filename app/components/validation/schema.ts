import * as Yup from "yup";

/* ------------------------------------------------------------------ */
/*  Reusable field-level rules                                         */
/*  Compose these into form-level schemas below, or import them        */
/*  individually if you need the same rule in a different form.        */
/* ------------------------------------------------------------------ */

export const emailRule = Yup.string()
  .trim()
  .required("Email is required")
  .email("Enter a valid email address");

export const nameRule = (label: string) =>
  Yup.string()
    .trim()
    .required(`${label} is required`)
    .min(2, `${label} must be at least 2 characters`)
    .max(50, `${label} must be under 50 characters`)
    .matches(/^[a-zA-Z\s'-]+$/, `${label} can only contain letters, spaces, ' or -`);

// Strong-ish password: 8+ chars, at least one letter and one number.
// Relax/extend as your backend's actual policy requires.
export const passwordRule = Yup.string()
  .required("Password is required")
  .min(8, "Password must be at least 8 characters")
  .matches(/[a-z]/, "Password must include a lowercase letter")
  .matches(/[A-Z]/, "Password must include an uppercase letter")
  .matches(/[0-9]/, "Password must include a number");

export const confirmPasswordRule = Yup.string()
  .required("Please re-type your password")
  .oneOf([Yup.ref("password")], "Passwords do not match");

/* ------------------------------------------------------------------ */
/*  Log In                                                             */
/* ------------------------------------------------------------------ */

export interface LoginValues {
  email: string;
  password: string;
  remember: boolean;
}

export const loginInitialValues: LoginValues = {
  email: "",
  password: "",
  remember: false,
};

export const LoginSchema: Yup.ObjectSchema<LoginValues> = Yup.object({
  email: emailRule,
  // Login only needs "is it non-empty" — don't enforce the full strength
  // policy here, since an existing user's password may predate the policy.
  password: Yup.string().required("Password is required"),
  remember: Yup.boolean().default(false),
});

/* ------------------------------------------------------------------ */
/*  Sign Up                                                             */
/* ------------------------------------------------------------------ */

export interface SignUpValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const signUpInitialValues: SignUpValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export const SignUpSchema: Yup.ObjectSchema<SignUpValues> = Yup.object({
  firstName: nameRule("First name"),
  lastName: nameRule("Last name"),
  email: emailRule,
  password: passwordRule,
  confirmPassword: confirmPasswordRule,
});

/* ------------------------------------------------------------------ */
/*  Forgot Password                                                    */
/* ------------------------------------------------------------------ */

export interface ForgotPasswordValues {
  email: string;
}

export const forgotPasswordInitialValues: ForgotPasswordValues = { email: "" };

export const ForgotPasswordSchema: Yup.ObjectSchema<ForgotPasswordValues> = Yup.object({
  email: emailRule,
});

/* ------------------------------------------------------------------ */
/*  Verify Reset Link                                                  */
/*  Shown after "Send Reset Link" — lets the user paste the link       */
/*  manually instead of clicking it from their inbox.                  */
/* ------------------------------------------------------------------ */

export interface VerifyResetLinkValues {
  resetLink: string;
}

export const verifyResetLinkInitialValues: VerifyResetLinkValues = { resetLink: "" };

export const VerifyResetLinkSchema: Yup.ObjectSchema<VerifyResetLinkValues> = Yup.object({
  resetLink: Yup.string()
    .trim()
    .required("Paste your reset link")
    .url("That doesn't look like a valid link"),
});

/* ------------------------------------------------------------------ */
/*  Reset Password (after clicking the email link)                     */
/* ------------------------------------------------------------------ */

export interface ResetPasswordValues {
  password: string;
  confirmPassword: string;
}

export const resetPasswordInitialValues: ResetPasswordValues = {
  password: "",
  confirmPassword: "",
};

export const ResetPasswordSchema: Yup.ObjectSchema<ResetPasswordValues> = Yup.object({
  password: passwordRule,
  confirmPassword: confirmPasswordRule,
});

/* ------------------------------------------------------------------ */
/*  Request Access (for industrial buyers and processors)              */
/*  Seen as a link on both screens — modeled as its own short form.    */
/* ------------------------------------------------------------------ */

export interface RequestAccessValues {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  message: string;
}

export const requestAccessInitialValues: RequestAccessValues = {
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  message: "",
};

export const RequestAccessSchema: Yup.ObjectSchema<RequestAccessValues> = Yup.object({
  companyName: Yup.string()
    .trim()
    .required("Company name is required")
    .min(2, "Company name must be at least 2 characters"),
  contactName: nameRule("Contact name"),
  email: emailRule,
  phone: Yup.string()
    .trim()
    .required("Phone number is required")
    .matches(/^\+?[0-9\s\-()]{7,20}$/, "Enter a valid phone number"),
  message: Yup.string()
    .trim()
    .required("Tell us a bit about your business")
    .min(20, "Please provide at least 20 characters")
    .max(1000, "Message must be under 1000 characters"),
});

/* ------------------------------------------------------------------ */
/*  Checkout — Shipping Information                                    */
/* ------------------------------------------------------------------ */

export interface ShippingInfoValues {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  state: string;
  country: string;
  postalCode: string;
  sameBillingAddress: boolean;
  saveDetails: boolean;
}

export const shippingInfoInitialValues: ShippingInfoValues = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  address: "",
  state: "",
  country: "",
  postalCode: "",
  sameBillingAddress: true,
  saveDetails: true,
};

export const ShippingInfoSchema: Yup.ObjectSchema<ShippingInfoValues> = Yup.object({
  firstName: nameRule("First name"),
  lastName: nameRule("Last name"),
  phone: Yup.string()
    .trim()
    .required("Phone number is required")
    .matches(/^\+?[0-9\s\-()]{7,20}$/, "Enter a valid phone number"),
  email: emailRule,
  address: Yup.string().trim().required("Delivery address is required"),
  state: Yup.string().trim().required("Please select a state"),
  country: Yup.string().trim().required("Please select a country"),
  postalCode: Yup.string()
    .trim()
    .required("Postal code is required")
    .matches(/^[0-9A-Za-z\s-]{3,10}$/, "Enter a valid postal code"),
  sameBillingAddress: Yup.boolean().default(true),
  saveDetails: Yup.boolean().default(true),
});

/* ------------------------------------------------------------------ */
/*  Checkout — Card Payment                                            */
/* ------------------------------------------------------------------ */

export interface CardPaymentValues {
  cardNumber: string;
  cardHolderName: string;
  expDate: string;
  cvv: string;
  saveCard: boolean;
}

export const cardPaymentInitialValues: CardPaymentValues = {
  cardNumber: "",
  cardHolderName: "",
  expDate: "",
  cvv: "",
  saveCard: true,
};

export const CardPaymentSchema: Yup.ObjectSchema<CardPaymentValues> = Yup.object({
  cardNumber: Yup.string()
    .trim()
    .required("Card number is required")
    .matches(/^[0-9\s]{13,19}$/, "Enter a valid card number"),
  cardHolderName: Yup.string().trim().required("Card holder name is required"),
  expDate: Yup.string()
    .trim()
    .required("Expiry date is required")
    .matches(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, "Use MM/YY format"),
  cvv: Yup.string()
    .trim()
    .required("CVV is required")
    .matches(/^[0-9]{3,4}$/, "Enter a valid CVV"),
  saveCard: Yup.boolean().default(true),
});

/* ------------------------------------------------------------------ */
/*  Aggregator — Receive Batch inspection form                         */
/* ------------------------------------------------------------------ */

export type QualityGradeOption = "A" | "B" | "C" | "reject";

export interface ReceiveBatchValues {
  confirmedWeight: string;
  qualityGrade: QualityGradeOption | "";
  qualityNotes: string;
  collectionPoint: string;
  signedOff: boolean;
}

export const receiveBatchInitialValues: ReceiveBatchValues = {
  confirmedWeight: "",
  qualityGrade: "",
  qualityNotes: "",
  collectionPoint: "",
  signedOff: false,
};

export const ReceiveBatchSchema: Yup.ObjectSchema<ReceiveBatchValues> = Yup.object({
  confirmedWeight: Yup.string()
    .trim()
    .required("Confirmed weight is required")
    .matches(/^[0-9]+(\.[0-9]+)?$/, "Enter a valid weight in kg"),
  qualityGrade: Yup.mixed<QualityGradeOption>()
    .oneOf(["A", "B", "C", "reject"], "Select a quality grade")
    .required("Select a quality grade") as Yup.StringSchema<QualityGradeOption>,
  qualityNotes: Yup.string().trim().required("Quality notes are required"),
  collectionPoint: Yup.string().trim().required("Select a collection point location"),
  signedOff: Yup.boolean()
    .oneOf([true], "Farmer confirmation sign-off is required")
    .required(),
});

/* ------------------------------------------------------------------ */
/*  Aggregator — Dispatch Order logistics form                         */
/* ------------------------------------------------------------------ */
 
export interface DispatchLogisticsValues {
  vaultPlateNumber: string;
  vaultNumber: string;
  driverName: string;
  deliveryDate: string;
  deliveryTime: string;
  additionalNotes: string;
}
 
export const dispatchLogisticsInitialValues: DispatchLogisticsValues = {
  vaultPlateNumber: "",
  vaultNumber: "",
  driverName: "",
  deliveryDate: "",
  deliveryTime: "",
  additionalNotes: "",
};
 
export const DispatchLogisticsSchema: Yup.ObjectSchema<DispatchLogisticsValues> = Yup.object({
  vaultPlateNumber: Yup.string().trim().required("Vault plate number is required"),
  vaultNumber: Yup.string().trim().required("Vault number is required"),
  driverName: Yup.string().trim().required("Driver name is required"),
  deliveryDate: Yup.string().trim().required("Delivery date is required"),
  deliveryTime: Yup.string().trim().required("Delivery time is required"),
  additionalNotes: Yup.string().trim().default(""),
});