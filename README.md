# IT-IS-POLL

# Запуск проекта
1) Создание виртуальное окружение python3 -m venv venv
2) source venv/bin/activate
3) pip install -r requirements.txt
4) python3 manage.py migrate
5) python3 manage.py runserver



# ORM
1) Переопределен user, его можно получить через **User = get_user_model()**

# Email адреса
1) создана отправка email, пока в локально в папку sent_emails

# Картинки 
1) Подключена возможность добавления картинок, они будут сохранятся в папку media
2) Сохранение в подпапку происходит по upload_to="posts_images" в models.ImageField

# Шаблоны
1) Все шаблоны находятся в папке templates

# CSS, Картинки, JS
1) Хранится в папке static_dev
