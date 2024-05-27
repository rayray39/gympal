# Generated by Django 4.2.9 on 2024-04-27 02:54

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('gym', '0007_star'),
    ]

    operations = [
        migrations.CreateModel(
            name='Booking',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('booked_trainer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='booked_trainer', to=settings.AUTH_USER_MODEL)),
                ('booker', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='booker', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]