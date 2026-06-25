from sqlmodel import Session, create_engine, select

from app import crud
from app.core.config import settings
from app.models import Account, User, UserCreate

engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))


# make sure all SQLModel models are imported (app.models) before initializing DB
# otherwise, SQLModel might fail to initialize relationships properly
# for more details: https://github.com/fastapi/full-stack-fastapi-template/issues/28


def init_db(session: Session) -> None:
    # Tables should be created with Alembic migrations
    # But if you don't want to use migrations, create
    # the tables un-commenting the next lines
    # from sqlmodel import SQLModel

    # This works because the models are already imported and registered from app.models
    # SQLModel.metadata.create_all(engine)

    user = session.exec(
        select(User).where(User.email == settings.FIRST_SUPERUSER)
    ).first()
    if not user:
        user_in = UserCreate(
            email=settings.FIRST_SUPERUSER,
            password=settings.FIRST_SUPERUSER_PASSWORD,
        )
        user = crud.create_user(session=session, user_create=user_in)
        crud.create_account_with_data(session=session, user=user)
    elif not session.exec(
        select(Account).where(Account.owner_id == user.id)
    ).first():
        crud.create_account_with_data(session=session, user=user)

    
    demo_user = session.exec(
        select(User).where(User.email == settings.DEMO_USER_EMAIL)
    ).first()
    if not demo_user:
        demo_user = crud.create_user(
            session=session,
            user_create=UserCreate(
                email=settings.DEMO_USER_EMAIL,
                password=settings.DEMO_USER_PASSWORD,
            ),
        )
        crud.create_account_with_data(session=session, user=demo_user)
