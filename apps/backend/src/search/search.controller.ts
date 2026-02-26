import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SearchService } from './search.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get('search')
  search(
    @Query('q') query: string,
    @Query('fieldId') fieldId?: string,
  ) {
    return this.searchService.search(query, fieldId);
  }
}
