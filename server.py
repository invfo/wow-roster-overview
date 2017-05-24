from wsgiref.simple_server import make_server
from pyramid.config import Configurator
from pyramid.response import Response

import requests

# get yours at https://dev.battle.net
KEY = ''

def manage_player(request):

    server = request.matchdict['server']
    player = request.matchdict['player']

    # send request to Blizzard server
    url = 'https://eu.api.battle.net/wow/character/%s/%s' \
            '?fields=items&locale=en_GB&apikey=%s' \
            % (server, player, KEY)

    r = requests.get(url)

    return Response('%s' % r.json())


if __name__ == '__main__':
    config = Configurator()

    config.add_route('player', '/player/{server}/{player}')
    config.add_view(manage_player, route_name='player')

    config.add_static_view(name='/', path='./static')

    app = config.make_wsgi_app()
    server = make_server('0.0.0.0', 8080, app)
    server.serve_forever()
