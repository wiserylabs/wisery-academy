"""Seed the portal with realistic, *real* data so the connected app looks
like the design prototype while every file is genuinely downloadable,
editable and deletable through the API.

Run after `migrate` (and after `seed_tracks`, though this creates the tracks
too if they're missing):

    python manage.py seed_demo

Idempotent: re-running updates metadata and fills gaps without duplicating.
The stored files are tiny placeholders — the *displayed* size is the
prototype's number, but nothing here ships multi-GB blobs into MinIO.
"""

from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.utils import timezone

from academy.models import FileAsset, Track

User = get_user_model()

DEMO_PASSWORD = "wisery-demo-1234"

# Three sign-in identities, one per role — the login screen's demo picker
# logs in as these for real.
USERS = [
    ("dana@wisery.ai", "Dana Levi", "student"),
    ("omer@wisery.ai", "Omer Katz", "technical"),
    ("maya@wisery.ai", "Maya Shani", "editor"),
]

# Richer track blurbs from the prototype (the seed_tracks ones are terser).
TRACKS = [
    ("slide-decks", "Slide Decks",
     "Full instructor slide decks for all 5 days — theory, architecture diagrams and module walkthroughs. Editable PowerPoint.", 1),
    ("lab-guides", "Hands-On Lab Guides",
     "Step-by-step booklets for all 10 labs, with screenshots, expected outputs and troubleshooting tips. Five of the labs also ship a recorded instruction video.", 2),
    ("prompt-playbook", "Prompt Engineering Playbook",
     "Curated library of intelligence-domain prompts, templates and patterns — best practices and anti-patterns.", 3),
    ("sample-datasets", "Sample Datasets",
     "Anonymized intelligence documents and data used in the labs — reusable for practice after the course.", 4),
    ("admin-guide", "Administrator Guide",
     "Technical documentation covering system configuration, user management and day-to-day operations.", 5),
    ("study-guide", "Certification Study Guide",
     "Focused review aligned to the exam: key concepts, mock questions and exam-day tips.", 6),
    ("technical-section", "Technical Section",
     "Runbooks, release notes, escalation paths and deployment docs for Wisery Tier 1 and Tier 2 support engineers.", 7),
]

