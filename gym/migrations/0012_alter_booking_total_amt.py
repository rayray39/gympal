# Generated by Django 4.2.9 on 2024-04-27 16:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gym', '0011_alter_booking_total_amt'),
    ]

    operations = [
        migrations.AlterField(
            model_name='booking',
            name='total_amt',
            field=models.CharField(default=None, max_length=4),
            preserve_default=False,
        ),
    ]
