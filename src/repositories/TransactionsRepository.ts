import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const income = transactions.reduce<number>(
      (previousValue: number, currentValue: Transaction): number => {
        return currentValue.type === 'income'
          ? previousValue + currentValue.value
          : previousValue;
      },
      0,
    );

    const outcome = transactions.reduce<number>(
      (previousValue: number, currentValue: Transaction): number => {
        return currentValue.type === 'outcome'
          ? previousValue + currentValue.value
          : previousValue;
      },
      0,
    );

    return {
      income,
      outcome,
      total: income - outcome,
    };
  }
}

export default TransactionsRepository;
