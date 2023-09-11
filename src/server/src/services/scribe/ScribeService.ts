import ms from 'ms';

import { ReadAndSummarizePayload, RecapPayload } from './types';
import {
  Loot,
  MailService,
  OpenAIService,
  Prompt,
  PuppeteerError,
  PuppeteerService,
  S3Service,
  TtsService,
} from '../';
import {
  Category,
  Recap,
  SentimentMethod,
  Subscription,
  Summary,
  SummaryMedia,
} from '../../api/v1/schema';
import { BaseService } from '../base';

const MIN_TOKEN_COUNT = 50;
const MAX_OPENAI_TOKEN_COUNT = Number(process.env.MAX_OPENAI_TOKEN_COUNT || 1500);
const BAD_RESPONSE_EXPR = /^["']?[\s\n]*(?:Understood,|Alright,|okay, i|Okay. How|I am an AI|I'm sorry|stay (?:informed|updated)|got it|keep yourself updated|CNBC: stay|CNBC is offering|sign\s?up|HuffPost|got it. |how can i|hello!|okay, i'm|sure,)/i;

const OLD_NEWS_THRESHOLD = process.env.OLD_NEWS_THRESHOLD || '1d';

export function abbreviate(str: string, len: number) {
  //
  return str.split(' ').slice(0, len).join(' ');
}

export class ScribeService extends BaseService {
  
  static categories: string[] = [];
  
  public static async prepare() {
    await Category.prepare();
    const categories = await Category.findAll();
    this.categories = categories.map((c) => c.displayName);
    await SentimentMethod.prepare();
  }

  public static async error(subject: string, text = subject, throws = true): Promise<void> {
    console.log(subject);
    await new MailService().sendMail({
      from: 'debug@readless.ai',
      subject,
      text,
      to: 'debug@readless.ai',
    });
    if (throws === true) {
      throw new Error(subject);
    }
  }
  
  public static async readAndSummarize(
    {
      url, imageUrls, content, publisher, force, priority,
    }: ReadAndSummarizePayload
  ): Promise<Summary> {
    if (this.categories.length === 0) {
      await this.prepare();
    }
    if (!publisher) {
      throw new Error('no publisher id specified');
    }
    if (!force) {
      const existingSummary = await Summary.findOne({ where: { url } });
      if (existingSummary) {
        console.log(`Summary already exists for ${url}`);
        return existingSummary;
      }
    } else {
      console.log(`Forcing summary rewrite for ${url}`);
    }
    if (!PuppeteerService.EXCLUDE_EXPRS.depth1.every((e) => !new RegExp(e, 'i').test(url.replace(/^https?:\/\/.*?(?=\/)/, '')))) {
      throw new Error('Probably not a news article');
    }
    // fetch web content with the spider
    let loot: Loot; 
    try {
      loot = await PuppeteerService.loot(url, publisher, { content });
    } catch (e) {
      if (e instanceof PuppeteerError) {
        await this.error('Bad response', [url, e.message].join('\n\n'));
      }
      throw e;
    }
    if (priority > 0) {
      const parsedDate = new Date(parseInt(`${priority}`));
      if (!Number.isNaN(parsedDate.valueOf())) {
        loot.date = parsedDate;
      }
    }
    loot.imageUrls = Array.from(new Set([...loot.imageUrls, ...imageUrls]));
    // create the prompt onReply map to be sentto ChatGPT
    if (!force) {
      const existingMedia = await SummaryMedia.findOne({ where: { originalUrl: loot.imageUrls } });
      if (existingMedia) {
        console.log(`Media already exists for ${url}`);
        return await Summary.findOne({ where: { id: existingMedia.parentId } });
      }
    }
    if (loot.content.split(' ').length > MAX_OPENAI_TOKEN_COUNT) {
      loot.content = abbreviate(loot.content, MAX_OPENAI_TOKEN_COUNT);
    }
    if (loot.content.split(' ').length < MIN_TOKEN_COUNT) {
      await this.error('Article too short', [url, loot.content].join('\n\n'));
    }
    if (!loot.date || Number.isNaN(loot.date.valueOf())) {
      await this.error('Invalid date found', [url, JSON.stringify(publisher.selectors.date), loot.dateMatches.join('\n-----\n'), loot.content].join('\n\n'));
    }
    if (Date.now() - loot.date.valueOf() > ms(OLD_NEWS_THRESHOLD)) {
      throw new Error(`${loot.date} -- News is older than ${OLD_NEWS_THRESHOLD}`);
    }
    if (loot.date > new Date(Date.now() + ms('3h'))) {
      await this.error('News is from the future', [url, loot.date.toISOString()].join('\n\n'));
    }
    while (loot.date > new Date()) {
      loot.date = new Date(loot.date.valueOf() - ms('1h'));
    }
    const newSummary = Summary.json<Summary>({
      filteredText: loot.content,
      imageUrl: loot.imageUrls?.[0],
      originalDate: loot.date,
      originalTitle: loot.title,
      publisherId: publisher.id,
      rawText: loot.rawText,
      url,
    });
    let categoryDisplayName: string;
    const prompts: Prompt[] = [
      {
        handleReply: async (reply) => { 
          if (/no/i.test(reply)) {
            throw new Error('Not an actual article');
          }
          newSummary.title = reply;
        },
        text: [
          'Does the following appear to be a news article or story? A collection of article headlines, pictures, videos, advertisements, description of a news website, or subscription program should not be considered a news article/story. Please respond with just "yes" or "no"\n\n', 
          newSummary.filteredText,
        ].join(''),
      },
      {
        handleReply: async (reply) => { 
          categoryDisplayName = reply
            .replace(/^.*?:\s*/, '')
            .replace(/\.$/, '')
            .trim();
          if (!this.categories.some((c) => new RegExp(`^${c}$`, 'i').test(categoryDisplayName))) {
            await this.error('Bad category', [url, categoryDisplayName, reply].join('\n\n'));
          }
        },
        text: `Please select a best category for this article from the following choices: ${this.categories.join(',')}. Respond with only the category name`,
      },
      {
        handleReply: async (reply) => { 
          if (reply.split(' ').length > 15) {
            await this.error('Title too long', `Title too long for ${url}\n\n${reply}`);
          }
          newSummary.title = reply;
        },
        text: [
          'Please summarize the same article using no more than 10 words to be used as a title. Prioritize important names, places, events, dates, and numeric values. Make the title as unbiased and not clickbaity as possible. Respond with just the title.',
        ].join(''),
      },
      {
        handleReply: async (reply) => { 
          if (reply.split(' ').length > 40) {
            await this.error('Short summary too long', `Short summary too long for ${url}\n\n${reply}`);
          }
          newSummary.shortSummary = reply;
        },
        text: [
          'Please provide another unbiased summary using no more than 30 words. Prioritize important names, places, events, dates, and numeric values. Make the summary as unbiased as possible. Do not use phrases like "The article" or "This article".', 
        ].join(''),
      },
      {
        handleReply: async (reply) => { 
          if (reply.split(' ').length > 120) {
            await this.error('Summary too long', `Summary too long for ${url}\n\n${reply}`);
          }
          newSummary.summary = reply;
        },
        text: [
          'Please provide another longer unbiased summary using no more than 100 words. Prioritize important names, places, events, dates, and numeric values. Make the summary as unbiased as possible. Do not use phrases like "The article" or "This article".', 
        ].join(''),
      },
      {
        handleReply: async (reply) => {
          newSummary.bullets = reply
            .replace(/•\s*/g, '')
            .replace(/^\.*?:\s*/, '')
            .replace(/<br\s*\/?>/g, '')
            .split(/\n/)
            .map((bullet) => bullet.trim()
              .replace(/\n*/g, '')
              .replace(/[\\.]*$/, ''))
            .filter(Boolean);
        },
        text: 'Please provide 5 concise unbiased bullet point sentences no longer than 10 words each that summarize this article using • as the bullet symbol. Prioritize important names, places, events, dates, and numeric values.',
      },
    ];
      
    // initialize chatService service and send the prompt
    const chatService = new OpenAIService();
    // iterate through each summary prompt and send themto ChatGPT
    for (const prompt of prompts) {
      if (await Summary.findOne({ where: { url } })) {
        await this.error('job already completed by another worker');
      }
      let reply = await chatService.send(prompt.text);
      if (BAD_RESPONSE_EXPR.test(reply)) {
        // attempt single retry
        reply = await chatService.send(prompt.text);
        if (BAD_RESPONSE_EXPR.test(reply)) {
          await this.error('Bad response from chatService', ['--repl--', reply, '--prompt--', prompt.text].join('\n'));
        }
      }
      try {
        await prompt.handleReply(reply);
      } catch (e) {
        if (/too long|sentiment|category/i.test(e.message)) {
          reply = await chatService.send(prompt.text);
          console.log(e);
          // attempt single retry
          await prompt.handleReply(reply);
        } else {
          throw e;
        }
      }
      this.log(reply);
    }
      
    try {
    
      const category = await Category.findOne({ where: { displayName: categoryDisplayName } });
      newSummary.categoryId = category.id;
      
      if (await Summary.findOne({ where: { url } })) {
        await this.error('job already completed by another worker');
      }
    
      // Save summary to database
      const summary = await Summary.create(newSummary);
      
      // Save article media
      if (loot.imageUrls && loot.imageUrls.length > 0) {
        // download looted images
        let imageCount = 0;
        for (const imageUrl of loot.imageUrls) {
          try {
            const obj = await S3Service.mirror(imageUrl, {
              ACL: 'public-read',
              Accept: 'image',
              Folder: 'img/s',
            });
            if (!obj) {
              continue;
            }
            await SummaryMedia.create({
              key: `imageArticle${imageCount === 0 ? '' : imageCount + 1}`,
              originalUrl: imageUrl,
              parentId: summary.id,
              path: obj.key,
              type: 'image',
              url: obj.url,
            });
            if (imageCount === 0) {
              summary.set('imageUrl', obj.url);
              await summary.save();
            }
            imageCount++;
          } catch (e) {
            await this.error('Failed to download image', [loot.imageUrls, JSON.stringify(e)].join('\n\n'), false);
          }
        }
      } else {
        this.log('Generating image with deepai as fallback');
        const obj = await summary.generateImageWithDeepAi();
        if (obj) {
          await SummaryMedia.create({
            key: 'imageAi1',
            parentId: summary.id,
            path: obj.key,
            type: 'image',
            url: obj.url,
          });
          summary.set('imageUrl', obj.url);
          await summary.save();
        }
      }
        
      // Generate sentiment scores
      await summary.generateSentiment();
      
      if (this.features.tts) {
      
        this.log('Generating tts');
        // generate media
        const result = await TtsService.generate({ text: `From ${publisher.displayName}: ${summary.title}` });
        const obj = await TtsService.mirror(result.url, {
          ACL: 'public-read',
          Folder: 'audio/s',
        });
        if (obj) {
          await SummaryMedia.create({
            key: 'tts',
            parentId: summary.id,
            path: obj.key,
            type: 'audio',
            url: obj.url,
          });
        }
        
      }
      
      this.log('🥳 Created new summary from', url, newSummary.title);
      
      return summary;
      
    } catch (e) {
      await this.error('😤 Unexpected Error Encountered', [url, JSON.stringify(e), JSON.stringify(newSummary, null, 2)].join('\n\n'));
    }
    
  }
  
  public static async writeRecap(payload: RecapPayload = {}) {
    try {
      
      const {
        key, start, end, duration,
      } = Recap.objectKey(payload);
      
      const exists = await Recap.exists(key);
      if (exists && !payload.force) {
        await this.error('Recap already exists');
      }
      
      console.log(start, end);

      const summaries = (await Summary.getTopStories({ interval: duration })).rows;
      
      if (summaries.length === 0) {
        await this.error('no summaries to recap');
      }

      const sourceSummaries = summaries.map((summary) => 
        `[${summary.id}] (${summary.siblings.length} articles) ${summary.publisher.displayName}: ${summary.title} - ${summary.shortSummary}`);

      const mainPrompt = 
        `I will provide you with a list of news events that occurred on ${start.toLocaleString()}. Please summarize the highlights in three to five paragraphs, blog form, making sure to prioritize topics that seem like breaking news and/or have a greater number of related articles written about them indicated in parentheses.

        Try to make the summary concise, engaging, and entertaining to read. Do not make up facts and do not respons with a list of bullet points. Just cover what seems most important. Do NOT add a references section at the end.

        Please also site from the list of events using the number of each headline as its reference code. For example, if the list of events were:
        [88] (14 articles) CNN: Trump impeached - Trump was impeached by the House of Representatives. The Senate will now hold a trial to determine whether or not he will be removed from office.
        [2793] (14 articles) Fox News: Trump impeached - Former President Donald Trump has been impeached by the House of Representatives for the second time in his presidency.
        [12476] (20 articles) MSNBC: Wildfires in California - Wildfires are raging in California, destroying thousands of homes and forcing hundreds of thousands of people to evacuate.

        Then you would write:

        In today's news, Trump was impeached [88, 2793] and wildfires are raging in California [12476].

        Here is the list of events:
        ${sourceSummaries.join('\n')}`;

      const newRecap = Recap.json<Recap>({ 
        key,
        length: duration,
      });
      const prompts: Prompt[] = [
        {
          handleReply: async (reply) => {
            newRecap.text = reply;
          },
          text: mainPrompt,
        },
        {
          handleReply: async (reply) => {
            newRecap.title = reply;
          },
          text: 'Give this recap a 10-15 word title that does not reflexively reference that this is a recap/daily highlight. For example: Trump Impeached and Lethal Forest Fires in California',
        },
      ];
      
      // initialize chat service
      const chatService = new OpenAIService();
      // iterate through each summary prompt and send them to ChatGPT
      for (const prompt of prompts) {
        let reply = await chatService.send(prompt.text);
        if (BAD_RESPONSE_EXPR.test(reply)) {
          // attempt single retry
          reply = await chatService.send(prompt.text);
          if (BAD_RESPONSE_EXPR.test(reply)) {
            await this.error('Bad response from chatService', ['--repl--', reply, '--prompt--', prompt.text].join('\n'));
          }
        }
        try {
          await prompt.handleReply(reply);
        } catch (e) {
          if (/too long|sentiment|category/i.test(e.message)) {
            reply = await chatService.send(prompt.text);
            console.error(e);
            // attempt single retry
            await prompt.handleReply(reply);
          } else {
            throw e;
          }
        }
        this.log(reply);
      }
      
      const recap = await Recap.create(newRecap);

      await Subscription.notify('daily-recap', 'email', {
        html: await recap.formatAsHTML(summaries),
        subject: `Daily Highlights: ${recap.title}`,
      });
      
      await Subscription.notify('daily-recap', 'push', {
        body: recap.title,
        title: 'Daily Highlights',
      });

      return recap;
      
    } catch (e) {
      console.log(e);
      await this.error('Unexpected error writing recap');
    }
  }
  
}