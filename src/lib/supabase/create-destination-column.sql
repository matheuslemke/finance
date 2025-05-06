-- Script para adicionar a coluna destination_account_id à tabela transactions
-- Este script só deve ser executado caso a coluna ainda não exista

-- Verifica se a coluna já existe e se não existir, adiciona
DO $$
BEGIN
    -- Verifica se a coluna destination_account_id já existe na tabela transactions
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'transactions'
        AND column_name = 'destination_account_id'
    ) THEN
        -- Adiciona a coluna destination_account_id como chave estrangeira para a tabela accounts
        ALTER TABLE transactions
        ADD COLUMN destination_account_id UUID REFERENCES accounts(id);
        
        RAISE NOTICE 'Coluna destination_account_id adicionada com sucesso à tabela transactions.';
    ELSE
        RAISE NOTICE 'A coluna destination_account_id já existe na tabela transactions.';
    END IF;
END $$; 