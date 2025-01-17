import {
  JwtRequest,
  JwtResponse,
  WrappedJwt,
} from './jwt';
import { 
  AliasPayload,
  DestructuredCredentialPayload,
  MetadataType, 
  ThirdParty,
} from '../../schema';
import { ProfileResponse } from '../profile';

export * from './jwt';

export type LoginRequest = AliasPayload & DestructuredCredentialPayload & JwtRequest & {
  createIfNotExists?: boolean;
  anonymous?: string;
  requestedRole?: string;
  requestedScope?: string[];
};

export type LoginResponse = JwtResponse & ProfileResponse & {
  unlinked?: boolean;
};

export type LogoutRequest = JwtRequest & {
  force?: boolean;
};

export type LogoutResponse = Partial<JwtResponse> & {
  success: boolean;
  count: number;
};

export type RegistrationRequest = AliasPayload & DestructuredCredentialPayload & JwtRequest & {
  anonymous?: string;
};

export type RegistrationResponse = Omit<JwtResponse, 'token'> & {
  token?: WrappedJwt;
};

export type RequestOtpRequest = Omit<AliasPayload, 'otp'> & {
  deleteAccount?: boolean;
};

export type RequestOtpResponse = {
  success: boolean;
};

export type VerifyOtpRequest = AliasPayload & {
  deleteAccount?: boolean;
};

export type VerifyOtpResponse = {
  token: WrappedJwt;
  userId: number;
};

export type RegisterAliasRequest = JwtRequest & {
  otherAlias: AliasPayload;
};

export type UnregisterAliasRequest = JwtRequest & {
  otherAlias: Omit<AliasPayload, 'thirdParty'> & {
    thirdParty?: ThirdParty;
  }
};

export type VerifyAliasRequest = {
  verificationCode: string;
};

export type VerifyAliasResponse = {
  success: boolean;
};

export type UpdateMetadataRequest = JwtRequest & {
  key: string;
  value: Record<string, unknown>;
  type?: MetadataType;
};

export type UpdateMetadataResponse = {
  success: boolean;
};

export type UpdateCredentialRequest = JwtRequest & {
  password?: string;
  newPassword?: string;
};

export type UpdateCredentialResponse = {
  success: boolean;
};

export type DeleteUserRequest = AliasPayload & JwtRequest & {
  password?: string;
};

export type DeleteUserResponse = {
  success: boolean;
};

export const OTP_LENGTH = 16;

export const VERIFICATION_CODE_LENGTH = 10;
