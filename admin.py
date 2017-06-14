# -*- coding: utf-8 -*-
from pyramid.response import FileResponse
from pyramid.httpexceptions import HTTPFound
import json
from database import Database


class Player:

    def __init__(self, name, class_name, spec, roster_type):
        self.name = name
        self.class_name = class_name
        self.spec = spec
        self.roster_type = roster_type


class Roster:

    def __init__(self, roster_type):
        self.type = roster_type
        self.players = []

    def add_player(self, player):
        self.players.append(player)


def add_to_roster(player):
    db = Database()
    db.connect()
    db.add_player(player)
    db.disconnect()
    print "added %s" % player.name

def retrieve_roster_players(roster_type):
    db = Database()
    db.connect()
    players = db.get_roster(roster_type)
    db.disconnect()

    roster = Roster(roster_type)
    for p in players:
        player = Player(name=p[0], class_name=p[2], spec=p[1],
                        roster_type=roster_type)
        roster.add_player(player)
    return roster

def get_roster(request):
    roster_type = request.matchdict['roster_type']
    roster = retrieve_roster_players(roster_type)
    resp = {'players': []}
    for p in roster.players:
        resp['players'].append(({
                                'name': p.name,
                                'class': p.class_name,
                                'spec': p.spec
                                }))
    return resp


# -----
# views
# -----

def admin(request):
    print request.method
    if request.method == 'GET':
        return FileResponse('./static/admin.html')
    elif request.method == 'POST':
        name = request.POST.getone('player')
        class_name = request.POST.getone('class')
        spec = request.POST.getone('spec')
        roster_type = request.POST.getone('roster-type')

        player = Player(name, class_name, spec, roster_type)
        print "adding", name
        add_to_roster(player)
        print 'redirecting'
        return HTTPFound('/admin')

def delete_player(request):
    name = request.matchdict['player']
    spec = request.matchdict['spec']
    roster = request.matchdict['roster']
    player = Player(name, None, spec, roster)
    db = Database()
    db.connect()
    db.delete_player(player)
    db.disconnect()
    return FileResponse('./static/admin.html')
