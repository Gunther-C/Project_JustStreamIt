import requests


class Request:
    def __init__(self, type_url):
        self.newpage = None

        try:
            response = requests.get(f"http://localhost:8000/api/v1/{type_url}", timeout=None)

        except requests.ConnectionError as e:
            print(f"Échec de connexion: {e}")

        else:
            if response.status_code == 200:

                self.newpage = response.content
            else:
                print(f"Erreur statut Url réponse: {response.status_code}")


if __name__ == '__main__':
    print(Request("titles").newpage)
