import logging
from fastapi import APIRouter, HTTPException


from services.vin_validator import validate_vin
from models import ReportRequest, CeleryTask, ReportTaskResult
from workers.tasks import generate_car_report_task, get_celery_task_result
from exceptions import CeleryTaskNotFound



logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/generate", response_model=CeleryTask, tags=["report"])
def generate_car_report(request: ReportRequest):

    # --- 1. Validate VIN ---
    if not validate_vin(request.vin):
        raise HTTPException(status_code=400, detail="Invalid VIN format")

    task = generate_car_report_task.delay(request.vin)

    return CeleryTask(id = task.id)


@router.get("/result/{task_id}", response_model=ReportTaskResult, tags=["report"])
def get_task_result(task_id: str):
    """
    Get the result of a Celery task by ID.
    
    Args:
        task_id: The ID of the Celery task
         
    Returns:
        ReportTaskResult: The task result with status and data
         
    Raises:
        HTTPException: If task is not found
    """
    try:
        return get_celery_task_result(task_id)
    except CeleryTaskNotFound:
        raise HTTPException(status_code=404, detail="Task ID not found")
