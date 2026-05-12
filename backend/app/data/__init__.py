import json
import pathlib
from datetime import datetime
from decimal import Decimal

from sqlmodel import Session

from app.models import Account, Budget, Category, Pot, Transaction, User

DATA_PATH = pathlib.Path(__file__).parent / "seed_data.json"

with _DATA_PATH.open() as _f:
    DEFAULT_SEED_DATA: dict = json.load(_f)


def seed_user_data(session: Session, user: User, data: dict) -> None:
    """
    Creates an Account with balance data, then seeds Categories, Transactions,
    Budgets, and Pots from *data* for the given user.

    Uses flush() so child rows can reference parent IDs within the same
    transaction. The caller is responsible for the final commit/rollback.
    """
    # ── 1. Account ────────────────────────────────────────────────────────────
    balance = data["balance"]
    account = Account(
        owner_id=user.id,
        current_balance=Decimal(str(balance["current"])),
        income=Decimal(str(balance["income"])),
        expenses=Decimal(str(balance["expenses"])),
    )
    session.add(account)
    session.flush()  # account.id is now available

    # ── 2. Categories ─────────────────────────────────────────────────────────
    # Collect unique names from both transactions and budgets
    category_names: set[str] = {tx["category"] for tx in data["transactions"]}
    category_names |= {b["category"] for b in data["budgets"]}
    category_map: dict[str, Category] = {}
    for name in category_names:
        cat = Category(account_id=account.id, name=name)
        session.add(cat)
        category_map[name] = cat
    session.flush()  # category IDs are now available


    # ── 3. Transactions ───────────────────────────────────────────────────────
    for tx in data["transactions"]:
        # fromisoformat in Python <=3.10 doesn't handle trailing "Z"
        posted_at = datetime.fromisoformat(tx["date"].replace("Z", "+00:00"))
        session.add(
            Transaction(
                account_id=account.id,
                category_id=category_map[tx["category"]].id,
                counterparty_name=tx["name"],
                avatar_url=tx["avatar"],
                posted_at=posted_at,
                amount=Decimal(str(tx["amount"])),
                is_recurring=tx["recurring"],
            )
        )
    # ── 4. Budgets ────────────────────────────────────────────────────────────
    for b in data["budgets"]:
        session.add(
            Budget(
                account_id=account.id,
                category_id=category_map[b["category"]].id,
                maximum=Decimal(str(b["maximum"])),
                theme=b["theme"],
            )
        )
    # ── 5. Pots ───────────────────────────────────────────────────────────────
    for p in data["pots"]:
        session.add(
            Pot(
                account_id=account.id,
                name=p["name"],
                target=Decimal(str(p["target"])),
                total=Decimal(str(p["total"])),
                theme=p["theme"],
            )
        )




    