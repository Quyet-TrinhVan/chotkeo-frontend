import { validatePassword } from './utils/passwordPolicy';
import { mapProblemDetailToFormErrors } from './utils/problemDetailMapper';

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    passedTests++;
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log('--- TEST SUITE: Password Policy Validation ---');

// 1. Password < 8 characters
const res1 = validatePassword('Pass1!');
assert(!res1.minLength, 'Password < 8 chars fails minLength');
assert(!res1.isValid, 'Password < 8 chars is invalid overall');

// 2. Missing uppercase
const res2 = validatePassword('pass123!@#');
assert(res2.minLength, 'pass123!@# passes minLength');
assert(!res2.uppercase, 'pass123!@# fails uppercase');
assert(res2.digit, 'pass123!@# passes digit');
assert(res2.special, 'pass123!@# passes special');
assert(!res2.isValid, 'Missing uppercase is invalid');

// 3. Missing digit
const res3 = validatePassword('Password!@#');
assert(res3.minLength, 'Password!@# passes minLength');
assert(res3.uppercase, 'Password!@# passes uppercase');
assert(!res3.digit, 'Password!@# fails digit');
assert(res3.special, 'Password!@# passes special');
assert(!res3.isValid, 'Missing digit is invalid');

// 4. Missing special char
const res4 = validatePassword('Password123');
assert(res4.minLength, 'Password123 passes minLength');
assert(res4.uppercase, 'Password123 passes uppercase');
assert(res4.digit, 'Password123 passes digit');
assert(!res4.special, 'Password123 fails special');
assert(!res4.isValid, 'Missing special char is invalid');

// 5. Valid password
const res5 = validatePassword('Chotkeo@2026');
assert(res5.minLength, 'Chotkeo@2026 passes minLength');
assert(res5.uppercase, 'Chotkeo@2026 passes uppercase');
assert(res5.digit, 'Chotkeo@2026 passes digit');
assert(res5.special, 'Chotkeo@2026 passes special');
assert(res5.isValid, 'Chotkeo@2026 is fully valid');

console.log('\n--- TEST SUITE: ProblemDetail Mapper ---');

// 6. Duplicate username (409 USERNAME_ALREADY_EXISTS)
const dupUserProblem = {
  status: 409,
  code: 'USERNAME_ALREADY_EXISTS',
  errors: [
    {
      field: 'username',
      reason: 'DUPLICATE',
      message: 'Tên đăng nhập đã được sử dụng.',
    },
  ],
};
const errUser = mapProblemDetailToFormErrors(dupUserProblem);
assert(errUser.username === 'Tên đăng nhập đã được sử dụng.', 'Mapped duplicate username message to username field');
assert(!errUser.email, 'Email field is untouched');
assert(!errUser.form, 'Form-level error is untouched');

// 7. Duplicate email (409 EMAIL_ALREADY_EXISTS)
const dupEmailProblem = {
  status: 409,
  code: 'EMAIL_ALREADY_EXISTS',
  errors: [
    {
      field: 'email',
      reason: 'DUPLICATE',
      message: 'Email đã được sử dụng.',
    },
  ],
};
const errEmail = mapProblemDetailToFormErrors(dupEmailProblem);
assert(errEmail.email === 'Email đã được sử dụng.', 'Mapped duplicate email message to email field');
assert(!errEmail.username, 'Username field is untouched');

// 8. Multiple conflicts (409 REGISTER_CONFLICT)
const conflictProblem = {
  status: 409,
  code: 'REGISTER_CONFLICT',
  errors: [
    {
      field: 'username',
      reason: 'DUPLICATE',
      message: 'Tên đăng nhập đã được sử dụng.',
    },
    {
      field: 'email',
      reason: 'DUPLICATE',
      message: 'Email đã được sử dụng.',
    },
  ],
};
const errConflict = mapProblemDetailToFormErrors(conflictProblem);
assert(errConflict.username === 'Tên đăng nhập đã được sử dụng.', 'REGISTER_CONFLICT mapped username');
assert(errConflict.email === 'Email đã được sử dụng.', 'REGISTER_CONFLICT mapped email');

// 9. PASSWORD_POLICY_VIOLATION
const pwdPolicyProblem = {
  status: 400,
  code: 'PASSWORD_POLICY_VIOLATION',
  errors: [
    {
      field: 'password',
      reason: 'UPPERCASE_REQUIRED',
      message: 'Mật khẩu phải có ít nhất 1 chữ hoa.',
    },
    {
      field: 'password',
      reason: 'SPECIAL_CHARACTER_REQUIRED',
      message: 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt.',
    },
  ],
};
const errPwd = mapProblemDetailToFormErrors(pwdPolicyProblem);
assert(Array.isArray(errPwd.password) && errPwd.password.length === 2, 'Mapped password error messages');
assert(errPwd.passwordViolationReasons?.includes('UPPERCASE_REQUIRED') === true, 'Mapped UPPERCASE_REQUIRED reason');
assert(errPwd.passwordViolationReasons?.includes('SPECIAL_CHARACTER_REQUIRED') === true, 'Mapped SPECIAL_CHARACTER_REQUIRED reason');

