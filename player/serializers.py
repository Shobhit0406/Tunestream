from rest_framework import serializers
from .models import Track, Artist


class TrackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Track
        fields = ['id', 'title', 'artist_names', 'audio_file', 'audio_url', 'cover_image', 'slug']


class ArtistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artist
        fields = ['id', 'name', 'image']