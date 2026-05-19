import unittest
import app.models as db

# make sure to be in the root directory of the project to run this test
# python -m unittest app.tests.test_models

class TestModels(unittest.TestCase):
    def test_add_job_site(self):
        # Mock adding a job site
        result = db.addJobSite('Test Project', 'Description', 12.34, 56.78, 100)
        self.assertTrue(result)
    def test_add_user_project_manager(self):
        # Mock adding a job site
        result = db.signup("TestProjectManagerUser", "TestPassword","pm")
        self.assertTrue(result)
    def test_add_user_worker(self):
        # Mock adding a job site
        result = db.signup("TestProjectManagerUser", "TestPassword","1")
        self.assertTrue(result)
    def test_load_user_database(self):
        # Test loading user database
        try:
            db.loadUserDatabase()
            result = True
        except Exception as e:
            result = False
        self.assertTrue(result)



    def test_get_assigned_jobsites(self):
        # Test getting assigned jobsites for a user
        jobsites = db.getAssignedJobsites('test-uuid')
        self.assertIsInstance(jobsites, list)

    def test_get_all_worker_users(self):
        # Test getting all worker users
        workers = db.getAllWorkerUsers()
        self.assertIsInstance(workers, list)

    def test_correct_user(self):
        # Test user authentication
        # First create a user
        db.signup("AuthTestUser", "TestPass123", "worker")
        # Then test authentication
        result = db.correctUser("AuthTestUser", "TestPass123")
        self.assertTrue(result)

    def test_update_user_password(self):
        # Test password update functionality
        # First create a user
        db.signup("PasswordTestUser", "OldPass", "worker")
        # Then update password
        result = db.update_user_password("PasswordTestUser", "NewPass")
        self.assertTrue(result)

    def test_get_assigned_users_for_jobsite(self):
        # Test getting users assigned to a jobsite
        users = db.getAssignedUsersForJobsite('test-jobsite-uuid')
        self.assertIsInstance(users, list)


    def test_get_time_card(self):
        # Test retrieving time card
        time_card = db.get_time_card('test-worker-uuid', '2024-01-01')
        self.assertIsNotNone(time_card)


if __name__ == '__main__':
    unittest.main()