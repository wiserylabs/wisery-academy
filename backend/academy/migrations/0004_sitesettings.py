import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("academy", "0003_fileasset_must_read"),
    ]

    operations = [
        migrations.CreateModel(
            name="SiteSettings",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("exam_opens_at", models.DateField(blank=True, null=True)),
                ("exam_closes_at", models.DateField(blank=True, null=True)),
                (
                    "exam_track",
                    models.ForeignKey(
                        blank=True, null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="+", to="academy.track",
                    ),
                ),
            ],
            options={
                "verbose_name": "site settings",
                "verbose_name_plural": "site settings",
            },
        ),
    ]
