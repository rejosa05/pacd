# Generated by Django 4.2.2 on 2025-05-13 14:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0026_accountdetails_contact_accountdetails_email'),
    ]

    operations = [
        migrations.AlterField(
            model_name='divisionlog',
            name='transaction_details',
            field=models.CharField(max_length=10000, null=True),
        ),
    ]
