from django.contrib import admin
from .models import AccountDetails, SessionHistory, DivisionLog, ServicesDetails

@admin.register(AccountDetails)
class AccountDetailsAdmin(admin.ModelAdmin):
    list_display = ('user', 'first_name', 'last_name', 'status', 'divisions', 'unit', 'position', 'email', 'contact', 'date_created')
    search_fields = ('user', 'first_name', 'last_name')
    list_filter = ('divisions', 'unit')
    ordering = ('-date_created',)
    list_per_page = 10

@admin.register(SessionHistory)
class SessionHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'login_time', 'logout_time', 'session_key')
    search_fields = ('user', 'login_time', 'logout_time')
    list_filter = ('user','login_time')
    ordering = ('-login_time',)
    list_per_page = 10

@admin.register(DivisionLog)
class DivisionLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'division', 'action_type', 'transaction_type', 'unit', 'status', 'date', 'form', 'service_avail')
    search_fields = ('action_type', 'transaction_type', 'form')
    list_filter = ('action_type', 'transaction_type', 'unit', 'status')
    ordering = ('-id',)
    list_per_page = 10

@admin.register(ServicesDetails)
class ServiceDetails(admin.ModelAdmin):
    list_display = ('id', 'service_name', 'service_code', 'division', 'unit', 'classification', 'type_transaction', 'edition', 'function')
    search_fields = ('service_name', 'service_code', 'division', 'unit', 'classification', 'type_transaction')
    list_filter = ('service_name', 'service_code', 'classification', 'type_transaction')
    order = ('-id')
    list_per_page = 10