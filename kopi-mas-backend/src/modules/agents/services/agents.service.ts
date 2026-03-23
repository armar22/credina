import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Agent, AgentStatus } from '../entities/agent.entity';
import { AgentWalletTransaction, TransactionType, TransactionStatus } from '../entities/agent-wallet.entity';
import { 
  CreateAgentDto, 
  UpdateAgentDto, 
  AgentQueryDto,
  AgentWalletResponseDto,
  AgentTransactionResponseDto 
} from '../dto/agent.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AgentsService {
  constructor(
    @InjectRepository(Agent)
    private agentRepository: Repository<Agent>,
    @InjectRepository(AgentWalletTransaction)
    private walletTransactionRepository: Repository<AgentWalletTransaction>,
  ) {}

  async create(createAgentDto: CreateAgentDto): Promise<Agent> {
    const agentCode = this.generateAgentCode();
    
    const agent = this.agentRepository.create({
      ...createAgentDto,
      agentCode,
      pettyCashBalance: 0,
      collectionBalance: 0,
      status: AgentStatus.ACTIVE,
    });

    return this.agentRepository.save(agent);
  }

  async findAll(query: AgentQueryDto): Promise<{ data: Agent[]; total: number }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (query.status) {
      where.status = query.status;
    }
    
    if (query.branch_id) {
      where.branchId = query.branch_id;
    }
    
    if (query.region_id) {
      where.regionId = query.region_id;
    }

    let queryBuilder = this.agentRepository.createQueryBuilder('agent');

    if (query.search) {
      queryBuilder = queryBuilder.where(
        '(agent.full_name ILIKE :search OR agent.phone_number ILIKE :search OR agent.agent_code ILIKE :search)',
        { search: `%${query.search}%` }
      );
    }

    if (query.status) {
      queryBuilder = queryBuilder.andWhere('agent.status = :status', { status: query.status });
    }

    if (query.branch_id) {
      queryBuilder = queryBuilder.andWhere('agent.branch_id = :branchId', { branchId: query.branch_id });
    }

    const [data, total] = await queryBuilder
      .orderBy('agent.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(id: string): Promise<Agent> {
    if (!id || id === 'undefined') {
      throw new NotFoundException(`Agent not found`);
    }
    
    const agent = await this.agentRepository.findOne({ 
      where: { agent_id: id },
      relations: ['walletTransactions']
    });
    
    if (!agent) {
      throw new NotFoundException(`Agent with ID ${id} not found`);
    }
    
    return agent;
  }

  async findByAgentCode(agentCode: string): Promise<Agent | null> {
    return this.agentRepository.findOne({ 
      where: { agentCode },
      relations: ['walletTransactions']
    });
  }

  async update(id: string, updateAgentDto: UpdateAgentDto): Promise<Agent> {
    const agent = await this.findOne(id);
    Object.assign(agent, updateAgentDto);
    return this.agentRepository.save(agent);
  }

  async remove(id: string): Promise<void> {
    const agent = await this.findOne(id);
    agent.status = AgentStatus.INACTIVE;
    await this.agentRepository.save(agent);
  }

  async getAgentWallet(agentId: string): Promise<AgentWalletResponseDto> {
    const agent = await this.findOne(agentId);
    
    return {
      id: agent.agent_id,
      agentCode: agent.agentCode,
      fullName: agent.fullName,
      phoneNumber: agent.phoneNumber,
      pettyCashBalance: Number(agent.pettyCashBalance),
      collectionBalance: Number(agent.collectionBalance),
      totalBalance: Number(agent.pettyCashBalance) + Number(agent.collectionBalance),
      status: agent.status,
      selfApprovalLimit: Number(agent.selfApprovalLimit),
    };
  }

  async getAllAgentWallets(branchId?: string, regionId?: string): Promise<AgentWalletResponseDto[]> {
    const where: any = { status: AgentStatus.ACTIVE };
    if (branchId) where.branchId = branchId;
    if (regionId) where.regionId = regionId;

    const agents = await this.agentRepository.find({ where });

    return agents.map(agent => ({
      id: agent.agent_id,
      agentCode: agent.agentCode,
      fullName: agent.fullName,
      phoneNumber: agent.phoneNumber,
      pettyCashBalance: Number(agent.pettyCashBalance),
      collectionBalance: Number(agent.collectionBalance),
      totalBalance: Number(agent.pettyCashBalance) + Number(agent.collectionBalance),
      status: agent.status,
      selfApprovalLimit: Number(agent.selfApprovalLimit),
    }));
  }

  async releasePettyCash(agentId: string, amount: number, description?: string, processedBy?: string): Promise<Agent> {
    const agent = await this.findOne(agentId);
    const amountNum = Number(amount);

    const balanceBefore = Number(agent.pettyCashBalance);
    const balanceAfter = balanceBefore + amountNum;

    await this.walletTransactionRepository.query(
      `INSERT INTO agent_wallet_transactions (transaction_id, agent_id, "transactionType", amount, status, description, balance_before, balance_after, processed_by, processed_at, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
      [
        agent.agent_id,
        'petty_cash_in',
        amountNum,
        'completed',
        description || 'Petty cash received from admin',
        balanceBefore,
        balanceAfter,
        processedBy || null,
      ]
    );

    await this.agentRepository.query(
      `UPDATE agents SET pettyCashBalance = $1, updated_at = NOW() WHERE agent_id = $2`,
      [balanceAfter, agent.agent_id]
    );

    agent.pettyCashBalance = balanceAfter;
    return agent;
  }

  async receiveFromCollection(agentId: string, amount: number, collectionId: string, description?: string): Promise<Agent> {
    const agent = await this.findOne(agentId);
    const amountNum = Number(amount);

    const balanceBefore = Number(agent.collectionBalance);
    const balanceAfter = balanceBefore + amountNum;

    await this.walletTransactionRepository.query(
      `INSERT INTO agent_wallet_transactions (transaction_id, agent_id, "transactionType", amount, status, description, reference_type, reference_id, balance_before, balance_after, processed_at, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
      [
        agent.agent_id,
        'collection_in',
        amountNum,
        'completed',
        description || 'Cash received from collection',
        'collection',
        collectionId,
        balanceBefore,
        balanceAfter,
      ]
    );

    await this.agentRepository.query(
      `UPDATE agents SET collection_balance = $1, updated_at = NOW() WHERE agent_id = $2`,
      [balanceAfter, agent.agent_id]
    );

    agent.collectionBalance = balanceAfter;
    return agent;
  }

  async disburseToMember(agentId: string, applicationId: string, amount: number, notes?: string): Promise<Agent> {
    const agent = await this.findOne(agentId);
    const amountNum = Number(amount);

    const totalBalance = Number(agent.pettyCashBalance) + Number(agent.collectionBalance);
    
    if (totalBalance < amountNum) {
      throw new BadRequestException('Insufficient balance for disbursement');
    }

    let pettyCashBalanceBefore = Number(agent.pettyCashBalance);
    let collectionBalanceBefore = Number(agent.collectionBalance);
    let pettyCashUsed = 0;
    let collectionUsed = 0;

    if (pettyCashBalanceBefore >= amountNum) {
      pettyCashUsed = amountNum;
    } else {
      pettyCashUsed = pettyCashBalanceBefore;
      collectionUsed = amountNum - pettyCashBalanceBefore;
    }

    const pettyCashAfter = pettyCashBalanceBefore - pettyCashUsed;
    const collectionAfter = collectionBalanceBefore - collectionUsed;

    await this.walletTransactionRepository.query(
      `INSERT INTO agent_wallet_transactions (transaction_id, agent_id, "transactionType", amount, status, description, reference_type, reference_id, balance_before, balance_after, processed_at, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
      [
        agent.agent_id,
        'disbursement',
        amountNum,
        'completed',
        notes || 'Disbursed to member',
        'application',
        applicationId,
        totalBalance,
        pettyCashAfter + collectionAfter,
      ]
    );

    await this.agentRepository.query(
      `UPDATE agents SET pettyCashBalance = $1, collection_balance = $2, updated_at = NOW() WHERE agent_id = $3`,
      [pettyCashAfter, collectionAfter, agent.agent_id]
    );

    agent.pettyCashBalance = pettyCashAfter;
    agent.collectionBalance = collectionAfter;
    return agent;
  }

  async depositToAdmin(agentId: string, amount: number, notes?: string, processedBy?: string): Promise<Agent> {
    const agent = await this.findOne(agentId);
    const amountNum = Number(amount);

    const totalBalance = Number(agent.pettyCashBalance) + Number(agent.collectionBalance);
    
    if (totalBalance < amountNum) {
      throw new BadRequestException('Insufficient balance for deposit');
    }

    let pettyCashUsed = 0;
    let collectionUsed = 0;
    let pettyCashBalanceBefore = Number(agent.pettyCashBalance);
    let collectionBalanceBefore = Number(agent.collectionBalance);

    if (pettyCashBalanceBefore >= amountNum) {
      pettyCashUsed = amountNum;
    } else {
      pettyCashUsed = pettyCashBalanceBefore;
      collectionUsed = amountNum - pettyCashBalanceBefore;
    }

    const pettyCashAfter = pettyCashBalanceBefore - pettyCashUsed;
    const collectionAfter = collectionBalanceBefore - collectionUsed;

    await this.walletTransactionRepository.query(
      `INSERT INTO agent_wallet_transactions (transaction_id, agent_id, "transactionType", amount, status, description, balance_before, balance_after, processed_by, processed_at, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
      [
        agent.agent_id,
        'deposit',
        amountNum,
        'completed',
        notes || 'Deposit to admin',
        totalBalance,
        pettyCashAfter + collectionAfter,
        processedBy || null,
      ]
    );

    await this.agentRepository.query(
      `UPDATE agents SET pettyCashBalance = $1, collection_balance = $2, updated_at = NOW() WHERE agent_id = $3`,
      [pettyCashAfter, collectionAfter, agent.agent_id]
    );

    agent.pettyCashBalance = pettyCashAfter;
    agent.collectionBalance = collectionAfter;
    return agent;
  }

  async getAgentTransactions(agentId: string, page: number = 1, limit: number = 20): Promise<{ data: AgentTransactionResponseDto[]; total: number }> {
    if (!agentId || agentId === 'undefined') {
      return { data: [], total: 0 };
    }

    const skip = (page - 1) * limit;

    const [transactions, total] = await this.walletTransactionRepository.findAndCount({
      where: { agentId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const data = transactions.map(t => ({
      id: t.transaction_id,
      agentId: t.agentId,
      agentName: '',
      transactionType: t.transactionType,
      amount: Number(t.amount),
      status: t.status,
      referenceType: t.referenceType,
      referenceId: t.referenceId,
      description: t.description,
      balanceBefore: Number(t.balanceBefore),
      balanceAfter: Number(t.balanceAfter),
      processedBy: t.processedBy,
      processedAt: t.processedAt,
      createdAt: t.createdAt,
    }));

    return { data, total };
  }

  async checkSelfApprovalLimit(agentId: string, amount: number): Promise<boolean> {
    const agent = await this.findOne(agentId);
    return Number(amount) <= Number(agent.selfApprovalLimit);
  }

  private generateAgentCode(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `AGT-${timestamp}${random}`;
  }
}