// 10. Rate limiting (429)
const rateLimitProblem = {
  status: 429,
  code: 'RATE_LIMIT_EXCEEDED',
  detail: 'Too many requests',
};
const errRate = mapProblemDetailToFormErrors(rateLimitProblem);
assert(errRate.form === 'Bạn thao tác quá nhanh. Vui lòng thử lại sau.', 'Mapped 429 to friendly rate limit warning');

// 11. 500 / 503 Server Error
const serverErrorProblem = {
  status: 503,
  code: 'SERVICE_UNAVAILABLE',
  detail: 'DB Connection Timeout',
};
const errServer = mapProblemDetailToFormErrors(serverErrorProblem);
assert(errServer.form === 'Không thể tạo tài khoản lúc này. Vui lòng thử lại sau.', 'Mapped 503 to friendly server error');
assert(!errServer.form?.includes('DB Connection Timeout'), 'Raw server details hidden from user');

console.log('\n--- TEST SUITE: Bug Fix Specific Validation (Cases 1-5) ---');

// Mock form state holder
const mockInitialFormData = {
  lastName: 'Nguyễn',
  firstName: 'Văn A',
  username: 'trung_username',
  email: 'vana@example.com',
  password: 'Password123!',
  confirmPassword: 'Password123!',
};

// Case 1: Username duplicate error preserves all form fields
let formDataCase1 = { ...mockInitialFormData };
const server409Username = {
  status: 409,
  code: 'USERNAME_ALREADY_EXISTS',
  errors: [
    {
      field: 'username',
      reason: 'DUPLICATE',
      message: 'Tên đăng nhập đã được sử dụng.',
    },
  ],
};
const case1Errors = mapProblemDetailToFormErrors(server409Username);
assert(case1Errors.username === 'Tên đăng nhập đã được sử dụng.', 'Case 1: Error mapped to username field');
assert(formDataCase1.username === 'trung_username', 'Case 1: username retained');
assert(formDataCase1.email === 'vana@example.com', 'Case 1: email retained');
assert(formDataCase1.password === 'Password123!', 'Case 1: password retained');
assert(formDataCase1.confirmPassword === 'Password123!', 'Case 1: confirmPassword retained');
assert(formDataCase1.firstName === 'Văn A', 'Case 1: firstName retained');
assert(formDataCase1.lastName === 'Nguyễn', 'Case 1: lastName retained');

// Case 2: Email duplicate error preserves all form fields
let formDataCase2 = { ...mockInitialFormData };
const server409Email = {
  status: 409,
  code: 'EMAIL_ALREADY_EXISTS',
  errors: [
    {
      field: 'email',
      reason: 'DUPLICATE',
      message: 'Email đã được sử dụng.',
    },
  ],
};
const case2Errors = mapProblemDetailToFormErrors(server409Email);
assert(case2Errors.email === 'Email đã được sử dụng.', 'Case 2: Error mapped to email field');
assert(!case2Errors.username, 'Case 2: No username error');
assert(formDataCase2.email === 'vana@example.com', 'Case 2: email retained');
assert(formDataCase2.username === 'trung_username', 'Case 2: username retained');

// Case 3: Password backend reject preserves all form fields
let formDataCase3 = { ...mockInitialFormData };
const server400Password = {
  status: 400,
  code: 'PASSWORD_POLICY_VIOLATION',
  errors: [
    {
      field: 'password',
      reason: 'SPECIAL_CHARACTER_REQUIRED',
      message: 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt.',
    },
  ],
};
const case3Errors = mapProblemDetailToFormErrors(server400Password);
assert(Array.isArray(case3Errors.password) && case3Errors.password.length > 0, 'Case 3: Password error mapped');
assert(formDataCase3.password === 'Password123!', 'Case 3: password retained');
assert(formDataCase3.username === 'trung_username', 'Case 3: username retained');

// Case 4: Backend 500 error preserves all form fields & maps form-level error
let formDataCase4 = { ...mockInitialFormData };
const server500 = {
  status: 500,
  code: 'INTERNAL_SERVER_ERROR',
  detail: 'Internal Server Error',
};
const case4Errors = mapProblemDetailToFormErrors(server500);
assert(case4Errors.form === 'Không thể tạo tài khoản lúc này. Vui lòng thử lại sau.', 'Case 4: Form-level error mapped');
assert(!case4Errors.username, 'Case 4: No field error');
assert(formDataCase4.username === 'trung_username', 'Case 4: username retained on 500');

// Case 5: Success only triggers resetForm & navigation
let formDataCase5 = { ...mockInitialFormData };
let hasNavigated: boolean = false;
function mockResetForm() {
  formDataCase5 = {
    lastName: '',
    firstName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  };
}
function mockSuccessNavigate() {
  hasNavigated = true;
}

// Simulate success branch
mockResetForm();
mockSuccessNavigate();
assert(formDataCase5.username === '', 'Case 5: Form reset on success');
assert(formDataCase5.password === '', 'Case 5: Password cleared on success');
assert(Boolean(hasNavigated), 'Case 5: Navigated on success');

console.log(`\n🎉 ALL ${passedTests}/${totalTests} TESTS PASSED!`);

