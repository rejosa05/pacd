# from django.db.models import Q, Count
from django.shortcuts import render

# from app.models import TransactionLog


def all_transactions_page(request):
    return render(request, "pages/all_transactions.html")
# def get_scoped_logs(request):
#     """
#     Admin / Sub-admin: makakita og tanan transaction logs.
#     Unit user: makakita ra sa transactions nga na-forward sa ilang unit.
#     """
#     user = request.user
#     logs = TransactionLog.objects.select_related(
#         'client', 'forwarded_division', 'forwarded_unit'
#     )

#     role = getattr(user, 'role', None)  # i-adjust base sa imong actual field/relation

#     if role in ('Admin', 'SubAdmin'):
#         return logs, True
#     else:
#         # assumes user has a `unit` FK — palit-i base sa imong tinuod nga field
#         user_unit = getattr(user, 'unit', None)
#         logs = logs.filter(forwarded_unit=user_unit)
#         return logs, False


# @login_required
# def transaction_logs_api(request):
#     logs, can_view_all = get_scoped_logs(request)

#     search = request.GET.get('search', '').strip()
#     status = request.GET.get('status', '').strip()
#     date_from = request.GET.get('date_from', '').strip()
#     date_to = request.GET.get('date_to', '').strip()

#     if search:
#         logs = logs.filter(
#             Q(client__first_name__icontains=search) |
#             Q(client__last_name__icontains=search) |
#             Q(transaction_type__icontains=search) |
#             Q(remarks__icontains=search)
#         )
#     if status:
#         logs = logs.filter(transaction_status=status)
#     if date_from:
#         logs = logs.filter(created_at__date__gte=date_from)
#     if date_to:
#         logs = logs.filter(created_at__date__lte=date_to)

#     stats = {
#         "total": logs.count(),
#         "waiting": logs.filter(transaction_status="Waiting").count(),
#     }

#     paginator = Paginator(logs.order_by('-created_at'), 10)
#     page_obj = paginator.get_page(request.GET.get('page', 1))

#     results = [{
#         "uid": str(log.uid),
#         "client": str(log.client),
#         "action": log.action,
#         "transaction_type": log.transaction_type,
#         "transaction_status": log.transaction_status,
#         "has_deficiency": log.has_deficiency,
#         "deficiency_details": log.deficiency_details,
#         "remarks": log.remarks,
#         "forwarded_to": f"{log.forwarded_division} / {log.forwarded_unit}" if log.forwarded_division else None,
#         "created_at": log.created_at.strftime("%b %d, %Y %I:%M %p"),
#     } for log in page_obj]

#     return JsonResponse({
#         "results": results,
#         "total_pages": paginator.num_pages,
#         "current_page": page_obj.number,
#         "stats": stats,
#         "can_view_all": can_view_all,
#     })


# @login_required
# def transaction_log_edit(request, uid):
#     log = get_object_or_404(TransactionLog, uid=uid)
#     # optional: i-check pud diri kung authorized ba mo-edit (dili lang unit-scoped)
#     data = json.loads(request.body)

#     log.transaction_type = data.get('transaction_type', log.transaction_type)
#     log.has_deficiency = data.get('has_deficiency', log.has_deficiency)
#     log.deficiency_details = data.get('deficiency_details', log.deficiency_details)
#     log.remarks = data.get('remarks', log.remarks)
#     log.save()

#     return JsonResponse({"success": True})


# @login_required
# def transaction_log_update_status(request, uid):
#     log = get_object_or_404(TransactionLog, uid=uid)
#     data = json.loads(request.body)

#     log.transaction_status = data.get('transaction_status', log.transaction_status)
#     log.remarks = data.get('remarks', log.remarks)
#     log.save()

#     return JsonResponse({"success": True})


# @login_required
# def transaction_log_delete(request, uid):
#     log = get_object_or_404(TransactionLog, uid=uid)
#     log.delete()
#     return JsonResponse({"success": True})