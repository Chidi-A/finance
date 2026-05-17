from typing import Optional
import uuid
from datetime import datetime, timezone
from decimal import Decimal

from pydantic import EmailStr
from sqlalchemy import DateTime, Index, Numeric, UniqueConstraint
from sqlmodel import Field, Relationship, SQLModel


def get_datetime_utc() -> datetime:
    return datetime.now(timezone.utc)


# Shared properties
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=128)



# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  
    )
    account: Optional["Account"] = Relationship(back_populates="owner", cascade_delete=True)


# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: uuid.UUID
    created_at: datetime | None = None



class AccountBase(SQLModel):
    current_balance: Decimal = Field(default=Decimal("0.00"), sa_type=Numeric(12, 2))  
    income: Decimal = Field(default=Decimal("0.00"), sa_type=Numeric(12, 2))  
    expenses: Decimal = Field(default=Decimal("0.00"), sa_type=Numeric(12, 2))  


class AccountCreate(AccountBase):
    pass


class AccountUpdate(SQLModel):
    current_balance: Decimal | None = Field(default=None, sa_type=Numeric(12, 2))  
    income: Decimal | None = Field(default=None, sa_type=Numeric(12, 2))  
    expenses: Decimal | None = Field(default=None, sa_type=Numeric(12, 2))  


class Account(AccountBase, table=True):
    __table_args__ = (UniqueConstraint("owner_id", name="uq_account_owner_id"),)
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    owner: Optional[User] = Relationship(back_populates="account")
    categories: list["Category"] = Relationship(back_populates="account", cascade_delete=True)
    transactions: list["Transaction"] = Relationship(back_populates="account", cascade_delete=True)
    budgets: list["Budget"] = Relationship(back_populates="account", cascade_delete=True)
    pots: list["Pot"] = Relationship(back_populates="account", cascade_delete=True)


class AccountPublic(AccountBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    created_at: datetime | None = None


class CategoryBase(SQLModel):
    name: str = Field(min_length=1, max_length=255)

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(SQLModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)

class Category(CategoryBase, table=True):
    __table_args__ = (
        UniqueConstraint("account_id", "name", name="uq_category_account_id_name"),
    )
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    account_id: uuid.UUID = Field(
        foreign_key="account.id", nullable=False, ondelete="CASCADE"
    )
    account: Optional["Account"] = Relationship(back_populates="categories")
    transactions: list["Transaction"] = Relationship(back_populates="category", cascade_delete=False)
    budgets: list["Budget"] = Relationship(back_populates="category", cascade_delete=False)


class CategoryPublic(CategoryBase):
    id: uuid.UUID
    account_id: uuid.UUID
    created_at: datetime | None = None


class TransactionBase(SQLModel):
    counterparty_name: str = Field(min_length=1, max_length=255)
    avatar_url: str | None = Field(default=None, max_length=1024)
    posted_at: datetime = Field(sa_type=DateTime(timezone=True))  
    amount: Decimal = Field(sa_type=Numeric(12, 2))  
    is_recurring: bool = False



class Transaction(TransactionBase, table=True):
    __table_args__ = (
        Index("ix_transaction_account_posted_at", "account_id", "posted_at"),
    )
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    account_id: uuid.UUID = Field(
        foreign_key="account.id", nullable=False, ondelete="CASCADE"
    )
    account: Optional[Account] = Relationship(back_populates="transactions")
    category_id: uuid.UUID = Field(
        foreign_key="category.id", nullable=False, ondelete="RESTRICT"
    )
    category: Optional["Category"] = Relationship(back_populates="transactions")

class TransactionPublic(TransactionBase):
    id: uuid.UUID
    account_id: uuid.UUID
    category_id: uuid.UUID
    created_at: datetime | None = None

class BudgetBase(SQLModel):
    maximum: Decimal = Field(sa_type=Numeric(12, 2))  # type: ignore[arg-type]
    theme: str = Field(min_length=4, max_length=32)  # store "#RRGGBB" etc.

class BudgetCreate(BudgetBase):
    category_id: uuid.UUID

class BudgetUpdate(SQLModel):
    maximum: Decimal | None = Field(default=None, sa_type=Numeric(12, 2))  # type: ignore[arg-type]
    theme: str | None = Field(default=None, min_length=4, max_length=32)
    category_id: uuid.UUID | None = None

class Budget(BudgetBase, table=True):
    __table_args__ = (
        UniqueConstraint("account_id", "category_id", name="uq_budget_account_id_category_id"),
    )
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    account_id: uuid.UUID = Field(
        foreign_key="account.id", nullable=False, ondelete="CASCADE"
    )
    account: Optional["Account"] = Relationship(back_populates="budgets")
    category_id: uuid.UUID = Field(
        foreign_key="category.id", nullable=False, ondelete="RESTRICT"
    )
    category: Optional["Category"] = Relationship(back_populates="budgets")

class BudgetPublic(BudgetBase):
    id: uuid.UUID
    account_id: uuid.UUID
    category_id: uuid.UUID
    created_at: datetime | None = None

class PotBase(SQLModel):
    name: str = Field(min_length=1, max_length=255)
    target: Decimal = Field(sa_type=Numeric(12, 2))  
    total: Decimal = Field(default=Decimal("0.00"), sa_type=Numeric(12, 2))  
    theme: str = Field(min_length=4, max_length=32)

class PotCreate(PotBase):
    pass

class PotUpdate(SQLModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    target: Decimal | None = Field(default=None, sa_type=Numeric(12, 2))  
    total: Decimal | None = Field(default=None, sa_type=Numeric(12, 2))  
    theme: str | None = Field(default=None, min_length=4, max_length=32)

class Pot(PotBase, table=True):
    __table_args__ = (
        UniqueConstraint("account_id", "name", name="uq_pot_account_id_name"),
    )
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  
    )
    account_id: uuid.UUID = Field(
        foreign_key="account.id", nullable=False, ondelete="CASCADE"
    )
    account: Optional["Account"] = Relationship(back_populates="pots")

class PotPublic(PotBase):
    id: uuid.UUID
    account_id: uuid.UUID
    created_at: datetime | None = None


# Generic message
class Message(SQLModel):
    message: str


# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: str | None = None


