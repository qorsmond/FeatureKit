"""Acceptance: Session.commit() persists pending and modified objects without an explicit flush."""

import os
import sys

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path[:0] = [os.path.join(root, "lib"), os.path.join(root, "checks", "_vendor")]

from sqlalchemy import String, create_engine, func, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column


class Base(DeclarativeBase):
    pass


class Item(Base):
    __tablename__ = "item"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(30))


def check():
    engine = create_engine("sqlite://")
    Base.metadata.create_all(engine)
    with Session(engine) as session:
        session.add(Item(name="a"))
        session.commit()
    with Session(engine) as session:
        assert session.scalar(select(func.count()).select_from(Item)) == 1, "commit did not insert the pending object"
        session.scalars(select(Item)).one().name = "b"
        session.commit()
    with Session(engine) as session:
        assert session.scalars(select(Item.name)).one() == "b", "commit did not update the modified object"
    print("PASS: check_commit_flush")


if __name__ == "__main__":
    check()
