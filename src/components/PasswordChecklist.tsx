import { Check as CheckIcon, Xmark as CancelIcon } from "iconoir-react";
import "./PasswordChecklist.css";
import { useEffect } from "react";

interface PasswordRequirement {
  label: string;
  validator: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  {
    label: "At least 8 characters",
    validator: (password) => password.length >= 8,
  },
  {
    label: "At least 1 lowercase letter",
    validator: (password) => /[a-z]/.test(password),
  },
  {
    label: "At least 1 uppercase letter",
    validator: (password) => /[A-Z]/.test(password),
  },
  {
    label: "At least 1 number",
    validator: (password) => /[0-9]/.test(password),
  },
  {
    label: "At least 1 symbol",
    validator: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
  },
];

interface Props {
  password: string;
  onValidationChange?: (isValid: boolean) => void;
}

const PasswordChecklist: React.FC<Props> = ({
  password,
  onValidationChange,
}) => {
  const isPasswordValid = requirements.every((req) => req.validator(password));

  useEffect(() => {
    onValidationChange?.(isPasswordValid);
  }, [password, onValidationChange]);

  return (
    <div className="password-checklist">
      {requirements.map((req, index) => {
        const isValid = req.validator(password);
        return (
          <div key={index} className={`requirement ${isValid ? "valid" : ""}`}>
            {isValid ? (
              <CheckIcon className="check-icon" />
            ) : (
              <CancelIcon className="cancel-icon" />
            )}
            <span>{req.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default PasswordChecklist;
