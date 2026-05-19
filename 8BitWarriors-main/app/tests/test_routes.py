import unittest
from app import create_app  # Assuming you have a factory function to create the app

# python -m unittest app.tests.test_routes

class TestRoutes(unittest.TestCase):
    def setUp(self):
        self.app = create_app().test_client()
        self.app.testing = True

    def simulate_user_session(self, user_type, uuid="test_uuid", username="test_user"):
        """Helper function to simulate a user session."""
        with self.app.session_transaction() as session:
            session['user'] = {
                'UUID': uuid,
                'username': username,
                'type': user_type
            }

    def test_pm_landing_page(self):
        self.simulate_user_session(user_type="pm")
        response = self.app.get('/pmLandingPage')
        self.assertEqual(response.status_code, 200)

    def test_worker_main_page(self):
        self.simulate_user_session(user_type="worker")
        response = self.app.get('/workerMainPage')
        self.assertEqual(response.status_code, 200)

    def test_worker_profile(self):
        self.simulate_user_session(user_type="worker")
        response = self.app.get('/workerProfile')
        self.assertEqual(response.status_code, 200)

    def test_pm_help_page(self):
        self.simulate_user_session(user_type="pm")
        response = self.app.get('/pmhelp')
        self.assertEqual(response.status_code, 200)

    def test_worker_help_page(self):
        self.simulate_user_session(user_type="worker")
        response = self.app.get('/workerhelp')
        self.assertEqual(response.status_code, 200)

    def test_logout_button_clicked(self):
        self.simulate_user_session(user_type="worker")
        response = self.app.post('/logoutButtonClicked', follow_redirects=True)
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Login', response.data)  # Check if the login page is displayed

if __name__ == '__main__':
    unittest.main()