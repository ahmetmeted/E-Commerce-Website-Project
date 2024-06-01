from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from rest_framework_simplejwt.views import TokenVerifyView
from rest_framework.routers import DefaultRouter
from customer.views import CustomerLoginView, CustomerUserRegisterView, CustomerChangePasswordApiView, CustomerChangeInformationApiView, CustomerForgetPasswordApiView, CustomerAddProductToBasketView, CustomerRemoveProductFromBasketView, CustomerDecreaseProductInBasketView, CustomerClearBasketView, SendEmailApiView, GetUserInformationApiView, CustomerResetPasswordApiView
from platform_manager.views import PlatformManagerLoginView, PlatformManagerChangePasswordView, PlatformManagerChangeUserInformationView, PlatformManagerUserRegisterView
from store_owner.views import StoreOwnerLoginView, StoreOwnerUserRegisterView, StoreOwnerChangePasswordView, StoreOwnerChangeUserInformationView, StoreOwnerViewSet
from store.views import StoreViewSet
from shopping_history.views import PurchaseHistoryViewSet
from product.views import ProductViewSet, product_search
from basket.views import BasketViewSet, SendEmailOrderDetails
from product_rate.views import ProductRateViewSet

import os 
from two_factor.urls import urlpatterns as tf_urls

router = DefaultRouter()
router.register(r'users', StoreOwnerViewSet)
router.register(r'store', StoreViewSet)
router.register(r'basket', BasketViewSet)
router.register(r'product', ProductViewSet)
router.register(r'purchase-history', PurchaseHistoryViewSet, basename='purchase-history')
router.register(r'product-rate', ProductRateViewSet)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include(tf_urls)),
    
    ## Api Configs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    ## Customer Process (User)
    path('api/customer/login/', CustomerLoginView.as_view(), name='customer_login'),
    path('api/customer/create/', CustomerUserRegisterView.as_view(), name='customer_register'),
    path('api/customer/change-password/', CustomerChangePasswordApiView.as_view(), name='customer_change_password'),
    path('api/customer/forget-password/', CustomerForgetPasswordApiView.as_view(), name='customer_forget_password'),
    path('api/customer/change-user-info/', CustomerChangeInformationApiView.as_view(), name='customer_change_information'),
    
    ## Platform Manager Process (User)
    path('api/platform-manager/login/', PlatformManagerLoginView.as_view(), name='platform_manager_login'),
    path('api/platform-manager/create/', PlatformManagerUserRegisterView.as_view(), name='platform_manager_register'),
    path('api/platform-manager/change-password/', PlatformManagerChangePasswordView.as_view(), name='platform_manager_change_password'),
    path('api/platform-manager/change-user-info/', PlatformManagerChangeUserInformationView.as_view(), name='platform_manager_change_information'),
    
    ## Store Owner Process (User)
    path('api/store-owner/login/', StoreOwnerLoginView.as_view(), name='store_owner_login'),
    path('api/store-owner/create/', StoreOwnerUserRegisterView.as_view(), name='store_owner_register'),
    path('api/store-owner/change-password/', StoreOwnerChangePasswordView.as_view(), name='store_owner_change_password'),
    path('api/store-owner/change-user-info/', StoreOwnerChangeUserInformationView.as_view(), name='store_owner_change_information'),
    
    ## Customer Basket Process
    path('api/add-to-basket/<int:product_id>/', CustomerAddProductToBasketView.as_view(), name='customer_add_product_to_basket'),
    path('api/remove-from-basket/<int:product_id>/', CustomerRemoveProductFromBasketView.as_view(), name='customer_remove_product_from_basket'),
    path('api/decrease-from-basket/<int:product_id>/', CustomerDecreaseProductInBasketView.as_view(), name='customer_decrease_product_in_basket'),
    path('api/clear-basket/', CustomerClearBasketView.as_view(), name='customer_clear_basket'),
    
    path('api/send-order-details/', SendEmailOrderDetails.as_view(), name='send_order_details'),
    
    path('api/send-email/', SendEmailApiView.as_view(), name='send-email'),
    path('api/product/search/', product_search, name='product_search'),

    path('api/customer/get-user-info/', GetUserInformationApiView.as_view(), name='get_user_info'),

    path('api/customer/reset-password/<int:user_id>/', CustomerResetPasswordApiView.as_view(), name='customer_reset_password'),

    path('api/', include(router.urls)), ## Router Urls
    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG :
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
