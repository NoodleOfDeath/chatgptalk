//
// AuthError.swift
//
// Generated by openapi-generator
// https://openapi-generator.tech
//

import Foundation
#if canImport(AnyCodable)
import AnyCodable
#endif

public struct AuthError: Codable, JSONEncodable, Hashable {

    public enum ErrorKey: String, Codable, CaseIterable {
        case aliasUnverified = "ALIAS_UNVERIFIED"
        case alreadyLoggedIn = "ALREADY_LOGGED_IN"
        case badRequest = "BAD_REQUEST"
        case duplicateUser = "DUPLICATE_USER"
        case expiredCredentials = "EXPIRED_CREDENTIALS"
        case expiredVerificationCode = "EXPIRED_VERIFICATION_CODE"
        case insufficientPermissions = "INSUFFICIENT_PERMISSIONS"
        case invalidCredentials = "INVALID_CREDENTIALS"
        case invalidPassword = "INVALID_PASSWORD"
        case missingAuthorizationHeader = "MISSING_AUTHORIZATION_HEADER"
        case missingPassword = "MISSING_PASSWORD"
        case noThirdPartyAlias = "NO_THIRD_PARTY_ALIAS"
        case staleVerificationCode = "STALE_VERIFICATION_CODE"
        case thirdPartyAliasNotVerified = "THIRD_PARTY_ALIAS_NOT_VERIFIED"
        case unknownAlias = "UNKNOWN_ALIAS"
        case unknownRole = "UNKNOWN_ROLE"
        case unrefreshableJwt = "UNREFRESHABLE_JWT"
    }
    public var name: String
    public var message: String
    public var stack: String?
    public var code: Double
    public var statusCode: Double
    public var errorKey: ErrorKey

    public init(name: String, message: String, stack: String? = nil, code: Double, statusCode: Double, errorKey: ErrorKey) {
        self.name = name
        self.message = message
        self.stack = stack
        self.code = code
        self.statusCode = statusCode
        self.errorKey = errorKey
    }

    public enum CodingKeys: String, CodingKey, CaseIterable {
        case name
        case message
        case stack
        case code
        case statusCode
        case errorKey
    }

    // Encodable protocol methods

    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(name, forKey: .name)
        try container.encode(message, forKey: .message)
        try container.encodeIfPresent(stack, forKey: .stack)
        try container.encode(code, forKey: .code)
        try container.encode(statusCode, forKey: .statusCode)
        try container.encode(errorKey, forKey: .errorKey)
    }
}
