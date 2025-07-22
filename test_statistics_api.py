import requests
import json

# URL de base du backend
BASE_URL = "http://localhost:8000"

def test_statistics_api():
    """Test de l'API des statistiques"""
    
    # URL de l'API des statistiques
    url = f"{BASE_URL}/api/presences/statistics/"
    
    print(f"Test de l'API : {url}")
    
    try:
        # Test sans authentification (devrait retourner 401)
        response = requests.get(url)
        print(f"Status sans auth: {response.status_code}")
        if response.status_code == 401:
            print("✅ L'API nécessite une authentification (normal)")
        else:
            print(f"❌ Réponse inattendue: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Impossible de se connecter au backend")
        print("Vérifiez que le serveur Django est lancé sur http://localhost:8000")
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    test_statistics_api() 