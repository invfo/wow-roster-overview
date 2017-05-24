from wsgiref.simple_server import make_server
from app import make_app


application = make_app()
server = make_server('0.0.0.0', 8000, application)
server.serve_forever()
