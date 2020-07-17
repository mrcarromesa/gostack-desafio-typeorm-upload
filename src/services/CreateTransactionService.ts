import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';

import Category from '../models/Category';

interface Request {
  title: string;
  value: string;
  type: string;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const typeParse = type.trim();

    if (typeParse === 'income' || typeParse === 'outcome') {
      const customRepTran = getCustomRepository(TransactionsRepository);
      const balance = await customRepTran.getBalance();
      const totalBalance = balance.total;

      if (typeParse === 'outcome' && parseInt(value, 10) > totalBalance) {
        /*  console.log(
          `${type} === ` +
            `outcome` +
            ` && ${parseInt(value, 10)} > ${totalBalance}`,
        );
        console.log('error 1'); */
        throw new AppError('Value is more than total');
      }
    } else {
      throw new AppError('type only income or outcome only');
    }
    const parseCategory = category.trim();
    // console.log('aqui');
    const categoryRepository = getRepository(Category);
    let categoryFind: Category | undefined;
    categoryFind = await categoryRepository.findOne({
      where: { title: parseCategory },
    });

    if (!categoryFind) {
      const categoryRepository1 = getRepository(Category);
      categoryFind = categoryRepository1.create({
        title: parseCategory,
      });
      categoryFind = await categoryRepository1.save(categoryFind);
    }

    const transactionRepository = getRepository(Transaction);

    const transaction = transactionRepository.create({
      title,
      category: categoryFind,
      type: typeParse,
      value: parseFloat(value),
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
