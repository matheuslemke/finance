import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const categoriesTable = 'categories';
const accountsTable = 'accounts';

async function fetchCategories() {
  const { data, error } = await supabase
    .from(categoriesTable)
    .select('*')
    .order('name');

  if (error) {
    console.error('Erro ao buscar categorias:', JSON.stringify(error, null, 2));
    return [];
  }

  return data || [];
}

async function fetchAccounts() {
  const { data, error } = await supabase
    .from(accountsTable)
    .select('*')
    .order('name');

  if (error) {
    console.error('Erro ao buscar contas:', JSON.stringify(error, null, 2));
    return [];
  }

  return data || [];
}

async function processCsv(month, year) {
  try {
    month = parseInt(month);
    year = parseInt(year);

    if (isNaN(month) || month < 1 || month > 12) {
      console.error('Invalid month. Please provide a number between 1 and 12.');
      return;
    }

    if (isNaN(year) || year < 2000 || year > 2100) {
      console.error('Invalid year. Please provide a year between 2000 and 2100.');
      return;
    }

    console.log(`Processing transactions for ${month}/${year}`);

    const scriptsDir = path.dirname(new URL(import.meta.url).pathname);
    const inputFile = path.join(scriptsDir, 'input.csv');
    const outputFile = path.join(scriptsDir, 'processed.csv');
    
    const fileContent = fs.readFileSync(inputFile, 'utf8');
    
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      delimiter: ',',
    });
    
    console.log(`Processing ${records.length} records from CSV...`);
    
    console.log('Fetching categories and accounts from database...');
    const categories = await fetchCategories();
    const accounts = await fetchAccounts();
    
    console.log(`Found ${categories.length} categories and ${accounts.length} accounts in the database`);
    
    const processedRows = [];
    const missingCategories = new Set();
    const missingAccounts = new Set();
    
    for (const row of records) {
      const categoryName = row.category;
      const accountName = row.account;
      
      const category = categories.find(c => c.name === categoryName);
      if (!category) {
        missingCategories.add(categoryName);
      }
      
      const account = accounts.find(a => a.name === accountName);
      if (!account) {
        missingAccounts.add(accountName);
      }
      
      const type = row.amount.includes('-') ? 'income' : 'expense';
      const parsedClass = parseTransactionClass(row.class);
      const parsedAmount = parseAmount(row.amount);
      
      const day = parseInt(row.date);
      if (isNaN(day) || day < 1 || day > 31) {
        console.warn(`Invalid day "${row.date}" in row: ${row.description}. Using 1 as default.`);
      }
      
      const validDay = isNaN(day) || day < 1 || day > 31 ? 1 : day;
      const timestamptz = `${year}-${month.toString().padStart(2, '0')}-${validDay.toString().padStart(2, '0')}T03:00:00.000Z`;
      
      const weddingCategory = row.wedding_category === '-' ? '' : row.wedding_category;
      
      processedRows.push({
        date: timestamptz,
        description: row.description,
        category_id: category?.id || 'missing',
        amount: parsedAmount,
        account_id: account?.id || 'missing',
        wedding_category: weddingCategory,
        class: parsedClass,
        type
      });
    }
    
    if (missingCategories.size > 0) {
      console.warn('Missing categories:', Array.from(missingCategories).join(', '));
    }
    
    if (missingAccounts.size > 0) {
      console.warn('Missing accounts:', Array.from(missingAccounts).join(', '));
    }
    
    const csvOutput = stringify(processedRows, {
      header: true,
      columns: ['date', 'description', 'category_id', 'amount', 'account_id', 'wedding_category', 'class', 'type'],
    });
    
    fs.writeFileSync(outputFile, csvOutput);
    console.log(`Processed CSV written to ${outputFile}`);
    
  } catch (error) {
    console.error('Error processing CSV:', error);
  }
}

function parseTransactionClass(classStr) {
  switch (classStr.toLowerCase()) {
    case 'essencial':
      return 'essential';
    case 'não essencial':
      return 'non-essential';
    case 'entradas':
      return 'income';
    case 'pj':
      return 'business';
    case 'investimento':
      return 'investment';
    default:
      return 'non-essential';
  }
}

function parseAmount(amount) {
  const cleanedAmount = amount
    .replace(/R\$\s*/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .trim();
  
  return Math.abs(parseFloat(cleanedAmount));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: node process-csv-supabase.js <month> <year>');
    console.error('Example: node process-csv-supabase.js 3 2024');
    process.exit(1);
  }
  
  const [month, year] = args;
  processCsv(month, year).catch(console.error);
}

export default processCsv;