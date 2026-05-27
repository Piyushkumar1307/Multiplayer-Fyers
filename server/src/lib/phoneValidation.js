function isRepeatingDigitPhone(phone) {
  return /^(\d)\1{9}$/.test(phone);
}

function validatePhoneNumber(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!/^\d{10}$/.test(digits)) {
    return 'Phone must be a 10-digit number';
  }
  if (isRepeatingDigitPhone(digits)) {
    return 'Please enter a valid number';
  }
  return null;
}

module.exports = { validatePhoneNumber, isRepeatingDigitPhone };
