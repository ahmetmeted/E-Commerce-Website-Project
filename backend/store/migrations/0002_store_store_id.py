# Generated by Django 5.0.4 on 2024-04-22 21:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='store',
            name='store_id',
            field=models.IntegerField(default=0),
        ),
    ]
