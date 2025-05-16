import { sendEmail } from "../mail/mail.config.js";
import {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE
} from "./mail.template.js";

export const sendVerificationEmail = async (to, verificationCode) => {
  const subject = "Verify Your Email";
  const html = VERIFICATION_EMAIL_TEMPLATE.replace('{verificationCode}', verificationCode);
  
  return sendEmail(to, subject, html);
};

export const sendPasswordResetRequestEmail = async (to, resetURL) => {
  const subject = "Reset Your Password";
  const html = PASSWORD_RESET_REQUEST_TEMPLATE.replace('{resetURL}', resetURL);
  
  return sendEmail(to, subject, html);
};

export const sendPasswordResetSuccessEmail = async (to) => {
  const subject = "Password Reset Successful";
  const html = PASSWORD_RESET_SUCCESS_TEMPLATE;
  
  return sendEmail(to, subject, html);
};