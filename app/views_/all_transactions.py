# transactions/views.py
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db.models.signals import post_save
from django.dispatch import receiver
from app.models import TransactionLog


def _serialize(tx: TransactionLog) -> dict:
    return {
        "uid": str(tx.uid),
        "client": str(tx.client),
        "action": tx.action,
        "transaction_type": tx.transaction_type or "",
        "transaction_status": tx.transaction_status,
        "forwarded_division": str(tx.forwarded_division) if tx.forwarded_division_id else "",
        "forwarded_unit": str(tx.forwarded_unit) if tx.forwarded_unit_id else "",
        "process_owner": tx.process_owner.get_full_name() if tx.process_owner_id else "",
        "created_at": tx.created_at.strftime("%b %d, %Y %I:%M %p"),
    }
 
 
@receiver(post_save, sender=TransactionLog)
def broadcast_transaction_log(sender, instance, created, **kwargs):
    channel_layer = get_channel_layer()
    if channel_layer is None:
        return  # channel layer not configured, skip silently
 
    async_to_sync(channel_layer.group_send)(
        "transaction_log",
        {
            "type": "transaction.update",
            "data": {
                "event": "created" if created else "updated",
                "transaction": _serialize(instance),
            },
        },
    )


@login_required
def transaction_log_list(request):
    """Initial page load. Renders the table shell + the first page of rows."""
    qs = TransactionLog.objects.select_related(
        "client", "forwarded_division", "forwarded_unit", "process_owner"
    )[:50]

    context = {
        "transactions": qs,
        "total_count": TransactionLog.objects.count(),
    }
    return render(request, "transactions/transaction_list.html", context)


@login_required
def transaction_log_search(request):
    """
    AJAX endpoint used by the search bar + date filter.
    GET params: q, date_from, date_to
    Returns JSON so the front end can re-render the <tbody> without a
    full page reload.
    """
    qs = TransactionLog.objects.select_related(
        "client", "forwarded_division", "forwarded_unit", "process_owner"
    )

    q = request.GET.get("q", "").strip()
    date_from = request.GET.get("date_from", "").strip()
    date_to = request.GET.get("date_to", "").strip()

    if q:
        from django.db.models import Q

        qs = qs.filter(
            Q(client__first_name__icontains=q)
            | Q(client__last_name__icontains=q)
            | Q(action__icontains=q)
            | Q(transaction_type__icontains=q)
            | Q(transaction_status__icontains=q)
            | Q(remarks__icontains=q)
        )

    if date_from:
        qs = qs.filter(created_at__date__gte=date_from)
    if date_to:
        qs = qs.filter(created_at__date__lte=date_to)

    qs = qs[:200]

    return JsonResponse(
        {
            "count": qs.count(),
            "total_count": TransactionLog.objects.count(),
            "results": [_serialize(tx) for tx in qs],
        }
    )