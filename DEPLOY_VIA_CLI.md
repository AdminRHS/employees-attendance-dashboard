# Deployment через Vercel CLI

## Швидкий старт

### 1. Автентифікація

```bash
cd "/Users/nikolay/Library/CloudStorage/Dropbox/Nov25/AI/Artemchuk Nikolay/Employees attendance/hr-dashboard"
vercel login
```

Це відкриє браузер для автентифікації або попросить ввести email.

### 2. Лінк проекту (перший раз)

```bash
vercel link
```

Відповідай на питання:
- **Set up and deploy?** → Yes
- **Which scope?** → Обери свій акаунт
- **Link to existing project?** → No (якщо проект ще не існує)
- **What's your project's name?** → `employees-attendance-dashboard`
- **In which directory is your code located?** → `./`

### 3. Додай Environment Variables

```bash
vercel env add GOOGLE_SERVICE_ACCOUNT_EMAIL
# Введи значення з .env.local або Google Cloud Console

vercel env add GOOGLE_PRIVATE_KEY
# Введи повний private key (з лапками та \n)

vercel env add GOOGLE_SHEET_ID
# Введи spreadsheet ID
```

Або додай всі одразу через файл:

```bash
# Створи .env.vercel з твоїми значеннями
vercel env pull .env.vercel
# Відредагуй .env.vercel і потім:
vercel env push .env.vercel
```

### 4. Deploy

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

## Альтернатива: Використання токену

Якщо не хочеш використовувати інтерактивну автентифікацію:

1. Отримай токен: https://vercel.com/account/tokens
2. Використовуй його:

```bash
vercel --token YOUR_VERCEL_TOKEN --prod
```

## Перевірка deployment

```bash
# Подивись список deployment
vercel ls

# Відкрий проект в браузері
vercel open

# Подивись логи
vercel logs
```

## Troubleshooting

### Помилка: "No existing credentials found"
```bash
vercel login
```

### Помилка: "Project not found"
```bash
vercel link
```

### Помилка: "Environment variables missing"
Перевір через:
```bash
vercel env ls
```

---

**Примітка**: Для автоматичного deployment через GitHub Actions дивись `.github/workflows/vercel-deploy.yml`

