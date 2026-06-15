from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import Item
from database import get_db
from schemas import ItemCreate, ItemOut, ItemUpdate
from auth import get_current_facility

router = APIRouter(prefix="/items", tags=["items"])


@router.get("", response_model=list[ItemOut])
def list_items(
    db: Session = Depends(get_db),
    current_facility: dict = Depends(get_current_facility),
):
    return (
        db.query(Item)
        .filter(Item.facility_id == current_facility["id"])
        .order_by(Item.name)
        .all()
    )


@router.post("", response_model=ItemOut, status_code=201)
def create_item(
    payload: ItemCreate,
    db: Session = Depends(get_db),
    current_facility: dict = Depends(get_current_facility),
):
    existing = (
        db.query(Item)
        .filter(
            Item.barcode == payload.barcode,
            Item.facility_id == current_facility["id"],
        )
        .first()
    )

    if existing:
        raise HTTPException(status_code=400, detail="Barcode already exists")

    item = Item(
        **payload.model_dump(),
        facility_id=current_facility["id"],
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    return item


@router.put("/{item_id}", response_model=ItemOut)
def update_item(
    item_id: int,
    payload: ItemUpdate,
    db: Session = Depends(get_db),
    current_facility: dict = Depends(get_current_facility),
):
    item = (
        db.query(Item)
        .filter(
            Item.id == item_id,
            Item.facility_id == current_facility["id"],
        )
        .first()
    )

    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    updates = payload.model_dump(exclude_unset=True)

    if "barcode" in updates:
        duplicate = (
            db.query(Item)
            .filter(
                Item.barcode == updates["barcode"],
                Item.id != item_id,
                Item.facility_id == current_facility["id"],
            )
            .first()
        )

        if duplicate:
            raise HTTPException(status_code=400, detail="Barcode already exists")

    for key, value in updates.items():
        setattr(item, key, value)

    db.commit()
    db.refresh(item)

    return item


@router.delete("/{item_id}")
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_facility: dict = Depends(get_current_facility),
):
    item = (
        db.query(Item)
        .filter(
            Item.id == item_id,
            Item.facility_id == current_facility["id"],
        )
        .first()
    )

    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    db.delete(item)
    db.commit()

    return {"ok": True}