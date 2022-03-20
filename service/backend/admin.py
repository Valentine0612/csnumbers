from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.forms import TextInput, Textarea, CharField
from django import forms
from django.db import models
from .models import CustomUser, Transaction, Item, Tag, CoinFlip, Digit, Output, Referal


class UserAdminConfig(UserAdmin):
    model = CustomUser
    search_fields = ('username',)
    list_filter = ('username',)
    ordering = ('-start_date',)
    list_display = ('username', 'code', 'steam_uid',
                    'is_banned', 'is_email_confirmed',)
    readonly_fields = ('steam_uid', 'code', 'coinflips', 'digits')
    fieldsets = (
        (None, {'fields': ('email', 'username', 'steam_uid', 'steam_link',
                           'code', 'avatar', 'avatar_url', 'items','steam_item', 'coinflips', 'digits')}),
        ('Permissions', {'fields': ('is_active',
                                    'is_email_confirmed', 'is_banned', 'is_winner')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'steam_link', 'password1',
                       'password2', 'is_active', 'is_email_confirmed', 'avatar')}
         ),
    )


class TransAdminConfig(admin.ModelAdmin):
    model = Transaction
    list_display = ('user', 'amount', 'info')
    ordering = ('-created_at',)


class ItemAdminConfig(admin.ModelAdmin):
    model = Item
    list_display = ('title', 'price', 'image', 'tag')


class OutputAdminConfig(admin.ModelAdmin):
    model = Output
    list_display = ('user', 'amount', 'is_active')


admin.site.register(CustomUser, UserAdminConfig)
admin.site.register(Transaction, TransAdminConfig)
admin.site.register(Item, ItemAdminConfig)
admin.site.register(Tag)
admin.site.register(CoinFlip)
admin.site.register(Digit)
admin.site.register(Referal)
admin.site.register(Output, OutputAdminConfig)
