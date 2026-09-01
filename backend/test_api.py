import unittest
import json
from app import create_app
from seed import seed_database

class HomeServeAPITestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        seed_database()
        cls.app = create_app()
        cls.client = cls.app.test_client()

    def test_01_get_categories(self):
        res = self.client.get("/api/services/categories")
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertIn("categories", data)
        self.assertGreaterEqual(len(data["categories"]), 8)

    def test_02_login_customer(self):
        res = self.client.post("/api/auth/login", json={
            "email": "alex@example.com",
            "password": "customer123"
        })
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertIn("token", data)
        self.assertEqual(data["user"]["role"], "customer")
        self.assertFalse(data["user"]["is_premium"])

    def test_03_login_admin(self):
        res = self.client.post("/api/auth/login", json={
            "email": "admin@homeserve.com",
            "password": "admin123"
        })
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertIn("token", data)
        self.assertEqual(data["user"]["role"], "admin")

    def test_04_search_providers_masked(self):
        # Unauthenticated search should return masked contact info
        res = self.client.get("/api/providers")
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        providers = data["providers"]
        self.assertGreaterEqual(len(providers), 1)
        first_prov = providers[0]
        self.assertIn("*", first_prov["phone"])
        self.assertIn("*", first_prov["email"])

    def test_05_premium_user_unmasked(self):
        # Login as premium user Sarah
        login_res = self.client.post("/api/auth/login", json={
            "email": "sarah@example.com",
            "password": "premium123"
        })
        token = json.loads(login_res.data)["token"]
        
        # Search providers with Sarah's token
        res = self.client.get("/api/providers", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        first_prov = data["providers"][0]
        self.assertTrue(first_prov["is_unlocked"])
        self.assertNotIn("*", first_prov["phone"])

    def test_06_admin_stats(self):
        login_res = self.client.post("/api/auth/login", json={
            "email": "admin@homeserve.com",
            "password": "admin123"
        })
        token = json.loads(login_res.data)["token"]

        res = self.client.get("/api/admin/stats", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertIn("kpis", data)
        self.assertGreaterEqual(data["kpis"]["total_users"], 4)

if __name__ == "__main__":
    unittest.main()
