from app import make_app

application = make_app()

# launch with
# gunicorn -w <nb_of_workers> wsgiapp
