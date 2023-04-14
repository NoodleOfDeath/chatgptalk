//
// PickSummaryAttributesExcludeKeyofSummaryAttributesRawTextOrFilteredText.swift
//
// Generated by openapi-generator
// https://openapi-generator.tech
//

import Foundation
#if canImport(AnyCodable)
import AnyCodable
#endif

/** From T, pick a set of properties whose keys are in the union K */
public struct PublicSummaryAttributes: Codable, Hashable {

    public var id: Double
    public var createdAt: Date?
    public var updatedAt: Date?
    public var deletedAt: Date?
    public var text: String
    public var longSummary: String
    public var summary: String
    public var shortSummary: String
    public var bullets: [String]
    public var imagePrompt: String
    public var interactions: InteractionResponse
    public var formats: [ReadingFormat]
    public var title: String
    public var category: String
    public var subcategory: String
    public var tags: [String]
    public var outletId: Double
    public var url: String
    public var originalTitle: String
    public var outletAttributes: PublicOutletAttributes?
    public var categoryAttributes: PublicCategoryAttributes?

    public init(id: Double, createdAt: Date? = nil, updatedAt: Date? = nil, deletedAt: Date? = nil, text: String, longSummary: String, summary: String, shortSummary: String, bullets: [String], imagePrompt: String, interactions: InteractionResponse, formats: [ReadingFormat], title: String, category: String, subcategory: String, tags: [String], outletId: Double, url: String, originalTitle: String, outletAttributes: PublicOutletAttributes? = nil, categoryAttributes: PublicCategoryAttributes? = nil) {
        self.id = id
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.deletedAt = deletedAt
        self.text = text
        self.longSummary = longSummary
        self.summary = summary
        self.shortSummary = shortSummary
        self.bullets = bullets
        self.imagePrompt = imagePrompt
        self.interactions = interactions
        self.formats = formats
        self.title = title
        self.category = category
        self.subcategory = subcategory
        self.tags = tags
        self.outletId = outletId
        self.url = url
        self.originalTitle = originalTitle
        self.outletAttributes = outletAttributes
        self.categoryAttributes = categoryAttributes
    }

    public enum CodingKeys: String, CodingKey, CaseIterable {
        case id
        case createdAt
        case updatedAt
        case deletedAt
        case text
        case longSummary
        case summary
        case shortSummary
        case bullets
        case imagePrompt
        case interactions
        case formats
        case title
        case category
        case subcategory
        case tags
        case outletId
        case url
        case originalTitle
        case outletAttributes
        case categoryAttributes
    }

    // Encodable protocol methods

    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(id, forKey: .id)
        try container.encodeIfPresent(createdAt, forKey: .createdAt)
        try container.encodeIfPresent(updatedAt, forKey: .updatedAt)
        try container.encodeIfPresent(deletedAt, forKey: .deletedAt)
        try container.encode(text, forKey: .text)
        try container.encode(longSummary, forKey: .longSummary)
        try container.encode(summary, forKey: .summary)
        try container.encode(shortSummary, forKey: .shortSummary)
        try container.encode(bullets, forKey: .bullets)
        try container.encode(imagePrompt, forKey: .imagePrompt)
        try container.encode(interactions, forKey: .interactions)
        try container.encode(formats, forKey: .formats)
        try container.encode(title, forKey: .title)
        try container.encode(category, forKey: .category)
        try container.encode(subcategory, forKey: .subcategory)
        try container.encode(tags, forKey: .tags)
        try container.encode(outletId, forKey: .outletId)
        try container.encode(url, forKey: .url)
        try container.encode(originalTitle, forKey: .originalTitle)
        try container.encodeIfPresent(outletAttributes, forKey: .outletAttributes)
        try container.encodeIfPresent(categoryAttributes, forKey: .categoryAttributes)
    }
}
