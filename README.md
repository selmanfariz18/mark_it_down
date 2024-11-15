# Mark It Down

Django + React Todo management App

- Can Download each Todo project as markdown file
- Can Upload Todo project to Github Gists

## Setup

The first thing to do is to clone the repository:

```sh
$ git clone https://github.com/selmanfariz18/mark_it_down.git
```

### Django Backend Setup

Create a virtual environment to install dependencies in and activate it:

```sh
$ cd mark_it_down/Backend
$ python3 -m venv venv
$ source venv/bin/activate
```

Then install the dependencies:

```sh
(venv)$ pip install -r requirements.txt
```

Note the `(venv)` in front of the prompt. This indicates that this terminal
session operates in a virtual environment set up by python venv.

Once `pip` has finished downloading the dependencies:

```sh
(venv)$ python manage.py runserver
```

Server will be running on `http://127.0.0.1:8000`.

### React Frontend Setup

```sh
$ cd mark_it_down/Frontend
$ npm install
$ npm run dev
```

## Test

Implemented test codes for Django in

```sh
$ cd Backend/api/tests
```

You can do test by

```sh
$ python manage.py test api.tests
```

(Note: This needs to be done in the directory where the `manage.py` file is located.)
