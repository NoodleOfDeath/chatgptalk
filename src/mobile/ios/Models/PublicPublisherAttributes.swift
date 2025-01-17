//
// PublicPublisherAttributes.swift
//

import Foundation
#if canImport(AnyCodable)
import AnyCodable
#endif

public struct PublicPublisherAttributes: Codable, Hashable {

  public var name: String
  public var displayName: String
  public var description: String?
  
  public var icon: URL {
    return URL(string: "https://readless.nyc3.cdn.digitaloceanspaces.com/img/pub/\(self.name).png")!
  }

  public init(name: String, displayName: String, description: String? = nil) {
    self.name = name
    self.displayName = displayName
    self.description = description
  }

  public enum CodingKeys: String, CodingKey, CaseIterable {
    case name
    case displayName
    case description
  }

  public func encode(to encoder: Encoder) throws {
    var container = encoder.container(keyedBy: CodingKeys.self)
    try container.encode(name, forKey: .name)
    try container.encode(displayName, forKey: .displayName)
    try container.encodeIfPresent(description, forKey: .description)
  }
  
}

