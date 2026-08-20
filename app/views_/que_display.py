from django.http import JsonResponse
from django.shortcuts import render
from ..models import ClientDetails, TransactionLog
from django.utils import timezone


def que_display_page(request):
    return render(request, "pages/que_display.html")


def display_queue_api(request):
    today = timezone.localtime().date()

    # Get ONLY today's Waiting clients
    clients = ClientDetails.objects.filter(
        client_status="Waiting", date_created__date=today
    ).order_by("date_created")

    priority = []
    regular = []

    for client in clients:

        queue_code = (
            f"P-{client.client_queue_no:03d}"
            if client.client_lane_type == "Priority"
            else f"R-{client.client_queue_no:03d}"
        )

        if client.client_lane_type == "Priority":
            priority.append(queue_code)

        elif client.client_lane_type == "Regular":
            regular.append(queue_code)

    serving_transactions = (
        TransactionLog.objects.select_related(
            "client",
            "forwarded_division",
            "forwarded_unit",
        )
        .filter(
            created_at__date=today,
            transaction_status="Serving",
        )
        .order_by("-created_at")
    )

    serving = {
        "RLED": [],
        "MSD": [],
        "LHSD": [],
        "RD/ARD": [],
    }


    for transaction in serving_transactions:

        # Walay division → skip
        if not transaction.forwarded_division:
            continue

        division_name = transaction.forwarded_division.name

        # Check kung supported ang division
        if division_name not in serving:
            continue

        client = transaction.client

        if not client:
            continue

        # Queue number
        queue_code = (
            f"P-{client.client_queue_no:03d}"
            if client.client_lane_type == "Priority"
            else f"R-{client.client_queue_no:03d}"
        )

        # Unit nga belonging sa division
        unit_name = transaction.forwarded_unit.name if transaction.forwarded_unit else ""

        serving[division_name].append(
        {
            "queue_no": queue_code,
            "client_name": (
                f"{client.client_firstname} " f"{client.client_lastname}"
            ).strip(),
            "unit": unit_name,
        }
    )

    return JsonResponse(
        {
            "priority": priority,
            "regular": regular,
            "serving": serving,
        }
    )
