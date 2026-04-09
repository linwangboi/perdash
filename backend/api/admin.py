from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Task


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = [
        "email",
        "first_name",
        "last_name",
        "is_verified",
        "is_staff",
        "date_joined",
    ]
    list_filter = ["is_verified", "is_staff", "is_superuser", "date_joined"]
    search_fields = ["email", "first_name", "last_name"]
    ordering = ["-date_joined"]

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("first_name", "last_name")}),
        ("Status", {"fields": ("is_verified",)}),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "password1",
                    "password2",
                    "first_name",
                    "last_name",
                ),
            },
        ),
    )


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ["title", "created_by", "created_at", "updated_at"]
    list_filter = ["created_at", "updated_at"]
    search_fields = ["title", "content"]
    ordering = ["-created_at"]
