from django.utils import timezone
from django.db.models.functions import TruncDate
from django.db.models import Count
from django.http import JsonResponse
from ..models import DivisionLog, AccountDetails
from datetime import timedelta

def get_daily_data(request):
    
    today = timezone.now().date()
    seven_days_ago = today - timedelta(days=7)
    unit = 'MAIP'

    data = (
        DivisionLog.objects
        .filter(date__date__gte=seven_days_ago)
        .annotate(dates=TruncDate('date'))
        .values('dates')
        .annotate(count=Count('id'))
        .order_by('dates')
    )

    labels = [entry['dates'].strftime('%Y-%m-%d') for entry in data]
    values = [entry['count'] for entry in data]

    return JsonResponse({'labels': labels, 'values': values})

def get_daily_data_unit(request):
    user = request.session.get('username')
    users = AccountDetails.objects.filter(user=user).first()
    unit = users.unit
    today = timezone.now().date()
    seven_days_ago = today - timedelta(days=7)

    data = (
        DivisionLog.objects
        .filter(date__date__gte=seven_days_ago, unit=unit)
        .annotate(dates=TruncDate('date'))
        .values('dates')
        .annotate(count=Count('id'))
        .order_by('dates')
    )

    labels = [entry['dates'].strftime('%Y-%m-%d') for entry in data]
    values = [entry['count'] for entry in data]

    return JsonResponse({'labels': labels, 'values': values})