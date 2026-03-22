import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
} from '@react-email/components';

interface MagicLinkProps {
  loginUrl: string;
  email: string;
}

export const MagicLink = ({ loginUrl, email }: MagicLinkProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={content}>
            <Text style={heading}>Sign in to Ready Set Plans</Text>

            <Text style={paragraph}>
              Click the button below to sign in to your account.
            </Text>

            <Text style={emailText}>
              Email: {email}
            </Text>

            <Section style={buttonSection}>
              <Button style={button} href={loginUrl}>
                Sign In
              </Button>
            </Section>

            <Text style={footer}>
              This link will expire in 1 hour for security reasons.
            </Text>

            <Text style={footer}>
              If you didn't request this email, you can safely ignore it.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const content = {
  padding: '40px 48px',
  textAlign: 'center' as const,
};

const heading = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0 0 24px 0',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.4',
  color: '#484848',
  margin: '16px 0',
};

const emailText = {
  fontSize: '16px',
  color: '#374151',
  backgroundColor: '#f9fafb',
  padding: '12px',
  borderRadius: '6px',
  margin: '24px 0',
  fontFamily: 'monospace',
};

const buttonSection = {
  margin: '32px 0',
};

const button = {
  backgroundColor: '#1f2937',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '18px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
};

const footer = {
  fontSize: '14px',
  color: '#8898aa',
  margin: '8px 0',
};

export default MagicLink;