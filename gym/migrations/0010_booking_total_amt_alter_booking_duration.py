# Generated by Django 4.2.9 on 2024-04-27 15:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gym', '0009_booking_booked_datetime_booking_duration_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='booking',
            name='total_amt',
            field=models.PositiveIntegerField(null=True),
        ),
        migrations.AlterField(
            model_name='booking',
            name='duration',
            field=models.PositiveIntegerField(),
        ),
    ]