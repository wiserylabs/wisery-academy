from django.core.management.base import BaseCommand

from academy.models import Track

# The six material tracks plus the Technical Section, straight from the
# portal design — run this once after migrating so the app isn't empty
# on first login.
TRACKS = [
    ("slide-decks", "Slide Decks", "Full instructor slide decks for all 5 days.", 1),
    ("lab-guides", "Hands-On Lab Guides", "Step-by-step booklets for all 10 labs, five with video.", 2),
    ("prompt-playbook", "Prompt Engineering Playbook", "Curated prompts, templates and patterns.", 3),
    ("sample-datasets", "Sample Datasets", "Anonymized data used in the labs.", 4),
    ("admin-guide", "Administrator Guide", "System configuration and day-to-day operations.", 5),
    ("study-guide", "Certification Study Guide", "Focused review aligned to the exam.", 6),
    ("technical-section", "Technical Section", "Runbooks, release notes and escalation paths — Technical+ only.", 7),
]


class Command(BaseCommand):
    help = "Seeds the six material tracks (plus the Technical Section) from the portal design."

    def handle(self, *args, **options):
        for slug, title, description, sort_order in TRACKS:
            track, created = Track.objects.update_or_create(
                slug=slug,
                defaults={"title": title, "description": description, "sort_order": sort_order},
            )
            self.stdout.write(f"{'created' if created else 'updated'}: {track.title}")
