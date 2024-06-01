# Generated by Django 5.0.4 on 2024-05-04 20:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('basket', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='OrderDetails',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('total_price', models.FloatField()),
                ('item_name', models.CharField(max_length=255)),
                ('item_quantity', models.IntegerField()),
                ('order_address', models.CharField(max_length=255)),
            ],
        ),
    ]
