"""
Django Management Command: Load Songs from CSV

Place this file at: player/management/commands/load_songs_from_csv.py

Usage:
    python manage.py load_songs_from_csv songs.csv

CSV Format (with header):
    title,artist_names,audio_file,cover_image,slug
    For A Reason,Karan Aujla,songs/Chill/For a reason.mp3,https://i.scdn.co/image/...,for-a-reason
    STFU,A.P Dhillon,songs/angry/STFU.mp3,,STFU

Notes:
    - title: Required
    - artist_names: Required
    - audio_file: Required (path to MP3 in media/ folder)
    - cover_image: Optional (URL to image or leave blank for placeholder)
    - slug: Optional (used for card identification, auto-generated if blank)
"""

import csv
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from player.models import Track


class Command(BaseCommand):
    help = 'Load songs from a CSV file into the database'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='Path to the CSV file')
        parser.add_argument(
            '--skip-existing',
            action='store_true',
            help='Skip songs that already exist (by title)',
        )

    def handle(self, *args, **options):
        csv_file = options['csv_file']
        skip_existing = options['skip_existing']

        try:
            with open(csv_file, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                
                if not reader.fieldnames:
                    self.stdout.write(self.style.ERROR('CSV file is empty'))
                    return

                created_count = 0
                skipped_count = 0
                error_count = 0

                for row_num, row in enumerate(reader, start=2):  # Start at 2 (after header)
                    try:
                        title = row.get('title', '').strip()
                        artist_names = row.get('artist_names', '').strip()
                        audio_file = row.get('audio_file', '').strip()
                        cover_image = row.get('cover_image', '').strip()
                        slug = row.get('slug', '').strip()

                        # Validation
                        if not title or not artist_names or not audio_file:
                            self.stdout.write(
                                self.style.WARNING(
                                    f'Row {row_num}: Missing required fields (title, artist_names, audio_file). Skipped.'
                                )
                            )
                            error_count += 1
                            continue

                        # Generate slug if not provided
                        if not slug:
                            slug = slugify(title)

                        # Check if already exists
                        if skip_existing and Track.objects.filter(title=title, artist_names=artist_names).exists():
                            self.stdout.write(f'Row {row_num}: "{title}" already exists. Skipped.')
                            skipped_count += 1
                            continue

                        # Create or update track
                        track, created = Track.objects.update_or_create(
                            slug=slug,
                            defaults={
                                'title': title,
                                'artist_names': artist_names,
                                'audio_file': audio_file,
                                'cover_image': cover_image or None,
                            }
                        )

                        if created:
                            self.stdout.write(
                                self.style.SUCCESS(f'Row {row_num}: Created "{title}"')
                            )
                            created_count += 1
                        else:
                            self.stdout.write(
                                self.style.SUCCESS(f'Row {row_num}: Updated "{title}"')
                            )
                            created_count += 1

                    except Exception as e:
                        self.stdout.write(
                            self.style.ERROR(f'Row {row_num}: {str(e)}')
                        )
                        error_count += 1

                # Summary
                self.stdout.write('\n' + '='*60)
                self.stdout.write(self.style.SUCCESS(f'✅ Created/Updated: {created_count}'))
                self.stdout.write(self.style.WARNING(f'⏭️  Skipped: {skipped_count}'))
                self.stdout.write(self.style.ERROR(f'❌ Errors: {error_count}'))
                self.stdout.write('='*60)

        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f'File "{csv_file}" not found'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error reading CSV: {str(e)}'))