import os
import resend
from decouple import config

resend.api_key = config("RESEND_API_KEY")


def send_email(to_email, subject, html):
    return resend.Emails.send(
        {
            "from": "Perdash <onboarding@resend.dev>",
            "to": [to_email],
            "subject": subject,
            "html": html,
        }
    )
