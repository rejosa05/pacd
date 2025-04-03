# Generated by Django 4.2.2 on 2025-04-03 13:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0018_clientdetails_division'),
    ]

    operations = [
        migrations.AddField(
            model_name='clientdetails',
            name='unit',
            field=models.CharField(default='PACD', max_length=100),
        ),
        migrations.AlterField(
            model_name='clientdetails',
            name='division',
            field=models.CharField(default='RD/ARD', max_length=100),
        ),
    ]
