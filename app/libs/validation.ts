import * as Yup from "yup";

export const loginSchema = Yup.object({

    email: Yup.string()
        .email("Invalid email")
        .required("Email is required"),

    password: Yup.string()
        .required("Password is required")

});

export const signupSchema = Yup.object({

    firstName: Yup.string()
        .required("First name is required"),

    lastName: Yup.string()
        .required("Last name is required"),

    email: Yup.string()
        .email("Invalid email")
        .required("Email is required"),

    password: Yup.string()
        .min(8,"Password must contain at least 8 characters")
        .required("Password is required"),

    confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")],"Passwords must match")
        .required("Confirm your password")

});