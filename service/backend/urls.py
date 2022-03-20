from django.urls import path
from .views import *

urlpatterns = [
    # URLS for balance
    path('topup/', TopUpView.as_view(), name="Top_up_an_account"),
    path('free_kassa/', FreeKassaRedirectView.as_view()),
    path('balance/', UserBalanceView.as_view({'get':'list'}), name="user_balance"),
    path('balance/<int:pk>/change/', AdminChangeBalance.as_view(), name="admin_change_balance_url"),
    # User's URLS for manage account
    path('create/', UserCreate.as_view(), name="create_user"),
    path('current_user/', CurrentUser.as_view()),
    path('users/', UserListView.as_view({'get': 'list'})),
    path('users/<int:pk>/', UserListView.as_view({'get': 'retrieve'})),
    path('user_info/<int:pk>/', UserInfoView.as_view(), name='get_user_info'),
    path('user/<int:pk>/update/', UserListView.as_view({'post': 'update'})),
    path('users/<int:pk>/update/', UserUpdateView.as_view()),
    path('activate/', ActivateEmail.as_view(), name='activate'),
    # STEAM URLS for LogIn
    path('steam/login/', Login.as_view()),
    path('steam/callback/', SteamUserLogin.as_view(), name='callback'),
    # Admin URLS for Magazine
    path('item/create/', CreateItem.as_view(), name='create_item'),
    path('item/<int:pk>/action/', DetailItem.as_view(), name='update_item'),
    path('tag/create/', CreateTag.as_view(), name='create_tag'),
    # URLs for Magazine
    path('item/<int:pk>/', ItemRetrieveView.as_view(), name='retrieve_item'),
    path('item/<int:pk>/buy/', BuyItem.as_view()),
    path('item/<int:pk>/sell/', SellItem.as_view()),
    path('items/', ItemListView.as_view()),
    path('shop/', AllItemListView.as_view()),
    path('tags/', AllTagListView.as_view()),
    # URL for ban_list
    path('banlist/', BanListView.as_view()),
    # URL for manage Outputs model
    path('output/', OutputListCreateView.as_view()),
    path('output/<int:pk>/', OutputRetrieveDestroyView.as_view()),
    # URL for Admin manage Outputs model
    path('outputs/', AdminOutputListView.as_view()),
    path('outputs/<int:pk>/', AdminOutputUpdateView.as_view()),
    # URL for create Steam item output
    path('output/item/<int:pk>/', SteamOutputItemView.as_view()),
    path('output/item/', SteamItemListView.as_view()),
    # URL for Admin manage Steam Item outputs
    path('outputs/item/', AdminSteamItemOutput.as_view()),
    path('outputs/item/<str:username>/<int:pk>/', AdminSteamItemOutputDeleteView.as_view()),
    # URL for Referal System
    path('referal/', ReferalCreateView.as_view()),
    #URL for Feedback
    path('feedback/', FeedbackView.as_view()),
]
