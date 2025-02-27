# Voting Poll System

Voting Poll System написана с использованием TypeScript, Nest.js, PostgreSQL, TypeORM, Passport-jwt, Docker, Docker Compose. Реализованы unit, e2e тесты (jest, supertest), документация API c использованием Swagger.
Для тестирования эндпоинтов в папке проекта есть test.rest файл, для расширения VsCode [Rest Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client).
Или [Postman коллекция](https://www.postman.com/vitalalex/vital-alex/collection/9639295-71674f87-aa36-46b9-8652-9aab43000147/?action=share&creator=9639295)

---

## Функциональность

- Регистрация/вход/выход пользователя.
- Реализована access/refresh auth.
- Добавление/удаление опроса.
- Просмотр всех, не закрытых, опросов с пагинацией.
- Просмотр всех своих опросов с пагинацией.
- Просмотр конкретного опроса.
- Просмотр статистики по конкретному опросу.
- Участие в опросе (сохранение ответов пользователя), с проверкой не участвовал ли пользователь в этом опросе ранее.
- Создатель опроса может его закрыть, после чего опрос перестанет отображаться в списке всех опросов.
- Изменение опроса: можно поменять заголовок, описание; вопросы и ответы на них можно изменить или удалить. Если кто-то уже участвовал в опросе, то опрос изменить нельзя.
- Удаление опроса.

---

## Установка и запуск

### Требования

- **Docker** версии 26.1.1 или выше.

### Установка

1. Клонируйте репозиторий:

```bash
git clone https://github.com/JbanTeam/voting-poll-system.git
```

2. Перейдите в папку проекта:

```bash
cd voting-poll-system
```

3. Установите зависимости:

```bash
npm install
```

4. Запустите сервер в docker контейнере:

- **в dev режиме**

```bash
npm run dc:cmp:dev
```

С пересборкой image:

```bash
npm run dc:cmp:devb
```

- **в prod режиме**

```bash
npm run dc:cmp:prod
```

С пересборкой image:

```bash
npm run dc:cmp:prodb
```

5. Начальная миграция имеется в проекте и она будет применена автоматически. Чтобы сгенерировать и применить новую миграцию:

```bash
npm run migration:gen -- src/db/migrations/{имя_миграции}
npm run migration:run:local
```

6. Остановка и удаление контейнера:

```bash
npm run dc:cmp:down
```

### Тестирование

1. Unit

1.1 Запуск всех unit тестов:

```bash
npm run test
```

1.2 Запуск unit тестов по файлам:

Poll:

```bash
npm run test -- --testPathPattern=src/modules/poll/tests/poll.service.test.ts
npm run test -- --testPathPattern=src/modules/poll/tests/poll.controller.test.ts
```

User:

```bash
npm run test -- --testPathPattern=src/modules/user/tests/user.service.test.ts
npm run test -- --testPathPattern=src/modules/user/tests/user.controller.test.ts
```

Auth:

```bash
npm run test -- --testPathPattern=src/modules/auth/tests/auth.service.test.ts
npm run test -- --testPathPattern=src/modules/auth/tests/auth.controller.test.ts
```

Poll-statistics:

```bash
npm run test -- --testPathPattern=src/modules/poll-statistics/tests/poll-statistics.service.test.ts
```

2. E2E

2.1 Запустите тестовую базу данных:

```bash
npm run db:test:up
```

2.2 Запуск всех e2e тестов:

```bash
npm run test:e2e
```

2.2 Запуск e2e тестов по файлам:

```bash
npm run test:e2e -- --testPathPattern=tests/auth.e2e.test.ts
npm run test:e2e -- --testPathPattern=tests/poll.e2e.test.ts
npm run test:e2e -- --testPathPattern=tests/user.e2e.test.ts
```

2.3 Остановка и удаление контейнера с тестовой базой данных:

```bash
npm run db:test:down
```
