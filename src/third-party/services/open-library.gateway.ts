import { Injectable, BadRequestException, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { LibraryGatewayInterface } from '../interface/library-gateway.interface';
import { SearchBookDto, SearchBookResultDto } from '../dto/open-library.dto';
import { QueryDto } from 'src/common/dto/common.dto';

@Injectable()
export class OpenLibraryGateway implements LibraryGatewayInterface {
  private readonly logger = new Logger(OpenLibraryGateway.name);
  private readonly baseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.baseUrl = this.configService.get<string>('OPEN_LIBRARY_API') as string
    if (!this.baseUrl) {
      this.logger.error('OPEN_LIBRARY_API configuration is missing');
      throw new Error('OPEN_LIBRARY_API configuration is required');
    }
  }

  async search(queryDto: QueryDto): Promise<SearchBookResultDto<SearchBookDto>> {
    try {
      const {q,page,limit} = queryDto
      const url = `${this.baseUrl}/search.json?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`;
      const response = await firstValueFrom(
        this.httpService.get(url),
      );
      const books = response.data.docs.map((doc: any): SearchBookDto => ({
        title: doc.title || 'Unknown Title',
        author: doc.author_name?.[0],
      }));
      return {
        total: response.data.numFound || response.data.num_found,
        data:books
      };
    } catch (error) {
      this.logger.error(`Failed to search books: ${error.message}`, error.stack);
      if (error.response?.status >= 500) {
        throw new ServiceUnavailableException('Open Library API is unavailable');
      }
      throw new BadRequestException('Failed to search books');
    }
  }
}