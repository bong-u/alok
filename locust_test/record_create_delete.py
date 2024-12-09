from locust import HttpUser, task
from datetime import datetime, timedelta
from itertools import count

global_user_index = count(start=1)

class APIUser(HttpUser):
    access_token = None
    task_index = count(start=1)

    def on_start(self):
        """
        사용자 생성 및 로그인
        """
        self.user_index = next(global_user_index)

        print(self.user_index)
        username = f"testuser{self.user_index}"
        password = f"testpassword{self.user_index}"

        self.client.post(
            "/api/users/signup",
            json={"username": username, "password": password, "recaptchaToken": "test"},
        )

        # 로그인 API 호출
        response = self.client.post(
            "/api/users/login",
            json={"username": username, "password": password},
        )
        if response.status_code == 200:
            self.access_token = response.json()["access_token"]
        
    @task
    def create_and_delete_record(self):
        """
        기록 생성 및 삭제 반복
        """
        task_index = next(self.task_index)

        base_date = datetime.strptime("2000-01-01", "%Y-%m-%d")
        record_date = base_date + timedelta(days=task_index)
        record_date_str = record_date.strftime("%Y-%m-%d")
        record_type = "soju"
        amount = 3.5

        # 기록 생성
        self.client.post(
            "/api/records",
            json={"date": record_date_str, "recordType": record_type, "amount": amount},
            headers={"Authorization": f"Bearer {self.access_token}"},
        )

        # 기록 삭제
        delete_response = self.client.delete(
            f"/api/records/{record_date_str}/{record_type}",
            headers={"Authorization": f"Bearer {self.access_token}"},
        )
