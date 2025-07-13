from django.utils import timezone
from django.db.models.functions import TruncDate, TruncMonth
from django.db.models import Count
from django.http import JsonResponse
from ..models import DivisionLog, AccountDetails
from datetime import timedelta
from collections import defaultdict

def get_daily_data(request):
    user = request.session.get('username')
    account = AccountDetails.objects.filter(user=user).first()
    today = timezone.now().date()
    seven_days_ago = today - timedelta(days=7)


    if not account:
        return JsonResponse({'message': 'User not found'}, status=404)
    accUnit = account.unit

    if accUnit == 'PACD':
        data = (
            DivisionLog.objects
            .filter(date__date__gte=seven_days_ago)
            .annotate(dates=TruncDate('date'))
            .values('dates')
            .annotate(count=Count('id'))
            .order_by('dates')
        )
    else:
        data = (
            DivisionLog.objects
            .filter(date__date__gte=seven_days_ago, unit=accUnit)
            .annotate(dates=TruncDate('date'))
            .values('dates')
            .annotate(count=Count('id'))
            .order_by('dates')
        )

    labels = [entry['dates'].strftime('%b-%d') for entry in data]
    values = [entry['count'] for entry in data]

    return JsonResponse({'labels': labels, 'values': values})

def get_monthly_data(request):
    user = request.session.get('username')
    account = AccountDetails.objects.filter(user=user).first()
    today = timezone.now().date()
    twelve_months_ago = today.replace(day=1) - timedelta(days=365)

    if not account:
        return JsonResponse({'message': 'User not found'}, status=404)
    accUnit = account.unit


    if accUnit == 'PACD':
        data = (
            DivisionLog.objects
            .filter(date__date__gte=twelve_months_ago)
            .annotate(month=TruncMonth('date'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )
    else: 
        data = (
            DivisionLog.objects
            .filter(date__date__gte=twelve_months_ago, unit=accUnit)
            .annotate(month=TruncMonth('date'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )

    labels = [entry['month'].strftime('%B') for entry in data]
    values = [entry['count'] for entry in data]

    return JsonResponse({'labels': labels, 'values': values})

def get_type_data(request):
    user = request.session.get('username')
    account = AccountDetails.objects.filter(user=user).first()
    today = timezone.now().date()
    seven_days_ago = today - timedelta(days=6)  # Include today

    if not account:
        return JsonResponse({'message': 'User not found'}, status=404)
    
    accUnit = account.unit
    base_query = DivisionLog.objects.filter(date__date__gte=seven_days_ago)
    if accUnit != 'PACD':
        base_query = base_query.filter(unit=accUnit)

    data = (
        base_query
        .annotate(dates=TruncDate('date'))
        .values('dates', 'transaction_type')
        .annotate(count=Count('id'))
        .order_by('dates')
    )

    transaction_types = ['Request', 'Payment', 'Submit Documents', 'Inquiry', 'Others']
    date_range = [(today - timedelta(days=i)) for i in range(6, -1, -1)]
    date_labels = [d.strftime('%b-%d') for d in date_range]
    
    result = {t: [0] * 7 for t in transaction_types}  # 7 days, each type

    date_index = {d: i for i, d in enumerate(date_range)}  # Map dates to index
    
    for entry in data:
        trans_type = entry['transaction_type']
        date = entry['dates']
        count = entry['count']
        
        if trans_type in transaction_types and date in date_index:
            result[trans_type][date_index[date]] = count

    response_data = {
        'labels': date_labels,
        'datasets': [
            {
                'label': trans_type.title(),
                'data': result[trans_type]
            }
            for trans_type in transaction_types
        ]
    }

    return JsonResponse(response_data)