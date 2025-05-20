from django.contrib import admin
from .models import AccountDetails

@admin.register(AccountDetails)
class AccountDetailsAdmin(admin.ModelAdmin):
    list_display = ('user', 'first_name', 'last_name', 'divisions', 'unit', 'position', 'email', 'contact', 'date_created')
    search_fields = ('user', 'first_name', 'last_name')
    list_filter = ('divisions', 'unit')
    ordering = ('-date_created',)
    list_per_page = 10