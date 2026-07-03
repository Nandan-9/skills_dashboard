from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator


class ICPCAmbassadorApplication(models.Model):

    class Gender(models.TextChoices):
        MALE = "M", "Male"
        FEMALE = "F", "Female"
        OTHER = "O", "Other"

    class YearOfStudy(models.TextChoices):
        FIRST = "1", "1st Year"
        SECOND = "2", "2nd Year"
        THIRD = "3", "3rd Year"
        FOURTH = "4", "4th Year"
        FINAL = "5", "5th Year / Final"

    # --- Meta / tracking ---
    reference_id = models.CharField(max_length=50, unique=True, db_index=True)
    submitted_at = models.DateTimeField()  # from "Timestamp"
    created_at = models.DateTimeField(auto_now_add=True)

    # --- Personal info ---
    full_name = models.CharField(max_length=150)
    email = models.EmailField()
    phone_number = models.CharField(
        max_length=15,
        validators=[RegexValidator(r"^\+?\d{10,15}$", "Enter a valid phone number.")],
    )
    gender = models.CharField(max_length=1, choices=Gender.choices)
    photo_url = models.URLField(blank=True, null=True)  # google form file upload gives a drive link

    # --- Institution info ---
    official_email = models.EmailField()
    state = models.CharField(max_length=100)
    college_name = models.CharField(max_length=255)
    degree_program = models.CharField(max_length=100)
    year_of_study = models.CharField(max_length=1, choices=YearOfStudy.choices)
    is_women_only_institution = models.BooleanField(default=False)
    student_strength = models.PositiveIntegerField(null=True, blank=True)

    # --- ICPC awareness / participation ---
    awareness_score = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)]
    )
    active_participants_estimate = models.CharField(max_length=100, blank=True)  # keep as text if form gave ranges like "10-20"
    institution_has = ArrayField(models.CharField(max_length=100), blank=True, default=list)
    non_participation_reasons = ArrayField(models.CharField(max_length=200), blank=True, default=list)
    biggest_challenge = models.TextField(blank=True)
    awareness_plan = models.TextField(blank=True)
    estimated_teams = models.PositiveSmallIntegerField(null=True, blank=True)

    # --- Ambassador candidacy ---
    memberships = ArrayField(models.CharField(max_length=150), blank=True, default=list)
    has_organized_event = models.BooleanField(default=False)
    event_description = models.TextField(blank=True)
    network_reach_estimate = models.PositiveIntegerField(null=True, blank=True)
    aware_of_mentors = models.BooleanField(default=False)
    mentor_details = models.TextField(blank=True)
    faculty_encourages = models.BooleanField(null=True, blank=True)  # form might have Yes/No/Not sure
    motivation = models.TextField()
    agrees_to_promote = models.BooleanField(default=False)

    # --- Social ---
    instagram_url = models.URLField(blank=True, null=True)
    linkedin_url = models.URLField(blank=True, null=True)

    class Meta:
        ordering = ["-submitted_at"]

    def __str__(self):
        return f"{self.full_name} — {self.college_name}"