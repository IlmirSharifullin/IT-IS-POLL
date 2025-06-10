from collections import Counter
import re
import base64

import matplotlib.pyplot as plt
from wordcloud import WordCloud
from io import BytesIO


def get_age_distribution(ages):
    """Группировка возрастов по диапазонам"""
    bins = [18, 25, 35, 45, 55, 65, 75, 100]
    labels = ["18-24", "25-34", "35-44", "45-54", "55-64", "65-74", "75+"]
    counts = [0] * len(labels)

    for age in ages:
        for i, bin_edge in enumerate(bins):
            if age <= bin_edge:
                counts[i] += 1
                break

    return [{"range": label, "count": count} for label, count in zip(labels, counts)]


def get_word_frequency(text):
    """Анализ частоты слов (игнорируя стоп-слова)"""
    words = re.findall(r"\w+", text.lower())
    stopwords = set(["и", "в", "на", "с", "по", "что", "это"])
    filtered = [w for w in words if w not in stopwords and len(w) > 2]
    return Counter(filtered).most_common()


def generate_word_cloud(word_freq):
    """Генерация облака слов в base64"""
    wordcloud = WordCloud(
        width=800, height=400, background_color="white"
    ).generate_from_frequencies(dict(word_freq))

    plt.figure(figsize=(8, 4))
    plt.imshow(wordcloud)
    plt.axis("off")

    buffer = BytesIO()
    plt.savefig(buffer, format="png")
    plt.close()

    return f"data:image/png;base64,{base64.b64encode(buffer.getvalue()).decode()}"
