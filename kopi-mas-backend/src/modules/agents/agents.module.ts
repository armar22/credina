import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentsController } from './controllers/agents.controller';
import { AgentsService } from './services/agents.service';
import { Agent } from './entities/agent.entity';
import { AgentWalletTransaction } from './entities/agent-wallet.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Agent,
      AgentWalletTransaction,
    ]),
  ],
  controllers: [AgentsController],
  providers: [AgentsService],
  exports: [AgentsService],
})
export class AgentsModule {}
