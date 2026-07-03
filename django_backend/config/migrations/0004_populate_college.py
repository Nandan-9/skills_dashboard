from django.db import migrations


def populate_colleges(apps, schema_editor):
    ICPCAmbassadorApplication = apps.get_model("config", "ICPCAmbassadorApplication")
    College = apps.get_model("config", "College")

    seen = set()
    colleges = []
    for college_name, state in ICPCAmbassadorApplication.objects.values_list(
        "college_name", "state"
    ).distinct():
        name = (college_name or "").strip()
        place = (state or "").strip()
        if not name:
            continue
        key = (name, place)
        if key in seen:
            continue
        seen.add(key)
        colleges.append(College(name=name, place=place))

    College.objects.bulk_create(colleges)


def remove_colleges(apps, schema_editor):
    College = apps.get_model("config", "College")
    College.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('config', '0003_college'),
    ]

    operations = [
        migrations.RunPython(populate_colleges, remove_colleges),
    ]
