import autotpIdl from './autotp.json';
import type { AutotpIdl, Vault, AutotpProgram } from './types';

// Cast the JSON IDL to our extended IDL type
const typedAutotpIdl = autotpIdl as unknown as AutotpIdl;

export { typedAutotpIdl };
export type { AutotpIdl, Vault, AutotpProgram }; 