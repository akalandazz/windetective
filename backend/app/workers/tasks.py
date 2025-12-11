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
        raise CeleryTaskNotFound(f"Task ID '{task_id}' not found")

    if result.state == "PENDING":
        return ReportTaskResult(
            message=f"Task '{task_id}' is pending in the queue",
            status=TaskStatus.PENDING
        )

    elif result.state == "SUCCESS":
        return ReportTaskResult(
            message=f"Task '{task_id}' completed successfully",
            status=TaskStatus.COMPLETED,
            result=result.get()
        )
      
    elif result.state == "FAILURE":
        exc_info = result.result if result.result else "No info"
        return ReportTaskResult(
            message=f"Task '{task_id}' failed: {exc_info}",
            status=TaskStatus.FAILED
        )
      
    else:
        return ReportTaskResult(
            message=f"[Task '{task_id}' is in progress (state: {result.state})",
            status=TaskStatus.IN_PROGRESS
        )

@celeryapp.task
def generate_car_report_task(vin: str):
    if settings.ai_mock_response:
        report = generate_mock_report(vin)
    else:
        report = generate_report(vin)
        
    logger.info(f"Report content: {report}")
    
    task_result = ReportTaskResult(
        message = "Report Finished",
        status = TaskStatus.COMPLETED,
        result = report
    )
    
    return task_result.model_dump(mode="json")