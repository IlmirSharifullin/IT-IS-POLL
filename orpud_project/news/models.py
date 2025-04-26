from django.db import models

# Create your models here.
from django.db import models


class TimestampMixin(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class User(TimestampMixin, models.Model):
    user_id = models.AutoField(primary_key=True)
    email = models.EmailField(unique=True)
    hashed_password = models.CharField(max_length=255)
    bio = models.TextField(max_length=255, blank=True)

    def __str__(self):
        return self.email


class News(TimestampMixin, models.Model):
    news_id = models.AutoField(primary_key=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='news')
    title = models.CharField(max_length=255)
    text = models.TextField()

    def __str__(self):
        return self.title


class NewsComment(TimestampMixin, models.Model):
    news = models.ForeignKey(News, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='news_comments')
    text = models.TextField()

    def __str__(self):
        return f'Comment by {self.author.email} on {self.news.title}'


class NewsReaction(TimestampMixin, models.Model):
    news = models.ForeignKey(News, on_delete=models.CASCADE, related_name='reactions')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='news_reactions')
    is_like = models.BooleanField()

    def __str__(self):
        return f'{"Like" if self.is_like else "Dislike"} by {self.author.email} on {self.news.title}'
