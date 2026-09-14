import json
from datetime import datetime

from django.contrib.auth.decorators import login_required
from django.db.models import Q, Count
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from django.views.decorators.http import require_GET, require_POST

from app.models import (
    TransactionLog,
    Division,
    Unit,
)


@login_required
def transaction_logs_page(request):
    """
    Main Transaction Logs page.
    """

    return render(request, "pages/all_transactions.html")


@login_required
@require_GET
def transaction_logs_api(request):
    """
    Returns paginated transaction logs + dashboard statistics.
    """

    page = int(request.GET.get("page", 1))
    page_size = 10

    search = request.GET.get("search", "").strip()
    status = request.GET.get("status", "").strip()
    date_from = request.GET.get("date_from", "").strip()
    date_to = request.GET.get("date_to", "").strip()

    queryset = TransactionLog.objects.select_related(
        "client",
        "forwarded_division",
        "forwarded_unit",
        "pacd_officer",
        "process_owner",
        "service",
    ).order_by("-created_at")

    # -------------------------------------------------
    # SEARCH
    # -------------------------------------------------

    if search:
        queryset = queryset.filter(
            Q(client__client_firstname__icontains=search)
            | Q(client__client_lastname__icontains=search)
            | Q(transaction_type__icontains=search)
            | Q(details__icontains=search)
            | Q(remarks__icontains=search)
            | Q(forwarded_division__name__icontains=search)
            | Q(forwarded_unit__name__icontains=search)
            | Q(action__icontains=search)
            | Q(transaction_status__icontains=search)
        )

    # -------------------------------------------------
    # STATUS
    # -------------------------------------------------

    if status:
        queryset = queryset.filter(transaction_status=status)

    # -------------------------------------------------
    # DATE FROM
    # -------------------------------------------------

    if date_from:
        try:
            date_from_obj = datetime.strptime(date_from, "%Y-%m-%d").date()

            queryset = queryset.filter(created_at__date__gte=date_from_obj)

        except ValueError:
            pass

    # -------------------------------------------------
    # DATE TO
    # -------------------------------------------------

    if date_to:
        try:
            date_to_obj = datetime.strptime(date_to, "%Y-%m-%d").date()

            queryset = queryset.filter(created_at__date__lte=date_to_obj)

        except ValueError:
            pass

    # -------------------------------------------------
    # PAGINATION
    # -------------------------------------------------

    total_filtered = queryset.count()

    total_pages = max(1, (total_filtered + page_size - 1) // page_size)

    if page < 1:
        page = 1

    if page > total_pages:
        page = total_pages

    start = (page - 1) * page_size
    end = start + page_size

    logs = queryset[start:end]

    # -------------------------------------------------
    # SERIALIZE LOGS
    # -------------------------------------------------

    data = []

    for log in logs:

        client_name = ""

        if log.client:
            first_name = getattr(log.client, "client_firstname", "") or ""

            last_name = getattr(log.client, "client_lastname", "") or ""

            client_name = f"{first_name} {last_name}".strip()

            # fallback if using client_fullname
            if not client_name:
                client_name = getattr(log.client, "client_fullname", "") or ""

        forwarded_to = ""

        if log.forwarded_division:
            forwarded_to = log.forwarded_division.name

        if log.forwarded_unit:
            if forwarded_to:
                forwarded_to += " / "

            forwarded_to += log.forwarded_unit.name

        data.append(
            {
                "uid": str(log.uid),
                "client": client_name,
                "queue_no": getattr(log.client, "client_queue_no", ""),
                "action": log.action,
                "details": log.details or "",
                "transaction_type": (log.transaction_type or ""),
                "transaction_status": (log.transaction_status or ""),
                "forwarded_division": (
                    log.forwarded_division.name if log.forwarded_division else ""
                ),
                "forwarded_unit": (
                    log.forwarded_unit.name if log.forwarded_unit else ""
                ),
                "forwarded_to": forwarded_to,
                "citizen_charter": (log.citizen_charter or ""),
                "service": (str(log.service) if log.service else ""),
                "has_deficiency": (log.has_deficiency or ""),
                "deficiency_details": (log.deficiency_details or ""),
                "resolved": (log.resolved or ""),
                "deficiency_status": (log.deficiency_status or ""),
                "remarks": (log.remarks or ""),
                "survey_form": (log.survey_form or ""),
                "pacd_officer": (log.pacd_officer.username if log.pacd_officer else ""),
                "process_owner": (
                    log.process_owner.username if log.process_owner else ""
                ),
                "created_at": log.created_at.strftime("%b %d, %Y %I:%M %p"),
            }
        )

    # -------------------------------------------------
    # GLOBAL STATISTICS
    # -------------------------------------------------

    stats_queryset = TransactionLog.objects.all()

    stats = {
        "total": stats_queryset.count(),
        "waiting": stats_queryset.filter(transaction_status="Waiting").count(),
        "serving": stats_queryset.filter(transaction_status="Serving").count(),
        "served": stats_queryset.filter(transaction_status="Served").count(),
        "forwarded": stats_queryset.filter(transaction_status="Forwarded").count(),
        "skipped": stats_queryset.filter(transaction_status="Skipped").count(),
        "catered": stats_queryset.filter(transaction_status="Catered").count(),
    }

    return JsonResponse(
        {
            "success": True,
            "logs": data,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total_filtered,
                "total_pages": total_pages,
            },
            "stats": stats,
        }
    )


