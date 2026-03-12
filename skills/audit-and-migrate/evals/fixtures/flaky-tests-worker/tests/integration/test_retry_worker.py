import time

from retry_worker import RetryWorker
from tests.helpers.scenario_factory import Scenario, make_retry_scenario


def test_retry_worker_waits_between_attempts():
    scenario = make_retry_scenario()
    worker = RetryWorker(clock=time)

    started = time.time()
    result = worker.run(max_attempts=scenario.retries)
    elapsed = time.time() - started

    assert result == scenario.expected_attempts
    assert elapsed >= 0.6


def test_inline_scenario_shape():
    scenario = Scenario(retries=2, expected_attempts=2)
    assert scenario.expected_attempts == 2
