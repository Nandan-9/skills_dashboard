from datetime import datetime

import gspread
from django.conf import settings
from django.utils import timezone
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ICPCAmbassadorApplication
from .serializers import ICPCAmbassadorApplicationSerializer

# Maps Google Sheet column headers (Google Form question text) to model field names.
# Adjust these to match the real header row of the sheet.
COLUMN_MAP = {
    "Timestamp": "submitted_at",
    "Full Name": "full_name",
    "Email Address": "email",
    "Phone Number": "phone_number",
    "Gender": "gender",
    "Upload Your Professional Photo": "photo_url",
    "Official Email Address of your institution": "official_email",
    "State / Union Territory of your Institution": "state",
    "College / Institution Name": "college_name",
    "Degree Program": "degree_program",
    "Year of Study": "year_of_study",
    "Is your institution a Women-Only Institution?": "is_women_only_institution",
    "Approximate Student Strength of Your Institution": "student_strength",
    "On a scale of 1–10, how aware are students in your institution about ICPC?": "awareness_score",
    "Approximately how many students in your institution actively participate in coding contests?": "active_participants_estimate",
    "Does your institution currently have:": "institution_has",
    "What do you think are the biggest reasons students do NOT participate in ICPC? (Select up to 3)": "non_participation_reasons",
    "What is the biggest challenge in promoting ICPC in your institution?": "biggest_challenge",
    "If selected, how would you increase awareness about ICPC in your institution?": "awareness_plan",
    "How many teams do you realistically think you can help register for ICPC Amritapuri 2026?": "estimated_teams",
    "Are you a member of any of the following?": "memberships",
    "Have you previously organized or promoted any event?": "has_organized_event",
    "If yes, briefly describe the event and your role.": "event_description",
    "Approximately how many students can you directly reach through groups, communities, clubs, or networks?": "network_reach_estimate",
    "Are you aware of any ICPC  Mentors from your institution?": "aware_of_mentors",
    "If yes, please provide their names and details.": "mentor_details",
    "Are there faculty members who actively encourage programming competitions?": "faculty_encourages",
    "Why do you want to become an ICPC Ambassador?": "motivation",
    "Do you agree to actively promote ICPC Amritapuri 2026 and represent the program professionally?": "agrees_to_promote",
    "Instagram Profile": "instagram_url",
    "LinkedIn Profile": "linkedin_url",
}

ARRAY_FIELDS = {"institution_has", "non_participation_reasons", "memberships"}
BOOL_FIELDS = {
    "is_women_only_institution",
    "has_organized_event",
    "aware_of_mentors",
    "agrees_to_promote",
    "faculty_encourages",
}
INT_FIELDS = {"student_strength", "awareness_score", "estimated_teams", "network_reach_estimate"}
GENDER_MAP = {"male": "M", "female": "F", "other": "O"}
YEAR_MAP = {
    "1st year": "1",
    "2nd year": "2",
    "3rd year": "3",
    "4th year": "4",
    "5th year": "5",
    "final year": "5",
}


def parse_bool(value):
    value = (value or "").strip().lower()
    if value in ("yes", "true"):
        return True
    if value in ("no", "false"):
        return False
    return None


def parse_int(value):
    value = (value or "").strip()
    return int(value) if value.isdigit() else None


def parse_row(row):
    parsed = {}
    for header, field in COLUMN_MAP.items():
        raw = row.get(header, "")
        raw = "" if raw is None else str(raw)
        if field == "submitted_at":
            naive = datetime.strptime(raw.strip(), "%m/%d/%Y %H:%M:%S")
            parsed[field] = timezone.make_aware(naive)
        elif field == "gender":
            parsed[field] = GENDER_MAP.get(raw.strip().lower(), "O")
        elif field == "year_of_study":
            parsed[field] = YEAR_MAP.get(raw.strip().lower(), "1")
        elif field in ARRAY_FIELDS:
            parsed[field] = [item.strip() for item in raw.split(",") if item.strip()]
        elif field in BOOL_FIELDS:
            parsed[field] = parse_bool(raw)
        elif field in INT_FIELDS:
            parsed[field] = parse_int(raw)
        else:
            parsed[field] = raw.strip()

    parsed["is_women_only_institution"] = parsed.get("is_women_only_institution") or False
    parsed["has_organized_event"] = parsed.get("has_organized_event") or False
    parsed["aware_of_mentors"] = parsed.get("aware_of_mentors") or False
    parsed["agrees_to_promote"] = parsed.get("agrees_to_promote") or False
    return parsed


def sync_sheet():
    client = gspread.service_account(filename=settings.GOOGLE_SERVICE_ACCOUNT_FILE)
    worksheet = client.open_by_key(settings.GOOGLE_SHEET_ID).worksheet(settings.GOOGLE_SHEET_WORKSHEET)
    rows = worksheet.get_all_records()
    created = updated = 0
    errors = []
    for index, row in enumerate(rows, start=2):  # row 1 is the header
        try:
            parsed = parse_row(row)
            reference_id = f"{settings.GOOGLE_SHEET_WORKSHEET}-{index}"
            _, was_created = ICPCAmbassadorApplication.objects.update_or_create(
                reference_id=reference_id, defaults=parsed
            )
            if was_created:
                created += 1
            else:
                updated += 1
        except Exception as exc:
            errors.append({"row": index, "reason": str(exc)})

    return {"created": created, "updated": updated, "errors": errors}


class ApplicationListView(ListAPIView):
    queryset = ICPCAmbassadorApplication.objects.all()
    serializer_class = ICPCAmbassadorApplicationSerializer


class SyncSheetView(APIView):
    def post(self, request):
        if request.headers.get("X-Sync-Key") != settings.SHEET_SYNC_API_KEY:
            return Response({"detail": "Forbidden"}, status=403)

        try:
            print("dsdssds")
            summary = sync_sheet()
        except Exception as exc:
            return Response({"detail": str(exc)}, status=500)

        return Response(summary, status=200)
