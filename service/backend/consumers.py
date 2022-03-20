import json
from typing import Dict, Any

from channels.consumer import AsyncConsumer
from channels.generic.websocket import AsyncWebsocketConsumer
from django.db.models import QuerySet
from asgiref.sync import sync_to_async
from asgiref.sync import async_to_sync
from rest_framework.generics import get_object_or_404
from rest_framework import status
from djangochannelsrestframework.decorators import action
from djangochannelsrestframework.generics import GenericAsyncAPIConsumer
from djangochannelsrestframework.observer import model_observer
from djangochannelsrestframework.permissions import IsAuthenticated, AllowAny

from .models import CoinFlip, CustomUser, Item, Digit
from .serializers import CoinFlipSerializer, UserRetrieveSerializer, ItemSerializer, DigitSerializer


class IsAuthenticatedForWrite(IsAuthenticated):
    async def has_permission(
            self, scope: Dict[str, Any],
            consumer: AsyncConsumer,
            action: str,
            **kwargs
    ) -> bool:
        """
        This method will permit un-authenticated requests
         for non descrutive actions only.
        """
        if action in ('list', 'retrieve'):
            return True
        return await super().has_permission(
            scope,
            consumer,
            action,
            **kwargs
        )

class ItemConsumer(GenericAsyncAPIConsumer):

    queryset = CoinFlip.objects.all()
    serializer_class = CoinFlipSerializer
    permission_classes = (IsAuthenticatedForWrite,)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.group_name = 'pool'
        self.request_id = None
        self.action = None

    def get_object(self, pk):
        return get_object_or_404(self.queryset, pk=pk)

    def filter_queryset(self, queryset):
        return queryset.filter(is_active=True).order_by('-pk')
        
    @sync_to_async
    def create(self, data, **kwargs):
        serializer = self.get_serializer(data=data['data'], action_kwargs=kwargs)
        serializer.is_valid(raise_exception=True)
        try:
            serializer.save()
            return async_to_sync(self.send_coinflip_group(serializer.data, 'create'))
        except:
            return async_to_sync(self.retrieve_coinflip({"Error":400}))

    @sync_to_async
    def patch(self, data, **kwargs):
        instance = self.get_object(pk=data['pk'], **kwargs)
        serializer = self.get_serializer(
            instance=instance, data=data['data'], action_kwargs=kwargs, partial=True
        )
        serializer.is_valid()
        serializer.save()
        if getattr(instance, "_prefetched_objects_cache", None):
            instance._prefetched_objects_cache = {}
        return async_to_sync(self.send_coinflip_group(serializer.data, 'patch'))

    @sync_to_async
    def list(self, **kwargs):
        queryset = self.filter_queryset(self.get_queryset(**kwargs), **kwargs)
        serializer = self.get_serializer(
            instance=queryset, many=True, action_kwargs=kwargs
        )
        return async_to_sync(self.send_coinflips(serializer.data, 'list'))

    @sync_to_async
    def retrieve(self, data, **kwargs):
        instance = self.get_object(pk=data['pk'])
        serializer = self.get_serializer(instance=instance, action_kwargs=kwargs)
        return async_to_sync(self.retrieve_coinflip(serializer.data))

    @sync_to_async
    def delete(self, data ,**kwargs):
        instance = self.get_object(pk=data['pk'])
        current_user = self.scope.get('user')

        if current_user.pk == instance.player_1.pk:
            item = Item.objects.get(pk=instance.item_1)
            current_user.items.add(item)
            self.perform_delete(instance, **kwargs)
            return async_to_sync(self.send_coinflip_group({"deleted":data['pk']}, 'delete'))
        else:
            return async_to_sync(self.send_coinflips({"error":status.HTTP_400_BAD_REQUEST}, 'delete'))

    def perform_delete(self, instance, **kwargs):
        instance.delete()

    commands = {
        'create': create,
        'patch': patch,
        'list':list,
        'retrieve':retrieve,
        'delete':delete,
    }

    async def connect(self):
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        self.request_id = data['request_id']
        self.action = data['action']
        if data['action'] in ['list']:
            await self.commands[data['action']](self)
        else:
            await self.commands[data['action']](self, data)

    def get_user_info(self, pk):
        user = CustomUser.objects.get(pk=pk)
        serializer = UserRetrieveSerializer(user)
        return {
            'profileName' : serializer.data['username'],
            'avatar' : serializer.data['avatar'],
            'avatar_url': serializer.data['avatar_url']
        }
    
    def get_item_info(self, pk):
        item = Item.objects.get(pk=pk)
        serializer = ItemSerializer(item)
        return {
            'gunName' : serializer.data['title'],
            'gunImage' : serializer.data['image'],
            'gunPrice' : serializer.data['price'],
            'gunTag': serializer.data['tag']
        }

    def create_user_info(self, data):
        try:
            data.update({'user_1' : self.get_user_info(data['player_1'])})
            data['user_1'].update(self.get_item_info(data['item_1']))
            if data['player_2']:
                data.update({'user_2' : self.get_user_info(data['player_2'])})
                data['user_2'].update(self.get_item_info(data['item_2']))
            return data
        except:
            return data

    def send_coinflips(self, data, action=None):
        bank = 0
        for coinflip in self.queryset.filter(is_active=False):
            item = Item.objects.get(pk=coinflip.item_1)
            bank += round(float(item.price)*0.9)
        if action != 'delete':
            res = json.loads(json.dumps(data))
            data = []
            for i in res:
                data.append(self.create_user_info(i))
        async_to_sync(self.send)(text_data=json.dumps({
                'data': data,
                'request_id':self.request_id,
                'action':self.action,
                'coinflips': self.queryset.count(),
                'bank': bank
            }))

    def retrieve_coinflip(self, data):
        data = self.create_user_info(data)
        async_to_sync(self.send)(text_data=json.dumps({
                'data': data,
                'request_id':self.request_id,
                'action':self.action
            }))

    def send_coinflip_group(self, data, action=None):
        data = self.create_user_info(data)
        async_to_sync(self.channel_layer.group_send)(
            self.group_name,
            {
                'type': 'send_coinflip',
                'data': data,
                'action':action
            }
        )

    async def send_coinflip(self, event):
        data = event['data']
        await self.send(text_data=json.dumps({
            'data': data,
            'request_id':self.request_id,
            'action':event['action']
        }))


class DigitsConsumers(ItemConsumer):
    
    queryset = Digit.objects.all()
    serializer_class = DigitSerializer
    permission_classes = (IsAuthenticatedForWrite,)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.group_name = 'digit'
        self.request_id = None
        self.action = None

    def send_coinflips(self, data, action=None):
        bank = 0
        for coinflip in self.queryset.filter(is_active=False):
            item = Item.objects.get(pk=coinflip.item_1)
            bank += round(float(item.price)*0.9)
        if action != 'delete':
            res = json.loads(json.dumps(data))
            data = []
            for i in res:
                data.append(self.create_user_info(i))
        async_to_sync(self.send)(text_data=json.dumps({
                'data': data,
                'request_id':self.request_id,
                'action':self.action,
                'digits': self.queryset.count(),
                'bank': bank
            }))
