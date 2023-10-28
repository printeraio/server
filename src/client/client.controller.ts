import { Controller, Get, Headers, Post, UseGuards } from '@nestjs/common';

import { AuthGuard } from '@app/auth/auth.guard';
import { ClientService } from '@app/client/client.service';
import { RequestHeaders } from '@app/types';

@Controller('clients')
@UseGuards(AuthGuard)
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get()
  async findAll(@Headers() { user }: RequestHeaders) {
    const clients = await this.clientService.findAll(user.id);
    return { clients };
  }

  @Post('create')
  async create(@Headers() { user }: RequestHeaders) {
    const client = await this.clientService.create(user.id);
    return { client };
  }
}
