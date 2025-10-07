import React from 'react';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  className = '',
}) => {
  const calculateStrength = (pwd: string): {
    score: number;
    label: string;
    color: string;
    bgColor: string;
    textColor: string;
  } => {
    if (!pwd) {
      return {
        score: 0,
        label: '',
        color: 'bg-gray-300',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-600',
      };
    }

    let score = 0;
    
    // Length check
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    
    // Character variety checks
    if (/[a-z]/.test(pwd)) score += 1; // lowercase
    if (/[A-Z]/.test(pwd)) score += 1; // uppercase
    if (/[0-9]/.test(pwd)) score += 1; // numbers
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 1; // special characters

    // Determine strength level
    if (score <= 2) {
      return {
        score: 1,
        label: 'Weak',
        color: 'bg-red-500',
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
      };
    } else if (score <= 4) {
      return {
        score: 2,
        label: 'Medium',
        color: 'bg-yellow-500',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-700',
      };
    } else {
      return {
        score: 3,
        label: 'Strong',
        color: 'bg-green-500',
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
      };
    }
  };

  const strength = calculateStrength(password);

  if (!password) return null;

  return (
    <div className={`mt-2 ${className}`}>
      {/* Progress bars */}
      <div className="flex space-x-1 mb-2">
        <div
          className={`h-1 flex-1 rounded-full transition-colors ${
            strength.score >= 1 ? strength.color : 'bg-gray-300'
          }`}
        />
        <div
          className={`h-1 flex-1 rounded-full transition-colors ${
            strength.score >= 2 ? strength.color : 'bg-gray-300'
          }`}
        />
        <div
          className={`h-1 flex-1 rounded-full transition-colors ${
            strength.score >= 3 ? strength.color : 'bg-gray-300'
          }`}
        />
      </div>

      {/* Strength label */}
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${strength.textColor}`}>
          Password strength: {strength.label}
        </span>
      </div>

      {/* Requirements checklist */}
      <div className="mt-3 space-y-1">
        <PasswordRequirement
          met={password.length >= 8}
          text="At least 8 characters"
        />
        <PasswordRequirement
          met={/[a-z]/.test(password) && /[A-Z]/.test(password)}
          text="Uppercase and lowercase letters"
        />
        <PasswordRequirement
          met={/[0-9]/.test(password)}
          text="At least one number"
        />
        <PasswordRequirement
          met={/[^a-zA-Z0-9]/.test(password)}
          text="At least one special character"
        />
      </div>
    </div>
  );
};

interface PasswordRequirementProps {
  met: boolean;
  text: string;
}

const PasswordRequirement: React.FC<PasswordRequirementProps> = ({ met, text }) => {
  return (
    <div className="flex items-center text-xs">
      {met ? (
        <svg
          className="h-4 w-4 text-green-500 mr-2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg
          className="h-4 w-4 text-gray-400 mr-2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      <span className={met ? 'text-green-700' : 'text-gray-600'}>{text}</span>
    </div>
  );
};

