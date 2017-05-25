from pyramid.config import Configurator
from pyramid.response import Response

from pyramid.view import view_config

import requests

# get yours at https://dev.battle.net
KEY = ''


def get_active_spec(server, player, key):
    url = 'https://eu.api.battle.net/wow/character/' \
            '%s/%s?fields=talents&locale=en_GB&apikey=%s' \
            % (server, player, key)
    r = requests.get(url)
    talent_info = r.json()['talents']
    for e in talent_info:
        if 'spec' in e:
            if e.get('selected', None):
                return e['spec']['name']


def manage_player(request):

    server = request.matchdict['server']
    player = request.matchdict['player']
    required_spec = request.matchdict['spec']

    # send request to Blizzard server
    url = 'https://eu.api.battle.net/wow/character/%s/%s' \
            '?fields=items&locale=en_GB&apikey=%s' \
            % (server, player, KEY)

    r = requests.get(url)
    active_spec = get_active_spec(server, player, KEY)
    return r.json()

def make_app():
    config = Configurator()

    config.add_route('player', '/player/{server}/{player}/{spec}')
    config.add_view(manage_player, route_name='player', renderer='json')

    config.add_static_view(name='/', path='./static')

    app = config.make_wsgi_app()
    return app
