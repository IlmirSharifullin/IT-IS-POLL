from django.db import models

from django.contrib.auth import get_user_model

User = get_user_model()


class TimestampModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Tag(models.Model):
    title = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.title


class News(TimestampModel):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="news")
    title = models.CharField(max_length=255)
    text = models.TextField()
    image = models.ImageField(upload_to="news/images/", null=True, default=None)
    tags = models.ManyToManyField(Tag, related_name="news")

    def __str__(self):
        return self.title


class NewsComment(TimestampModel):
    news = models.ForeignKey(News, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="news_comments"
    )
    text = models.TextField()

    def __str__(self):
        return f"Comment by {self.author.email} on {self.news.title}"


class NewsReaction(TimestampModel):
    news = models.ForeignKey(News, on_delete=models.CASCADE, related_name="reactions")
    author = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="news_reactions"
    )
    is_like = models.BooleanField()

    class Meta:
        unique_together = ("news", "author")

    def __str__(self):
        return f'{"Like" if self.is_like else "Dislike"} by {self.author.email} on {self.news.title}'
