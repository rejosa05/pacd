from django.db import models
from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.hashers import make_password
import uuid


class AccountDetails(models.Model):
    user = models.CharField(max_length=100, unique=True)
    password = models.CharField(max_length=255, null=True)  # mas taas para safe sa hash
    first_name = models.CharField(max_length=100, null=True)
    last_name = models.CharField(max_length=100, null=True)
    divisions = models.CharField(max_length=100, null=True, blank=True)
    unit = models.CharField(max_length=100, null=True, blank=True)
    position = models.CharField(max_length=100, null=True, blank=True)
    email = models.CharField(max_length=100, null=True)
    contact = models.CharField(max_length=100, null=True)
    date_created = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=100, default='For Approval', null=True)
    created_by = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"{self.user} ({self.first_name} {self.last_name})"

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def save(self, *args, **kwargs):
        self.first_name = self.first_name.title()
        self.last_name = self.last_name.title()
        super().save(*args, **kwargs)
    
class ClientDetails(models.Model):
    public_id = models.UUIDField(default=uuid.uuid4, editable=False, null=True, blank=True)
    client_firstname = models.CharField(max_length=100, blank=True)
    client_lastname = models.CharField(max_length=100, blank=True)
    client_org = models.CharField(max_length=100, blank=True, null=True)
    client_queue_no = models.PositiveIntegerField(default=1)
    client_lane_type = models.CharField(max_length=100, blank=True, null=True)
    client_contact = models.CharField(max_length=10, null=True)
    client_gender = models.CharField(max_length=10, null=True)
    client_status = models.CharField(max_length=100, default='Waiting')
    date_created = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"({self.client_firstname} {self.client_lastname})"
    
    def save(self, *args, **kwargs):
        self.client_firstname = (self.client_firstname or '').title()
        self.client_lastname = (self.client_lastname or '').title()
        self.client_org = (self.client_org or '').title()
        
        super(ClientDetails, self).save(*args, **kwargs)
    
    @staticmethod
    def get_queue_no():
        today = timezone.now()
        start_queue = 1
        last_queue = ClientDetails.objects.filter(date_created__date=today).order_by('client_queue_no').last()
        if last_queue:
            return last_queue.client_queue_no + start_queue
        return start_queue

@receiver(pre_save, sender=ClientDetails)
def set_queue_no(sender, instance, **kwargs):
    if instance._state.adding and (not instance.client_queue_no or instance.client_queue_no == 1):
        instance.client_queue_no = ClientDetails.get_queue_no()

class ServicesDetails(models.Model):
    service_name = models.TextField()
    category = models.CharField(max_length=100, null=True, blank=True)
    division = models.CharField(max_length=100, null=True, blank=True)
    unit = models.CharField(max_length=100, null=True, blank=True)
    classification = models.CharField(max_length=100, null=True, blank=True)
    type_transaction = models.CharField(max_length=100, null=True, blank=True)
    processing_time = models.DurationField(default=timedelta(days=1), null=True, blank=True)

    def __str__(self):
        return f"{self.service_name}"

    def save(self, *args, **kwargs):
        self.service_name = self.service_name.title()
        super(ServicesDetails, self).save(*args, **kwargs)

class DivisionLog(models.Model):
    client_id = models.ForeignKey(ClientDetails, on_delete=models.CASCADE, null=True, blank=True, related_name='client_logs')
    process_owner_id = models.ForeignKey(AccountDetails, on_delete=models.CASCADE, null=True, blank=True, related_name='process_owner')
    pacd_officer_id = models.ForeignKey(AccountDetails, on_delete=models.CASCADE, null=True, blank=True, related_name='pacd_officer')
    service_id = models.ForeignKey(ServicesDetails, on_delete=models.CASCADE, null=True, blank=True)
    transaction_no = models.CharField(max_length=100, null=True, blank=True)
    transaction_type = models.CharField(max_length=100, null=True, blank=True)
    division = models.CharField(max_length=100, null=True, blank=True)
    transaction_details = models.TextField(null=True)
    unit = models.CharField(max_length=100, null=True, blank=True)
    action_type = models.CharField(max_length=100,  null=True, blank=True)
    date = models.DateTimeField(auto_now_add=True)
    
    date_resolved = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=100, null=True, blank=True)
    form = models.CharField(max_length=100, null=True)
    deficiencies = models.TextField(null=True, blank=True)
    remarks = models.TextField(blank=True)
    requirements_met = models.CharField(max_length=10, null=True, blank=True)
    cc_cover = models.CharField(max_length=10, null=True, blank=True)
    request_catered = models.CharField(max_length=10, null=True, blank=True)

    class Meta:
        db_table = 'transactions_log'


    def __str__(self):
        return str(self.action_type) if self.action_type else "No Action"
        
class HistoryLog(models.Model):
    action = models.CharField(max_length=100)
    client = models.ForeignKey(ClientDetails, on_delete=models.CASCADE, related_name='history_logs')
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.client.client_fullname} - {self.action} at {self.timestamp}"
    
@receiver(post_save, sender=ClientDetails)
def log_client_save(sender, instance, created, **kwargs):
    if created:
        action = 'created'
    else:
        action = 'updated'
    HistoryLog.objects.create(
        client=instance,
        action=action,
        timestamp=timezone.now()
    )

@receiver(post_delete, sender=ClientDetails)
def log_client_delete(sender, instance, **kwargs):
    HistoryLog.objects.create(
        client=instance,
        action='deleted',
        date=timezone.now()
    )

class SessionHistory(models.Model):
    user = models.CharField(max_length=100)
    login_time = models.DateTimeField(default=timezone.now)
    logout_time = models.DateTimeField(null=True, blank=True)
    session_key = models.CharField(max_length=40, null=True, blank=True)

    def __str__(self):
        return f"{self.user} - {self.login_time}"

class TransactionHistory(models.Model):
    division_log = models.ForeignKey(DivisionLog, on_delete=models.CASCADE, related_name='division_log', null = True)
    accounts = models.ForeignKey(AccountDetails, on_delete=models.CASCADE, related_name='account', null = True)
    form = models.CharField(max_length=20, null=True)
    deficiencies = models.TextField(null=True)
    remarks = models.TextField(null=True)
    action = models.CharField(max_length=20, null=True)
    status = models.CharField(max_length=20, null=True)
    date = models.DateTimeField(auto_now_add=True)
    

    class Meta:
        db_table = 'transaction_history'
        ordering = ['-date']

    def __str__(self):
        return f"{self.action} - {self.division_log}"

    
