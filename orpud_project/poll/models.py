import datetime

from django.conf import settings
from django.contrib.auth import get_user_model

import mongoengine
from mongoengine import Document, StringField, DateTimeField, IntField, ListField, ReferenceField

User = get_user_model()

mongoengine.connect(settings.DATABASES['mongodb']['database'], host=settings.DATABASES['mongodb']['host'], port=settings.DATABASES['mongodb']['port'], username=settings.DATABASES['mongodb']['username'], password=settings.DATABASES['mongodb']['password'])


class Question(Document):
    type = StringField()

    question = StringField()
    options = ListField(StringField())

    created_at = DateTimeField(default=datetime.datetime.now)
    updated_at = DateTimeField(default=datetime.datetime.now)


class Poll(Document):
    title = StringField(max_length=200)
    description = StringField(max_length=200)

    author_id = IntField()
    questions = ListField(ReferenceField(Question))

    created_at = DateTimeField(default=datetime.datetime.now)
    updated_at = DateTimeField(default=datetime.datetime.now)


class Answer(Document):
    question = ReferenceField(Question)
    answerer_id = IntField()
    answers = ListField(StringField())

    created_at = DateTimeField(default=datetime.datetime.now)
    updated_at = DateTimeField(default=datetime.datetime.now)
