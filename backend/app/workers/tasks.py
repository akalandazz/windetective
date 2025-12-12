from celery.result import AsyncResult
from workers.celeryapp import celeryapp
from services.report_generator import generate_report
from resources.mocks import generate_mock_report
from settings import settings
from models import ReportTaskResult, ReportResponse
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
        ReportTaskResult: The task result
    """
    logger.info(f"Checking status for task ID: {task_id}")
    result = AsyncResult(task_id, app=celeryapp)
    logger.info(f"Task state: {result.state}, result: {result.result}")

    # Check if the task exists in the backend
    # Note: Newly created tasks will be in PENDING state with no info
    # This is normal and should not be treated as "not found"
    # Only raise CeleryTaskNotFound if the task result is None or invalid
    if result.result is None and not result.state:
        # This indicates a truly invalid task ID
        raise CeleryTaskNotFound(f"Task ID '{task_id}' not found")

    if result.state == "PENDING":
        return ReportTaskResult(
            message=f"Task '{task_id}' is pending in the queue",
            status=TaskStatus.PENDING
        )

    elif result.state == "SUCCESS":
        # Get the raw result dict and reconstruct the Pydantic model
        raw_result = result.get()
        report = ReportResponse.model_validate(raw_result)
        return ReportTaskResult(
            message=f"Task '{task_id}' completed successfully",
            status=TaskStatus.COMPLETED,
            result=report
        )
      
    elif result.state == "FAILURE":
        exc_info = result.result if result.result else "No info"
        return ReportTaskResult(
            message=f"Task '{task_id}' failed: {exc_info}",
            status=TaskStatus.FAILED
        )
      
    else:
        return ReportTaskResult(
            message=f"Task '{task_id}' is in progress (state: {result.state})",
            status=TaskStatus.IN_PROGRESS
        )

@celeryapp.task
def generate_car_report_task(vin: str):
    if settings.ai_mock_response:
        report = generate_mock_report(vin)
    else:
        report = generate_report(vin)
        
    logger.info(f"Report content: {report}")
    
    # Serialize the Pydantic model to a JSON-compatible dict
    return report.model_dump(mode="json")