from django.db import models
from django.conf import settings
from django.contrib.auth.models import User
from django.db.models.signals import pre_save, post_save, post_delete

from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.hashers import make_password
import uuid


class Unit(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Division(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Position(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Organization(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def save(self, *args, **kwargs):
        self.name = (self.name or "").title()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class AccountDetails(models.Model):

    ROLE_CHOICES = [
        ("SUPER_ADMIN", "Super Admin"),
        ("SUB_ADMIN", "Sub-Admin"),
        ("STAFF", "Staff"),
    ]

    uid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="account_profile"
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="STAFF")
    position = models.ForeignKey(
        Position,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="profiles",
    )
    division = models.ForeignKey(
        Division,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="profiles",
    )
    unit = models.ForeignKey(
        Unit, on_delete=models.SET_NULL, blank=True, null=True, related_name="profiles"
    )
    contact_number = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=100, default="Active")
    created_by = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"{self.user} - {self.get_role_display()}"


class ClientDetails(models.Model):
    STATUS_CHOICES = [
        ("Served", "Served"),
        ("Serving", "Serving"),
        ("Forwarded", "Forwarded"),
        ("Skipped", "Skipped"),
        ("Waiting", "Waiting"),
    ]

    uid = models.UUIDField(default=uuid.uuid4, editable=False, null=True, blank=True)
    client_firstname = models.CharField(max_length=100, blank=True)
    client_lastname = models.CharField(max_length=100, blank=True)
    client_address = models.CharField(max_length=100, blank=True)
    client_org = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="clients",
    )
    client_queue_no = models.PositiveIntegerField(default=1)
    client_lane_type = models.CharField(max_length=100, blank=True, null=True)
    client_contact = models.CharField(max_length=20, null=True)
    client_gender = models.CharField(max_length=10, null=True)
    client_status = models.CharField(
        max_length=100, default="Waiting", choices=STATUS_CHOICES
    )
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"({self.client_firstname} {self.client_lastname})"

    def save(self, *args, **kwargs):
        self.client_firstname = (self.client_firstname or "").title()
        self.client_lastname = (self.client_lastname or "").title()
        
        super(ClientDetails, self).save(*args, **kwargs)

    @staticmethod
    def get_queue_no():
        today = timezone.now()
        start_queue = 1
        last_queue = (
            ClientDetails.objects.filter(date_created__date=today)
            .order_by("client_queue_no")
            .last()
        )
        if last_queue:
            return last_queue.client_queue_no + start_queue
        return start_queue


@receiver(pre_save, sender=ClientDetails)
def set_queue_no(sender, instance, **kwargs):
    if instance._state.adding and (
        not instance.client_queue_no or instance.client_queue_no == 1
    ):
        instance.client_queue_no = ClientDetails.get_queue_no()


class ServicesDetails(models.Model):
    CATEGORY_CHOICES = [
        ("External", "External"),
        ("Internal", "Internal"),
    ]

    CLASSIFICATION_CHOICES = [
        ("Simple", "Simple"),
        ("Complex", "Complex"),
        ("Highly Technical", "Highly Technical"),
    ]

    service_name = models.TextField()
    category = models.CharField(
        max_length=100, choices=CATEGORY_CHOICES, null=True, blank=True
    )
    division = models.CharField(max_length=100, null=True, blank=True)
    unit = models.CharField(max_length=100, null=True, blank=True)
    classification = models.CharField(
        max_length=100, choices=CLASSIFICATION_CHOICES, null=True, blank=True
    )
    type_transaction = models.CharField(max_length=100, null=True, blank=True)
    processing_time = models.DurationField(
        default=timedelta(days=1), null=True, blank=True
    )
    link = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"{self.service_name}"

    def save(self, *args, **kwargs):
        self.service_name = self.service_name.title()
        super(ServicesDetails, self).save(*args, **kwargs)


class TransactionLog(models.Model):
    ACTION_CHOICES = [
        ("Served", "Served"),
        ("Serving", "Serving"),
        ("Forwarded", "Forwarded"),
        ("Skipped", "Skipped"),
    ]

    STATUS_CHOICES = [
        ("Served", "Served"),
        ("Serving", "Serving"),
        ("Forwarded", "Forwarded"),
        ("Skipped", "Skipped"),
        ("Catered", "Catered"),
        ("Waiting", "Waiting"),
    ]

    CSM_CSS_CHOICES = [("CSM", "CSM"), ("CSS", "CSS")]
    YES_NO_CHOICES = [("Yes", "Yes"), ("No", "No")]
    uid = models.UUIDField(default=uuid.uuid4, editable=False, null=True, blank=True)

    client = models.ForeignKey(
        ClientDetails, on_delete=models.CASCADE, related_name="transactions"
    )
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    details = models.TextField(blank=True, null=True)
    transaction_type = models.CharField(max_length=100, blank=True, null=True)

    # ---- Serve: Citizen's Charter / CSM-CSS flow ----
    citizen_charter = models.CharField(
        max_length=3, choices=YES_NO_CHOICES, blank=True, null=True
    )
    service = models.ForeignKey(
        ServicesDetails,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="service",
    )
    has_deficiency = models.CharField(
        max_length=3, choices=YES_NO_CHOICES, blank=True, null=True
    )
    deficiency_details = models.TextField(blank=True, null=True)
    resolved = models.CharField(
        max_length=3, choices=YES_NO_CHOICES, blank=True, null=True
    )
    deficiency_status = models.CharField(max_length=50, blank=True, null=True)

    # ---- Forward ----
    forwarded_division = models.ForeignKey(
        Division, on_delete=models.SET_NULL, null=True, blank=True, related_name="+"
    )
    forwarded_unit = models.ForeignKey(
        Unit, on_delete=models.SET_NULL, null=True, blank=True, related_name="+"
    )
    transaction_status = models.CharField(
        max_length=100, default="Waiting", choices=STATUS_CHOICES
    )
    remarks = models.TextField(blank=True, null=True)
    survey_form = models.CharField(
        max_length=3, choices=CSM_CSS_CHOICES, blank=True, null=True
    )
    pacd_officer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="transaction_logs_as_pacd_officer",
    )

    process_owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="transaction_logs_as_process_owner",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.action} — {self.client} ({self.created_at:%Y-%m-%d %I:%M %p})"
