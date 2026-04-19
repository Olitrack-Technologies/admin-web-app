import * as Yup from "yup"
import { client_types } from "./constants/client_types"

export const DeviceType_VS = Yup.object().shape({
  name: Yup.string()
    .required("Name is required")
    .max(255, "Name cannot exceed 255 characters"),

  protocol: Yup.string().required("Protocol is required"),
  installation_cost: Yup.number()
    .required("Installation cost is required")
    .typeError("Installation cost must be a number")
    .min(1, "Installation cost must be greater than 0"),

  subscription_cost: Yup.number()
    .required("Subscription cost is required")
    .typeError("Subscription cost must be a number")
    .min(1, "Subscription cost must be greater than 0"),

  validity: Yup.string().required("Validity is required"),
})

export const Customer_VS = Yup.object({
  full_name: Yup.string()
    .required("Full name is required")
    .max(255, "Name cannot exceed 255 characters"),

  email: Yup.string()
    .trim()
    .email("Enter a valid email address")
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email format is invalid")
    .required("Email is required")
    .max(255, "Name cannot exceed 255 characters"),

  phone_number: Yup.string()
    .matches(
      /^(07|01)\d{8}$/,
      "Phone number must start with 07 or 01 and be 10 digits"
    )
    .required("Phone number is required"),

  location: Yup.string().max(255, "Name cannot exceed 255 characters"),

  client_type: Yup.string()
    .oneOf(client_types, "Invalid client type")
    .required("Client type is required"),
})
