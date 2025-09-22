import React, { ReactNode } from 'react';
import { Formik, Form as FormikForm, FormikHelpers, FormikProps } from 'formik';
import { twMerge } from 'tailwind-merge';
import * as Yup from 'yup';
import { Button, ButtonProps } from './Button';

type FormVariant = 'default' | 'card' | 'transparent';

export interface FormProps<T> {
  /** Form initial values */
  initialValues: T;
  /** Form validation schema using Yup */
  validationSchema?: Yup.ObjectSchema<Partial<T>>;
  /** Form submission handler */
  onSubmit: (values: T, formikHelpers: FormikHelpers<T>) => void | Promise<any>;
  /** Form content */
  children: ((props: FormikProps<T>) => ReactNode) | ReactNode;
  /** Submit button text */
  submitText?: string;
  /** Show/hide submit button */
  showSubmitButton?: boolean;
  /** Custom submit button props */
  submitButtonProps?: ButtonProps;
  /** Show/hide reset button */
  showResetButton?: boolean;
  /** Custom reset button text */
  resetText?: string;
  /** Custom reset button props */
  resetButtonProps?: ButtonProps;
  /** Form container class name */
  className?: string;
  /** Form class name */
  formClassName?: string;
  /** Form actions container class name */
  actionsClassName?: string;
  /** Loading state */
  loading?: boolean;
  /** Disable form */
  disabled?: boolean;
  /** Form variant */
  variant?: FormVariant;
  /** Enable form reset after submission */
  enableReinitialize?: boolean;
  /** On cancel handler */
  onCancel?: () => void;
  /** Show/hide cancel button */
  showCancelButton?: boolean;
  /** Custom cancel button text */
  cancelText?: string;
  /** Custom cancel button props */
  cancelButtonProps?: ButtonProps;
  /** Additional form props */
  formikProps?: Partial<FormikProps<T>>;
}

const variantStyles: Record<FormVariant, string> = {
  default: 'bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6',
  card: 'bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700',
  transparent: '',
};

/**
 * A flexible form component built on top of Formik and Yup
 */
function Form<T extends Record<string, any>>({
  initialValues,
  validationSchema,
  onSubmit,
  children,
  submitText = 'Submit',
  showSubmitButton = true,
  submitButtonProps = {},
  showResetButton = false,
  resetText = 'Reset',
  resetButtonProps = { variant: 'outline' },
  className = '',
  formClassName = '',
  actionsClassName = 'mt-6 flex justify-end space-x-3',
  loading = false,
  disabled = false,
  variant = 'default',
  enableReinitialize = false,
  onCancel,
  showCancelButton = false,
  cancelText = 'Cancel',
  cancelButtonProps = { variant: 'ghost' },
  formikProps = {},
}: FormProps<T>) {
  const handleSubmit = async (
    values: T,
    formikHelpers: FormikHelpers<T>
  ) => {
    try {
      await onSubmit(values, formikHelpers);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <div className={twMerge(variantStyles[variant], className)}>
      <Formik<T>
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize={enableReinitialize}
        validateOnMount={false}
        {...formikProps}
      >
        {(formik) => (
          <FormikForm className={twMerge('space-y-6', formClassName)}>
            {typeof children === 'function' ? children(formik) : children}

            {(showSubmitButton || showResetButton || showCancelButton) && (
              <div className={actionsClassName}>
                {showCancelButton && (
                  <Button
                    type="button"
                    onClick={onCancel}
                    disabled={loading || disabled}
                    {...cancelButtonProps}
                  >
                    {cancelText}
                  </Button>
                )}
                
                {showResetButton && (
                  <Button
                    type="button"
                    onClick={() => formik.resetForm()}
                    disabled={loading || disabled || !formik.dirty}
                    variant="outline"
                    {...resetButtonProps}
                  >
                    {resetText}
                  </Button>
                )}
                
                {showSubmitButton && (
                  <Button
                    type="submit"
                    disabled={
                      loading ||
                      disabled ||
                      (formik.isValidating && !formik.isValid) ||
                      !formik.dirty || // Disable if form hasn't been touched
                      Object.keys(formik.errors).length > 0 // Disable if there are validation errors
                    }
                    isLoading={formik.isSubmitting || loading}
                    {...submitButtonProps}
                  >
                    {submitText}
                  </Button>
                )}
              </div>
            )}
          </FormikForm>
        )}
      </Formik>
    </div>
  );
}

export { Form };

// Helper components for form layout
type FormGroupProps = {
  children: ReactNode;
  className?: string;
};

const FormGroup = ({ children, className = '' }: FormGroupProps) => (
  <div className={twMerge('space-y-2', className)}>{children}</div>
);

Form.Group = FormGroup;

type FormRowProps = {
  children: ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4;
};

const FormRow = ({ children, className = '', cols = 2 }: FormRowProps) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={twMerge('grid gap-6', gridCols[cols], className)}>
      {children}
    </div>
  );
};

Form.Row = FormRow;

type FormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

const FormSection = ({
  title,
  description,
  children,
  className = '',
}: FormSectionProps) => (
  <div className={twMerge('space-y-6', className)}>
    <div>
      <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
        {title}
      </h3>
      {description && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

Form.Section = FormSection;

type FormDividerProps = {
  className?: string;
};

const FormDivider = ({ className = '' }: FormDividerProps) => (
  <div className={twMerge('border-t border-gray-200 dark:border-gray-700', className)} />
);

Form.Divider = FormDivider;
