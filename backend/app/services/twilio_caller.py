"""
Twilio WhatsApp Messaging Service for Emergency Alerts
Sends automated WhatsApp messages to pre-configured emergency contacts.
"""
from app.core.config import settings


class TwilioEmergency:
    """Handles sending emergency WhatsApp messages via Twilio"""

    def __init__(self):
        self.client = None
        self._initialized = False

    def _ensure_client(self):
        """Lazy-initialize the Twilio client only when needed"""
        if self._initialized:
            return

        if not all([settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN]):
            raise RuntimeError(
                "Twilio is not configured. Set TWILIO_ACCOUNT_SID and "
                "TWILIO_AUTH_TOKEN in your .env file."
            )

        if not settings.TWILIO_WHATSAPP_NUMBER:
            raise RuntimeError(
                "TWILIO_WHATSAPP_NUMBER is not set in .env. "
                "Example: whatsapp:+14155238886"
            )

        from twilio.rest import Client
        self.client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        self._initialized = True

    def send_whatsapp(self, to_number: str, alert_message: str, severity: str = "warning") -> dict:
        """
        Send a single WhatsApp emergency message.

        Args:
            to_number: Phone number (e.g. +919031851732)
            alert_message: The alert message to send
            severity: Alert severity (info, warning, critical)

        Returns:
            dict with status info
        """
        self._ensure_client()

        severity_emoji = {
            "critical": "🚨🔴",
            "warning": "⚠️🟡",
            "info": "ℹ️🔵",
        }.get(severity, "⚠️")

        body = (
            f"{severity_emoji} *AQUAGUARDIANS EMERGENCY ALERT* {severity_emoji}\n\n"
            f"*Severity:* {severity.upper()}\n\n"
            f"{alert_message}\n\n"
            f"Please take immediate action.\n"
            f"— AquaGuardians Emergency System"
        )

        # Format the 'to' number for WhatsApp
        whatsapp_to = to_number if to_number.startswith("whatsapp:") else f"whatsapp:{to_number}"

        try:
            message = self.client.messages.create(
                body=body,
                from_=settings.TWILIO_WHATSAPP_NUMBER,
                to=whatsapp_to,
            )
            return {
                "to_number": to_number,
                "message_sid": message.sid,
                "status": "sent",
                "error": None,
            }
        except Exception as e:
            return {
                "to_number": to_number,
                "message_sid": None,
                "status": "failed",
                "error": str(e),
            }

    def broadcast(self, alert_message: str, severity: str = "warning", phone_numbers: list[str] | None = None) -> dict:
        """
        Send WhatsApp messages to all emergency contacts.

        Args:
            alert_message: Message to send
            severity: Alert severity level
            phone_numbers: Optional override list. If None, uses EMERGENCY_CONTACTS from config.

        Returns:
            dict with total, successful, failed counts and details
        """
        self._ensure_client()

        contacts = phone_numbers if phone_numbers else settings.emergency_contacts_list

        if not contacts:
            raise RuntimeError(
                "No emergency contacts configured. Set EMERGENCY_CONTACTS in .env "
                "(comma-separated, e.g. +919031851732,+919931336263)"
            )

        results = []
        for number in contacts:
            number = number.strip()
            if not number:
                continue
            result = self.send_whatsapp(number, alert_message, severity)
            results.append(result)

        successful = sum(1 for r in results if r["status"] == "sent")
        failed = sum(1 for r in results if r["status"] == "failed")

        return {
            "total": len(results),
            "successful": successful,
            "failed": failed,
            "details": results,
        }


# Singleton instance
twilio_emergency = TwilioEmergency()
