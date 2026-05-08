import { UserRole, UserStatus, AuthProviderType } from './enums'

export interface User {
  id: string
  phoneNumber: string
  email?: string
  firstName?: string
  lastName?: string
  role: UserRole
  status: UserStatus
  provider: AuthProviderType
  isPhoneVerified: boolean
  isEmailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginResponse {
  user: User
  tokens: AuthTokens
}
