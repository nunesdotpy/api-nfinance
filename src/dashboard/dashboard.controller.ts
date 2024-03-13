import { Controller, Get } from '@nestjs/common';

@Controller('dashboard')
export class DashboardController {

@Get(':id')
findOne(params: any): string {
  console.log(params.id);
  return `This action returns a #${params.id} cat`;
}

}