# Per-track files: (title, version, size, mime, [annotation]).
# visibility is "all" everywhere except the Technical Section.
FILES = {
    "slide-decks": [
        ("Day 1 — Platform foundations", "2.4.1", "96 MB", "application/vnd.openxmlformats-officedocument.presentationml.presentation"),
        ("Day 2 — Entity resolution & graphs", "2.4.1", "104 MB", "application/vnd.openxmlformats-officedocument.presentationml.presentation"),
        ("Day 3 — Language & multimedia", "2.4.0", "88 MB", "application/vnd.openxmlformats-officedocument.presentationml.presentation"),
        ("Day 4 — Analysis workflows", "2.4.2", "78 MB", "application/vnd.openxmlformats-officedocument.presentationml.presentation"),
        ("Day 5 — Operations & certification", "2.4.2", "46 MB", "application/vnd.openxmlformats-officedocument.presentationml.presentation"),
    ],
    "lab-guides": [
        ("Ingesting a mixed-source document set", "2.4.1", "14 MB", "application/pdf"),
        ("Building your first entity graph", "2.4.1", "19 MB", "application/pdf"),
        ("Querying across languages", "2.4.0", "12 MB", "application/pdf"),
        ("Timeline reconstruction from device data", "2.4.2", "22 MB", "application/pdf"),
        ("Prompt-driven summarisation at scale", "2.4.2", "17 MB", "application/pdf",
         "Step 4 screenshots are from 2.8 — the batch panel moved in 2.9. Updated guide lands this week."),
        ("Geospatial analysis and route inference", "2.4.0", "25 MB", "application/pdf"),
        ("Link analysis on financial records", "2.4.0", "16 MB", "application/pdf"),
        ("Building a shareable case dossier", "2.4.1", "13 MB", "application/pdf"),
        ("Working with restricted classifications", "2.4.1", "11 MB", "application/pdf"),
        ("End-to-end investigation walkthrough", "2.4.2", "29 MB", "application/pdf"),
    ],
    "prompt-playbook": [
        ("Playbook — full edition", "3.1", "11 MB", "application/pdf"),
        ("Prompt library (importable)", "3.1", "2 MB", "application/json"),
        ("Summarisation patterns", "3.0", "3 MB", "application/pdf"),
        ("Entity & relation extraction patterns", "3.0", "3 MB", "application/pdf"),
        ("Anti-patterns and failure modes", "3.0", "2 MB", "application/pdf"),
        ("Evaluation rubric template", "2.2", "400 KB", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
    ],
    "sample-datasets": [
        ("Northern corridor — seized device dump", "r3", "1.8 GB", "application/zip"),
        ("Mixed-language document bundle", "r2", "640 MB", "application/zip"),
        ("Financial ledger set — shell entities", "r5", "96 MB", "text/csv"),
        ("Cell-tower location traces", "r4", "212 MB", "application/octet-stream"),
        ("Open-source social media crawl", "r1", "2.1 GB", "application/json",
         "Platform B crawl is truncated at 400k posts pending a re-anonymisation pass. Use the mixed-language or email sets for volume exercises."),
        ("Voice call sample set", "r2", "780 MB", "application/zip"),
        ("Border-crossing manifest extract", "r3", "48 MB", "text/csv"),
        ("Imagery set — vehicle identification", "r1", "520 MB", "application/zip"),
        ("Entity watchlist (training copy)", "r6", "3 MB", "application/json"),
        ("Email corpus — corporate leak simulation", "r2", "310 MB", "application/mbox"),
        ("Sensor and telemetry feed replay", "r1", "156 MB", "application/json"),
        ("Capstone case bundle (Lab 10)", "r2", "1.1 GB", "application/zip"),
    ],
    "admin-guide": [
        ("Installation & deployment", "2.9", "18 MB", "application/pdf"),
        ("User & role management", "2.9", "14 MB", "application/pdf"),
        ("Data sources & connectors", "2.9", "16 MB", "application/pdf"),
        ("Operations & monitoring", "2.9", "10 MB", "application/pdf"),
    ],
    "study-guide": [
        ("Study guide — exam blueprint", "2.4", "9 MB", "application/pdf"),
        ("Mock exam A (80 questions)", "2.4", "4 MB", "application/pdf"),
        ("Exam-day checklist", "2.4", "1 MB", "application/pdf"),
    ],
    "technical-section": [
        ("Runbooks — operational procedures", "2.9", "22 MB", "application/pdf"),
        ("Troubleshooting & known issues index", "2.9", "9 MB", "application/pdf"),
        ("Release notes 2.0 → 2.9", "2.9", "6 MB", "application/pdf"),
        ("Architecture & deployment reference", "2.9", "31 MB", "application/pdf"),
        ("Escalation paths & on-call flows", "2.9", "2 MB", "application/pdf"),
    ],
}

# A handful of files marked required reading, so the progress panel has
# something to measure the moment the demo is seeded.
MUST_READ_TITLES = {
    "Day 1 — Platform foundations",
    "Day 5 — Operations & certification",
    "Ingesting a mixed-source document set",
    "Building your first entity graph",
    "Study guide — exam blueprint",
    "Mock exam A (80 questions)",
}

UNITS = {"KB": 1024, "MB": 1024 ** 2, "GB": 1024 ** 3}


def to_bytes(size):
    number, unit = size.split()
    return int(float(number) * UNITS[unit])


class Command(BaseCommand):
    help = "Seeds demo users and realistic, downloadable files for the connected portal."

    def handle(self, *args, **options):
        editor = self._seed_users()
        self._seed_tracks()
        self._seed_files(editor)
        self._secure_technical_section()
        self.stdout.write(self.style.SUCCESS(
            "\nDemo ready. Sign in with any of:"
            "\n  dana@wisery.ai  (Student)"
            "\n  omer@wisery.ai  (Technical)"
            "\n  maya@wisery.ai  (Editor)"
            f"\n  password: {DEMO_PASSWORD}"
        ))

    def _seed_users(self):
        editor = None
        for email, name, role in USERS:
            user, created = User.objects.get_or_create(email=email, defaults={"full_name": name})
            # role is forced to "student" by the manager, so set it explicitly
            # here (trusted server-side seed) and (re)set a known password.
            user.full_name = name
            user.role = role
            user.set_password(DEMO_PASSWORD)
            user.save()
            if role == "editor":
                editor = user
            self.stdout.write(f"{'created' if created else 'updated'} user: {email} ({role})")
        return editor

    def _seed_tracks(self):
        for slug, title, description, sort_order in TRACKS:
            Track.objects.update_or_create(
                slug=slug,
                defaults={"title": title, "description": description, "sort_order": sort_order},
            )

    def _seed_files(self, editor):
        now = timezone.now()
        for slug, rows in FILES.items():
            track = Track.objects.get(slug=slug)
            visibility = "technical_plus" if slug == "technical-section" else "all"
            for row in rows:
                title, version, size, mime = row[0], row[1], row[2], row[3]
                annotation = row[4] if len(row) > 4 else ""
                must_read = title in MUST_READ_TITLES
                if FileAsset.objects.filter(track=track, title=title).exists():
                    fa = FileAsset.objects.get(track=track, title=title)
                    fa.annotation = annotation
                    fa.must_read = must_read
                    fa.save(update_fields=["annotation", "must_read"])
                    continue
                fa = FileAsset(
                    track=track, title=title, version=version,
                    size_bytes=to_bytes(size), mime_type=mime,
                    visibility=visibility, status="published",
                    scan_status="clean", annotation=annotation,
                    must_read=must_read, uploaded_by=editor, published_at=now,
                )
                # Tiny placeholder so download_url resolves to a real object.
                placeholder = (
                    f"Wisery Academy demo file\n{title} (v{version})\n"
                    "This is a stand-in for the real course material.\n"
                ).encode()
                ext = {"application/pdf": "pdf", "text/csv": "csv", "application/json": "json",
                       "application/zip": "zip"}.get(mime, "bin")
                fa.file.save(f"{slug}.{ext}", ContentFile(placeholder), save=False)
                fa.compute_checksum()
                fa.save()
            self.stdout.write(f"seeded {len(rows)} files into {track.title}")

    def _secure_technical_section(self):
        # Any file already uploaded to the Technical Section with world
        # visibility (e.g. a test upload that kept the default) is pulled up
        # to Technical+ so Students can't see it.
        tech = Track.objects.filter(slug="technical-section").first()
        if not tech:
            return
        stray = tech.files.filter(visibility="all")
        count = stray.count()
        if count:
            stray.update(visibility="technical_plus")
            self.stdout.write(f"secured {count} stray Technical Section file(s)")
