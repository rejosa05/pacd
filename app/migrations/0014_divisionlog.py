# Generated by Django 5.1.6 on 2025-04-03 04:31

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0013_rename_hislorylog_historylog_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='DivisionLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('action', models.CharField(max_length=100)),
                ('division', models.CharField(max_length=100)),
                ('remarks', models.TextField()),
                ('unit', models.CharField(max_length=100)),
                ('action_type', models.CharField(max_length=100)),
                ('user', models.CharField(max_length=100)),
                ('date', models.DateTimeField(auto_now_add=True)),
                ('client_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='pacd_actions', to='app.clientdetails')),
            ],
        ),
    ]
