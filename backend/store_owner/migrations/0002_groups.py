# Generated by Django 5.0.3 on 2024-04-04 20:53

from django.db import migrations, models
from django.contrib.auth.models import Group




class Migration(migrations.Migration):

    initial = True

    dependencies = [('store_owner', '0001_initial'),
    ]
    
    def generateUserGroups(apps, schema_editor):
        Group = apps.get_model('auth', 'Group')
        db_alias = schema_editor.connection.alias
        Group.objects.using(db_alias).bulk_create([
            Group(name='store_owner'),
        ])
        
    ## add permissions to the group
    def addPermissionsToGroup(apps, schema_editor):
        store_owner_group, created = Group.objects.get_or_create(name='store_owner')
        store_owner_group.permissions.set([])

    operations = [
        migrations.RunPython(generateUserGroups),
        migrations.RunPython(addPermissionsToGroup),
    ]
