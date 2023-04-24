import ms from 'ms';
import {
  Column,
  DataType,
  Scopes,
  Table,
} from 'sequelize-typescript';

import {
  FetchPolicy,
  OutletAttributes,
  OutletCreationAttributes,
  PUBLIC_OUTLET_ATTRIBUTES,
  Selectors,
} from './Outlet.types';
import { RateLimit } from '../../analytics/RateLimit.model';
import { BaseModel } from '../../base';

const OUTLET_FETCH_LIMIT = process.env.OUTLET_FETCH_LIMIT ? Number(process.env.OUTLET_FETCH_LIMIT) : 1; // 1 for dev and testing
const OUTLET_MAX_ATTEMPT_LIMIT = process.env.OUTLET_MAX_ATTEMPT_LIMIT ? Number(process.env.OUTLET_MAX_ATTEMPT_LIMIT) : 5;
const OUTLET_FETCH_INTERVAL = process.env.OUTLET_FETCH_INTERVAL || '1d';

@Scopes(() => ({ public: { attributes: [...PUBLIC_OUTLET_ATTRIBUTES] } }))
@Table({
  modelName: 'outlet',
  paranoid: true,
  timestamps: true,
})
export class Outlet<
    A extends OutletAttributes = OutletAttributes,
    B extends OutletCreationAttributes = OutletCreationAttributes,
  >
  extends BaseModel<A, B>
  implements OutletAttributes {

  static OUTLETS: Record<string, OutletCreationAttributes> = {
    abc: {
      baseUrl: 'https://abcnews.go.com',
      displayName: 'ABC News',
      name: 'abc',
      selectors: {
        article: { selector: 'article' },
        author: { selector: '.ShareByline a[href*="/author"]' },
        date: { selector: '.ShareByline > div  > div :last-child' },
        spider: {
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    advocate: {
      baseUrl: 'https://www.advocate.com',
      displayName: 'Advocate',
      name: 'advocate',
      selectors: {
        article: { selector: 'article' },
        author: { selector: 'article .social-author' },
        date: { selector: 'article .social-date' },
        spider: { 
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    aei: {
      baseUrl: 'https://www.aei.org',
      displayName: 'AEI',
      name: 'aei',
      selectors: {
        article: { selector: 'article' },
        author: { selector: 'article header .author' },
        date: { selector: 'article header .date' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    apnews: {
      baseUrl: 'https://www.apnews.com',
      displayName: 'AP News',
      name: 'apnews',
      selectors: {
        article: { selector: '.Content .Article' },
        author: { selector: '.Content .CardHeadline *[class*="Component-bylines"]' },
        date: { attribute: 'data-source', selector: '.Content .CardHeadline .Timestamp' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    arstechnica: {
      baseUrl: 'https://www.arstechnica.com',
      displayName: 'ars technica',
      name: 'ars-technica',
      selectors: {
        article:{ selector: 'article' }, 
        author: { selector: 'article header section *[itemprop*="author creator"] a' },
        date: { selector: 'article header time' },
        spider: {
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    atlantic: {
      baseUrl: 'https://www.theatlantic.com',
      displayName: 'The Atlantic',
      name: 'atlantic',
      selectors: {
        article: { selector: 'article' },
        author: { selector: 'article header #byline a' },
        date: { selector: 'article header time' },
        spider: {
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    barrons: {
      baseUrl: 'https://www.barrons.com/real-time',
      displayName: 'Barron\'s',
      name: 'barrons',
      selectors: {
        article: { selector: 'article' },
        author: { selector: 'article header .byline .author' },
        date: { selector: 'article header time' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    bbc: {
      baseUrl: 'https://www.bbc.com',
      displayName: 'BBC',
      name: 'bbc',
      selectors: { 
        article: { selector: 'article' },
        author: { selector: 'article *[class*="TextContributorName"]' },
        date: { selector: 'article time' },
        spider:{ attribute: 'href', selector: 'a' }, 
      },
      timezone: 'UTC+1',
    },
    billboard: {
      baseUrl: 'https://www.billboard.com',
      displayName: 'billboard',
      name: 'billboard',
      selectors: {
        article: { selector: 'article' },
        author: { selector: 'header .author a' },
        date: { selector: 'header time' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    bleepingcomputer: {
      baseUrl: 'https://www.bleepingcomputer.com',
      displayName: 'Bleeping Computer',
      name: 'bleeping-computer',
      selectors: {
        article: { selector: 'article' },
        author: { selector: 'article .author' },
        date: { attribute: 'text', selector: 'article .cz-news-date,article .cz-news-time' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    bloomberg: {
      baseUrl: 'https://www.bloomberg.com',
      displayName: 'Bloomberg',
      name: 'bloomberg',
      selectors: {
        article: { selector: 'article' },
        author: { selector: 'address p[class*="author"] a' },
        date: { selector: 'time' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    businessinsider: {
      baseUrl: 'https://www.businessinsider.com',
      displayName: 'Business Insider',
      name: 'business-insider',
      selectors: {
        article: { selector: 'article' },
        author: { selector: '.byline .byline-author-name' },
        date: { selector: '.byline .byline-timestamp' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    bustle: {
      baseUrl: 'https://www.bustle.com',
      displayName: 'Bustle',
      name: 'bustle',
      selectors: {
        article: { selector: 'article' },
        author: { selector: 'address a' },
        date: { selector: 'time' },
        spider:{
          attribute: 'href',
          selector: 'a', 
        },
      },
      timezone: 'EST',
    },
    buzzfeed: {
      baseUrl: 'https://www.buzzfeed.com',
      displayName: 'BuzzFeed',
      name: 'buzzfeed',
      selectors: {
        article: { selector: 'article' },
        author: { selector: 'article .author a' },
        date: { selector: 'time' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    cbsnews: {
      baseUrl: 'https://www.cbsnews.com',
      displayName: 'CBS News',
      name: 'cbsnews',
      selectors: {
        article: { selector: 'article' },
        author : { selector: '' },
        date: { selector: 'article time' },
        spider:{ attribute: 'href', selector: 'a' },
      },
      timezone: 'EST',
    },
    cnbc: {
      baseUrl: 'https://www.cnbc.com',
      displayName: 'CNBC',
      name: 'cnbc',
      selectors: {
        article: { selector: '.ArticleBody-articleBody' },
        author: { selector: '.Author-authorName' },
        date: { selector: 'time' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    cnn: {
      baseUrl: 'https://www.cnn.com',
      displayName: 'CNN',
      name: 'cnn',
      selectors: {
        article: { selector: '.ArticleBody-articleBody' },
        author: { selector: 'header .headline__sub-text .byline_name' },
        date: { selector: 'header .headline__sub-text .timestamp' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    coindesk: {
      baseUrl: 'https://www.coindesk.com',
      displayName: 'CoinDesk',
      name: 'coindesk',
      selectors: {
        article: { selector: 'article' },
        author: { selector: 'article .at-authors a' },
        date: { selector: 'article .at-created,article .at-updated' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    cryptoglobe: {
      baseUrl: 'https://www.cryptoglobe.com',
      displayName: 'Cryptoglobe',
      name: 'cryptoglobe',
      selectors: {
        article: { selector: 'article' },
        author: { selector: 'article header .media-body a[href*="/contributors"]' },
        date: { selector: 'article header .media-body :last-child' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    csis: {
      baseUrl: 'https://www.csis.org',
      displayName: 'CSIS',
      name: 'csis',
      selectors: {
        article: { selector: 'div[role*="article"] .column' },
        author: { selector: 'article .contributors a' },
        date: { selector: 'article .contributors :last-child' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    defenseone: {
      baseUrl: 'https://www.defenseone.com',
      displayName: 'Defense One',
      name: 'defense-one',
      selectors: {
        article: { selector: 'div[role*="article"] .column' },
        author: { selector: 'article .contributors a' },
        date: { selector: 'article .contributors :last-child' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    developertech: {
      baseUrl: 'https://www.developer-tech.com',
      displayName: 'Developer Tech',
      name: 'developer-tech',
      selectors: {
        article: { selector: 'article' },
        author: { selector: 'article .byline .by a' },
        date: { selector: 'article .byline time' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    economist: {
      baseUrl: 'https://www.economist.com',
      displayName: 'The Economist (Coming Soon)',
      name: 'economist',
      selectors: {
        article: { selector: 'disabled' },
        author: { selector: 'disabled' },
        date: { selector: 'disabled' },
        spider : { selector: 'disabled' },
      },
      timezone: 'EST',
    },
    enews: {
      baseUrl: 'https://www.eonline.com',
      displayName: 'E! News',
      name: 'enews',
      selectors: {
        article: { selector: '.article-detail__text-only' },
        author: { selector: 'header .article-detail__meta__author' },
        date: { selector: 'header .article-detail__meta__date' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'UTC-7',
    },
    espn: {
      baseUrl: 'https://www.espn.com',
      displayName: 'ESPN',
      name: 'espn',
      selectors: {
        article: { selector: 'article' },
        author: { selector: 'article .authors .author' },
        date: { attribute: 'data-date', selector: 'article .timestamp' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    essence: {
      baseUrl: 'https://www.essence.com',
      displayName: 'Essence',
      name: 'essence',
      selectors: {
        article: { selector: 'article' },
        author: { selector: 'article header .byline .author a' },
        date: { selector: 'article .posted-on time' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    ew: {
      baseUrl: 'https://www.ew.com',
      displayName: 'Entertainment Weekly',
      name: 'ew',
      selectors: {
        article: { selector: 'main > .longformContent' },
        author: { attribute: 'alt', selector: 'main > .longformContent .byline__authorAvatar img' },
        date: { attribute: 'data-date', selector: '.byline_block--timestamp' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    forbes: {
      baseUrl: 'https://www.forbes.com',
      displayName: 'Forbes',
      name: 'forbes',
      selectors: {
        article: { selector: 'article' },
        author: { selector: 'article .fs-author-name a' },
        date: { selector: 'article time' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EDT',
    },
    foreignpolicy: {
      baseUrl: 'https://www.foreignpolicy.com',
      displayName: 'Foreign Policy',
      name: 'foreign-policy',
      selectors: {
        article: { selector: 'article' },
        author: { selector: 'article .author-bio a[rel*="author"]' },
        date: { selector: 'time' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    fortune: {
      baseUrl: 'https://www.fortune.com',
      displayName: 'Fortune',
      name: 'fortune',
      selectors: {
        article: { selector: '#article-content' },
        author: { selector: '#content a[href*="/author"]' },
        date: { selector: '#content' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EDT',
    },
    foxnews: {
      baseUrl: 'https://www.foxnews.com',
      displayName: 'Fox News',
      name: 'foxnews',
      selectors: {
        article: { selector: 'article' },
        author: { selector: 'article header .author-byline a[href*="/person"]' },
        date: { selector: 'article header time' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    ft: {
      baseUrl: 'https://www.ft.com',
      displayName: 'Financial Times',
      name: 'ft',
      selectors: {
        article: { selector: 'disabled' },
        author: { selector: 'disabled' },
        date: { selector: 'disabled' },
        spider : { selector: 'disabled' },
      },
      timezone: 'EST',
    },
    gizmodo: {
      baseUrl: 'https://www.gizmodo.com', 
      displayName: 'Gizmodo',
      name: 'gizmodo',
      selectors: {
        article: { selector: '.js_post-content' },
        author: { selector: '.js_starterpost a[href*="/author"]' },
        date: { selector: '.js_starterpost time' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    guardian: {
      baseUrl: 'https://www.theguardian.com',
      displayName: 'The Guardian',
      name: 'theguardian',
      selectors: {
        article: { selector: 'article' },
        author: { selector: 'address a[rel*="author"]' },
        date: { selector: 'article details summary' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    hill: {
      baseUrl: 'https://www.thehill.com',
      displayName: 'The Hill',
      name: 'thehill',
      selectors: {
        article: { selector: 'article' },
        author: { selector: 'article .submitted-by a[href*="/author"]' },
        date: { selector: 'article .submitted-by' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    huffpost: {
      baseUrl: 'https://www.huffpost.com',
      displayName: 'HuffPost',
      name: 'huffpost',
      selectors: {
        article: { selector: 'article' },
        author: { selector: 'main header .entry__wirepartner span' },
        date: { selector: 'main header time' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    inverse: {
      baseUrl: 'https://www.inverse.com',
      displayName: 'Inverse',
      name: 'inverse',
      selectors: {
        article: { selector: 'article' },
        author: { selector: 'address a' },
        date: { selector: 'article time' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    kotaku: {
      baseUrl: 'https://www.kotaku.com',
      displayName: 'Kotaku',
      name: 'kotaku',
      selectors: {
        article: { selector: 'article' },
        author: { selector: 'main a[href*="/author"]' },
        date: { selector: 'main time' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    ksl: {
      baseUrl: 'https://www.ksl.com',
      displayName: 'KSL',
      name: 'ksl',
      selectors: {
        article: { selector: 'article' },
        author: { selector: '.byline .author a' },
        date: { selector: '.byline .author a' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    latimes: {
      baseUrl: 'https://www.latimes.com',
      displayName: 'Los Angeles Times',
      name: 'latimes',
      selectors: {
        article: { selector: 'article' },
        author: { selector: 'article .byline .authors .author-name a' },
        date: { selector: 'aritcle .byline time' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'UTC-7',
    },
    lifewire: {
      baseUrl: 'https://www.lifewire.com',
      displayName: 'Lifewire',
      name: 'lifewire',
      selectors: {
        article: { selector: 'article' },
        author: { selector: '.article-meta a' },
        date: { selector: '.mntl-attribution__item-date' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EDT',
    },
    mashable: {
      baseUrl: 'https://www.mashable.com',
      displayName: 'Mashable',
      name: 'mashable',
      selectors: {
        article: { selector: 'article' },
        author: { selector: 'header a[href*="/author"]' },
        date: { selector: 'header time' },
        spider:{
          attribute: 'href',
          selector: 'a[href*="/article"]',
        },
      },
      timezone: 'EST',
    },
    menshealth: {
      baseUrl: 'https://www.menshealth.com',
      displayName: 'Men\'s Health',
      name: 'mens-health',
      selectors: {
        article: { selector: '.article-body-content' },
        author: { selector: 'header address a[href*="/author"]' },
        date: { selector: 'header time' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    natgeo: {
      baseUrl: 'https://www.nationalgeographic.com',
      displayName: 'National Geographic',
      name: 'national-geographic',
      selectors: {
        article: { selector: 'article' },
        author: { selector: 'article header .Byline .Byline__Author a[href*="/author"]' },
        date: { selector: 'article header .Byline__TimestampWrapper .Byline__Meta--publishDate' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    nbcnews: {
      baseUrl: 'https://www.nbcnews.com',
      displayName: 'NBC News',
      name: 'nbcnews',
      selectors: {
        article: { selector: 'article' },
        author: { selector: 'article .byline-name a' },
        date: { attribute:'content', selector: 'time' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    newsweek: {
      baseUrl: 'https://www.newsweek.com',
      displayName: 'Newsweek',
      name: 'newsweek',
      selectors: {
        article: { selector: 'article' },
        author: { selector: 'article .byline-name a' },
        date: { attribute:'content', selector: 'time' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    newyorker: {
      baseUrl: 'https://www.newyorker.com',
      displayName: 'The New Yorker',
      name: 'newyorker',
      selectors: {
        article: { selector: 'article' },
        author: { selector: 'article *[class*="BylinesWrapper"] a[href*="/contributors"]' },
        date: { attribute: 'datetime', selector: 'article time' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    npr: {
      baseUrl: 'https://www.npr.org',
      displayName: 'NPR',
      name: 'npr',
      selectors: {
        article: { selector: 'article' },
        author: { selector: '#storybyline .byline__name a' },
        date: { attribute:'datetime', selector: 'article time' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    nytimes: {
      baseUrl: 'https://www.nytimes.com',
      displayName: 'New York Times (Coming Soon)',
      name: 'nytimes',
      selectors: {
        article: { selector: 'disabled' },
        author: { selector: 'disabled' },
        date: { selector: 'disabled' },
        spider:{ selector: 'disbaled' },
      },
      timezone: 'EST',
    },
    out: {
      baseUrl: 'https://www.out.com',
      displayName: 'Out',
      name: 'out',
      selectors: {
        article: { selector: 'article' },
        author: { selector: 'article .byline-name a' },
        date: { attribute: 'content', selector: 'article .social-date,article .social-date-modified' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    people: {
      baseUrl: 'https://www.people.com',
      displayName: 'People',
      name: 'people',
      selectors: {
        article: { selector: 'article' },
        author: { selector: 'article .mntl-bylines__item a[href*="/author"]' },
        date: { attribute: 'text', selector: '.mntl-attribution__item-date' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    politico: {
      baseUrl: 'https://www.politico.com',
      displayName: 'Politico',
      name: 'politico',
      selectors: {
        article: { selector: '.article__container .article__content' },
        author: { selector: '.article-meta .authors a' },
        date: { selector: '.article-meta .articla-meta__datetime-duration .date-time__date' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    popmechs: {
      baseUrl: 'https://www.popularmechanics.com',
      displayName: 'Popular Mechanics ',
      name: 'popular-mechanics',
      selectors: {
        article: { selector: '.article-body-content' },
        author: { selector: 'address a[href*="/author"]' },
        date: { attribute: 'text', selector: 'address time' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    reuters: {
      baseUrl: 'https://www.reuters.com', 
      displayName: 'Reuters',
      name: 'reuters',
      selectors: {
        article: { selector: 'article' },
        author: { selector: '*[class*="author-name"] a' },
        date: { attribute: 'text', selector: 'article time' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    rstone: {
      baseUrl: 'https://www.rollingstone.com',
      displayName: 'Rolling Stone',
      name: 'rolling-stone',
      selectors: {
        article: { selector: 'article' },
        author: { selector: 'article .author-tagline a' },
        date: { selector: 'article time' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    science: {
      baseUrl: 'https://www.science.org',
      displayName: 'Science',
      name: 'science',
      selectors: {
        article: { selector: 'article' },
        author: { selector: 'article .byline-name a' },
        date: { selector: 'time' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    sciencedaily: {
      baseUrl: 'https://www.sciencedaily.com',
      displayName: 'Science Daily',
      name: 'science-daily',
      selectors: {
        article: { selector: '#story_text' },
        author: { selector: '#source' },
        date: { selector: '#date_posted' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    space: {
      baseUrl: 'https://www.space.com',
      displayName: 'Space',
      name: 'space',
      selectors: {
        article: { selector: 'article' },
        author: { selector: 'article .author-byline__authors .author-byline__author-name a' },
        date: { selector: 'article time' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    street: {
      baseUrl: 'https://www.thestreet.com',
      displayName: 'The Street',
      name: 'thestreet',
      selectors: {
        article: { selector: 'article' },
        author: { selector: 'article .m-detail-header--meta-author' },
        date: { selector: 'article .m-detail-header--date' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    sundaytimes: {
      baseUrl: 'https://www.thetimes.co.uk',
      displayName: 'The Sunday Times ',
      name: 'sunday-times',
      selectors: {
        article: { selector: 'article' },
        author: { selector: '' },
        date: { selector: 'time' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'UTC+1',
    },
    telegraph: {
      baseUrl: 'https://www.telegraph.co.uk',
      displayName: 'The Telegraph',
      name: 'telegraph',
      selectors: {
        article: { selector: 'article' },
        author: { selector: 'article .e-byline__author' },
        date: { selector: 'article time' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'UTC+1',
    },
    time: {
      baseUrl: 'https://www.time.com',
      displayName: 'Time',
      name: 'time',
      selectors: {
        article: { selector: '#article-body' },
        author: { selector: '.article .author .author-name' },
        date: { selector: '.article .author .timestamp' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    usatoday: {
      baseUrl: 'https://www.usatoday.com',
      displayName: 'USA Today',
      name: 'usatoday',
      selectors: {
        article: { selector: 'article' },
        author: { selector: 'a[href="/staff"]' },
        date: { selector: 'article *[aria-label*="Published:"]' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    usnews: {
      baseUrl: 'https://www.usnews.com',
      displayName: 'U.S. News',
      name: 'usnews',
      selectors: {
        article: { selector: '#main-column' },
        author: { selector: '*[class*="BylineArticle__AuthorWrapper"] a' },
        date: { selector: '*[class*="BylineArticle__AuthorWrapper"] *[class*="BylineArticle__DateSpan"]' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    vbeat: {
      baseUrl: 'https://www.venturebeat.com',
      displayName: 'Venture Beat',
      name: 'venture-beat',
      selectors: {
        article: { selector: 'article' },
        author: { selector: 'article .byline-name a' },
        date: { selector: 'time' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    vice: {
      baseUrl: 'https://www.vice.com',
      displayName: 'Vice',
      name: 'vice',
      selectors: {
        article: { selector: 'article' },
        author: { selector: 'article .byline-name a' },
        date: { selector: 'time' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    vox: {
      baseUrl: 'https://www.vox.com',
      displayName: 'Vox',
      name: 'vox',
      selectors: {
        article: { selector: 'article' },
        author: { selector: 'article .byline-name a' },
        date: { selector: 'time' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EDT',
    },
    wapo: {
      baseUrl: 'https://www.washingtonpost.com',
      displayName: 'The Washington Post (Coming Soon)',
      name: 'washington-post',
      selectors: {
        article: { selector: 'disabled' },
        author: { selector: 'disabled' },
        date: { selector:'disabled' },
        spider:{ selector: 'disabled' },
      },
      timezone: 'EST',
    },
    wilsoncenter: {
      baseUrl: 'https://www.wilsoncenter.org',
      displayName: 'Wilson Center',
      name: 'wilson-center',
      selectors: {
        article: { selector: 'disabled' },
        author: { selector: 'disabled' },
        date: { selector:'disabled' },
        spider:{ selector: 'disabled' },
      },
      timezone: 'EST',
    },
    wired: {
      baseUrl: 'https://www.wired.com',
      displayName: 'Wired',
      name: 'wired',
      selectors: {
        article: { selector: 'article' },
        author: { selector: 'article .byline-name a' },
        date: { selector: 'time' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
    wsj: {
      baseUrl: 'https://www.wsj.com',
      displayName: 'The Wall Street Journal',
      name: 'wsj',
      selectors: {
        article: { selector: 'article' },
        author: { selector: 'article .byline-name a' },
        date: { selector: 'time' },
        spider:{
          attribute: 'href',
          selector: 'a',
        },
      },
      timezone: 'EST',
    },
  };

  static async initOutlets() {
    for (const outlet of Object.values(this.OUTLETS)) {
      await this.upsert(outlet);
    }
  }

  @Column({
    allowNull: false,
    type: DataType.STRING,
    unique: true,
  })
  declare name: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  declare displayName: string;

  @Column({
    allowNull: false,
    type: DataType.STRING(2083),
  })
  declare baseUrl: string;
  
  @Column({ type: DataType.STRING(2083) })
  declare brandImageUrl?: string;
  
  @Column({ type: DataType.TEXT })
  declare description?: string;

  @Column({
    allowNull: false,
    defaultValue: {},
    type: DataType.JSON,
  })
  declare selectors: Selectors;
  
  @Column({ type: DataType.JSON })
  declare fetchPolicy?: Record<string, FetchPolicy>;
  
  @Column({ 
    defaultValue: 'UTC',
    type: DataType.STRING,
  })
  declare timezone: string;

  async getRateLimit(namespace = 'default') {
    const key = ['//outlet', this.id, this.name, namespace].join('§§');
    let limit = await RateLimit.findOne({ where: { key } });
    const policy = this.fetchPolicy?.[namespace];
    if (!limit) {
      limit = await RateLimit.create({
        expiresAt: new Date(Date.now() + ms(policy?.window || OUTLET_FETCH_INTERVAL)),
        key,
        limit: policy?.limit || namespace === 'default' ? OUTLET_FETCH_LIMIT : OUTLET_MAX_ATTEMPT_LIMIT,
        window: ms(policy?.window || OUTLET_FETCH_INTERVAL),
      });
    }
    return limit;
  }

}
