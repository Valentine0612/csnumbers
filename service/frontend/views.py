from django.shortcuts import render


def index(reques, *args, **kwargs):
    return render(reques, './index.production.html')
