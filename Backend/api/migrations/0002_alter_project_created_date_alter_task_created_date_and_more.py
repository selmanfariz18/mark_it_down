# Generated by Django 5.1.3 on 2024-11-13 14:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='project',
            name='created_date',
            field=models.DateTimeField(),
        ),
        migrations.AlterField(
            model_name='task',
            name='created_date',
            field=models.DateTimeField(),
        ),
        migrations.AlterField(
            model_name='task',
            name='last_updated_on',
            field=models.DateTimeField(),
        ),
    ]