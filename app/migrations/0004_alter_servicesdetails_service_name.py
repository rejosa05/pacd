# Generated by Django 5.1.6 on 2025-07-30 01:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0003_remove_servicesdetails_benefit'),
    ]

    operations = [
        migrations.AlterField(
            model_name='servicesdetails',
            name='service_name',
            field=models.CharField(max_length=500),
        ),
    ]
