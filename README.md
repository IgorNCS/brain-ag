1. **Comandos TypeORM:**
   - Criação de Migration: `yarn migration:create`
   - Gerar Migration: `yarn migration:generate`
   - Rodar Migration: `yarn migration:run`


2. **Subir docker:**
   - Buildar imagem docker: `docker build -t brainag .`
   - Rodar imagem/container: `docker run -p 5731:5731 brainag:latest`


3. **Rodar com docker-compose:**
   - Rodar o servidor em modo produ o: `docker-compose up -d`
   - O servidor est  dispon vel em `http://localhost:3000`
   - Parar o servidor: `docker-compose stop`
   - Remover o servidor: `docker-compose rm -f`

4. **Rodar em Desenvolvimento:**
   - Instalar dependências: `yarn install`
   - Rodar o servidor em modo desenvolvimento: `yarn start:dev`
   - O servidor estará disponível em `http://localhost:3000`



## Passo a Passo Desenvolvimento

1. **Subir Banco e Keycloak:**
   - Execute `docker compose up` para iniciar o banco de dados e o Keycloak.

2. **Executar Migrations:**
   - Criação de Migration: `yarn migration:create`
   - Gerar Migration: `yarn migration:generate`
   - Rodar Migration: `yarn migration:run`
> **Nota:** Para O projeto já consta com as migrations

3. **Configuração do Keycloak:**
   - Adicione um realm para a aplicação.
   - Crie um client que permita o registro de usuários.
   - Copie o client secret e coloque no arquivo `.env`.

4. **Ajustes em Desenvolvimento:**
   - Remova as validações de usuário após criação (somente em desenvolvimento).

5. **Testes:**
   - Use o `.env.example` como referência.

6. **Documentação:**
   - Acesse a documentação em `http://localhost:3000/documentation/api`.
