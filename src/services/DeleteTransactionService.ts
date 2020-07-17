import { getCustomRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transaction = getCustomRepository(TransactionsRepository);
    await transaction.delete(id);
  }
}

export default DeleteTransactionService;
