/**
 * ProblemDetail Mapper for Registration Form
 *
 * Maps RFC 7807 / Chốt Kèo ProblemDetail envelopes to form field errors.
 */

export interface FormErrors {
  username?: string;
  email?: string;
  password?: string[];
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  form?: string;
  passwordViolationReasons?: string[];
}

export interface BackendFieldError {
  field?: string;
  reason?: string;
  message?: string;
}

export interface ProblemDetailLike {
  status?: number;
  code?: string;
  title?: string;
  detail?: string;
  errors?: BackendFieldError[] | null;
  [key: string]: any;
}

/**
 * Maps ProblemDetail or ApiError to structured FormErrors
 */
export function mapProblemDetailToFormErrors(rawProblem: any): FormErrors {
  const result: FormErrors = {};

  if (!rawProblem) {
    result.form = 'Không thể tạo tài khoản. Vui lòng kiểm tra lại thông tin.';
    return result;
  }

  // Extract problem object if wrapped in ApiError or response
  const problem: ProblemDetailLike =
    rawProblem.problem || (rawProblem.response && rawProblem.response.data) || rawProblem;

  const status = problem.status || rawProblem.status || 0;
  const code = problem.code || rawProblem.code || '';
  const errors = Array.isArray(problem.errors) ? problem.errors : [];

  // 1. Rate limiting (429)
  if (status === 429 || code === 'RATE_LIMIT_EXCEEDED') {
    result.form = 'Bạn thao tác quá nhanh. Vui lòng thử lại sau.';
    return result;
  }

  // 2. Server Errors (500, 502, 503, 504)
  if (status >= 500 || code === 'INTERNAL_SERVER_ERROR' || code === 'SERVICE_UNAVAILABLE') {
    result.form = 'Không thể tạo tài khoản lúc này. Vui lòng thử lại sau.';
    return result;
  }

  // 3. Username Already Exists (409)
  if (code === 'USERNAME_ALREADY_EXISTS') {
    const errorItem = errors.find((e) => e.field?.toLowerCase() === 'username');
    result.username = errorItem?.message || problem.detail || 'Tên đăng nhập đã được sử dụng.';
  }

  // 4. Email Already Exists (409)
  if (code === 'EMAIL_ALREADY_EXISTS') {
    const errorItem = errors.find((e) => e.field?.toLowerCase() === 'email');
    result.email = errorItem?.message || problem.detail || 'Email đã được sử dụng.';
  }

  // 5. Password Policy Violation
  if (code === 'PASSWORD_POLICY_VIOLATION') {
    const passwordMessages: string[] = [];
    const reasons: string[] = [];

    errors.forEach((err) => {
      if (err.field?.toLowerCase() === 'password' || !err.field) {
        if (err.reason) {
          reasons.push(err.reason);
        }
        if (err.message && !passwordMessages.includes(err.message)) {
          passwordMessages.push(err.message);
        }
      }
    });

    if (passwordMessages.length > 0) {
      result.password = passwordMessages;
    } else if (problem.detail) {
      result.password = [problem.detail];
    } else {
      result.password = ['Mật khẩu chưa đáp ứng yêu cầu bảo mật.'];
    }

    if (reasons.length > 0) {
      result.passwordViolationReasons = reasons;
    }
  }

  // 6. Loop through all errors in problem.errors to map each field
  for (const err of errors) {
    const field = err.field?.toLowerCase();
    const message = err.message || problem.detail || 'Dữ liệu không hợp lệ.';

    if (field === 'username') {
      result.username = message;
    } else if (field === 'email') {
      result.email = message;
    } else if (field === 'password') {
      if (!result.password) {
        result.password = [message];
      } else if (!result.password.includes(message)) {
        result.password.push(message);
      }
      if (err.reason) {
        result.passwordViolationReasons = result.passwordViolationReasons || [];
        if (!result.passwordViolationReasons.includes(err.reason)) {
          result.passwordViolationReasons.push(err.reason);
        }
      }
    } else if (field === 'firstname' || field === 'first_name') {
      result.firstName = message;
    } else if (field === 'lastname' || field === 'last_name') {
      result.lastName = message;
    } else if (!field) {
      // Non-field error -> form-level
      if (!result.form) {
        result.form = message;
      }
    }
  }

  // 7. If no field errors were mapped and no form error set:
  const hasFieldErrors =
    Boolean(result.username) ||
    Boolean(result.email) ||
    Boolean(result.password && result.password.length > 0) ||
    Boolean(result.firstName) ||
    Boolean(result.lastName);

  if (!hasFieldErrors && !result.form) {
    if (problem.detail && typeof problem.detail === 'string' && !problem.detail.startsWith('{')) {
      result.form = problem.detail;
    } else if (problem.title && typeof problem.title === 'string') {
      result.form = problem.title;
    } else {
      result.form = 'Không thể tạo tài khoản. Vui lòng kiểm tra lại thông tin.';
    }
  }

  return result;
}
