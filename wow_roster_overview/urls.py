from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^player/(?P<server>\w+)/(?P<player>\w+)/(?P<required_spec>\w+)$',
        views.manage_player, name='manage_player'),
    url(r'^admin$', views.admin, name='admin'),
    url(r'^admin/(?P<roster_type>\w+)$', views.get_roster, name='get_roster'),
    url(r'^admin/delete/(?P<roster>\w+)/(?P<name>\w+)/(?P<spec>\w+)',
        views.delete_player, name="delete_player")
]
