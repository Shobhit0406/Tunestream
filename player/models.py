from django.db import models


class Artist(models.Model):
    name = models.CharField(max_length=200)
    image = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.name


class Track(models.Model):
    title = models.CharField(max_length=200)
    artist_names = models.CharField(max_length=300)  # e.g. "Karan Aujla, Ikky"
    audio_file = models.CharField(max_length=500, blank=True, null=True)
    audio_url = models.URLField(blank=True, null=True)  # fallback if using external links
    cover_image = models.URLField(blank=True, null=True)
    slug = models.SlugField(unique=True, blank=True, null=True)  # matches your data-card-song keys

    def __str__(self):
        return self.title