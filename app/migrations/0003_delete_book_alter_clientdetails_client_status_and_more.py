# Generated by Django 4.2.2 on 2025-03-11 15:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0002_remove_clientdetails_client_id_and_more'),
    ]

    operations = [
        migrations.DeleteModel(
            name='Book',
        ),
        migrations.AlterField(
            model_name='clientdetails',
            name='client_status',
            field=models.CharField(default='Pending', max_length=100),
        ),
        migrations.AlterField(
            model_name='clientdetails',
            name='created_date',
            field=models.DateField(auto_created=True),
        ),
    ]
