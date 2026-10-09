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

export const phoneRule = Yup.string()
  .trim()
  .required("Phone number is required")
  .min(7, "Phone number must be at least 7 characters");

/* ------------------------------------------------------------------ */
/*  Log In                                                             */
/* ------------------------------------------------------------------ */

export interface LoginValues {
  phoneNumber: string;
  password: string;
  remember: boolean;
}

export const loginInitialValues: LoginValues = {
  phoneNumber: "",
  password: "",
  remember: false,
};

export const LoginSchema: Yup.ObjectSchema<LoginValues> = Yup.object({
  phoneNumber: phoneRule,
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
/*  Marketplace User Registration (Farmer, Processor, Service Provider, Consumer) */
/* ------------------------------------------------------------------ */

export type MarketplaceRoleType = "farmer" | "processor" | "service-provider" | "consumer";

export interface MarketplaceRegisterValues {
  role: MarketplaceRoleType;
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  farmAddress: string;
  companyName: string;
  facilityAddress: string;
  businessAddress: string;
  deliveryAddress: string;
  state: string;
  lga: string;
  farmName: string;
  businessName: string;
}

export const marketplaceRegisterInitialValues: MarketplaceRegisterValues = {
  role: "farmer",
  fullName: "",
  phoneNumber: "",
  email: "",
  password: "",
  confirmPassword: "",
  farmAddress: "",
  companyName: "",
  facilityAddress: "",
  businessAddress: "",
  deliveryAddress: "",
  state: "Oyo",
  lga: "",
  farmName: "",
  businessName: "",
};

export const MarketplaceRegisterSchema = Yup.object({
  role: Yup.mixed<MarketplaceRoleType>()
    .oneOf(["farmer", "processor", "service-provider", "consumer"], "Please select a valid role")
    .required("Role is required") as Yup.StringSchema<MarketplaceRoleType>,
  fullName: Yup.string()
    .trim()
    .required("Full name is required")
    .min(2, "Name must be at least 2 characters"),
  phoneNumber: Yup.string()
    .trim()
    .required("Phone number is required")
    .test("no-letters", "Number is required here. Text is not allowed.", (val) => !val || !/[a-zA-Z]/.test(val))
    .matches(/^\+?[0-9]{7,15}$/, "Number is required here. Text is not allowed."),
  email: Yup.string()
    .trim()
    .test("valid-email-if-provided", "Enter a valid email address", (val) => {
      if (!val || val.trim() === "") return true;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
    })
    .default(""),
  password: passwordRule,
  confirmPassword: confirmPasswordRule,
  farmAddress: Yup.string().when("role", {
    is: "farmer",
    then: (schema) => schema.trim().required("Farm address is required"),
    otherwise: (schema) => schema.default(""),
  }),
  companyName: Yup.string().when("role", {
    is: (val: string) => val === "processor" || val === "service-provider",
    then: (schema) => schema.trim().required("Business / company name is required"),
    otherwise: (schema) => schema.default(""),
  }),
  facilityAddress: Yup.string().when("role", {
    is: "processor",
    then: (schema) => schema.trim().required("Facility address is required"),
    otherwise: (schema) => schema.default(""),
  }),
  businessAddress: Yup.string().when("role", {
    is: "service-provider",
    then: (schema) => schema.trim().required("Workshop / business address is required"),
    otherwise: (schema) => schema.default(""),
  }),
  deliveryAddress: Yup.string().when("role", {
    is: "consumer",
    then: (schema) => schema.trim().required("Delivery address is required"),
    otherwise: (schema) => schema.default(""),
  }),
  state: Yup.string().default("Oyo"),
  lga: Yup.string().default(""),
  farmName: Yup.string().default(""),
  businessName: Yup.string().default(""),
});

/* ------------------------------------------------------------------ */
/*  Forgot Password                                                    */
/* ------------------------------------------------------------------ */

export interface ForgotPasswordValues {
  email: string;
  phoneNumber?: string;
}

export const forgotPasswordInitialValues: ForgotPasswordValues = {
  email: "",
  phoneNumber: "",
};

export const ForgotPasswordSchema: Yup.ObjectSchema<ForgotPasswordValues> = Yup.object({
  email: emailRule,
  phoneNumber: Yup.string().trim().default(""),
});

/* ------------------------------------------------------------------ */
/*  Verify OTP Code                                                    */
/* ------------------------------------------------------------------ */

export interface VerifyOtpValues {
  code: string;
}

export const verifyOtpInitialValues: VerifyOtpValues = { code: "" };

export const VerifyOtpSchema: Yup.ObjectSchema<VerifyOtpValues> = Yup.object({
  code: Yup.string()
    .trim()
    .required("Verification code is required")
    .min(4, "Code must be at least 4 digits")
    .max(8, "Code cannot exceed 8 digits"),
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
/*  Reset Password                                                     */
/* ------------------------------------------------------------------ */

export interface ResetPasswordValues {
  password: string;
  confirmPassword: string;
  email?: string;
  phoneNumber?: string;
  otp?: string;
}

export const resetPasswordInitialValues: ResetPasswordValues = {
  password: "",
  confirmPassword: "",
  email: "",
  phoneNumber: "",
  otp: "",
};

export const ResetPasswordSchema: Yup.ObjectSchema<ResetPasswordValues> = Yup.object({
  password: passwordRule,
  confirmPassword: confirmPasswordRule,
  email: Yup.string().trim().email("Enter a valid email").optional(),
  phoneNumber: Yup.string().trim().optional(),
  otp: Yup.string().trim().optional(),
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
  firstName: Yup.string()
    .trim()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters"),
  lastName: Yup.string()
    .trim()
    .default(""),
  phone: Yup.string()
    .trim()
    .required("Phone number is required")
    .min(7, "Phone number must be at least 7 characters"),
  email: emailRule,
  address: Yup.string().trim().required("Delivery address is required"),
  state: Yup.string().trim().required("Please select a state"),
  country: Yup.string().trim().required("Please select a country"),
  postalCode: Yup.string()
    .trim()
    .default(""),
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
/* ------------------------------------------------------------------ */
/*  Admin — Receive Batch inspection form                             */
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
/*  Admin — Dispatch Order logistics form                             */
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

/* ------------------------------------------------------------------ */
/*  Admin — Login                                                     */
/* ------------------------------------------------------------------ */

export interface AdminLoginValues {
  email: string;
  password: string;
}

export const adminLoginInitialValues: AdminLoginValues = {
  email: "",
  password: "",
};

export const AdminLoginSchema: Yup.ObjectSchema<AdminLoginValues> = Yup.object({
  email: Yup.string()
    .trim()
    .email("Please enter a valid administrator email address")
    .required("Email address is required"),
  password: Yup.string().required("Password is required"),
});