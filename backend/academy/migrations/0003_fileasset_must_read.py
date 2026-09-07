from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("academy", "0002_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="fileasset",
            name="must_read",
            field=models.BooleanField(default=False),
        ),
    ]
