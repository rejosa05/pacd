from django.contrib import admin
from .models import AccountDetails, SessionHistory, DivisionLog

@admin.register(AccountDetails)
class AccountDetailsAdmin(admin.ModelAdmin):
    list_display = ('user', 'first_name', 'last_name', 'divisions', 'unit', 'position', 'email', 'contact', 'date_created')
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
    list_display = ('id', 'division', 'action_type', 'transaction_type', 'unit', 'status', 'date', 'form')
    search_fields = ('action_type', 'transaction_type', 'form')
    list_filter = ('action_type', 'transaction_type', 'unit', 'status')
    ordering = ('-date_resolved',)
    list_per_page = 10