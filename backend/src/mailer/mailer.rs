use lettre::transport::smtp::authentication::Credentials;
use lettre::{Message, SmtpTransport, Transport};
use std::env;

pub struct MailService {
    mailer: SmtpTransport,
    from: String,
    frontend_base_url: String,
}

impl MailService {
    pub fn new() -> Self {
        let smtp_host = env::var("SMTP_HOST").unwrap().trim().to_string();
        let smtp_user = env::var("SMTP_USER").unwrap().trim().to_string();
        let smtp_pass = env::var("SMTP_PASS").unwrap().trim().to_string();
        let from = env::var("SMTP_FROM").unwrap_or(smtp_user.clone()).trim().to_string();
        let frontend_base_url =
            env::var("FRONTEND_BASE_URL").unwrap_or("http://localhost:5173".into());

        let creds = Credentials::new(smtp_user, smtp_pass);

        let mailer = SmtpTransport::relay(&smtp_host)
            .unwrap()
            .credentials(creds)
            .build();

        Self {
            mailer,
            from,
            frontend_base_url,
        }
    }

   pub fn build_reset_email(
        &self,
        to: &str,
        reset_token: &str,
    ) -> Result<Message, Box<dyn std::error::Error + Send + Sync>> {
        let reset_link = format!("{}/reset-password?token={}", self.frontend_base_url, reset_token);

        let body = format!(
            "Olá,\n\n\
            Recebemos um pedido para redefinir a tua palavra-passe.\n\
            Clica neste link para continuares:\n\n\
            {}\n\n\
            Se não foste tu, podes ignorar este email.\n",
            reset_link
        );

        Ok(
            Message::builder()
                .from(format!("Ribas Ferias <{}>", self.from).parse()?)
                .to(to.parse()?)
                .subject("Redefinição de palavra-passe")
                .body(body)?
        )
    }


    pub async fn send_reset_email(
        &self,
        to: &str,
        reset_token: &str,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let email = self.build_reset_email(to, reset_token)?; // now works

        let mailer = self.mailer.clone();

        tokio::task::spawn_blocking(move || mailer.send(&email))
            .await??;

        Ok(())
    }



}


