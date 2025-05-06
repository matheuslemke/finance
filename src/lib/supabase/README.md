# Atualização no Banco de Dados para Suporte a Transferências

Este diretório contém scripts e código para o suporte à funcionalidade de transferência entre contas no sistema de finanças pessoais.

## Visão Geral

Para implementar a funcionalidade de transferência entre contas, é necessário atualizar a estrutura da tabela `transactions` no banco de dados Supabase.

## Script SQL de Migração

O arquivo `create-destination-column.sql` contém o script SQL para adicionar a coluna `destination_account_id` à tabela `transactions`, caso esta coluna ainda não exista.

### O que o script faz:

1. Verifica se a coluna `destination_account_id` já existe na tabela `transactions`
2. Se a coluna não existir, adiciona uma nova coluna `destination_account_id` como chave estrangeira para a tabela `accounts`
3. A coluna é do tipo UUID, correspondendo ao tipo do campo ID na tabela `accounts`

## Como Aplicar a Migração

1. Acesse o painel de controle do Supabase para o seu projeto
2. Vá para a seção "SQL Editor"
3. Copie e cole o conteúdo do arquivo `create-destination-column.sql`
4. Execute o script

## Mudanças no Código

As alterações nos arquivos JavaScript já foram implementadas para lidar com o novo campo:

- `src/lib/supabase/transactions.ts` - Incluído suporte para `destination_account_id` nas funções de consulta e adição de transações
- `src/components/transaction-form.tsx` - Adicionado UI para selecionar conta de destino em transferências
- Interface `Transaction` em `src/types/index.ts` - Atualizada para incluir campos relacionados à conta de destino

## Verificação

Após executar o script, você pode verificar se a coluna foi adicionada usando:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'transactions';
```

Você deve ver a coluna `destination_account_id` listada entre as colunas da tabela. 