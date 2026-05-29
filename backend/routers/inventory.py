from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Alert, Item, Transaction
from schemas import StockAction, TransactionOut

router = APIRouter(prefix="/inventory", tags=["inventory"])

def transaction_to_out(tx: Transaction) -> TransactionOut:
    return TransactionOut(
        id=tx.id,
        item_id=tx.item_id,
        item_name=tx.item.name,
        action=tx.action,
        quantity=tx.quantity,
        new_quantity=tx.new_quantity,
        note=tx.note,
        created_at=tx.created_at,
    )

def maybe_create_low_stock_alert(db: Session, item: Item):
    if item.quantity <= item.reorder_level:
        message = f"Low stock: {item.name} has {item.quantity} remaining. Reorder level is {item.reorder_level}."
        db.add(Alert(item_id=item.id, message=message))

@router.post("/check-in", response_model=TransactionOut)
def check_in(payload: StockAction, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.barcode == payload.barcode).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    item.quantity += payload.quantity
    tx = Transaction(item_id=item.id, action="check_in", quantity=payload.quantity, new_quantity=item.quantity, note=payload.note)
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return transaction_to_out(tx)

@router.post("/check-out", response_model=TransactionOut)
def check_out(payload: StockAction, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.barcode == payload.barcode).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if item.quantity < payload.quantity:
        raise HTTPException(status_code=400, detail=f"Not enough stock. Available: {item.quantity}")

    item.quantity -= payload.quantity
    tx = Transaction(item_id=item.id, action="check_out", quantity=payload.quantity, new_quantity=item.quantity, note=payload.note)
    db.add(tx)
    maybe_create_low_stock_alert(db, item)
    db.commit()
    db.refresh(tx)
    return transaction_to_out(tx)

@router.get("/activity", response_model=list[TransactionOut])
def activity(db: Session = Depends(get_db)):
    txs = db.query(Transaction).order_by(Transaction.created_at.desc()).limit(50).all()
    return [transaction_to_out(tx) for tx in txs]
