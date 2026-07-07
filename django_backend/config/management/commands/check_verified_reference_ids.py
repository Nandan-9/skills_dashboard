from django.core.management.base import BaseCommand

from config.models import ICPCAmbassadorApplication

# Numeric suffixes of reference_id (format: "Main_Sheet-<n>") that are
# claimed to already be verified + approved.
REFERENCE_NUMBERS = [
    210, 160, 194, 221, 146, 32, 59, 75, 116, 213, 29, 204, 21, 96, 139, 4,
    119, 215, 236, 205, 7, 237, 73, 181, 84, 53, 58, 76, 104, 220, 56, 127,
    82, 74, 203, 14, 86, 115, 132, 179, 44, 85, 92, 42, 177, 185, 30, 117,
    5, 24, 151, 229, 135, 173, 225, 17, 13, 217, 175, 190, 228, 77, 120, 61,
    184, 136, 51, 35, 167, 219, 233, 232, 26, 125, 28, 71, 36, 40, 31, 9,
    63, 49, 66, 33, 183, 208, 88, 87, 178, 163, 165, 172, 2, 12, 161, 182,
    60, 54, 1, 196, 224, 189, 124, 103, 62, 187, 37, 20, 106, 110, 48, 78,
    38, 50, 93, 102, 192, 128, 227, 67, 65, 91, 201, 80, 222, 216, 72, 211,
    157, 25, 15, 147, 99, 68, 69, 41, 171, 156, 22, 107, 43, 212, 199, 90,
    162, 218, 52, 197, 164, 176, 195, 121, 109, 105, 83, 89, 138, 206, 198,
    200, 6, 8, 16, 10, 46, 45, 55, 129, 19, 141, 166, 113, 214, 70, 64, 79,
    193, 100, 231, 235, 3, 18, 170, 11, 81, 226, 27, 39, 57, 34, 111, 191,
    94, 118, 123, 97, 98, 122, 144, 150, 152, 47, 155, 202,
]


class Command(BaseCommand):
    help = (
        "Check that a given list of reference_id numbers (Main_Sheet-<n>) exist "
        "in the DB and are actually filtered (is_included) + approved. "
        "Pass --approve to set approval_status=APPROVE for the ones found in the DB."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--approve",
            action="store_true",
            help="Set approval_status=APPROVE for all found reference IDs.",
        )

    def handle(self, *args, **options):
        reference_ids = [f"Main_Sheet-{n}" for n in REFERENCE_NUMBERS]

        found = {
            a.reference_id: a
            for a in ICPCAmbassadorApplication.objects.filter(
                reference_id__in=reference_ids
            )
        }

        if options["approve"]:
            updated = ICPCAmbassadorApplication.objects.filter(
                reference_id__in=found.keys()
            ).update(approval_status=ICPCAmbassadorApplication.ApprovalStatus.APPROVE)
            self.stdout.write(self.style.SUCCESS(f"Approved {updated} application(s)."))
            for a in found.values():
                a.approval_status = ICPCAmbassadorApplication.ApprovalStatus.APPROVE

        missing = [rid for rid in reference_ids if rid not in found]
        not_included = [
            rid for rid in reference_ids if rid in found and not found[rid].is_included
        ]
        not_approved = [
            rid
            for rid in reference_ids
            if rid in found
            and found[rid].approval_status != ICPCAmbassadorApplication.ApprovalStatus.APPROVE
        ]
        not_state_verified = [
            rid for rid in reference_ids if rid in found and not found[rid].is_state_verified
        ]

        self.stdout.write(f"Checked: {len(reference_ids)}")
        self.stdout.write(f"Found: {len(found)}")

        if missing:
            self.stdout.write(self.style.ERROR(f"\nMissing from DB ({len(missing)}):"))
            for rid in missing:
                self.stdout.write(f"  {rid}")

        if not_state_verified:
            self.stdout.write(
                self.style.WARNING(f"\nFound but is_state_verified=False ({len(not_state_verified)}):")
            )
            for rid in not_state_verified:
                self.stdout.write(f"  {rid}")

        if not_included:
            self.stdout.write(
                self.style.WARNING(f"\nFound but is_included=False ({len(not_included)}):")
            )
            for rid in not_included:
                self.stdout.write(f"  {rid}")

        if not_approved:
            self.stdout.write(
                self.style.WARNING(f"\nFound but approval_status != approve ({len(not_approved)}):")
            )
            for rid in not_approved:
                self.stdout.write(f"  {rid} (status={found[rid].approval_status})")

        if not (missing or not_included or not_approved or not_state_verified):
            self.stdout.write(
                self.style.SUCCESS("\nAll reference IDs exist and are verified + filtered + approved.")
            )