@login_required
@require_GET
def transaction_log_detail(request, uid):

    log = get_object_or_404(
        TransactionLog.objects.select_related(
            "client",
            "forwarded_division",
            "forwarded_unit",
            "pacd_officer",
            "process_owner",
            "service",
        ),
        uid=uid,
    )

    client_name = ""

    if log.client:

        first_name = getattr(log.client, "client_firstname", "") or ""

        last_name = getattr(log.client, "client_lastname", "") or ""

        client_name = f"{first_name} {last_name}".strip()

        if not client_name:
            client_name = getattr(log.client, "client_fullname", "") or ""

    return JsonResponse(
        {
            "success": True,
            "log": {
                "uid": str(log.uid),
                "client": client_name,
                "queue_no": getattr(log.client, "client_queue_no", ""),
                "action": log.action,
                "details": log.details or "",
                "transaction_type": (log.transaction_type or ""),
                "transaction_status": (log.transaction_status or ""),
                "citizen_charter": (log.citizen_charter or ""),
                "service": (str(log.service) if log.service else ""),
                "has_deficiency": (log.has_deficiency or ""),
                "deficiency_details": (log.deficiency_details or ""),
                "resolved": (log.resolved or ""),
                "deficiency_status": (log.deficiency_status or ""),
                "forwarded_division": (
                    log.forwarded_division.name if log.forwarded_division else ""
                ),
                "forwarded_unit": (
                    log.forwarded_unit.name if log.forwarded_unit else ""
                ),
                "remarks": log.remarks or "",
                "survey_form": (log.survey_form or ""),
                "pacd_officer": (log.pacd_officer.username if log.pacd_officer else ""),
                "process_owner": (
                    log.process_owner.username if log.process_owner else ""
                ),
                "created_at": log.created_at.strftime("%b %d, %Y %I:%M %p"),
            },
        }
    )


@login_required
@require_POST
def transaction_log_update(request, uid):

    log = get_object_or_404(
        TransactionLog,
        uid=uid,
    )

    try:
        body = json.loads(request.body.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse(
            {"success": False, "message": "Invalid request."},
            status=400,
        )

    # -------------------------------------------------
    # UPDATE BASIC FIELDS
    # -------------------------------------------------

    action = body.get("action")

    if action in dict(TransactionLog.ACTION_CHOICES):
        log.action = action

    status = body.get("transaction_status")

    valid_statuses = dict(TransactionLog.STATUS_CHOICES)

    if status in valid_statuses:
        log.transaction_status = status

    transaction_type = body.get("transaction_type")

    if transaction_type is not None:
        log.transaction_type = transaction_type

    details = body.get("details")

    if details is not None:
        log.details = details

    remarks = body.get("remarks")

    if remarks is not None:
        log.remarks = remarks

    citizen_charter = body.get("citizen_charter")

    if citizen_charter in ["Yes", "No", ""]:
        log.citizen_charter = citizen_charter or None

    has_deficiency = body.get("has_deficiency")

    if has_deficiency in ["Yes", "No", ""]:
        log.has_deficiency = has_deficiency or None

    deficiency_details = body.get("deficiency_details")

    if deficiency_details is not None:
        log.deficiency_details = deficiency_details

    resolved = body.get("resolved")

    if resolved in ["Yes", "No", ""]:
        log.resolved = resolved or None

    deficiency_status = body.get("deficiency_status")

    if deficiency_status is not None:
        log.deficiency_status = deficiency_status

    survey_form = body.get("survey_form")

    if survey_form in ["CSM", "CSS", ""]:
        log.survey_form = survey_form or None

    # -------------------------------------------------
    # SAVE
    # -------------------------------------------------

    log.save()

    return JsonResponse(
        {
            "success": True,
            "message": "Transaction log updated successfully.",
        }
    )


@login_required
@require_POST
def transaction_log_delete(request, uid):

    log = get_object_or_404(
        TransactionLog,
        uid=uid,
    )

    log.delete()

    return JsonResponse(
        {
            "success": True,
            "message": "Transaction log deleted successfully.",
        }
    )
