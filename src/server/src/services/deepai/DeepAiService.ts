import axios from 'axios';

import { S3Service } from '../aws';

export type TextToImageOptions = {
  grid_size?: number;
};

export type TextToImageResponse = {
  id: string;
  output_url: string;
};

export class DeepAiService extends S3Service {
  
  public static baseUrl = 'https://api.deepai.org/api/text2img';
  
  public static async textToImage(text: string, { grid_size = 1 }: TextToImageOptions = {}): Promise<TextToImageResponse> {
    const data = new FormData();
    data.append('text', text);
    data.append('grid_size', `${grid_size}`);
    const response = await axios.post(this.baseUrl, data, { headers: { 'api-key': process.env.DEEPAI_API_KEY } });
    if (!response.data.id || !response.data.output_url) {
      throw new Error('Bad response');
    }
    return response.data as TextToImageResponse;
  }

}