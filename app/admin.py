from django.contrib import admin
from .models import AccountDetails, SessionHistory, DivisionLog, ServicesDetails, ClientDetails, TransactionHistory

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
class TransactionLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'process_owner_id', 'client_id' ,'transaction_no', 'division', 'action_type', 'transaction_type', 'unit', 'status', 'date', 'cc_cover','form', 'service_id') 
    search_fields = ('action_type', 'transaction_type', 'form')
    list_filter = ('action_type', 'transaction_type', 'unit', 'status')
    ordering = ('-id',)
    list_per_page = 10

@admin.register(ServicesDetails)
class ServiceDetails(admin.ModelAdmin):
    list_display = ('id', 'service_name', 'division', 'unit', 'classification', 'type_transaction', 'processing_time')
    search_fields = ('service_name', 'division', 'unit', 'classification', 'type_transaction')
    list_filter = ('service_name', 'classification', 'type_transaction')
    order = ('-id')
    list_per_page = 10

@admin.register(ClientDetails)
class ClientDetailsAdmin(admin.ModelAdmin):
    list_display = ('id','client_queue_no', 'client_firstname', 'client_lastname', 'client_org', 'client_lane_type', 'client_contact', 'client_status', 'date_created', 'public_id')
    search_fields = ('client_queue_no', 'client_firstname', 'client_lastname', 'client_org', 'client_lane_type', 'client_contact', 'client_status')
    list_filter = ('client_lane_type', 'client_status', 'date_created')
    ordering = ('-date_created',)
    list_per_page = 10

@admin.register(TransactionHistory)
class TransactionHistorys(admin.ModelAdmin):
    list_display = ('id', 'get_transaction_no', 'accounts', 'action', 'date')
    search_fields = ('accounts', 'action', 'date')
    list_filter = ('division_log', 'accounts', 'action', 'date')
    ordering = ('-date',)
    list_per_page = 10

    def get_transaction_no(self, obj):
        return obj.division_log.transaction_no if obj.division_log else None

    get_transaction_no.short_description = 'Transaction No'