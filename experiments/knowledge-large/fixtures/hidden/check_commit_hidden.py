"""Hidden verification: commit flushes for autoflush=False sessions, nested savepoints, and deletes."""

import os
import sys

root = os.getcwd()
sys.path[:0] = [os.path.join(root, "lib"), os.path.join(root, "checks", "_vendor")]

from sqlalchemy import String, create_engine, func, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column
from sqlalchemy.pool import StaticPool


class Base(DeclarativeBase):
    pass


class Item(Base):
    __tablename__ = "item"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(30))


engine = create_engine("sqlite://", poolclass=StaticPool)
Base.metadata.create_all(engine)
with Session(engine, autoflush=False) as session:
    session.add_all([Item(name="a"), Item(name="b")])
    session.commit()
with Session(engine) as session:
    with session.begin_nested():
        session.add(Item(name="c"))
    session.delete(session.scalars(select(Item).where(Item.name == "a")).one())
    session.commit()
with Session(engine) as session:
    assert sorted(session.scalars(select(Item.name))) == ["b", "c"]
    assert session.scalar(select(func.count()).select_from(Item)) == 2
print("PASS: hidden")
