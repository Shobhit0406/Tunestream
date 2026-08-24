import requests
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from player.models import Track

class Command(BaseCommand):
    help = 'Fetch trending songs (Last.fm + fallback)'

    def handle(self, *args, **kwargs):
        self.stdout.write('🎵 Fetching trending songs from Last.fm...')

        # Public demo key – works for testing
        url = 'http://ws.audioscrobbler.com/2.0/?method=chart.gettoptracks&api_key=2f7b1b0f4b8c9c2f5e6d7a8b9c0d1e2f&format=json'

        try:
            response = requests.get(url, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
            response.raise_for_status()
            data = response.json()
            tracks = data.get('tracks', {}).get('track', [])
            if tracks:
                self.stdout.write('✅ Last.fm returned data')
                self.save_tracks(tracks)
                return
            else:
                self.stdout.write('⚠️ Last.fm returned empty, using fallback...')
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'Last.fm failed: {e}'))

        # Fallback: Hardcoded list of popular songs (so you see something)
        self.stdout.write('📋 Using fallback list (sample songs)')
        fallback = [
            {'name': 'Espresso', 'artist': 'Sabrina Carpenter'},
            {'name': 'Beautiful Things', 'artist': 'Benson Boone'},
            {'name': 'Lose Control', 'artist': 'Teddy Swims'},
            {'name': 'Stick Season', 'artist': 'Noah Kahan'},
            {'name': 'Greedy', 'artist': 'Tate McRae'},
            {'name': 'Cruel Summer', 'artist': 'Taylor Swift'},
            {'name': 'Flowers', 'artist': 'Miley Cyrus'},
            {'name': 'As It Was', 'artist': 'Harry Styles'},
            {'name': 'Heat Waves', 'artist': 'Glass Animals'},
            {'name': 'Levitating', 'artist': 'Dua Lipa'},
        ]
        self.save_tracks(fallback, is_fallback=True)

    def save_tracks(self, tracks, is_fallback=False):
        created = 0
        updated = 0

        for track in tracks[:50]:
            if is_fallback:
                title = track.get('name')
                artist = track.get('artist')
                cover = ''
            else:
                title = track.get('name', 'Unknown')
                artist = track.get('artist', {}).get('name', 'Unknown')
                cover = track.get('image', [{}])[-1].get('#text', '') if track.get('image') else ''

            if not title or not artist:
                continue

            slug = slugify(f"{title}-{artist}")
            audio_path = f"songs/trending/{slug}.mp3"

            obj, is_new = Track.objects.update_or_create(
                slug=slug,
                defaults={
                    'title': title,
                    'artist_names': artist,
                    'cover_image': cover,
                    'audio_file': audio_path,
                }
            )

            if is_new:
                created += 1
                self.stdout.write(f'➕ Created: {title} - {artist}')
            else:
                updated += 1
                self.stdout.write(f'🔄 Updated: {title} - {artist}')

        self.stdout.write(self.style.SUCCESS(f'\n✅ Created: {created}, Updated: {updated}'))
        self.stdout.write(self.style.WARNING('\n⚠️  Place MP3 files in media/songs/trending/{slug}.mp3'))