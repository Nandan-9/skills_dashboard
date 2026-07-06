from itertools import groupby

from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import ICPCAmbassadorApplication
from ..serializers import ICPCAmbassadorApplicationSerializer


class CollegeStudentsView(APIView):

    """Students grouped by college, with per-college and overall counts.

    By default only includes state-verified, deduplicated applications
    (is_included=True), matching the filtered result used by SyncView.
    Pass ?include=all to include every application instead.
    """

    def get(self, request):

        applications = ICPCAmbassadorApplication.objects.all()
        if request.query_params.get("include") != "all":
            applications = applications.filter(is_included=True)
        applications = applications.order_by("college_name", "full_name")

        colleges = []
        for college_name, group in groupby(applications, key=lambda a: a.college_name):
            students = list(group)
            colleges.append({
                "college_name": college_name,
                "state": students[0].state,
                "student_count": len(students),
                "students": ICPCAmbassadorApplicationSerializer(students, many=True).data,
            })

        return Response({
            "total_colleges": len(colleges),
            "total_students": sum(college["student_count"] for college in colleges),
            "colleges": colleges,
        })
