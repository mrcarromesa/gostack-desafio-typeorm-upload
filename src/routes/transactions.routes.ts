import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';

import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

import uploadConfig from '../config/upload';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const transactions = await transactionsRepository.find({
    relations: ['category'],
  });

  // console.log(transactions);

  const balance = await transactionsRepository.getBalance();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  // title, value, type, e category
  const { title, value, type, category } = request.body;
  const ct = new CreateTransactionService();
  const a = await ct.execute({ title, value, type, category });
  return response.json(a);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const cd = new DeleteTransactionService();
  await cd.execute(request.params.id);
  response.send();
});

async function loadCSV(csvFilePath: string): Promise<string[][]> {
  const readCSVStream = fs.createReadStream(csvFilePath);

  const parseStream = csvParse({
    from_line: 2,
    ltrim: true,
    rtrim: true,
  });

  const parseCSV = readCSVStream.pipe(parseStream);

  const lines: string[][] = [];

  parseCSV.on('data', line => {
    lines.push(line);
  });

  await new Promise(resolve => {
    parseCSV.on('end', resolve);
  });

  return lines;
}

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const csvFilePath = path.resolve(
      uploadConfig.directory,
      request.file.filename,
    );

    const data = await loadCSV(csvFilePath);

    const im = new ImportTransactionsService();
    await im.execute({ data });

    return response.json(data);
  },
);

export default transactionsRouter;
