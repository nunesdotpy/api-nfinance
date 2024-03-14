# Nfinance

## Documentação

### Banco de Dados

#### User

O modelo de usuário é simples, apenas requer um *username* e uma *password*

> username
> Nome do usuário
>
> password
> Senha para autenticação

#### Transaction

Refere-se ao modelo de transações:
> name:
> Nome ou título da transação
>
> amount:
> Valor declarado na transação
>
> description:
> Descrição, caso o usuário queira
>
> category:
> Categoria, caso o usuário queira definir e futuramente filtrar seus gastos (ex: Alimentação, Mercado)
>
> type:
> Tipo da transação, pode ser 0 ou 1, sendo 0 identificado como um Gasto e 1 como uma entrada de receita.
>
> date:
> Data da transação
>
> userID:
> Key estrangeira para saber qual usuário realizou essa transação

Using MERN Stack as well.

Made by https://nunes.sh