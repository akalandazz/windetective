from celery.result import AsyncResult
from workers.celeryapp import celeryapp
from services.report_generator import generate_report
from resources.mocks import generate_mock_report
from settings import settings
from models import ReportTaskResult
from enums import TaskStatus
from exceptions import CeleryTaskNotFound
import logging

logger = logging.getLogger(__name__)


def get_celery_task_result(task_id: str):
    """
    Retrieve the result of a Celery task by its ID.
    
    Args:
        task_id: The ID of the Celery task
          
    Returns:
        AsyncResult: The task result
    """

    result = AsyncResult(task_id, app=celeryapp)

    # Check if the task ID is not found
    if result.id is None:
        raise CeleryTaskNotFound("Task ID not found")

    if result.state == "PENDING":
        return ReportTaskResult(
            message="Task is pending",
            status=TaskStatus.PENDING,
            result=None
        )
      
    elif result.state == "STARTED":
        return ReportTaskResult(
            message="Task started",
            status=TaskStatus.STARTED,
            result=None
        )
  
    elif result.state == "RETRY":
        return ReportTaskResult(
            message="Task is retrying",
            status=TaskStatus.IN_PROGRESS,
            result=None
        )

    elif result.state == "SUCCESS":
        return ReportTaskResult(
            message="Task completed successfully",
            status=TaskStatus.COMPLETED,
            result=result.get()
        )
      
    elif result.state == "FAILURE":
        return ReportTaskResult(
            message="Task failed",
            status=TaskStatus.FAILED,
            result=None
        )
      
    else:
        return ReportTaskResult(
            message="Task is in progress",
            status=TaskStatus.IN_PROGRESS,
            result=None
        )

@celeryapp.task
def generate_car_report_task(vin: str):
    try:
        # Generate report
        if settings.ai_mock_response:
            report = generate_mock_report(vin)
        else:
            report = generate_report(vin)

        return ReportTaskResult(
            message = "Report Generation Started",
            status = TaskStatus.COMPLETED,
            result = report
        )

    except Exception as e:
        logger.exception("Unexpected error generating report")
        return ReportTaskResult(
            message = "Task submit failed.",
            status = TaskStatus.FAILED
        )