import React, { useState, useEffect } from 'react';
import type { VinInputProps } from '@/lib/types';
import { buildClassName } from '@/lib/design-system';
import Button from './ui/button';
import Input from './ui/input';

// VIN validation regex - 17 characters, no I, O, Q
const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/;

const VinInput: React.FC<VinInputProps> = ({
  onSubmit,
  isLoading = false,
  error,
  placeholder = 'Enter 17-character VIN',
  className = '',
}) => {
  const [vin, setVin] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isTouched, setIsTouched] = useState(false);

  // Real-time VIN validation
  useEffect(() => {
    if (!isTouched && !vin) {
      setValidationError(null);
      return;
    }

    if (vin.length === 0) {
      setValidationError('VIN is required');
    } else if (vin.length < 17) {
      setValidationError(`VIN must be 17 characters (${vin.length}/17)`);
    } else if (vin.length > 17) {
      setValidationError('VIN cannot exceed 17 characters');
    } else if (!VIN_REGEX.test(vin)) {
      setValidationError('Invalid VIN format. Contains invalid characters (I, O, Q not allowed)');
    } else {
      setValidationError(null);
    }
  }, [vin, isTouched]);

  const handleInputChange = (value: string) => {
    // Convert to uppercase and remove invalid characters
    const cleanedValue = value
      .toUpperCase()
      .replace(/[^A-HJ-NPR-Z0-9]/g, '') // Remove invalid characters
      .slice(0, 17); // Limit to 17 characters
    
    setVin(cleanedValue);
    if (!isTouched) setIsTouched(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsTouched(true);
    
    if (!validationError && vin.length === 17 && VIN_REGEX.test(vin)) {
      onSubmit(vin);
    }
  };

  const isValid = !validationError && vin.length === 17;
  const displayError = error || validationError || undefined;

  return (
    <div className={buildClassName('w-full max-w-md mx-auto', className)}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label 
            htmlFor="vin-input" 
            className="block text-sm font-medium text-neutral-700 mb-2"
          >
            Vehicle Identification Number (VIN)
          </label>
          
          <Input
            id="vin-input"
            value={vin}
            onChange={handleInputChange}
            placeholder={placeholder}
            error={displayError}
            disabled={isLoading}
            maxLength={17}
            className="vin-input text-center text-lg font-mono tracking-wider"
            aria-describedby={displayError ? 'vin-error' : 'vin-help'}
            aria-invalid={!!displayError}
            autoComplete="off"
            spellCheck={false}
          />
          
          {/* Character counter */}
          <div className="mt-1 text-right">
            <span 
              className={buildClassName(
                'text-sm',
                vin.length === 17 ? 'text-success-600' : 'text-neutral-500'
              )}
            >
              {vin.length}/17
            </span>
          </div>
          
          {/* Help text */}
          {!displayError && (
            <p id="vin-help" className="mt-2 text-sm text-neutral-600">
              Enter the 17-character VIN from your vehicle registration or dashboard
            </p>
          )}
          
          {/* Error message */}
          {displayError && (
            <p 
              id="vin-error" 
              className="mt-2 text-sm text-error-600 flex items-center gap-2"
              role="alert"
            >
              <svg 
                className="w-4 h-4 flex-shrink-0" 
                fill="currentColor" 
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path 
                  fillRule="evenodd" 
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 002 0V6a1 1 0 00-1-1z" 
                  clipRule="evenodd" 
                />
              </svg>
              {displayError}
            </p>
          )}
        </div>
        
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={!isValid || isLoading}
          loading={isLoading}
          className="mt-6"
          aria-describedby="submit-button-help"
        >
          {isLoading ? 'Generating Report...' : 'Generate Report'}
        </Button>
        
        {!isLoading && (
          <p id="submit-button-help" className="text-xs text-center text-neutral-600 mt-2">
            Click to start generating your comprehensive vehicle history report
          </p>
        )}
      </form>
      
      {/* VIN Format Examples */}
      <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
        <h4 className="text-sm font-medium text-neutral-900 mb-2">VIN Format Examples:</h4>
        <div className="space-y-1">
          <div className="text-sm text-neutral-600 font-mono">
            1HGBH41JXMN109186
          </div>
          <div className="text-sm text-neutral-600 font-mono">
            WVWZZZ3CZBE041234
          </div>
        </div>
        <p className="text-xs text-neutral-600 mt-2">
          VINs are exactly 17 characters and don't contain the letters I, O, or Q
        </p>
      </div>
    </div>
  );
};

export default VinInput;