class Scenario:
    def __init__(self, retries: int, expected_attempts: int):
        self.retries = retries
        self.expected_attempts = expected_attempts


def make_retry_scenario() -> Scenario:
    return Scenario(retries=3, expected_attempts=3)
