from django.conf import settings
from django.db import migrations, models
import django.core.validators
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("finance", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="CreditCard",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=120)),
                ("brand", models.CharField(blank=True, default="", max_length=40)),
                ("limit_amount", models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                (
                    "closing_day",
                    models.PositiveSmallIntegerField(
                        default=25,
                        validators=[
                            django.core.validators.MinValueValidator(1),
                            django.core.validators.MaxValueValidator(31),
                        ],
                    ),
                ),
                (
                    "due_day",
                    models.PositiveSmallIntegerField(
                        default=5,
                        validators=[
                            django.core.validators.MinValueValidator(1),
                            django.core.validators.MaxValueValidator(31),
                        ],
                    ),
                ),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "owner",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="credit_cards",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "unique_together": {("owner", "name")},
            },
        ),
    ]
