# Generated by Django 4.2.9 on 2024-04-27 16:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gym', '0010_booking_total_amt_alter_booking_duration'),
    ]

    operations = [
        migrations.AlterField(
            model_name='booking',
            name='total_amt',
            field=models.PositiveBigIntegerField(null=True),
        ),
    ]
