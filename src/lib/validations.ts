/**
 * Validates a Spanish NIF (DNI) or NIE.
 * @param value The string to validate
 * @returns boolean indicating if the NIF/NIE is valid
 */
export function validateSpanishNIF(value: string): boolean {
  const nif = value.trim().toUpperCase();
  if (!nif || nif.length !== 9) return false;

  // NIE logic (starts with X, Y, or Z)
  let nifToTest = nif;
  const firstChar = nif.charAt(0);
  
  if (['X', 'Y', 'Z'].includes(firstChar)) {
    const prefix = firstChar === 'X' ? '0' : firstChar === 'Y' ? '1' : '2';
    nifToTest = prefix + nif.substring(1);
  }

  // Check if the format is correct (8 numbers + 1 letter)
  if (!/^[0-9]{8}[A-Z]$/.test(nifToTest)) return false;

  // Validate the control letter
  const dniLetters = "TRWAGMYFPDXBNJZSQVHLCKE";
  const number = parseInt(nifToTest.substring(0, 8), 10);
  const expectedLetter = dniLetters.charAt(number % 23);

  return nif.charAt(8) === expectedLetter;
}
