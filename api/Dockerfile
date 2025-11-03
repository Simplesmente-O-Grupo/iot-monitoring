FROM python:3.14-slim
ENV PYTHONUNBUFFERED=1

WORKDIR /api

RUN useradd \
	--shell /sbin/nologin \
	--uid 10001 \
	--no-create-home \
	api-usr

COPY requirements.txt .

RUN python -m pip install -r requirements.txt

USER api-usr

COPY . .

CMD ["fastapi", "run", "main.py", "--port", "80"]
