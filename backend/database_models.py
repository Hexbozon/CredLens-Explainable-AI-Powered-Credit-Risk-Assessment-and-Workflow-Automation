
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from utils.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True
    )
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    password_hash: Mapped[str] = mapped_column(
        Text, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )

    applications: Mapped[list["Application"]] = relationship(
        back_populates="user"
    )


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True
    )
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    loan_amount: Mapped[float] = mapped_column(
        Float, nullable=False
    )
    loan_term: Mapped[int] = mapped_column(
        Integer, nullable=False
    )
    interest_rate: Mapped[float] = mapped_column(
        Float, nullable=False
    )
    application_year: Mapped[int] = mapped_column(
        Integer, nullable=False
    )
    funded_amnt_inv: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    annual_income: Mapped[float] = mapped_column(
        Float, nullable=False
    )
    employment_length: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )
    home_ownership: Mapped[str] = mapped_column(
        String(20), nullable=False
    )
    fico_score: Mapped[float] = mapped_column(
        Float, nullable=False
    )
    mortgage_accounts: Mapped[int] = mapped_column(
        Integer, nullable=False
    )
    accounts_opened_last_24_months: Mapped[int] = mapped_column(
        Integer, nullable=False
    )
    active_revolving_accounts: Mapped[int] = mapped_column(
        Integer, nullable=False
    )
    accounts_120_days_past_due: Mapped[int] = mapped_column(
        Integer, nullable=False
    )
    average_account_balance: Mapped[float] = mapped_column(
        Float, nullable=False
    )
    total_credit_limit: Mapped[float] = mapped_column(
        Float, nullable=False
    )
    monthly_debt_payment: Mapped[float] = mapped_column(
        Float, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )

    user: Mapped["User | None"] = relationship(
        back_populates="applications"
    )
    assessment: Mapped["Assessment | None"] = relationship(
        back_populates="application",
        uselist=False,
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class Assessment(Base):
    __tablename__ = "assessments"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True
    )
    application_id: Mapped[int] = mapped_column(
        ForeignKey("applications.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    default_probability: Mapped[float] = mapped_column(
        Float, nullable=False
    )
    risk_level: Mapped[str] = mapped_column(
        String(20), nullable=False
    )
    recommendation: Mapped[str] = mapped_column(
        Text, nullable=False
    )
    shap_explanation: Mapped[dict | None] = mapped_column(
        JSONB, nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )

    application: Mapped["Application"] = relationship(
        back_populates="assessment"
    )
