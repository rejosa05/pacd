# Generated by Django 5.1.6 on 2025-07-30 01:09

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0002_divisionlog_unit_person'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='servicesdetails',
            name='benefit',
        ),
    ]
