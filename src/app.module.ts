import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DashboardController } from './dashboard/dashboard.controller';

@Module({
  imports: [],
  controllers: [AppController, DashboardController],
  providers: [AppService],
})
export class AppModule {}
