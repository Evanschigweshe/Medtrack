from datetime import datetime, date
from pydantic import BaseModel, Field, field_validator

class ItemBase(BaseModel):
    name: str
    category: str = Field(pattern="^(Medicine|Vaccine|Test Kit|Supply)$")
    barcode: str
    quantity: int = 0
    expiry: date | None = None
    reorder_level: int = 5
    
    @field_validator("expiry")
    @classmethod
    def validate_expiry(cls, value):
        if value is None:
            return value

        current_year = date.today().year

        if value.year < current_year:
            raise ValueError(f"Expiry year cannot be earlier than {current_year}")

        if value.year > current_year + 20:
            raise ValueError("Expiry year appears invalid")

        return value

class ItemCreate(ItemBase):
    pass

class ItemUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    barcode: str | None = None
    quantity: int | None = None
    expiry: date | None = None
    reorder_level: int | None = None
    
    @field_validator("expiry")
    @classmethod
    def validate_expiry(cls, value):
        if value is None:
            return value

        current_year = date.today().year

        if value.year < current_year:
            raise ValueError(f"Expiry year cannot be earlier than {current_year}")

        if value.year > current_year + 20:
            raise ValueError("Expiry year appears invalid")

        return value

class ItemOut(ItemBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class StockAction(BaseModel):
    barcode: str
    quantity: int = Field(gt=0)
    note: str | None = None

class TransactionOut(BaseModel):
    id: int
    item_id: int
    item_name: str
    action: str
    quantity: int
    new_quantity: int
    note: str | None
    created_at: datetime

class AlertOut(BaseModel):
    id: int
    item_id: int
    message: str
    created_at: datetime
