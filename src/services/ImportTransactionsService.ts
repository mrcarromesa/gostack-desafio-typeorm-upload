import CreateTransactionService from './CreateTransactionService';

interface Request {
  data: string[][];
}

class ImportTransactionsService {
  async execute({ data }: Request): Promise<void> {
    await Promise.all(
      data
        .filter(a => {
          const [, type] = a as string[];
          return type === 'income';
        })
        .map(async l => {
          const [title, type, value, category] = l as string[];
          const ct = new CreateTransactionService();

          await ct.execute({
            title,
            value,
            type,
            category,
          });
        }),
    );

    await Promise.all(
      data
        .filter(a => {
          const [, type] = a as string[];
          return type === 'outcome';
        })
        .map(async l => {
          const [title, type, value, category] = l as string[];
          const ct = new CreateTransactionService();

          await ct.execute({
            title,
            value,
            type,
            category,
          });
        }),
    );
  }
}

export default ImportTransactionsService;
