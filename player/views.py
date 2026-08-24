"""
TuneStream Player Views
- Serves the main HTML template
- Provides API endpoints for tracks and artists
"""

from django.shortcuts import render
from django.views.generic import TemplateView
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Track, Artist
from .serializers import TrackSerializer, ArtistSerializer


# =============================
# FRONTEND VIEWS
# =============================

class IndexView(TemplateView):
    """
    Serves the main index.html template
    Access: http://127.0.0.1:8000/
    """
    template_name = 'player/index.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['total_songs'] = Track.objects.count()
        context['total_artists'] = Artist.objects.count()
        return context


# =============================
# API VIEWS (REST Framework)
# =============================

class TrackListView(generics.ListAPIView):
    """
    API Endpoint: Get all tracks
    Access: http://127.0.0.1:8000/api/tracks/
    Method: GET
    
    Response:
    [
        {
            "id": 1,
            "title": "For A Reason",
            "artist_names": "Karan Aujla",
            "audio_file": "songs/Chill/For a reason.mp3",
            "audio_url": null,
            "cover_image": "https://i.scdn.co/image/...",
            "slug": "for-a-reason"
        },
        ...
    ]
    """
    queryset = Track.objects.all()
    serializer_class = TrackSerializer


class ArtistListView(generics.ListAPIView):
    """
    API Endpoint: Get all artists
    Access: http://127.0.0.1:8000/api/artists/
    Method: GET
    
    Response:
    [
        {
            "id": 1,
            "name": "Karan Aujla",
            "image": "https://..."
        },
        ...
    ]
    """
    queryset = Artist.objects.all()
    serializer_class = ArtistSerializer


class TrackDetailView(generics.RetrieveAPIView):
    """
    API Endpoint: Get a single track by slug
    Access: http://127.0.0.1:8000/api/tracks/{slug}/
    Method: GET
    """
    queryset = Track.objects.all()
    serializer_class = TrackSerializer
    lookup_field = 'slug'


# =============================
# HEALTH CHECK (Optional)
# =============================

@api_view(['GET'])
def api_health(request):
    """
    Quick health check endpoint
    Access: http://127.0.0.1:8000/api/health/
    """
    return Response({
        'status': 'ok',
        'total_tracks': Track.objects.count(),
        'total_artists': Artist.objects.count(),
    })