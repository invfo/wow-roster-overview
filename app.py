from pyramid.config import Configurator
from pyramid.response import Response

from pyramid.view import view_config

import requests

# get yours at https://dev.battle.net
KEY = ''

#@view_config(route_name='player')
def manage_player(request):

    server = request.matchdict['server']
    player = request.matchdict['player']

    # send request to Blizzard server
    url = 'https://eu.api.battle.net/wow/character/%s/%s' \
            '?fields=items&locale=en_GB&apikey=%s' \
            % (server, player, KEY)

    r = requests.get(url)

    return r.json()

def make_app():
    config = Configurator()

    config.add_route('player', '/player/{server}/{player}')
    config.add_view(manage_player, route_name='player', renderer='json')

    config.add_static_view(name='/', path='./static')

    app = config.make_wsgi_app()
    return app
