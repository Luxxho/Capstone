from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str
    secret_key: str
    access_token_expire_minutes: int = 60

    # Mercado Pago - Checkout Pro / Orders API
    mercadopago_access_token: str | None = None

    # Opcional, pero recomendado para las pruebas oficiales:
    # correo de la cuenta Mercado Pago de prueba tipo Comprador.
    mercadopago_test_payer_email: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


settings = Settings()
