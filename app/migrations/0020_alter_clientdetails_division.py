# Generated by Django 4.2.2 on 2025-04-03 13:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0019_clientdetails_unit_alter_clientdetails_division'),
    ]

    operations = [
        migrations.AlterField(
            model_name='clientdetails',
            name='division',
            field=models.CharField(default='RD ARD', max_length=100),
        ),
    ]
