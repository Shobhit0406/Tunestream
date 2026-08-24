from django.urls import path
from .views import IndexView, TrackListView, ArtistListView

urlpatterns = [
    # Front-end
    path('', IndexView.as_view(), name='index'),
    
    # API endpoints
    path('api/tracks/', TrackListView.as_view(), name='track-list'),
    path('api/artists/', ArtistListView.as_view(), name='artist-list'),
]